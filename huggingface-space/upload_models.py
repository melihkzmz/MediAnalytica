#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload models to Hugging Face Hub
Run this script to upload your trained models to Hugging Face Hub
"""

from huggingface_hub import HfApi, login
import os
import sys

# Configuration
HF_USERNAME = "melihkzmz"  # Replace with your Hugging Face username
REPO_PREFIX = "medianalytica"  # Will create repos like: medianalytica-skin-model, etc.

# Model configurations
MODELS_TO_UPLOAD = {
    'skin': {
        'local_path': '../Skin-Disease-Classifier/models/skin_disease_model_5class_efficientnetb3_macro_f1_savedmodel',
        'repo_name': f'{REPO_PREFIX}-skin-model',
        'description': 'EfficientNetB3 model for skin disease detection (5 classes: akiec, bcc, bkl, mel, nv)'
    },
    'bone': {
        'local_path': '../Skin-Disease-Classifier/models/bone_disease_model_4class_densenet121_macro_f1_savedmodel',
        'repo_name': f'{REPO_PREFIX}-bone-model',
        'description': 'DenseNet121 model for bone disease detection (4 classes: Normal, Fracture, Benign_Tumor, Malignant_Tumor)'
    },
    'lung': {
        'local_path': '../Skin-Disease-Classifier/models/lung_3class_densenet121_macro_f1_savedmodel',
        'repo_name': f'{REPO_PREFIX}-lung-model',
        'description': 'DenseNet121 model for lung disease detection (3 classes: COVID-19, Non-COVID, Normal)'
    },
    'eye': {
        'local_path': '../Skin-Disease-Classifier/models/eye_disease_model.keras',
        'repo_name': f'{REPO_PREFIX}-eye-model',
        'description': 'EfficientNetB3 model for eye disease detection (9 classes)'
    }
}

def upload_model(model_name, config):
    """Upload a single model to Hugging Face Hub"""
    local_path = config['local_path']
    repo_name = config['repo_name']
    description = config['description']
    
    # Check if model exists
    if not os.path.exists(local_path):
        print(f"[SKIP] {model_name}: Model not found at {local_path}")
        return False
    
    print(f"\n{'='*60}")
    print(f"Uploading {model_name} model...")
    print(f"Local path: {local_path}")
    print(f"Repo name: {repo_name}")
    print(f"{'='*60}")
    
    try:
        api = HfApi()
        
        # Create repository if it doesn't exist
        try:
            api.create_repo(
                repo_id=f"{HF_USERNAME}/{repo_name}",
                repo_type="model",
                private=False,  # Set to True if you want private repos
                exist_ok=True
            )
            print(f"[INFO] Repository created/verified: {HF_USERNAME}/{repo_name}")
        except Exception as e:
            print(f"[WARNING] Repository creation: {e}")
        
        # Upload model files
        if os.path.isdir(local_path):
            # SavedModel format - upload entire directory
            print(f"[UPLOAD] Uploading SavedModel directory...")
            api.upload_folder(
                folder_path=local_path,
                repo_id=f"{HF_USERNAME}/{repo_name}",
                repo_type="model",
                ignore_patterns=[".git*", "__pycache__*", "*.pyc"]
            )
        else:
            # Single file (e.g., .keras)
            print(f"[UPLOAD] Uploading model file...")
            api.upload_file(
                path_or_fileobj=local_path,
                path_in_repo=os.path.basename(local_path),
                repo_id=f"{HF_USERNAME}/{repo_name}",
                repo_type="model"
            )
        
        print(f"[SUCCESS] {model_name} model uploaded successfully!")
        print(f"[INFO] Model available at: https://huggingface.co/{HF_USERNAME}/{repo_name}")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to upload {model_name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function to upload all models"""
    print("="*60)
    print("MediAnalytica - Model Upload to Hugging Face Hub")
    print("="*60)
    
    # Check if logged in
    try:
        api = HfApi()
        user = api.whoami()
        print(f"[INFO] Logged in as: {user['name']}")
        global HF_USERNAME
        HF_USERNAME = user['name']  # Use actual username
    except Exception as e:
        print(f"[ERROR] Not logged in. Please run: huggingface-cli login")
        print(f"Or use: from huggingface_hub import login; login()")
        sys.exit(1)
    
    # Upload each model
    results = {}
    for model_name, config in MODELS_TO_UPLOAD.items():
        results[model_name] = upload_model(model_name, config)
    
    # Summary
    print("\n" + "="*60)
    print("Upload Summary")
    print("="*60)
    for model_name, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{model_name:10} : {status}")
    
    print("\n[INFO] Update app.py with your Hugging Face username!")
    print(f"[INFO] Set HF_USERNAME = '{HF_USERNAME}' in app.py")

if __name__ == '__main__':
    main()

