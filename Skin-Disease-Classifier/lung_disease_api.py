#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AKCIGER HASTALIKLARI TESPIT API
Flask API for Lung Disease Detection (3 Classes)
Model: DenseNet121 - Macro F1 Optimized
"""

import os
import sys
import numpy as np
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from PIL import Image
import io
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
import base64

# OpenCV for CLAHE (optional but recommended for X-ray images)
try:
    import cv2
    CLAHE_AVAILABLE = True
except ImportError:
    print("[WARNING] OpenCV (cv2) not found. CLAHE will be disabled. Install with: pip install opencv-python")
    CLAHE_AVAILABLE = False

# UTF-8 encoding
if sys.platform == 'win32':
    try:
    sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

# Flask app
app = Flask(__name__)
CORS(app)  # Frontend'den istek kabul etmek için

# Model configuration
MODEL_PATH_SAVEDMODEL = 'models/lung_3class_densenet121_macro_f1_savedmodel'
MODEL_PATH_KERAS = 'models/lung_3class_densenet121_macro_f1.keras'
MODEL_PATH_OLD = 'models/lung_disease_model.keras'
# Öncelik sırası: SavedModel > .keras > old model
if os.path.exists(MODEL_PATH_SAVEDMODEL):
    MODEL_PATH = MODEL_PATH_SAVEDMODEL
elif os.path.exists(MODEL_PATH_KERAS):
    MODEL_PATH = MODEL_PATH_KERAS
else:
    MODEL_PATH = MODEL_PATH_OLD

IMG_SIZE = (384, 384)  # Must match training size (medical imaging optimized)
CLASS_NAMES = ['COVID-19', 'Non-COVID', 'Normal']

CLASS_NAMES_TR = {
    'COVID-19': 'COVID-19',
    'Non-COVID': 'Non-COVID (Pnömoni)',
    'Normal': 'Normal'
}

CLASS_DESCRIPTIONS = {
    'COVID-19': 'COVID-19 enfeksiyonu belirtileri tespit edildi. Acil tıbbi değerlendirme önerilir.',
    'Non-COVID': 'COVID dışı pnömoni belirtileri tespit edildi. Tıbbi değerlendirme önerilir.',
    'Normal': 'Normal akciğer görüntüsü - Belirgin anormallik tespit edilmedi.'
}

# ============================================================================
# CUSTOM METRIC CLASS - Model yüklenirken gerekli
# ============================================================================

class StreamingMacroF1(keras.metrics.Metric):
    """
    Streaming Macro F1 Metric - Model yüklenirken gerekli
    Vectorized version matching training script exactly
    """
    def __init__(self, num_classes=3, name='macro_f1_metric', **kwargs):
        super(StreamingMacroF1, self).__init__(name=name, **kwargs)
        self.num_classes = num_classes
        
        # Initialize state variables for each class: TP, FP, FN
        self.true_positives = self.add_weight(
            name='tp',
            shape=(num_classes,),
            initializer='zeros',
            dtype=tf.float32
        )
        self.false_positives = self.add_weight(
            name='fp',
            shape=(num_classes,),
            initializer='zeros',
            dtype=tf.float32
        )
        self.false_negatives = self.add_weight(
            name='fn',
            shape=(num_classes,),
            initializer='zeros',
            dtype=tf.float32
        )
    
    def update_state(self, y_true, y_pred, sample_weight=None):
        """
        Update TP, FP, FN counts for current batch.
        Vectorized computation for all classes at once (matches training script).
        """
        # Convert to class indices
        y_true_classes = tf.cast(tf.argmax(y_true, axis=1), tf.int32)
        y_pred_classes = tf.cast(tf.argmax(y_pred, axis=1), tf.int32)
        
        # Vectorized computation: calculate TP/FP/FN for all classes simultaneously
        y_true_one_hot = tf.one_hot(y_true_classes, depth=self.num_classes, dtype=tf.float32)
        y_pred_one_hot = tf.one_hot(y_pred_classes, depth=self.num_classes, dtype=tf.float32)
        
        # True positives: (y_true == class) AND (y_pred == class)
        tp = tf.reduce_sum(y_true_one_hot * y_pred_one_hot, axis=0)
        
        # False positives: (y_true != class) AND (y_pred == class)
        fp = tf.reduce_sum((1.0 - y_true_one_hot) * y_pred_one_hot, axis=0)
        
        # False negatives: (y_true == class) AND (y_pred != class)
        fn = tf.reduce_sum(y_true_one_hot * (1.0 - y_pred_one_hot), axis=0)
        
        # Update state variables (vectorized update)
        self.true_positives.assign_add(tp)
        self.false_positives.assign_add(fp)
        self.false_negatives.assign_add(fn)
    
    def result(self):
        """
        Calculate macro F1 from accumulated TP/FP/FN.
        Vectorized computation for all classes.
        """
        # Vectorized calculation for all classes at once
        precision = self.true_positives / (self.true_positives + self.false_positives + 1e-8)
        recall = self.true_positives / (self.true_positives + self.false_negatives + 1e-8)
        f1_scores = 2.0 * precision * recall / (precision + recall + 1e-8)
        
        # Macro F1: average of all class F1 scores
        macro_f1 = tf.reduce_mean(f1_scores)
        return macro_f1
    
    def reset_state(self):
        """Reset all accumulated state."""
        self.true_positives.assign(tf.zeros_like(self.true_positives))
        self.false_positives.assign(tf.zeros_like(self.false_positives))
        self.false_negatives.assign(tf.zeros_like(self.false_negatives))
    
    def get_config(self):
        config = super(StreamingMacroF1, self).get_config()
        config.update({'num_classes': self.num_classes})
        return config

# Model yukle
print(f"Model yukleniyor: {MODEL_PATH}")
try:
    model = keras.models.load_model(
        MODEL_PATH,
        custom_objects={
            'StreamingMacroF1': StreamingMacroF1,
            'macro_f1_metric': StreamingMacroF1(num_classes=3)
        }
    )
    print(f"Model yuklendi! {len(CLASS_NAMES)} sinif")
except Exception as e:
    print(f"HATA: Model yuklenemedi: {e}")
    model = None

# ============================================================================
# YARDIMCI FONKSIYONLAR
# ============================================================================

def apply_clahe_grayscale(img):
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to grayscale images.
    CLAHE improves contrast in X-Ray images by enhancing local contrast.
    Must match training preprocessing exactly.
    """
    if not CLAHE_AVAILABLE:
        return img
    
    # Convert to uint8 if needed
    if img.dtype != np.uint8:
        img_uint8 = np.clip(img, 0, 255).astype(np.uint8)
    else:
        img_uint8 = img
    
    # Extract single channel for grayscale
    if len(img_uint8.shape) == 3 and img_uint8.shape[2] == 1:
        img_2d = img_uint8[:, :, 0]
    elif len(img_uint8.shape) == 2:
        img_2d = img_uint8
    else:
        # If RGB, convert to grayscale first
        img_2d = cv2.cvtColor(img_uint8, cv2.COLOR_RGB2GRAY)
    
    # Create CLAHE object (same parameters as training)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    # Apply CLAHE
    img_clahe = clahe.apply(img_2d)
    
    # Reshape back to (H, W, 1) if needed
    if len(img.shape) == 3:
        img_clahe = np.expand_dims(img_clahe, axis=-1)
    
    return img_clahe

