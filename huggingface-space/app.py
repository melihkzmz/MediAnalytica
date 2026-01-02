#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediAnalytica - Combined Disease Detection API
Hugging Face Spaces Deployment
Supports: Skin, Bone, Lung, Eye Disease Detection
"""

import os
import sys
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import tensorflow as tf
from tensorflow import keras

# OpenCV for CLAHE (X-ray preprocessing)
try:
    import cv2
    CLAHE_AVAILABLE = True
except ImportError:
    print("[WARNING] OpenCV not available. CLAHE disabled.")
    CLAHE_AVAILABLE = False

# Preprocessing functions
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess

# Hugging Face Hub for model downloading
try:
    from huggingface_hub import snapshot_download, hf_hub_download
    HF_HUB_AVAILABLE = True
except ImportError:
    print("[WARNING] huggingface_hub not available. Models must be in local 'models/' folder.")
    HF_HUB_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# ============================================================================
# CONFIGURATION - Update with your Hugging Face username
# ============================================================================

HF_USERNAME = os.environ.get('HF_USERNAME', 'melihkzmz')  # Set your HF username here or via env var
REPO_PREFIX = 'medianalytica'  # Prefix for model repositories

# ============================================================================
# MODEL CONFIGURATIONS
# ============================================================================

MODELS = {
    'skin': {
        'hf_repo': f'{HF_USERNAME}/{REPO_PREFIX}-skin-model',  # Hugging Face Hub repository
        'path': 'models/skin_disease_model_5class_efficientnetb3_macro_f1_savedmodel',
        'path_alt': 'models/skin_disease_model_5class_efficientnetb3_macro_f1.keras',
        'img_size': (300, 300),
        'classes': ['akiec', 'bcc', 'bkl', 'mel', 'nv'],
        'classes_tr': {
            'akiec': 'Aktinik Keratoz',
            'bcc': 'Bazal Hücreli Karsinom',
            'bkl': 'İyi Huylu Keratoz',
            'mel': 'Melanom',
            'nv': 'Melanositik Nevüs (Ben)'
        },
        'preprocess': 'efficientnet',
        'model': None
    },
    'bone': {
        'hf_repo': f'{HF_USERNAME}/{REPO_PREFIX}-bone-model',
        'path': 'models/bone_disease_model_4class_densenet121_macro_f1_savedmodel',
        'path_alt': 'models/bone_disease_model_4class_densenet121_macro_f1.keras',
        'img_size': (384, 384),
        'classes': ['Normal', 'Fracture', 'Benign_Tumor', 'Malignant_Tumor'],
        'classes_tr': {
            'Normal': 'Normal',
            'Fracture': 'Kırık',
            'Benign_Tumor': 'İyi Huylu Tümör',
            'Malignant_Tumor': 'Kötü Huylu Tümör'
        },
        'preprocess': 'densenet_clahe',
        'model': None
    },
    'lung': {
        'hf_repo': f'{HF_USERNAME}/{REPO_PREFIX}-lung-model',
        'path': 'models/lung_3class_densenet121_macro_f1_savedmodel',
        'path_alt': 'models/lung_3class_densenet121_macro_f1.keras',
        'img_size': (384, 384),
        'classes': ['COVID-19', 'Non-COVID', 'Normal'],
        'classes_tr': {
            'COVID-19': 'COVID-19',
            'Non-COVID': 'Non-COVID (Pnömoni)',
            'Normal': 'Normal'
        },
        'preprocess': 'densenet_clahe',
        'model': None
    },
    'eye': {
        'hf_repo': f'{HF_USERNAME}/{REPO_PREFIX}-eye-model',
        'path': 'models/eye_disease_model.keras',
        'path_alt': 'models/eye_disease_model_5class_improved.keras',
        'img_size': (224, 224),
        'classes': ['Diabetic_Retinopathy', 'Disc_Edema', 'Glaucoma', 'Macular_Scar', 
                   'Myopia', 'Normal', 'Pterygium', 'Retinal_Detachment', 'Retinitis_Pigmentosa'],
        'classes_tr': {
            'Diabetic_Retinopathy': 'Diyabetik Retinopati',
            'Disc_Edema': 'Disk Ödemi',
            'Glaucoma': 'Glokom',
            'Macular_Scar': 'Maküla Skarı',
            'Myopia': 'Miyopi',
            'Normal': 'Normal',
            'Pterygium': 'Pterijyum',
            'Retinal_Detachment': 'Retina Dekolmanı',
            'Retinitis_Pigmentosa': 'Retinitis Pigmentosa'
        },
        'preprocess': 'simple',
        'model': None
    }
}

# ============================================================================
# CUSTOM METRIC CLASS - Required for model loading
# ============================================================================

class StreamingMacroF1(keras.metrics.Metric):
    """Streaming Macro F1 Metric - Required for loading trained models"""
    def __init__(self, num_classes=3, name='macro_f1_metric', **kwargs):
        super(StreamingMacroF1, self).__init__(name=name, **kwargs)
        self.num_classes = num_classes
        self.true_positives = self.add_weight(name='tp', shape=(num_classes,), initializer='zeros', dtype=tf.float32)
        self.false_positives = self.add_weight(name='fp', shape=(num_classes,), initializer='zeros', dtype=tf.float32)
        self.false_negatives = self.add_weight(name='fn', shape=(num_classes,), initializer='zeros', dtype=tf.float32)
    
    def update_state(self, y_true, y_pred, sample_weight=None):
        y_true_classes = tf.cast(tf.argmax(y_true, axis=1), tf.int32)
        y_pred_classes = tf.cast(tf.argmax(y_pred, axis=1), tf.int32)
        y_true_one_hot = tf.one_hot(y_true_classes, depth=self.num_classes, dtype=tf.float32)
        y_pred_one_hot = tf.one_hot(y_pred_classes, depth=self.num_classes, dtype=tf.float32)
        tp = tf.reduce_sum(y_true_one_hot * y_pred_one_hot, axis=0)
        fp = tf.reduce_sum((1.0 - y_true_one_hot) * y_pred_one_hot, axis=0)
        fn = tf.reduce_sum(y_true_one_hot * (1.0 - y_pred_one_hot), axis=0)
        self.true_positives.assign_add(tp)
        self.false_positives.assign_add(fp)
        self.false_negatives.assign_add(fn)
    
    def result(self):
        precision = self.true_positives / (self.true_positives + self.false_positives + 1e-8)
        recall = self.true_positives / (self.true_positives + self.false_negatives + 1e-8)
        f1_scores = 2.0 * precision * recall / (precision + recall + 1e-8)
        return tf.reduce_mean(f1_scores)
    
    def reset_state(self):
        self.true_positives.assign(tf.zeros_like(self.true_positives))
        self.false_positives.assign(tf.zeros_like(self.false_positives))
        self.false_negatives.assign(tf.zeros_like(self.false_negatives))
    
    def get_config(self):
        config = super(StreamingMacroF1, self).get_config()
        config.update({'num_classes': self.num_classes})
        return config

# ============================================================================
# PREPROCESSING FUNCTIONS
# ============================================================================

def apply_clahe(img):
    """Apply CLAHE for X-ray images"""
    if not CLAHE_AVAILABLE:
        return img
    
    if img.dtype != np.uint8:
        img_uint8 = np.clip(img, 0, 255).astype(np.uint8)
    else:
        img_uint8 = img
    
    # Check if grayscale
    if len(img_uint8.shape) == 3 and img_uint8.shape[2] == 3:
        if np.allclose(img_uint8[:,:,0], img_uint8[:,:,1]) and np.allclose(img_uint8[:,:,1], img_uint8[:,:,2]):
            img_2d = img_uint8[:,:,0]
        else:
            return img  # RGB image, no CLAHE
    elif len(img_uint8.shape) == 2:
        img_2d = img_uint8
    else:
        return img
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img_2d)
    
    # Convert back to RGB
    return np.stack([img_clahe] * 3, axis=-1)

def preprocess_image(image, disease_type):
    """Preprocess image based on disease type"""
    config = MODELS[disease_type]
    img_size = config['img_size']
    preprocess_type = config['preprocess']
    
    # Resize
    image = image.resize(img_size)
    img_array = np.array(image)
    
    # Ensure RGB
    if len(img_array.shape) == 2:
        img_array = np.stack([img_array] * 3, axis=-1)
    elif img_array.shape[2] == 4:
        img_array = img_array[:, :, :3]
    elif img_array.shape[2] == 1:
        img_array = np.repeat(img_array, 3, axis=-1)
    
    # Apply preprocessing
    if preprocess_type == 'densenet_clahe':
        # Apply CLAHE for X-ray images
        if img_array.dtype != np.uint8:
            img_array = np.clip(img_array, 0, 255).astype(np.uint8)
        img_array = apply_clahe(img_array)
        img_array = img_array.astype(np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = densenet_preprocess(img_array)
    elif preprocess_type == 'efficientnet':
        img_array = img_array.astype(np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = efficientnet_preprocess(img_array)
    else:  # simple - for eye
        img_array = img_array.astype(np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# ============================================================================
# MODEL DOWNLOADING FROM HUGGING FACE HUB
# ============================================================================

def download_model_from_hub(disease_type, config):
    """Download model from Hugging Face Hub"""
    if not HF_HUB_AVAILABLE:
        return None
    
    hf_repo = config.get('hf_repo', '')
    if not hf_repo or hf_repo.startswith('YOUR_HF_USERNAME'):
        print(f"[SKIP] {disease_type}: HF_USERNAME not configured")
        return None
    
    try:
        print(f"[DOWNLOAD] {disease_type}: Downloading from {hf_repo}...")
        
        # Create models directory
        os.makedirs('models', exist_ok=True)
        
        # Download entire repository (for SavedModel) or specific file
        local_dir = os.path.join('models', disease_type)
        
        # Try to download as repository first (for SavedModel)
        try:
            snapshot_download(
                repo_id=hf_repo,
                local_dir=local_dir,
                repo_type="model",
                local_dir_use_symlinks=False
            )
            print(f"[SUCCESS] {disease_type}: Downloaded to {local_dir}")
            return local_dir
        except Exception as e:
            # If repository download fails, try downloading individual files
            print(f"[INFO] {disease_type}: Repository download failed, trying individual files...")
            
            # Try common model file names
            model_files = [
                'saved_model.pb',
                'model.keras',
                'model.h5',
                'model.pb'
            ]
            
            for filename in model_files:
                try:
                    downloaded_path = hf_hub_download(
                        repo_id=hf_repo,
                        filename=filename,
                        local_dir=local_dir,
                        repo_type="model",
                        local_dir_use_symlinks=False
                    )
                    print(f"[SUCCESS] {disease_type}: Downloaded {filename}")
                    return os.path.dirname(downloaded_path) if os.path.isfile(downloaded_path) else downloaded_path
                except:
                    continue
            
            print(f"[WARNING] {disease_type}: Could not download from Hub: {e}")
            return None
            
    except Exception as e:
        print(f"[ERROR] {disease_type}: Download failed: {e}")
        return None

# ============================================================================
# MODEL LOADING
# ============================================================================

def load_models():
    """Load all available models - tries Hub first, then local"""
    custom_objects = {
        'StreamingMacroF1': StreamingMacroF1,
        'macro_f1_metric': StreamingMacroF1(num_classes=3)
    }
    
    for disease_type, config in MODELS.items():
        # Step 1: Try downloading from Hugging Face Hub
        hub_path = download_model_from_hub(disease_type, config)
        
        # Step 2: Try loading from Hub path, then local paths
        paths_to_try = []
        if hub_path:
            # If it's a directory, add it; if it's a file, add parent directory
            if os.path.isdir(hub_path):
                paths_to_try.append(hub_path)
            else:
                paths_to_try.append(os.path.dirname(hub_path))
        
        # Add local paths
        paths_to_try.extend([config['path'], config['path_alt']])
        
        # Try each path
        model_loaded = False
        for path in paths_to_try:
            if not path or not os.path.exists(path):
                continue
            
            try:
                print(f"[LOADING] {disease_type}: {path}")
                
                if os.path.isdir(path):
                    # SavedModel format
                    model = tf.saved_model.load(path)
                    if hasattr(model, 'signatures') and 'serving_default' in model.signatures:
                        config['model'] = model.signatures['serving_default']
                        config['model_type'] = 'savedmodel'
                    else:
                        config['model'] = model
                        config['model_type'] = 'savedmodel_callable'
                else:
                    # Keras format
                    config['model'] = keras.models.load_model(path, custom_objects=custom_objects, compile=False)
                    config['model_type'] = 'keras'
                
                print(f"[SUCCESS] {disease_type} model loaded!")
                model_loaded = True
                break
                
            except Exception as e:
                print(f"[ERROR] Failed to load {disease_type} from {path}: {str(e)[:200]}")
                continue
        
        if not model_loaded:
            print(f"[WARNING] {disease_type} model not found! Check HF_USERNAME or upload models to Hub.")

# Load models at startup
print("=" * 60)
print("MediAnalytica - Loading Models...")
print("=" * 60)
load_models()
print("=" * 60)

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/')
def home():
    """API status and available endpoints"""
    available_models = {k: v['model'] is not None for k, v in MODELS.items()}
    return jsonify({
        "status": "OK",
        "message": "MediAnalytica Disease Detection API",
        "version": "1.0",
        "models": available_models,
        "endpoints": {
            "GET /": "API status",
            "GET /health": "Health check",
            "POST /predict/<disease_type>": "Predict disease (skin, bone, lung, eye)",
            "GET /classes/<disease_type>": "Get class names"
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    available = sum(1 for v in MODELS.values() if v['model'] is not None)
    return jsonify({
        "status": "healthy" if available > 0 else "no_models",
        "models_loaded": available,
        "total_models": len(MODELS)
    })

@app.route('/classes/<disease_type>')
def get_classes(disease_type):
    """Get class names for a disease type"""
    if disease_type not in MODELS:
        return jsonify({"error": f"Unknown disease type: {disease_type}. Available: {list(MODELS.keys())}"}), 400
    
    config = MODELS[disease_type]
    return jsonify({
        "disease_type": disease_type,
        "classes": config['classes'],
        "classes_tr": config['classes_tr'],
        "image_size": config['img_size']
    })

@app.route('/predict/<disease_type>', methods=['POST'])
def predict(disease_type):
    """Predict disease from uploaded image"""
    if disease_type not in MODELS:
        return jsonify({"error": f"Unknown disease type: {disease_type}. Available: {list(MODELS.keys())}"}), 400
    
    config = MODELS[disease_type]
    model = config['model']
    
    if model is None:
        return jsonify({"error": f"Model for {disease_type} not loaded"}), 503
    
    if 'image' not in request.files:
        return jsonify({"error": "No image provided. Use 'image' field."}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    try:
        # Load and preprocess image
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        processed_image = preprocess_image(image, disease_type)
        
        # Predict
        model_type = config.get('model_type', 'keras')
        if model_type == 'savedmodel':
            # SavedModel signature
            input_tensor = tf.constant(processed_image, dtype=tf.float32)
            predictions = model(input_tensor)
            # Get output from dict
            output_key = list(predictions.keys())[0]
            predictions = predictions[output_key].numpy()
        elif model_type == 'savedmodel_callable':
            input_tensor = tf.constant(processed_image, dtype=tf.float32)
            predictions = model(input_tensor)
            if hasattr(predictions, 'numpy'):
                predictions = predictions.numpy()
        else:
            predictions = model.predict(processed_image, verbose=0)
        
        # Format results
        classes = config['classes']
        classes_tr = config['classes_tr']
        
        results = []
        for i, class_name in enumerate(classes):
            conf = float(predictions[0][i])
            results.append({
                "class": class_name,
                "class_tr": classes_tr.get(class_name, class_name),
                "confidence": conf,
                "percentage": f"{conf * 100:.2f}%"
            })
        
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return jsonify({
            "success": True,
            "disease_type": disease_type,
            "prediction": results[0]["class"],
            "prediction_tr": results[0]["class_tr"],
            "confidence": results[0]["confidence"],
            "confidence_percentage": results[0]["percentage"],
            "top_3": results[:3],
            "all_predictions": results
        })
        
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)

