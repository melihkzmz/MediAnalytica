import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded
from flask_caching import Cache
from flask_swagger_ui import get_swaggerui_blueprint
import os
from datetime import datetime, timedelta
import uuid
import json
import logging
import traceback

# Import custom utilities
from utils.errors import APIError, AuthenticationError, ValidationError, NotFoundError
from utils.validators import (
    validate_disease_type, 
    validate_analysis_results, 
    validate_pagination_params
)
from utils.helpers import (
    serialize_firestore_doc, 
    serialize_firestore_timestamp,
    get_user_id_from_token
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Geliştirici ana dizine firebase_credentials.json ekledi.
CRED_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'firebase_credentials.json'))

app = Flask(__name__)

# CORS yapılandırması - Sadece belirli origin'lere izin ver
# Environment variable'dan CORS origins al, yoksa varsayılanları kullan
CORS_ORIGINS_ENV = os.getenv('CORS_ORIGINS', '')
if CORS_ORIGINS_ENV:
    # Environment variable'dan gelen origins (virgülle ayrılmış)
    CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_ENV.split(',') if origin.strip()]
else:
    # Varsayılan origins
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:3000",
        "https://medi-analytica.vercel.app",  # Vercel production domain
    ]

CORS(app, resources={
    r"/api/*": {
        "origins": CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/auth/*": {
        "origins": CORS_ORIGINS,
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Rate Limiting - DDoS koruması
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Production'da Redis kullanılmalı
)

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    """Handle validation errors."""
    logger.warning(f"Validation Error: {str(e)}")
    return jsonify({
        "success": False,
        "error": str(e),
        "error_code": "VALIDATION_ERROR"
    }), 400


@app.errorhandler(APIError)
def handle_api_error(e):
    """Handle custom API errors."""
    logger.warning(f"API Error: {e.error_code} - {e.message}")
    return jsonify({
        "success": False,
        "error": e.message,
        "error_code": e.error_code
    }), e.status_code


@app.errorhandler(RateLimitExceeded)
def handle_rate_limit_exceeded(e):
    """Handle rate limit errors."""
    return jsonify({
        "success": False,
        "error": "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
        "error_code": "RATE_LIMIT_EXCEEDED",
        "retry_after": e.retry_after if hasattr(e, 'retry_after') else None
    }), 429


@app.errorhandler(500)
def handle_internal_error(e):
    """Handle unexpected server errors."""
    logger.error(f"Internal server error: {str(e)}\n{traceback.format_exc()}")
    return jsonify({
        "success": False,
        "error": "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        "error_code": "INTERNAL_ERROR"
    }), 500

# Caching - API response cache
cache = Cache(app, config={
    'CACHE_TYPE': 'simple',
    'CACHE_DEFAULT_TIMEOUT': 300  # 5 dakika
})

if not firebase_admin._apps:
    cred = credentials.Certificate(CRED_PATH)
    firebase_admin.initialize_app(cred)

# Firestore ve Storage başlat
db = firestore.client()
try:
    from firebase_admin import storage as firebase_storage
    bucket = firebase_storage.bucket()
except:
    bucket = None
    print("[UYARI] Firebase Storage bucket başlatılamadı. Profil fotoğrafı yükleme çalışmayabilir.")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def verify_token():
    """
    Request header'dan Firebase ID token alıp doğrular.
    
    Returns:
        tuple: (uid, error_response, status_code)
            - uid (str): Kullanıcı ID'si (başarılıysa)
            - error_response (Response): Hata response objesi (hata varsa)
            - status_code (int): HTTP status kodu (hata varsa)
    
    Raises:
        None: Tüm hatalar yakalanır ve response döner
    
    Example:
        uid, error, status = verify_token()
        if uid is None:
            return error, status
    """
    try:
        uid = get_user_id_from_token(request)
        return uid, None, None
    except AuthenticationError as e:
        return None, jsonify({
            "success": False,
            "error": e.message,
            "error_code": e.error_code
        }), e.status_code
    except Exception as e:
        logger.error(f"Unexpected error in verify_token: {str(e)}\n{traceback.format_exc()}")
        return None, jsonify({
            "success": False,
            "error": "Authentication failed",
            "error_code": "AUTH_ERROR"
        }), 401

# ============================================================================
# AUTH ENDPOINTS (Mevcut)
# ============================================================================

@app.route("/auth/register", methods=["POST"])
@limiter.limit("5 per minute")  # Dakikada max 5 kayıt
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    try:
        user = auth.create_user(email=email, password=password)
        
        # Firestore'da kullanıcı dokümanı oluştur
        user_ref = db.collection('users').document(user.uid)
        current_time = datetime.utcnow()
        user_ref.set({
            'email': email,
            'displayName': email.split('@')[0],  # Varsayılan isim
            'createdAt': firestore.SERVER_TIMESTAMP,
            'lastLogin': firestore.SERVER_TIMESTAMP,
            'settings': {
                'notifications': True,
                'language': 'tr'
            }
        })
        
        return jsonify({"success": True, "uid": user.uid}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/auth/verify", methods=["POST"])
@limiter.limit("20 per minute")  # Dakikada max 20 doğrulama
def verify():
    data = request.get_json()
    id_token = data.get("idToken")
    try:
        decoded = auth.verify_id_token(id_token)
        
        # Son giriş zamanını güncelle
        user_ref = db.collection('users').document(decoded['uid'])
        user_ref.update({'lastLogin': firestore.SERVER_TIMESTAMP})
        
        return jsonify({"success": True, "uid": decoded["uid"]}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 401

# ============================================================================
# ANALİZ GEÇMİŞİ ENDPOINTS
# ============================================================================

@app.route("/api/user/analyses", methods=["POST"])
@limiter.limit("10 per minute")  # Dakikada max 10 analiz
def save_analysis():
    """
    Yeni analiz kaydet
    
    Request Body:
        diseaseType (str): Hastalık türü (bone, skin, lung, eye)
        results (list): Analiz sonuçları listesi
        topPrediction (str): En yüksek tahmin
        imageUrl (str, opsiyonel): Görüntü URL'si
    
    Returns:
        JSON: {
            "success": bool,
            "analysisId": str,
            "data": dict
        }
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")
        
        # Validate inputs
        disease_type = validate_disease_type(data.get("diseaseType"))
        results = validate_analysis_results(data.get("results", []))
        top_prediction = data.get("topPrediction", "")
        image_url = data.get("imageUrl", "")
        
        # Validate top_prediction is a string
        if top_prediction and not isinstance(top_prediction, str):
            raise ValidationError("topPrediction must be a string")
        
        # Validate image_url is a string
        if image_url and not isinstance(image_url, str):
            raise ValidationError("imageUrl must be a string")
        
    except ValidationError as e:
        raise  # Re-raise to be handled by error handler
    except Exception as e:
        logger.error(f"Validation error in save_analysis: {str(e)}\n{traceback.format_exc()}")
        raise ValidationError(f"Invalid request data: {str(e)}")
    
    try:
        analysis_ref = db.collection('analyses').document()
        current_time = datetime.utcnow()
        analysis_data = {
            'userId': uid,
            'diseaseType': disease_type,
            'imageUrl': image_url,
            'results': results,
            'topPrediction': top_prediction,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        analysis_ref.set(analysis_data)
        
        # Kullanıcı istatistiklerini güncelle
        try:
            update_user_stats(uid, disease_type)
        except Exception as e:
            logger.warning(f"Failed to update user stats: {str(e)}")
            # Don't fail the request if stats update fails
        
        # Response için createdAt'i datetime olarak ekle (SERVER_TIMESTAMP JSON'a çevrilemez)
        response_data = {
            'userId': uid,
            'diseaseType': disease_type,
            'imageUrl': image_url,
            'results': results,
            'topPrediction': top_prediction,
            'createdAt': serialize_firestore_timestamp(current_time)
        }
        
        return jsonify({
            "success": True,
            "analysisId": analysis_ref.id,
            "data": response_data
        }), 200
    except APIError:
        raise  # Re-raise API errors
    except Exception as e:
        logger.error(f"Error saving analysis: {str(e)}\n{traceback.format_exc()}")
        raise APIError("Failed to save analysis", error_code="SAVE_ERROR")

@app.route("/api/user/analyses", methods=["GET"])
@limiter.limit("30 per minute")  # Dakikada max 30 sorgu
def get_analyses():
    """
    Kullanıcının analiz geçmişini getir (Pagination destekli)
    
    Query Parameters:
        page (int): Sayfa numarası (varsayılan: 1)
        per_page (int): Sayfa başına kayıt sayısı (varsayılan: 20, max: 100)
        diseaseType (str): Hastalık türü filtresi (opsiyonel)
        last_doc_id (str): Son doküman ID'si (cursor-based pagination için)
    
    Returns:
        JSON: {
            "success": bool,
            "analyses": list,
            "count": int,
            "page": int,
            "per_page": int,
            "has_more": bool,
            "next_cursor": str (opsiyonel)
        }
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Pagination parametreleri
        page = int(request.args.get('page', 1))
        # limit parametresi de destekleniyor (frontend uyumluluğu için)
        limit_param = request.args.get('limit') or request.args.get('per_page', '20')
        per_page = min(int(limit_param), 100)  # Max 100
        disease_type = request.args.get('diseaseType', None)
        last_doc_id = request.args.get('last_doc_id', None)
        
        # Query oluştur
        # Firestore index gereksinimini önlemek için önce tüm analizleri al, sonra sırala
        query = db.collection('analyses').where('userId', '==', uid)
        
        if disease_type:
            query = query.where('diseaseType', '==', disease_type)
        
        # Tüm sonuçları al (limit olmadan)
        all_docs = list(query.stream())
        
        # Memory'de sırala (Firestore index gereksinimini önler)
        def get_timestamp(doc):
            data = doc.to_dict()
            created_at = data.get('createdAt')
            if hasattr(created_at, 'timestamp'):
                return created_at.timestamp()
            elif isinstance(created_at, (int, float)):
                return created_at
            else:
                return 0  # Varsayılan olarak en eski
        
        all_docs.sort(key=get_timestamp, reverse=True)
        
        # Pagination uygula
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page + 1  # has_more kontrolü için +1
        
        docs = all_docs[start_idx:end_idx]
        has_more = len(docs) > per_page
        
        if has_more:
            docs = docs[:per_page]  # Son ekstra dokümanı çıkar
        
        analyses = []
        next_cursor = None
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            # Timestamp'i düzelt
            if 'createdAt' in data:
                if hasattr(data['createdAt'], 'timestamp'):
                    data['createdAt'] = data['createdAt'].timestamp()
                elif isinstance(data['createdAt'], (int, float)):
                    data['createdAt'] = data['createdAt']
            analyses.append(data)
            next_cursor = doc.id  # Son doküman ID'si
        
        response = {
            "success": True,
            "analyses": analyses,
            "count": len(analyses),
            "page": page,
            "per_page": per_page,
            "has_more": has_more
        }
        
        # Cursor-based pagination için next_cursor ekle
        if has_more and next_cursor:
            response["next_cursor"] = next_cursor
        
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error getting analyses: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# KULLANICI İSTATİSTİKLERİ ENDPOINT
# ============================================================================

@app.route("/api/user/stats", methods=["GET"])
@cache.cached(timeout=300)  # 5 dakika cache
def get_user_stats():
    """Kullanıcı istatistiklerini getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Toplam analiz sayısı - Tüm analizleri say
        all_analyses = db.collection('analyses').where('userId', '==', uid).stream()
        total_analyses = len(list(all_analyses))
        
        # Hastalık türüne göre analiz sayıları
        disease_counts = {}
        disease_types = ['bone', 'skin', 'lung', 'eye']
        for dt in disease_types:
            analyses = db.collection('analyses').where('userId', '==', uid).where('diseaseType', '==', dt).stream()
            disease_counts[dt] = len(list(analyses))
        
        # En çok analiz edilen hastalık türü
        most_analyzed = max(disease_counts.items(), key=lambda x: x[1])[0] if disease_counts and max(disease_counts.values()) > 0 else None
        
        # Son analiz tarihi - Index gerektirmemek için tüm analizleri al, memory'de sırala
        all_analyses_for_date = db.collection('analyses').where('userId', '==', uid).stream()
        last_analysis_date = None
        max_timestamp = 0
        for doc in all_analyses_for_date:
            data = doc.to_dict()
            if 'createdAt' in data:
                timestamp = 0
                if hasattr(data['createdAt'], 'timestamp'):
                    timestamp = data['createdAt'].timestamp()
                elif isinstance(data['createdAt'], (int, float)):
                    timestamp = data['createdAt']
                if timestamp > max_timestamp:
                    max_timestamp = timestamp
                    last_analysis_date = timestamp
        
        # Kullanıcı bilgileri
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        join_date = None
        if user_data.get('createdAt'):
            if hasattr(user_data.get('createdAt'), 'timestamp'):
                join_date = user_data.get('createdAt').timestamp()
            elif isinstance(user_data.get('createdAt'), (int, float)):
                join_date = user_data.get('createdAt')
        
        return jsonify({
            "success": True,
            "stats": {
                "totalAnalyses": total_analyses,
                "diseaseTypeCounts": disease_counts,
                "mostAnalyzedDisease": most_analyzed,
                "lastAnalysisDate": last_analysis_date,
                "joinDate": join_date
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting user stats: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# PROFİL AYARLARI ENDPOINT
# ============================================================================

@app.route("/api/user/profile", methods=["GET"])
def get_profile():
    """Kullanıcı profilini getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"success": False, "error": "Kullanıcı bulunamadı"}), 404
        
        user_data = user_doc.to_dict()
        
        # Timestamp'leri string'e çevir
        if 'createdAt' in user_data and hasattr(user_data['createdAt'], 'timestamp'):
            user_data['createdAt'] = user_data['createdAt'].timestamp()
        if 'lastLogin' in user_data and hasattr(user_data['lastLogin'], 'timestamp'):
            user_data['lastLogin'] = user_data['lastLogin'].timestamp()
        
        return jsonify({
            "success": True,
            "profile": user_data
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    """Kullanıcı profilini güncelle"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    data = request.get_json()
    
    try:
        user_ref = db.collection('users').document(uid)
        update_data = {}
        
        if 'displayName' in data:
            update_data['displayName'] = data['displayName']
            # Firebase Auth'da da güncelle
            auth.update_user(uid, display_name=data['displayName'])
        
        if 'photoURL' in data:
            update_data['photoURL'] = data['photoURL']
            # Firebase Auth'da da güncelle
            auth.update_user(uid, photo_url=data['photoURL'])
        
        if 'settings' in data:
            update_data['settings'] = data['settings']
        
        if update_data:
            user_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": "Profil güncellendi"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/user/profile/photo", methods=["POST"])
def upload_profile_photo():
    """Profil fotoğrafı yükle (Firebase Storage)"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    if 'photo' not in request.files:
        return jsonify({"success": False, "error": "Fotoğraf dosyası gerekli"}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"success": False, "error": "Dosya seçilmedi"}), 400
    
    try:
        # Firebase Storage'a yükle
        blob = bucket.blob(f'profile_images/{uid}/{file.filename}')
        blob.upload_from_file(file, content_type=file.content_type)
        blob.make_public()
        
        photo_url = blob.public_url
        
        # Firestore'da güncelle
        user_ref = db.collection('users').document(uid)
        user_ref.update({'photoURL': photo_url})
        
        # Firebase Auth'da da güncelle
        auth.update_user(uid, photo_url=photo_url)
        
        return jsonify({
            "success": True,
            "photoURL": photo_url
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# FAVORİLER ENDPOINTS
# ============================================================================

@app.route("/api/user/favorites", methods=["POST"])
def add_favorite():
    """Analizi favorilere ekle"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    data = request.get_json()
    analysis_id = data.get("analysisId")
    
    if not analysis_id:
        return jsonify({"success": False, "error": "analysisId gerekli"}), 400
    
    try:
        # Analiz var mı kontrol et
        analysis_ref = db.collection('analyses').document(analysis_id)
        analysis_doc = analysis_ref.get()
        
        if not analysis_doc.exists:
            return jsonify({"success": False, "error": "Analiz bulunamadı"}), 404
        
        analysis_data = analysis_doc.to_dict()
        if analysis_data.get('userId') != uid:
            return jsonify({"success": False, "error": "Bu analiz size ait değil"}), 403
        
        # Zaten favorilerde mi kontrol et
        existing = db.collection('favorites').where('userId', '==', uid).where('analysisId', '==', analysis_id).limit(1).stream()
        if list(existing):
            return jsonify({"success": False, "error": "Bu analiz zaten favorilerde"}), 400
        
        # Favorilere ekle
        favorite_ref = db.collection('favorites').document()
        favorite_ref.set({
            'userId': uid,
            'analysisId': analysis_id,
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            "success": True,
            "favoriteId": favorite_ref.id
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/user/favorites", methods=["GET"])
def get_favorites():
    """Kullanıcının favorilerini getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Index gerektirmemek için order_by kullanmadan tüm favorileri al, memory'de sırala
        favorites_query = db.collection('favorites').where('userId', '==', uid)
        all_fav_docs = list(favorites_query.stream())
        
        # Memory'de sırala (en yeni önce)
        def get_fav_timestamp(fav_doc):
            fav_data = fav_doc.to_dict()
            created_at = fav_data.get('createdAt')
            if hasattr(created_at, 'timestamp'):
                return created_at.timestamp()
            elif isinstance(created_at, (int, float)):
                return created_at
            else:
                return 0
        
        all_fav_docs.sort(key=get_fav_timestamp, reverse=True)
        
        favorites = []
        for fav_doc in all_fav_docs:
            fav_data = fav_doc.to_dict()
            analysis_id = fav_data.get('analysisId')
            
            if not analysis_id:
                continue
            
            # Analiz bilgilerini getir
            analysis_ref = db.collection('analyses').document(analysis_id)
            analysis_doc = analysis_ref.get()
            
            if analysis_doc.exists:
                analysis_data = analysis_doc.to_dict()
                analysis_data['id'] = analysis_id
                
                # Timestamp'i düzelt
                if 'createdAt' in analysis_data:
                    if hasattr(analysis_data['createdAt'], 'timestamp'):
                        analysis_data['createdAt'] = analysis_data['createdAt'].timestamp()
                    elif isinstance(analysis_data['createdAt'], (int, float)):
                        analysis_data['createdAt'] = analysis_data['createdAt']
                
                # FavoritedAt timestamp'ini düzelt
                favorited_at = None
                if fav_data.get('createdAt'):
                    if hasattr(fav_data.get('createdAt'), 'timestamp'):
                        favorited_at = fav_data.get('createdAt').timestamp()
                    elif isinstance(fav_data.get('createdAt'), (int, float)):
                        favorited_at = fav_data.get('createdAt')
                
                favorites.append({
                    'favoriteId': fav_doc.id,
                    'analysis': analysis_data,
                    'favoritedAt': favorited_at
                })
        
        return jsonify({
            "success": True,
            "count": len(favorites),
            "favorites": favorites
        }), 200
    except Exception as e:
        logger.error(f"Error getting favorites: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/user/favorites/<favorite_id>", methods=["DELETE"])
def remove_favorite(favorite_id):
    """Favoriden kaldır"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        favorite_ref = db.collection('favorites').document(favorite_id)
        favorite_doc = favorite_ref.get()
        
        if not favorite_doc.exists:
            return jsonify({"success": False, "error": "Favori bulunamadı"}), 404
        
        favorite_data = favorite_doc.to_dict()
        if favorite_data.get('userId') != uid:
            return jsonify({"success": False, "error": "Bu favori size ait değil"}), 403
        
        favorite_ref.delete()
        
        return jsonify({
            "success": True,
            "message": "Favoriden kaldırıldı"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# PAYLAŞIM ENDPOINT
# ============================================================================

@app.route("/api/share/analysis", methods=["POST"])
def share_analysis():
    """Analiz için paylaşım linki oluştur"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    data = request.get_json()
    analysis_id = data.get("analysisId")
    expires_in_days = int(data.get("expiresInDays", 30))  # Varsayılan 30 gün
    
    if not analysis_id:
        return jsonify({"success": False, "error": "analysisId gerekli"}), 400
    
    try:
        # Analiz var mı kontrol et
        analysis_ref = db.collection('analyses').document(analysis_id)
        analysis_doc = analysis_ref.get()
        
        if not analysis_doc.exists:
            return jsonify({"success": False, "error": "Analiz bulunamadı"}), 404
        
        analysis_data = analysis_doc.to_dict()
        if analysis_data.get('userId') != uid:
            return jsonify({"success": False, "error": "Bu analiz size ait değil"}), 403
        
        # Paylaşım token'ı oluştur
        share_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        # Paylaşım dokümanı oluştur
        share_ref = db.collection('shared').document()
        share_ref.set({
            'userId': uid,
            'analysisId': analysis_id,
            'shareToken': share_token,
            'expiresAt': expires_at,
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        
        # Paylaşım URL'i oluştur (frontend'de kullanılacak)
        share_url = f"/shared/{share_token}"
        
        return jsonify({
            "success": True,
            "shareId": share_ref.id,
            "shareToken": share_token,
            "shareUrl": share_url,
            "expiresAt": expires_at.isoformat()
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/share/<share_token>", methods=["GET"])
def get_shared_analysis(share_token):
    """Paylaşım linkinden analiz bilgilerini getir (Public)"""
    try:
        # Paylaşım dokümanını bul
        share_query = db.collection('shared').where('shareToken', '==', share_token).limit(1).stream()
        share_doc = None
        for doc in share_query:
            share_doc = doc
            break
        
        if not share_doc:
            return jsonify({"success": False, "error": "Paylaşım linki bulunamadı"}), 404
        
        share_data = share_doc.to_dict()
        
        # Süresi dolmuş mu kontrol et
        expires_at = share_data.get('expiresAt')
        if expires_at and expires_at < datetime.utcnow():
            return jsonify({"success": False, "error": "Paylaşım linkinin süresi dolmuş"}), 410
        
        # Analiz bilgilerini getir
        analysis_id = share_data.get('analysisId')
        analysis_ref = db.collection('analyses').document(analysis_id)
        analysis_doc = analysis_ref.get()
        
        if not analysis_doc.exists:
            return jsonify({"success": False, "error": "Analiz bulunamadı"}), 404
        
        analysis_data = analysis_doc.to_dict()
        if 'createdAt' in analysis_data and hasattr(analysis_data['createdAt'], 'timestamp'):
            analysis_data['createdAt'] = analysis_data['createdAt'].timestamp()
        
        # Hassas bilgileri kaldır (userId gibi)
        analysis_data.pop('userId', None)
        
        return jsonify({
            "success": True,
            "analysis": analysis_data
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# DOCTOR ENDPOINTS
# ============================================================================

@app.route("/api/doctors/register", methods=["POST"])
@limiter.limit("5 per minute")  # Dakikada max 5 doktor kaydı
def register_doctor():
    """
    Doktor kayıt endpoint'i
    
    Request Body:
        firstName (str): Ad
        lastName (str): Soyad
        specialty (str): Uzmanlık alanı
        phone (str): Telefon
        tcNo (str, opsiyonel): T.C. Kimlik No
        experienceYears (int): Deneyim yılı
        institution (str, opsiyonel): Kurum
        bio (str, opsiyonel): Hakkında
        diplomaUrl (str, opsiyonel): Diploma URL'si
        certificateUrls (list, opsiyonel): Sertifika URL'leri listesi
        status (str): Durum (pending, approved, rejected)
    
    Returns:
        JSON: {"success": bool, "doctorId": str}
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Request body is required"}), 400
        
        # Gerekli alanları kontrol et
        required_fields = ['firstName', 'lastName', 'specialty', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "error": f"{field} is required"}), 400
        
        # Doktor dokümanı oluştur
        doctor_ref = db.collection('doctors').document(uid)
        doctor_data = {
            'userId': uid,
            'firstName': data.get('firstName'),
            'lastName': data.get('lastName'),
            'specialty': data.get('specialty'),
            'phone': data.get('phone'),
            'tcNo': data.get('tcNo'),
            'experienceYears': data.get('experienceYears', 0),
            'institution': data.get('institution'),
            'bio': data.get('bio'),
            'diplomaUrl': data.get('diplomaUrl'),
            'certificateUrls': data.get('certificateUrls', []),
            'status': data.get('status', 'approved'),  # Test için otomatik onaylıyoruz
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        doctor_ref.set(doctor_data)
        
        return jsonify({
            "success": True,
            "doctorId": uid,
            "message": "Doktor kaydı başarıyla oluşturuldu ve onaylandı."
        }), 200
    except Exception as e:
        logger.error(f"Error registering doctor: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/approve-self", methods=["POST"])
@limiter.limit("5 per minute")
def approve_doctor_self():
    """Test için: Doktor kendi hesabını onaylayabilir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "error": "Doktor kaydı bulunamadı"
            }), 404
        
        # Status'ü 'approved' yap
        doctor_ref.update({
            'status': 'approved',
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            "success": True,
            "message": "Doktor hesabınız onaylandı!"
        }), 200
    except Exception as e:
        logger.error(f"Error approving doctor: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/profile", methods=["GET"])
@limiter.limit("30 per minute")
def get_doctor_profile():
    """Doktor profil bilgilerini getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "doctor": None,
                "message": "Doktor kaydı bulunamadı"
            }), 404
        
        doctor_data = doctor_doc.to_dict()
        doctor_data['id'] = uid
        
        # Timestamp'leri serialize et
        if 'createdAt' in doctor_data:
            if hasattr(doctor_data['createdAt'], 'timestamp'):
                doctor_data['createdAt'] = doctor_data['createdAt'].timestamp()
            elif isinstance(doctor_data['createdAt'], datetime):
                doctor_data['createdAt'] = doctor_data['createdAt'].timestamp()
        
        if 'updatedAt' in doctor_data:
            if hasattr(doctor_data['updatedAt'], 'timestamp'):
                doctor_data['updatedAt'] = doctor_data['updatedAt'].timestamp()
            elif isinstance(doctor_data['updatedAt'], datetime):
                doctor_data['updatedAt'] = doctor_data['updatedAt'].timestamp()
        
        return jsonify({
            "success": True,
            "doctor": doctor_data
        }), 200
    except Exception as e:
        logger.error(f"Error getting doctor profile: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/appointments", methods=["GET"])
@limiter.limit("30 per minute")
def get_doctor_appointments():
    """Doktorun randevularını getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Önce doktor kaydını kontrol et
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "error": "Doktor kaydı bulunamadı"
            }), 404
        
        doctor_data = doctor_doc.to_dict()
        specialty = doctor_data.get('specialty')
        
        # Doktorun uzmanlık alanına göre randevuları getir
        status_filter = request.args.get('status', None)
        
        query = db.collection('appointments')
        
        # Eğer doktorun uzmanlık alanı varsa, ona göre filtrele
        if specialty:
            query = query.where('doctorType', '==', specialty)
        
        # Tüm randevuları al (status filtresi memory'de yapılacak)
        all_appointments = list(query.stream())
        
        # Status filtresi uygula
        if status_filter:
            all_appointments = [apt for apt in all_appointments if apt.to_dict().get('status') == status_filter]
        
        # Memory'de tarih ve saate göre sırala (en yakın önce)
        def get_appointment_sort_key(apt_doc):
            apt_data = apt_doc.to_dict()
            date_str = apt_data.get('date', '9999-99-99')  # Geçmiş tarihler en sona
            time_str = apt_data.get('time', '99:99')
            status = apt_data.get('status', 'pending')
            # Öncelik: pending > approved > completed > rejected
            priority = {'pending': 0, 'approved': 1, 'completed': 2, 'rejected': 3}.get(status, 4)
            return f"{priority}_{date_str} {time_str}"
        
        all_appointments.sort(key=get_appointment_sort_key)
        
        appointments = []
        for doc in all_appointments:
            data = doc.to_dict()
            data['id'] = doc.id
            
            # Timestamp'leri serialize et
            if 'createdAt' in data:
                if hasattr(data['createdAt'], 'timestamp'):
                    data['createdAt'] = data['createdAt'].timestamp()
                elif isinstance(data['createdAt'], datetime):
                    data['createdAt'] = data['createdAt'].timestamp()
            
            if 'updatedAt' in data:
                if hasattr(data['updatedAt'], 'timestamp'):
                    data['updatedAt'] = data['updatedAt'].timestamp()
                elif isinstance(data['updatedAt'], datetime):
                    data['updatedAt'] = data['updatedAt'].timestamp()
            
            # approvedAt timestamp'ini serialize et
            if 'approvedAt' in data:
                if hasattr(data['approvedAt'], 'timestamp'):
                    data['approvedAt'] = data['approvedAt'].timestamp()
                elif isinstance(data['approvedAt'], datetime):
                    data['approvedAt'] = data['approvedAt'].timestamp()
            
            appointments.append(data)
        
        return jsonify({
            "success": True,
            "appointments": appointments
        }), 200
    except Exception as e:
        logger.error(f"Error getting doctor appointments: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/appointments/<appointment_id>/approve", methods=["POST"])
@limiter.limit("30 per minute")
def approve_reject_appointment(appointment_id):
    """Randevuyu onayla veya reddet"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Önce doktor kaydını kontrol et
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "error": "Doktor kaydı bulunamadı"
            }), 404
        
        doctor_data = doctor_doc.to_dict()
        if doctor_data.get('status') != 'approved':
            return jsonify({
                "success": False,
                "error": "Doktor hesabınız henüz onaylanmamış"
            }), 403
        
        # Randevuyu getir
        appointment_ref = db.collection('appointments').document(appointment_id)
        appointment_doc = appointment_ref.get()
        
        if not appointment_doc.exists:
            return jsonify({
                "success": False,
                "error": "Randevu bulunamadı"
            }), 404
        
        data = request.get_json()
        action = data.get('action')  # 'approve' veya 'reject'
        note = data.get('note', '')
        
        if action not in ['approve', 'reject']:
            return jsonify({
                "success": False,
                "error": "Geçersiz aksiyon. 'approve' veya 'reject' olmalı"
            }), 400
        
        # Randevuyu güncelle
        update_data = {
            'status': 'approved' if action == 'approve' else 'rejected',
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Onaylandıysa approvedAt timestamp'i ekle
        if action == 'approve':
            update_data['approvedAt'] = firestore.SERVER_TIMESTAMP
        
        if note:
            update_data['doctorNote'] = note
        
        appointment_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": f"Randevu {'onaylandı' if action == 'approve' else 'reddedildi'}"
        }), 200
    except Exception as e:
        logger.error(f"Error approving/rejecting appointment: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/appointments/<appointment_id>/complete", methods=["POST"])
@limiter.limit("30 per minute")
def complete_appointment(appointment_id):
    """Randevuyu tamamlandı olarak işaretle"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Önce doktor kaydını kontrol et
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "error": "Doktor kaydı bulunamadı"
            }), 404
        
        doctor_data = doctor_doc.to_dict()
        if doctor_data.get('status') != 'approved':
            return jsonify({
                "success": False,
                "error": "Doktor hesabınız henüz onaylanmamış"
            }), 403
        
        # Randevuyu getir
        appointment_ref = db.collection('appointments').document(appointment_id)
        appointment_doc = appointment_ref.get()
        
        if not appointment_doc.exists:
            return jsonify({
                "success": False,
                "error": "Randevu bulunamadı"
            }), 404
        
        appointment_data = appointment_doc.to_dict()
        
        # Randevu durumu kontrol et (sadece approved randevular tamamlanabilir)
        if appointment_data.get('status') != 'approved':
            return jsonify({
                "success": False,
                "error": "Sadece onaylanmış randevular tamamlanabilir"
            }), 400
        
        data = request.get_json() or {}
        note = data.get('note', '')
        
        # Randevuyu tamamlandı olarak işaretle
        update_data = {
            'status': 'completed',
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        if note:
            update_data['completionNote'] = note
        
        appointment_ref.update(update_data)
        
        return jsonify({
            "success": True,
            "message": "Randevu tamamlandı olarak işaretlendi"
        }), 200
    except Exception as e:
        logger.error(f"Error completing appointment: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/doctors/patients", methods=["GET"])
@limiter.limit("30 per minute")
def get_doctor_patients():
    """Doktorun hastalarını getir"""
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        # Önce doktor kaydını kontrol et
        doctor_ref = db.collection('doctors').document(uid)
        doctor_doc = doctor_ref.get()
        
        if not doctor_doc.exists:
            return jsonify({
                "success": False,
                "error": "Doktor kaydı bulunamadı"
            }), 404
        
        doctor_data = doctor_doc.to_dict()
        specialty = doctor_data.get('specialty')
        
        # Doktorun randevularını getir
        query = db.collection('appointments')
        if specialty:
            specialty_mapping = {
                'dermatolog': 'dermatolog',
                'ortopedist': 'ortopedist',
                'gogus-hast': 'gogus-hast',
                'goz-hast': 'goz-hast',
                'genel-cerrahi': 'genel-cerrahi',
                'ic-hastaliklari': 'ic-hastaliklari',
                'noroloji': 'noroloji',
                'kardiyoloji': 'kardiyoloji'
            }
            mapped_specialty = specialty_mapping.get(specialty, specialty)
            all_appointments = [apt for apt in query.stream() if apt.to_dict().get('doctorType') == mapped_specialty]
        else:
            all_appointments = list(query.stream())
        
        # Unique hasta ID'lerini bul
        patient_ids = set()
        for apt_doc in all_appointments:
            apt_data = apt_doc.to_dict()
            patient_id = apt_data.get('userId')
            if patient_id:
                patient_ids.add(patient_id)
        
        # Hasta bilgilerini getir
        patients = []
        for patient_id in patient_ids:
            try:
                # Firestore'dan kullanıcı bilgilerini al
                user_ref = db.collection('users').document(patient_id)
                user_doc = user_ref.get()
                
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    # Bu hastanın randevularını say
                    patient_appointments = [apt for apt in all_appointments if apt.to_dict().get('userId') == patient_id]
                    
                    patients.append({
                        'userId': patient_id,
                        'email': user_data.get('email', ''),
                        'displayName': user_data.get('displayName', 'Bilinmeyen'),
                        'totalAppointments': len(patient_appointments),
                        'lastAppointment': max([apt.to_dict().get('date', '') for apt in patient_appointments], default='')
                    })
            except Exception as e:
                logger.warning(f"Error getting patient info for {patient_id}: {str(e)}")
                continue
        
        return jsonify({
            "success": True,
            "patients": patients
        }), 200
    except Exception as e:
        logger.error(f"Error getting doctor patients: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

@app.route("/api/appointments", methods=["POST"])
@limiter.limit("20 per hour")  # Saatte max 20 randevu talebi (test için artırıldı)
def create_appointment():
    """
    Yeni randevu talebi oluştur
    
    Request Body:
        date (str): Randevu tarihi (YYYY-MM-DD)
        time (str): Randevu saati (HH:MM)
        reason (str): Randevu nedeni/şikayet
        doctorType (str, opsiyonel): Doktor türü (dermatolog, ortopedist, vb.)
        status (str): Randevu durumu (pending, approved, rejected, completed)
    
    Returns:
        JSON: {"success": bool, "appointmentId": str, "jitsiRoom": str}
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    data = request.get_json()
    appointment_date = data.get("date")
    appointment_time = data.get("time")
    reason = data.get("reason")
    doctor_type = data.get("doctorType")
    # Randevu talebi → status: "pending" (doktor onayı bekliyor)
    status = data.get("status", "pending")
    
    if not appointment_date or not appointment_time or not reason:
        return jsonify({"success": False, "error": "date, time ve reason gerekli"}), 400
    
    try:
        # Jitsi Meet room ID oluştur (unique)
        import hashlib
        room_id = hashlib.md5(f"{uid}_{appointment_date}_{appointment_time}".encode()).hexdigest()[:12]
        jitsi_room = f"medianalytica-{room_id}"
        
        # Randevu dokümanı oluştur
        appointment_ref = db.collection('appointments').document()
        appointment_data = {
            'userId': uid,
            'date': appointment_date,
            'time': appointment_time,
            'reason': reason,
            'doctorType': doctor_type,
            'status': status,
            'jitsiRoom': jitsi_room,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        appointment_ref.set(appointment_data)
        
        return jsonify({
            "success": True,
            "appointmentId": appointment_ref.id,
            "jitsiRoom": jitsi_room,
            "status": "pending",
            "message": "Randevu talebiniz alındı! Doktor onayından sonra görüntülü görüşmeye katılabilirsiniz."
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/appointments", methods=["GET"])
@limiter.limit("30 per minute")
def get_appointments():
    """
    Kullanıcının randevularını getir
    
    Query Parameters:
        status (str, opsiyonel): Randevu durumu filtresi (pending, approved, rejected, completed)
    
    Returns:
        JSON: {"success": bool, "appointments": list}
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        status_filter = request.args.get('status', None)
        
        query = db.collection('appointments').where('userId', '==', uid)
        
        if status_filter:
            query = query.where('status', '==', status_filter)
        
        appointments = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            # Timestamp'i serialize et
            if 'createdAt' in data:
                if hasattr(data['createdAt'], 'timestamp'):
                    data['createdAt'] = data['createdAt'].timestamp()
                elif isinstance(data['createdAt'], datetime):
                    data['createdAt'] = data['createdAt'].timestamp()
                else:
                    data['createdAt'] = None
            if 'updatedAt' in data:
                if hasattr(data['updatedAt'], 'timestamp'):
                    data['updatedAt'] = data['updatedAt'].timestamp()
                elif isinstance(data['updatedAt'], datetime):
                    data['updatedAt'] = data['updatedAt'].timestamp()
                else:
                    data['updatedAt'] = None
            
            # approvedAt timestamp'ini serialize et
            if 'approvedAt' in data:
                if hasattr(data['approvedAt'], 'timestamp'):
                    data['approvedAt'] = data['approvedAt'].timestamp()
                elif isinstance(data['approvedAt'], datetime):
                    data['approvedAt'] = data['approvedAt'].timestamp()
                else:
                    data['approvedAt'] = None
            
            appointments.append(data)
        
        # Frontend'de sıralama yap (Firestore index gereksinimini önlemek için)
        appointments.sort(key=lambda x: (
            x.get('date', ''),
            x.get('time', '')
        ), reverse=True)
        
        return jsonify({
            "success": True,
            "count": len(appointments),
            "appointments": appointments
        }), 200
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in get_appointments: {error_trace}")
        return jsonify({
            "success": False, 
            "error": str(e),
            "details": error_trace if app.debug else None
        }), 500

@app.route("/api/appointments/<appointment_id>/join", methods=["GET"])
@limiter.limit("20 per minute")
def join_appointment(appointment_id):
    """
    Randevuya katıl (Jitsi Meet room linki döner)
    
    Returns:
        JSON: {"success": bool, "jitsiUrl": str, "roomName": str}
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    try:
        appointment_ref = db.collection('appointments').document(appointment_id)
        appointment_doc = appointment_ref.get()
        
        if not appointment_doc.exists:
            return jsonify({"success": False, "error": "Randevu bulunamadı"}), 404
        
        appointment_data = appointment_doc.to_dict()
        
        # Kullanıcı kontrolü: Randevu sahibi (hasta) veya doktor olmalı
        is_patient = appointment_data.get('userId') == uid
        is_doctor = False
        
        # Doktor kontrolü
        if not is_patient:
            doctor_ref = db.collection('doctors').where('userId', '==', uid).limit(1).stream()
            doctor_docs = list(doctor_ref)
            if doctor_docs:
                doctor_data = doctor_docs[0].to_dict()
                if doctor_data.get('status') == 'approved':
                    is_doctor = True
        
        if not is_patient and not is_doctor:
            return jsonify({"success": False, "error": "Bu randevuya erişim yetkiniz yok"}), 403
        
        # Randevu durumu kontrol et (sadece hasta için zorunlu, doktor her zaman katılabilir)
        if is_patient and appointment_data.get('status') != 'approved':
            return jsonify({
                "success": False, 
                "error": "Bu randevu henüz onaylanmamış",
                "status": appointment_data.get('status')
            }), 400
        
        # Jitsi Meet URL oluştur
        room_name = appointment_data.get('jitsiRoom', f"medianalytica-{appointment_id}")
        jitsi_url = f"https://meet.jit.si/{room_name}"
        
        return jsonify({
            "success": True,
            "jitsiUrl": jitsi_url,
            "roomName": room_name,
            "appointment": {
                "date": appointment_data.get('date'),
                "time": appointment_data.get('time'),
                "reason": appointment_data.get('reason')
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/feedback", methods=["POST"])
@limiter.limit("10 per minute")  # Dakikada max 10 geri bildirim
def submit_feedback():
    """
    Kullanıcı geri bildirimi kaydet
    
    Request Body:
        type (str): Geri bildirim türü (bug, feature, improvement, other)
        rating (int): Yıldız puanı (0-5)
        message (str): Geri bildirim mesajı
    
    Returns:
        JSON: {"success": bool, "message": str}
    """
    uid, error_response, status_code = verify_token()
    if uid is None:
        return error_response, status_code
    
    data = request.get_json()
    feedback_type = data.get("type")
    rating = data.get("rating", 0)
    message = data.get("message")
    
    if not feedback_type or not message:
        return jsonify({"success": False, "error": "type ve message gerekli"}), 400
    
    try:
        # Firestore'a kaydet
        feedback_ref = db.collection('feedback').document()
        feedback_ref.set({
            'userId': uid,
            'type': feedback_type,
            'rating': rating,
            'message': message,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'status': 'new'
        })
        
        return jsonify({
            "success": True,
            "message": "Geri bildiriminiz alındı. Teşekkürler!"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def update_user_stats(uid, disease_type):
    """
    Kullanıcı istatistiklerini güncelle (opsiyonel - cache için).
    
    Bu fonksiyon şu an için placeholder. İleride kullanıcı istatistiklerini
    cache'lemek veya hızlı erişim için kullanılabilir.
    
    Args:
        uid (str): Firebase kullanıcı ID'si
        disease_type (str): Hastalık türü (bone, skin, lung, eye)
    
    Returns:
        None: Hata durumunda sessizce devam eder
    """
    try:
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            # İstatistikleri güncelle (opsiyonel)
            # Burada daha detaylı istatistikler saklanabilir
            # Örnek: Her hastalık türü için toplam analiz sayısı
            pass
    except Exception as e:
        # Hata durumunda sessizce devam et (analiz kaydı başarısız olmasın)
        print(f"[WARNING] User stats update failed: {e}")
        pass

# ============================================================================
# SWAGGER API DOCUMENTATION
# ============================================================================

SWAGGER_URL = '/api/docs'
API_URL = '/api/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "MediAnalytica API",
        'docExpansion': 'list',
        'defaultModelsExpandDepth': 3
    }
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route(API_URL)
def swagger_json():
    """Swagger JSON specification"""
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "MediAnalytica API",
            "version": "1.0.0",
            "description": "Hastalık tespit sistemi için RESTful API"
        },
        "servers": [
            {"url": "http://localhost:5001", "description": "Development server"}
        ],
        "paths": {
            "/api/user/analyses": {
                "get": {
                    "summary": "Kullanıcı analiz geçmişini getir",
                    "parameters": [
                        {"name": "page", "in": "query", "schema": {"type": "integer", "default": 1}},
                        {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 20}},
                        {"name": "diseaseType", "in": "query", "schema": {"type": "string"}},
                        {"name": "last_doc_id", "in": "query", "schema": {"type": "string"}}
                    ],
                    "responses": {
                        "200": {"description": "Başarılı"}
                    }
                },
                "post": {
                    "summary": "Yeni analiz kaydet",
                    "responses": {
                        "200": {"description": "Başarılı"}
                    }
                }
            }
        }
    }), 200

# ============================================================================
# STATUS ENDPOINT
# ============================================================================

@app.route("/")
def status():
    return jsonify({
        "status": "Auth API is running",
        "version": "1.0.0",
        "docs": f"http://localhost:5001{SWAGGER_URL}",
        "endpoints": {
            "auth": ["/auth/register", "/auth/verify"],
            "analyses": ["POST /api/user/analyses", "GET /api/user/analyses"],
            "stats": ["GET /api/user/stats"],
            "profile": ["GET /api/user/profile", "PUT /api/user/profile", "POST /api/user/profile/photo"],
            "favorites": ["POST /api/user/favorites", "GET /api/user/favorites", "DELETE /api/user/favorites/<id>"],
            "share": ["POST /api/share/analysis", "GET /api/share/<token>"],
            "contact": ["POST /api/contact"],
            "feedback": ["POST /api/feedback"]
        }
    }), 200

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🔥 FIREBASE AUTH API SERVER")
    print("="*70)
    print(f"\n[SERVER] Çalışıyor: http://localhost:5001")
    print(f"[API] Durum: http://localhost:5001/")
    print("\n[ENDPOINTS]")
    print("  Auth: /auth/register, /auth/verify")
    print("  Analyses: POST/GET /api/user/analyses")
    print("  Stats: GET /api/user/stats")
    print("  Profile: GET/PUT /api/user/profile, POST /api/user/profile/photo")
    print("  Favorites: POST/GET /api/user/favorites, DELETE /api/user/favorites/<id>")
    print("  Share: POST /api/share/analysis, GET /api/share/<token>")
    print("\n" + "="*70 + "\n")
    
    app.run(host="0.0.0.0", port=5001, debug=True)