def preprocess_image(image):
    """
    Goruntu on isleme - DenseNet121 için
    Must match training preprocessing: CLAHE + DenseNet ImageNet preprocessing
    """
    # Boyutlandir
    image = image.resize(IMG_SIZE)
    
    # Array'e cevir
    img = np.array(image)
    
    # Ensure input is in [0, 255] range and uint8 format
    if img.max() <= 1.0:
        img = (img * 255.0).astype(np.uint8)
    elif img.dtype != np.uint8:
        img = np.clip(img, 0, 255).astype(np.uint8)
    
    # Detect if image is grayscale
    is_grayscale = False
    if len(img.shape) == 2:
        is_grayscale = True
    elif len(img.shape) == 3:
        if img.shape[2] == 1:
            is_grayscale = True
        elif img.shape[2] == 3:
            # Check if it's actually grayscale (all channels same)
            if np.allclose(img[:,:,0], img[:,:,1]) and np.allclose(img[:,:,1], img[:,:,2]):
                is_grayscale = True
    
    # Apply CLAHE if grayscale and available (X-ray images benefit from this)
    if is_grayscale and CLAHE_AVAILABLE:
        img = apply_clahe_grayscale(img)
        if img.dtype != np.uint8:
            img = np.clip(img, 0, 255).astype(np.uint8)
    
    # Convert grayscale to RGB if needed
    if len(img.shape) == 2:
        img = np.stack([img] * 3, axis=-1)
    elif len(img.shape) == 3 and img.shape[2] == 1:
        img = np.repeat(img, 3, axis=-1)
    
    # Ensure RGB (not RGBA)
    if len(img.shape) == 3 and img.shape[2] == 4:
        img = img[:, :, :3]
    
    # Batch dimension ekle
    img_array = np.expand_dims(img, axis=0).astype(np.float32)
    
    # Apply official DenseNet121 ImageNet preprocessing
    img_array = densenet_preprocess(img_array)
    
    return img_array

def generate_gradcam(model, img_array, class_index, layer_name='conv5_block16_concat'):
    """Grad-CAM görselleştirmesi oluştur"""
    try:
        # Son konvolüsyon katmanını bul
        try:
            conv_layer = model.get_layer(layer_name)
        except:
            # Alternatif katman isimleri dene
            for name in ['conv5_block16_concat', 'conv5_block16_2_conv', 'top_conv', 'block14_sepconv2']:
                try:
                    conv_layer = model.get_layer(name)
                    break
                except:
                    continue
            else:
                return None
        
        # Grad-CAM modeli
        grad_model = keras.models.Model(
            inputs=model.input,
            outputs=[conv_layer.output, model.output]
        )
        
        # Gradient hesapla
        with tf.GradientTape() as tape:
            conv_output, predictions = grad_model(img_array)
            class_output = predictions[:, class_index]
        
        # Gradients
        grads = tape.gradient(class_output, conv_output)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Heatmap oluştur
        conv_output = conv_output[0]
        heatmap = tf.reduce_sum(pooled_grads * conv_output, axis=-1)
        heatmap = tf.maximum(heatmap, 0)
        heatmap = heatmap / (tf.reduce_max(heatmap) + keras.backend.epsilon())
        
        return heatmap.numpy()
    except Exception as e:
        print(f"Grad-CAM hatasi: {e}")
        return None

def create_gradcam_overlay(original_image, heatmap):
    """Grad-CAM overlay görüntüsü oluştur"""
    try:
        import cv2
        
        # Heatmap'i görüntü boyutuna getir
        heatmap_resized = cv2.resize(heatmap, (original_image.width, original_image.height))
        
        # Heatmap'i renklendir
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        # Orijinal görüntüyle birleştir
        original_array = np.array(original_image)
        if len(original_array.shape) == 2:
            original_array = cv2.cvtColor(original_array, cv2.COLOR_GRAY2RGB)
        
        overlay = cv2.addWeighted(original_array, 0.6, heatmap_colored, 0.4, 0)
        
        # Base64'e çevir
        overlay_image = Image.fromarray(overlay)
        buffer = io.BytesIO()
        overlay_image.save(buffer, format='PNG')
        buffer.seek(0)
        
        return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
    except Exception as e:
        print(f"Overlay hatasi: {e}")
        return None

def predict_lung_disease(image, with_gradcam=False):
    """Akciger hastaligi tahmini"""
    if model is None:
        return {"error": "Model yuklu degil"}
    
    try:
        # On isleme
        processed_image = preprocess_image(image)
        
        # Tahmin
        predictions = model.predict(processed_image, verbose=0)
        
        # Sonuclari hazirla
        results = []
        for i, class_name in enumerate(CLASS_NAMES):
            confidence = float(predictions[0][i])
            results.append({
                "class": class_name,
                "class_tr": CLASS_NAMES_TR.get(class_name, class_name),
                "confidence": confidence,
                "percentage": f"{confidence * 100:.2f}%",
                "description": CLASS_DESCRIPTIONS.get(class_name, '')
            })
        
        # Confidence'a gore sirala
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        response = {
            "success": True,
            "prediction": results[0]["class"],
            "prediction_tr": results[0]["class_tr"],
            "confidence": results[0]["confidence"],
            "confidence_percentage": results[0]["percentage"],
            "description": results[0]["description"],
            "top_3": results[:3],
            "all_predictions": results
        }
        
        # Grad-CAM ekle
        if with_gradcam:
            top_class_index = CLASS_NAMES.index(results[0]["class"])
            heatmap = generate_gradcam(model, processed_image, top_class_index)
            if heatmap is not None:
                gradcam_image = create_gradcam_overlay(image, heatmap)
                if gradcam_image:
                    response["gradcam"] = gradcam_image
        
        return response
    
    except Exception as e:
        return {"error": str(e)}

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/')
def home():
    """Ana sayfa"""
    return jsonify({
        "status": "OK",
        "message": "Akciger Hastaliklari Tespit API",
        "version": "2.0",
        "model": "DenseNet121 (Macro F1 Optimized)",
        "model_path": MODEL_PATH,
        "classes": CLASS_NAMES,
        "classes_tr": CLASS_NAMES_TR,
        "image_size": IMG_SIZE,
        "endpoints": {
            "GET /": "API durumu",
            "POST /predict": "Goruntu tahmini (multipart/form-data, field: 'image', optional: 'with_gradcam')",
            "GET /health": "Saglik kontrolu",
            "GET /web": "Web arayuzu"
        }
    })

@app.route('/health')
def health():
    """Sağlık kontrolü endpoint'i"""
    return jsonify({
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Tahmin endpoint'i"""
    if 'image' not in request.files:
        return jsonify({"error": "Goruntu bulunamadi. 'image' field'i gerekli."}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "Dosya secilmedi"}), 400
    
    # Grad-CAM isteniyor mu?
    with_gradcam = request.form.get('with_gradcam', 'false').lower() == 'true'
    
    try:
        # Goruntu yukle
        image = Image.open(io.BytesIO(file.read()))
        
        # RGB'ye çevir
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Tahmin yap
        result = predict_lung_disease(image, with_gradcam=with_gradcam)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Tahmin hatasi: {str(e)}"}), 500

@app.route('/web')
def web():
    """Web arayuzu"""
    html = """
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Akciger Hastaliklari Tespit</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .upload-area {
            border: 3px dashed #667eea;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }
        
        .upload-area:hover {
            background: #f8f9ff;
            border-color: #764ba2;
        }
        
        .upload-area.dragover {
            background: #f0f2ff;
            border-color: #764ba2;
            transform: scale(1.02);
        }
        
        #file-input {
            display: none;
        }
        
        .upload-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .upload-text {
            color: #667eea;
            font-size: 16px;
            font-weight: 600;
        }
        
        .upload-hint {
            color: #999;
            font-size: 12px;
            margin-top: 10px;
        }
        
        #preview-container {
            margin: 20px 0;
            text-align: center;
            display: none;
        }
        
        #preview-image {
            max-width: 100%;
            max-height: 300px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            margin-top: 10px;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        #result {
            margin-top: 25px;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        
        .result-success {
            background: #d4edda;
            border: 2px solid #28a745;
        }
        
        .result-error {
            background: #f8d7da;
            border: 2px solid #dc3545;
        }
        
        .result-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .prediction-main {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .prediction-class {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .prediction-confidence {
            font-size: 18px;
            color: #666;
        }
        
        .all-predictions {
            margin-top: 15px;
        }
        
        .prediction-item {
            background: white;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .prediction-label {
            font-weight: 600;
            color: #333;
        }
        
        .prediction-value {
            color: #667eea;
            font-weight: 600;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .info-title {
            font-weight: 600;
            color: #2196F3;
            margin-bottom: 8px;
        }
        
        .class-list {
            list-style: none;
            padding-left: 0;
        }
        
        .class-list li {
            padding: 5px 0;
            color: #555;
        }
        
        .class-list li:before {
            content: "• ";
            color: #2196F3;
            font-weight: bold;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🫁 Akciger Hastaliklari Tespit</h1>
        <p class="subtitle">X-Ray goruntusu yukleyin ve analiz edin</p>
        
        <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
            <div class="upload-icon">📤</div>
            <div class="upload-text">Goruntu secmek icin tiklayin</div>
            <div class="upload-hint">veya goruntuyu buraya surukleyin</div>
            <input type="file" id="file-input" accept="image/*" onchange="handleFileSelect(event)">
        </div>
        
        <div id="preview-container">
            <img id="preview-image" alt="Preview">
        </div>
        
        <button id="predict-btn" onclick="predictDisease()" disabled>Analiz Et</button>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Analiz ediliyor...</p>
        </div>
        
        <div id="result"></div>
        
        <div class="info-box">
            <div class="info-title">Model Bilgileri</div>
            <ul class="class-list">
                <li>COVID-19: Koronavirus enfeksiyonu</li>
                <li>Non-COVID: Diger pnomoni turleri</li>
                <li>Normal: Saglikli akciger</li>
            </ul>
            <p style="margin-top: 10px; color: #666; font-size: 13px;">
                Model: <strong>DenseNet121</strong> | Macro F1 Optimized
            </p>
        </div>
    </div>

    <script>
        let selectedFile = null;
        
        // Drag & drop
        const uploadArea = document.getElementById('upload-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });
        
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        }, false);
        
        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                handleFile(file);
            }
        }
        
        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                alert('Lutfen bir goruntu dosyasi secin!');
                return;
            }
            
            selectedFile = file;
            
            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-image').src = e.target.result;
                document.getElementById('preview-container').style.display = 'block';
            };
            reader.readAsDataURL(file);
            
            // Enable button
            document.getElementById('predict-btn').disabled = false;
            document.getElementById('result').style.display = 'none';
        }
        
        async function predictDisease() {
            if (!selectedFile) {
                alert('Lutfen bir goruntu secin!');
                return;
            }
            
            // UI update
            document.getElementById('predict-btn').disabled = true;
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            // Form data
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    showError(data.error);
                } else {
                    showResult(data);
                }
            } catch (error) {
                showError('Baglanti hatasi: ' + error.message);
            } finally {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('predict-btn').disabled = false;
            }
        }
        
        function showResult(data) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'result-success';
            
            let html = '<div class="result-title">Analiz Sonucu</div>';
            
            // Ana tahmin
            html += '<div class="prediction-main">';
            html += `<div class="prediction-class">${data.prediction}</div>`;
            html += `<div class="prediction-confidence">Guven: ${data.confidence}</div>`;
            html += '</div>';
            
            // Tum tahminler
            html += '<div class="all-predictions">';
            html += '<div style="font-weight: 600; margin-bottom: 10px; text-align: center;">Detayli Sonuclar:</div>';
            data.all_predictions.forEach(pred => {
                html += '<div class="prediction-item">';
                html += `<span class="prediction-label">${pred.class}</span>`;
                html += `<span class="prediction-value">${pred.percentage}</span>`;
                html += '</div>';
            });
            html += '</div>';
            
            resultDiv.innerHTML = html;
            resultDiv.style.display = 'block';
        }
        
        function showError(message) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'result-error';
            resultDiv.innerHTML = `
                <div class="result-title">Hata</div>
                <p style="text-align: center; color: #721c24;">${message}</p>
            `;
            resultDiv.style.display = 'block';
        }
    </script>
</body>
</html>
    """
    return render_template_string(html)

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print(" AKCIGER HASTALIKLARI TESPIT API")
    print(" Lung Disease Detection API - DenseNet121 Macro F1")
    print("=" * 70)
    print(f"Model: {MODEL_PATH}")
    print(f"Goruntu boyutu: {IMG_SIZE}")
    print(f"\nSiniflar:")
    for i, class_name in enumerate(CLASS_NAMES, 1):
        print(f"  {i}. {class_name} - {CLASS_NAMES_TR.get(class_name, class_name)}")
    print(f"\nAPI calistiriliyor...")
    print(f"Adres: http://localhost:5004")
    print(f"Endpoint'ler:")
    print(f"  GET  /        - API durumu")
    print(f"  GET  /health  - Saglik kontrolu")
    print(f"  POST /predict - Goruntu tahmini (with_gradcam destekli)")
    print(f"  GET  /web     - Web arayuzu")
    print(f"\nWeb arayuzu: http://localhost:5004/web")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5004, debug=False)

