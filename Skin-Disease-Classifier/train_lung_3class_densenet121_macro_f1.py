#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lung Disease Detection - 3 CLASS MACRO F1 TRAINING
Model: DenseNet121 (Medical Imaging Optimized)
Optimized for: Class Imbalance + Medical Safety + Professional Standards
Uses: Macro F1 Metric + Class Weights
Color Mode: RGB (X-Ray optimized)
Classes: COVID-19, Non-COVID, Normal
Datasets: Combined Lung Segmentation Data + Infection Segmentation Data
"""
import os
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, Callback
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.utils.class_weight import compute_class_weight
import seaborn as sns
import shutil
import tempfile
try:
    import cv2
    CLAHE_AVAILABLE = True
except ImportError:
    print("[WARNING] OpenCV (cv2) not found. CLAHE will be disabled. Install with: pip install opencv-python")
    CLAHE_AVAILABLE = False

# Mixed precision disabled for Windows compatibility
print("[MEMORY] Mixed Precision Training DISABLED for Windows compatibility")

# Windows console UTF-8 support
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except (AttributeError, ValueError) as e:
        pass

print("\n" + "="*70)
print("🫁 LUNG DISEASE DETECTION - 3 CLASS MACRO F1 TRAINING")
print("="*70)
print("✅ Model: DenseNet121 (Medical Imaging Optimized)")
print("✅ Optimized for: Class Imbalance + Medical Safety")
print("✅ Uses: Macro F1 Metric + Class Weights")
print("✅ Color Mode: RGB (X-Ray optimized)")
print("✅ Classes: COVID-19, Non-COVID, Normal")
print("✅ Datasets: Combined Lung Segmentation Data + Infection Segmentation Data")
print("✅ Professional Standard for Medical AI")
print("="*70)

# Check GPU availability
physical_devices = tf.config.list_physical_devices('GPU')
USE_GPU = False

if len(physical_devices) > 0:
    print(f"\n[GPU] {len(physical_devices)} GPU(s) available")
    for device in physical_devices:
        print(f"  - {device}")
    
    try:
        tf.config.experimental.set_memory_growth(physical_devices[0], True)
        print("[GPU] Memory growth enabled")
        
        with tf.device('/GPU:0'):
            test_tensor = tf.constant([1.0, 2.0])
            _ = tf.reduce_sum(test_tensor)
        USE_GPU = True
        print("[GPU] ✅ GPU test passed, using GPU for training")
    except Exception as e:
        print(f"[GPU] ⚠️  GPU configuration failed: {e}")
        print("[GPU] 🔄 Falling back to CPU mode")
        os.environ['CUDA_VISIBLE_DEVICES'] = ''
        USE_GPU = False
        tf.config.set_visible_devices([], 'GPU')
else:
    print("\n[CPU] No GPU found, training on CPU")
    USE_GPU = False

# Hyperparameters
LUNG_SEG_DIR = 'datasets/Lung Segmentation Data/Lung Segmentation Data'
INFECTION_SEG_DIR = 'datasets/Infection Segmentation Data/Infection Segmentation Data'

IMG_SIZE = (384, 384)  # Optimized for medical imaging (same as bone disease)
BATCH_SIZE = 16  # Balanced for memory and performance (Phase 1)
BATCH_SIZE_FINETUNE = 4  # Reduced batch size for Phase 2 fine-tuning (all layers unfrozen = more memory)
INITIAL_EPOCHS = 150
FINE_TUNE_EPOCHS = 80
LEARNING_RATE = 0.0001  # Stable learning rate for Macro F1 optimization
FINE_TUNE_LR = 0.00001  # Lower learning rate for fine-tuning
COLOR_MODE = 'rgb'  # Load as RGB (preprocessing handles grayscale→RGB conversion and CLAHE)

# 3 Classes
CLASS_NAMES = [
    'COVID-19',
    'Non-COVID',
    'Normal'
]

NUM_CLASSES = len(CLASS_NAMES)

print(f"\n[CONFIG]")
print(f"  Image Size: {IMG_SIZE}")
print(f"  Batch Size (Phase 1): {BATCH_SIZE}")
print(f"  Batch Size (Phase 2): {BATCH_SIZE_FINETUNE} (reduced for fine-tuning memory)")
print(f"  Initial Epochs: {INITIAL_EPOCHS}")
print(f"  Fine-tune Epochs: {FINE_TUNE_EPOCHS}")
print(f"  Initial LR: {LEARNING_RATE}")
print(f"  Fine-tune LR: {FINE_TUNE_LR}")
print(f"  Color Mode: {COLOR_MODE} (X-Ray optimized)")
print(f"  Number of Classes: {NUM_CLASSES}")
print(f"  Classes: {', '.join(CLASS_NAMES)}")

# ============================================================================
# STREAMING MACRO F1 METRIC (Global TP/FP/FN Accumulation)
# ============================================================================

class StreamingMacroF1(keras.metrics.Metric):
    """
    Streaming Macro F1 Metric that accumulates TP/FP/FN across all batches.
    This matches sklearn's macro F1 calculation on the full dataset.
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
        Vectorized computation for all classes at once.
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

# ============================================================================
# SKLEARN MACRO F1 CALLBACK (Validation)
# ============================================================================

class SklearnMacroF1Callback(Callback):
    """
    Callback to calculate sklearn Macro F1 on validation set each epoch.
    This validates that our StreamingMacroF1 metric matches sklearn's calculation.
    """
    def __init__(self, val_generator, num_classes=3, verbose=1):
        super(SklearnMacroF1Callback, self).__init__()
        self.val_generator = val_generator
        self.num_classes = num_classes
        self.verbose = verbose
        self.sklearn_f1_scores = []
    
    def on_epoch_end(self, epoch, logs=None):
        """Calculate sklearn Macro F1 at end of each epoch."""
        # Reset generator to ensure we get all validation samples
        self.val_generator.reset()
        
        y_true_all = []
        y_pred_all = []
        
        # Predict on all validation batches
        for batch_idx in range(len(self.val_generator)):
            x_batch, y_batch = self.val_generator[batch_idx]
            y_pred_batch = self.model.predict(x_batch, verbose=0)
            
            y_true_all.append(np.argmax(y_batch, axis=1))
            y_pred_all.append(np.argmax(y_pred_batch, axis=1))
        
        # Concatenate all batches
        y_true = np.concatenate(y_true_all, axis=0)
        y_pred = np.concatenate(y_pred_all, axis=0)
        
        # Calculate sklearn macro F1
        sklearn_macro_f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)
        self.sklearn_f1_scores.append(sklearn_macro_f1)
        
        # Add to logs
        logs = logs or {}
        logs['val_sklearn_macro_f1'] = sklearn_macro_f1
        
        if self.verbose > 0:
            print(f'\n[Sklearn Macro F1] Epoch {epoch + 1}: {sklearn_macro_f1:.4f} ({sklearn_macro_f1*100:.2f}%)')

# ============================================================================
# PREPROCESSING FUNCTIONS
# ============================================================================

def apply_clahe_grayscale(img):
    """
    Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to grayscale images.
    CLAHE improves contrast in X-Ray images by enhancing local contrast.
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
    
    # Create CLAHE object
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    
    # Apply CLAHE
    img_clahe = clahe.apply(img_2d)
    
    # Reshape back to (H, W, 1) if needed
    if len(img.shape) == 3:
        img_clahe = np.expand_dims(img_clahe, axis=-1)
    
    return img_clahe


def preprocess_image_clahe_normalize(img):
    """
    Combined preprocessing: CLAHE + Official DenseNet121 ImageNet Preprocessing
    
    Process:
    1. Apply CLAHE for contrast enhancement (if grayscale and available)
    2. Convert grayscale to RGB if needed
    3. Apply official DenseNet121 ImageNet preprocessing
    """
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
    
    # Apply CLAHE if grayscale and available
    if is_grayscale and CLAHE_AVAILABLE:
        img = apply_clahe_grayscale(img)
        if img.dtype != np.uint8:
            img = np.clip(img, 0, 255).astype(np.uint8)
    
    # Convert grayscale to RGB if needed
    if len(img.shape) == 2:
        img = np.stack([img] * 3, axis=-1)
    elif len(img.shape) == 3 and img.shape[2] == 1:
        img = np.repeat(img, 3, axis=-1)
    
    # Apply official DenseNet121 ImageNet preprocessing
    img_preprocessed = densenet_preprocess(img)
    
    return img_preprocessed

# ============================================================================
# DATASET COMBINATION FUNCTION
# ============================================================================

def combine_datasets(base_dir1, base_dir2, split_name, class_names):
    """
    Combine images from two datasets into a single directory structure.
    
    Args:
        base_dir1: Path to first dataset (Lung Segmentation Data)
        base_dir2: Path to second dataset (Infection Segmentation Data)
        split_name: 'Train', 'Val', or 'Test'
        class_names: List of class names
    
    Returns:
        Path to combined directory
    """
    # Create temporary combined directory
    temp_dir = tempfile.mkdtemp(prefix=f'lung_combined_{split_name}_')
    
    print(f"\n[COMBINE] Combining {split_name} datasets...")
    
    for class_name in class_names:
        class_dir = os.path.join(temp_dir, class_name)
        os.makedirs(class_dir, exist_ok=True)
        
        # Paths in both datasets
        path1 = os.path.join(base_dir1, split_name, class_name, 'images')
        path2 = os.path.join(base_dir2, split_name, class_name, 'images')
        
        count1 = 0
        count2 = 0
        
        # Copy images from first dataset
        if os.path.exists(path1):
            for img_file in os.listdir(path1):
                if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    src = os.path.join(path1, img_file)
                    # Create unique filename to avoid conflicts
                    dst = os.path.join(class_dir, f'ds1_{img_file}')
                    shutil.copy2(src, dst)
                    count1 += 1
        
        # Copy images from second dataset
        if os.path.exists(path2):
            for img_file in os.listdir(path2):
                if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    src = os.path.join(path2, img_file)
                    # Create unique filename to avoid conflicts
                    dst = os.path.join(class_dir, f'ds2_{img_file}')
                    shutil.copy2(src, dst)
                    count2 += 1
        
        total = count1 + count2
        print(f"  {class_name}: {count1} (Lung) + {count2} (Infection) = {total} total")
    
    print(f"  ✅ Combined directory created: {temp_dir}")
    return temp_dir

# ============================================================================
# DATA GENERATORS
# ============================================================================

print("\n[DATA] Creating X-ray optimized data generators...")
print(f"  [PREPROCESSING] CLAHE: {'Enabled (auto-detect grayscale)' if CLAHE_AVAILABLE else 'Disabled'}")
print(f"  [PREPROCESSING] Normalization: Official DenseNet121 ImageNet preprocessing")
print(f"  [DATA] Loading images as RGB (preprocessing handles grayscale detection and conversion)")

# Combine datasets
print("\n[DATA] Combining datasets...")
TRAIN_DIR_COMBINED = combine_datasets(LUNG_SEG_DIR, INFECTION_SEG_DIR, 'Train', CLASS_NAMES)
VAL_DIR_COMBINED = combine_datasets(LUNG_SEG_DIR, INFECTION_SEG_DIR, 'Val', CLASS_NAMES)
TEST_DIR_COMBINED = combine_datasets(LUNG_SEG_DIR, INFECTION_SEG_DIR, 'Test', CLASS_NAMES)

# Enhanced augmentation for medical imaging (X-Ray specific)
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_image_clahe_normalize,
    rotation_range=22,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    vertical_flip=False,  # X-rays usually shouldn't be flipped vertically
    zoom_range=0.2,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest'
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_image_clahe_normalize
)

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_image_clahe_normalize
)

# Create generators
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR_COMBINED,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASS_NAMES,
    shuffle=True,
    color_mode=COLOR_MODE
)

val_generator = val_datagen.flow_from_directory(
    VAL_DIR_COMBINED,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASS_NAMES,
    shuffle=False,
    color_mode=COLOR_MODE
)

test_generator = test_datagen.flow_from_directory(
    TEST_DIR_COMBINED,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    classes=CLASS_NAMES,
    shuffle=False,
    color_mode=COLOR_MODE
)

print(f"\n[DATA] Generators created:")
print(f"  Training samples: {train_generator.samples}")
print(f"  Validation samples: {val_generator.samples}")
print(f"  Test samples: {test_generator.samples}")

# Data verification
print("\n[DATA VERIFICATION] Checking data diversity...")
print("  Class indices mapping:")
for i, class_name in enumerate(CLASS_NAMES):
    print(f"    Index {i}: {class_name}")
print("  Generator class indices:", train_generator.class_indices)

# Calculate class distribution
print("\n[DATA] Class distribution:")
class_counts = np.bincount(train_generator.classes)
total_samples = len(train_generator.classes)

for i, class_name in enumerate(CLASS_NAMES):
    percentage = (class_counts[i] / total_samples * 100) if total_samples > 0 else 0
    print(f"  {class_name}: {class_counts[i]} ({percentage:.1f}%)")

max_count = np.max(class_counts)
min_count = np.min(class_counts)
imbalance_ratio = max_count / min_count if min_count > 0 else 0
print(f"\n  Class imbalance ratio: {imbalance_ratio:.2f}:1")

# Calculate class weights for imbalanced dataset
print("\n[CLASS WEIGHTS] Computing balanced class weights...")
class_weights_balanced = compute_class_weight(
    'balanced',
    classes=np.arange(NUM_CLASSES),
    y=train_generator.classes
)

class_weight_dict = {}
for i, class_name in enumerate(CLASS_NAMES):
    balanced_weight = float(class_weights_balanced[i])
    # Use balanced weights with slight emphasis on COVID-19 (critical class)
    if 'COVID-19' in class_name:
        class_weight_dict[i] = min(balanced_weight * 1.2, 2.0)
    else:
        class_weight_dict[i] = balanced_weight
    
    print(f"  {class_name}: {class_weight_dict[i]:.2f}")

print("\n  ✅ Balanced class weights applied")

# ============================================================================
# MODEL ARCHITECTURE
# ============================================================================

print("\n[MODEL] Building DenseNet121 model...")

base_model = DenseNet121(
    input_shape=(*IMG_SIZE, 3),  # RGB input
    include_top=False,
    weights='imagenet'
)

print("  ✅ Model expects RGB input (3 channels)")
print("  ✅ Preprocessing handles grayscale detection, CLAHE, and RGB conversion")
print("  ✅ Official DenseNet121 ImageNet preprocessing applied")

# Phase 1: Unfreeze top layers
base_model.trainable = True
freeze_until_phase1 = len(base_model.layers) - 150
for layer in base_model.layers[:freeze_until_phase1]:
    layer.trainable = False

print(f"\n[MODEL] Phase 1 Configuration:")
print(f"  Model: DenseNet121")
print(f"  Input Shape: {(*IMG_SIZE, 3)} (RGB)")
print(f"  Unfrozen layers: {len([l for l in base_model.layers if l.trainable])}")
print(f"  Frozen layers: {len([l for l in base_model.layers if not l.trainable])}")

# Build model
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(256, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(128, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32')
])

# ============================================================================
# COMPILE MODEL - MACRO F1 METRIC
# ============================================================================

print("\n[MODEL] Compiling with CATEGORICAL CROSSENTROPY + CLASS WEIGHTS...")

# Prepare metrics list with streaming macro F1 metric
streaming_macro_f1 = StreamingMacroF1(num_classes=NUM_CLASSES, name='macro_f1_metric')
metrics_list = [
    'accuracy',
    streaming_macro_f1,
    keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')
]

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE, beta_1=0.9, beta_2=0.999),
    loss='categorical_crossentropy',
    metrics=metrics_list
)

print("\n[MODEL] Model architecture:")
model.summary()
print(f"\n[MODEL] Total parameters: {model.count_params():,}")
print(f"\n[MODEL] ✅ Using CATEGORICAL CROSSENTROPY + CLASS WEIGHTS")
print(f"[MODEL] ✅ Streaming Macro F1 metric: Accumulates TP/FP/FN globally")
print(f"[MODEL] ✅ Sklearn Macro F1 callback: Validates metric correctness each epoch")

# ============================================================================
# CALLBACKS
# ============================================================================

os.makedirs('models', exist_ok=True)

checkpoint_initial = ModelCheckpoint(
    'models/lung_3class_densenet121_macro_f1_initial.keras',
    monitor='val_macro_f1_metric',
    save_best_only=True,
    mode='max',
    verbose=1,
    save_weights_only=False
)

early_stopping = EarlyStopping(
    monitor='val_macro_f1_metric',
    patience=15,
    restore_best_weights=True,
    verbose=1,
    mode='max',
    min_delta=0.003
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_macro_f1_metric',
    factor=0.3,
    patience=15,
    min_lr=1e-8,
    verbose=1,
    mode='max',
    cooldown=5
)

# ============================================================================
# PHASE 1: INITIAL TRAINING
# ============================================================================

print("\n" + "="*70)
print("PHASE 1: INITIAL TRAINING (Top 150 Layers Unfrozen)")
print("Using: CATEGORICAL CROSSENTROPY + CLASS WEIGHTS + MACRO F1 METRIC")
print("="*70)

# Add sklearn macro F1 callback for validation
sklearn_macro_f1_callback = SklearnMacroF1Callback(
    val_generator=val_generator,
    num_classes=NUM_CLASSES,
    verbose=1
)

history_initial = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=INITIAL_EPOCHS,
    class_weight=class_weight_dict,
    callbacks=[checkpoint_initial, early_stopping, reduce_lr, sklearn_macro_f1_callback],
    verbose=1
)

# Load best model from phase 1
print("\n[INFO] Loading best model from Phase 1...")
model = keras.models.load_model(
    'models/lung_3class_densenet121_macro_f1_initial.keras',
    custom_objects={
        'StreamingMacroF1': StreamingMacroF1,
    }
)

# ============================================================================
# PHASE 2: FINE-TUNING
# ============================================================================

print("\n" + "="*70)
print("PHASE 2: FINE-TUNING (All Layers Unfrozen)")
print("Using: CATEGORICAL CROSSENTROPY + CLASS WEIGHTS + MACRO F1 METRIC")
print("="*70)

# Clear GPU memory before Phase 2 (fine-tuning uses more memory)
# WHY: When all layers are unfrozen, gradients must be computed for all layers,
#      which requires ~2-3x more GPU memory than Phase 1 (frozen backbone)
if USE_GPU:
    print("\n[MEMORY] Clearing GPU cache before Phase 2 fine-tuning...")
    import gc
    gc.collect()
    tf.keras.backend.clear_session()
    # Force garbage collection
    if hasattr(tf.config.experimental, 'set_memory_growth'):
        for device in tf.config.list_physical_devices('GPU'):
            tf.config.experimental.set_memory_growth(device, True)
    print("[MEMORY] GPU cache cleared")

# Create new generators with smaller batch size for Phase 2 (fine-tuning needs less memory)
print(f"\n[PHASE 2] Creating data generators with batch size {BATCH_SIZE_FINETUNE} (reduced from {BATCH_SIZE})")
train_generator_finetune = train_datagen.flow_from_directory(
    TRAIN_DIR_COMBINED,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE_FINETUNE,
    class_mode='categorical',
    classes=CLASS_NAMES,
    shuffle=True,
    color_mode=COLOR_MODE
)

val_generator_finetune = val_datagen.flow_from_directory(
    VAL_DIR_COMBINED,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE_FINETUNE,
    class_mode='categorical',
    classes=CLASS_NAMES,
    shuffle=False,
    color_mode=COLOR_MODE
)

# Extract base model from loaded model
base_model = None
for layer in model.layers:
    if isinstance(layer, keras.Model):
        base_model = layer
        break

if base_model is None:
    print("[ERROR] Could not extract base model from loaded model")
    sys.exit(1)

# GRADUAL UNFREEZING STRATEGY (to reduce memory usage)
# Phase 2a: Unfreeze last 15 layers (less memory)
# Phase 2b: Unfreeze all layers (more memory, but model is already partially fine-tuned)

print("\n[MODEL] Implementing GRADUAL UNFREEZING to reduce memory usage")
print("  Phase 2a: Unfreeze last 15 layers")
print("  Phase 2b: Unfreeze all layers")

# ============================================================================
# PHASE 2a: Fine-tune last 15 layers
# ============================================================================
print("\n" + "-"*70)
print("PHASE 2a: FINE-TUNING (Last 15 Layers Unfrozen)")
print("-"*70)

# Freeze all layers first
base_model.trainable = False
for layer in base_model.layers:
    layer.trainable = False

# Unfreeze last 15 layers
num_layers = len(base_model.layers)
layers_to_unfreeze = 15
print(f"\n[MODEL] Unfreezing last {layers_to_unfreeze} layers out of {num_layers} total layers")

for layer in base_model.layers[-layers_to_unfreeze:]:
    layer.trainable = True

# Keep BatchNormalization layers frozen (standard practice)
for layer in base_model.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

trainable_count_2a = len([l for l in base_model.layers if l.trainable])
print(f"[MODEL] Trainable layers in Phase 2a: {trainable_count_2a}")

# Recompile for Phase 2a
streaming_macro_f1_phase2a = StreamingMacroF1(num_classes=NUM_CLASSES, name='macro_f1_metric')
metrics_list_phase2a = [
    'accuracy',
    streaming_macro_f1_phase2a,
    keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')
]

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=FINE_TUNE_LR, beta_1=0.9, beta_2=0.999),
    loss='categorical_crossentropy',
    metrics=metrics_list_phase2a
)

checkpoint_phase2a = ModelCheckpoint(
    'models/lung_3class_densenet121_macro_f1_phase2a.keras',
    monitor='val_macro_f1_metric',
    save_best_only=True,
    mode='max',
    verbose=1,
    save_weights_only=False
)

early_stopping_phase2a = EarlyStopping(
    monitor='val_macro_f1_metric',
    patience=15,
    restore_best_weights=True,
    verbose=1,
    mode='max',
    min_delta=0.002
)

sklearn_macro_f1_callback_phase2a = SklearnMacroF1Callback(
    val_generator=val_generator_finetune,
    num_classes=NUM_CLASSES,
    verbose=1
)

# Fine-tune Phase 2a
print("\n[PHASE 2a] Starting training with last 15 layers unfrozen...")
history_phase2a = model.fit(
    train_generator_finetune,
    validation_data=val_generator_finetune,
    epochs=FINE_TUNE_EPOCHS // 2,  # Use half epochs for Phase 2a
    class_weight=class_weight_dict,
    callbacks=[checkpoint_phase2a, early_stopping_phase2a, reduce_lr, sklearn_macro_f1_callback_phase2a],
    verbose=1
)

# Load best Phase 2a model
print("\n[INFO] Loading best Phase 2a model...")
model = keras.models.load_model(
    'models/lung_3class_densenet121_macro_f1_phase2a.keras',
    custom_objects={
        'StreamingMacroF1': StreamingMacroF1,
    }
)

# Re-extract base model after loading
base_model = None
for layer in model.layers:
    if isinstance(layer, keras.Model):
        base_model = layer
        break

# ============================================================================
# PHASE 2b: Fine-tune all layers
# ============================================================================
print("\n" + "-"*70)
print("PHASE 2b: FINE-TUNING (All Layers Unfrozen)")
print("-"*70)

# Clear GPU memory before Phase 2b
if USE_GPU:
    print("\n[MEMORY] Clearing GPU cache before Phase 2b...")
    import gc
    gc.collect()
    tf.keras.backend.clear_session()
    # Reload model to clear memory
    model = keras.models.load_model(
        'models/lung_3class_densenet121_macro_f1_phase2a.keras',
        custom_objects={
            'StreamingMacroF1': StreamingMacroF1,
        }
    )
    # Re-extract base model
    base_model = None
    for layer in model.layers:
        if isinstance(layer, keras.Model):
            base_model = layer
            break
    print("[MEMORY] GPU cache cleared")

# Now unfreeze all layers
base_model.trainable = True
for layer in base_model.layers:
    layer.trainable = True

# Keep BatchNormalization layers frozen
for layer in base_model.layers:
    if isinstance(layer, layers.BatchNormalization):
        layer.trainable = False

trainable_count_2b = len([l for l in base_model.layers if l.trainable])
print(f"\n[MODEL] Trainable layers in Phase 2b: {trainable_count_2b}")

# Recompile for Phase 2b
streaming_macro_f1_phase2b = StreamingMacroF1(num_classes=NUM_CLASSES, name='macro_f1_metric')
metrics_list_phase2b = [
    'accuracy',
    streaming_macro_f1_phase2b,
    keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')
]

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=FINE_TUNE_LR * 0.5, beta_1=0.9, beta_2=0.999),  # Even lower LR
    loss='categorical_crossentropy',
    metrics=metrics_list_phase2b
)

checkpoint_finetune = ModelCheckpoint(
    'models/lung_3class_densenet121_macro_f1_finetuned.keras',
    monitor='val_macro_f1_metric',
    save_best_only=True,
    mode='max',
    verbose=1,
    save_weights_only=False
)

early_stopping_finetune = EarlyStopping(
    monitor='val_macro_f1_metric',
    patience=15,
    restore_best_weights=True,
    verbose=1,
    mode='max',
    min_delta=0.002
)

sklearn_macro_f1_callback_phase2b = SklearnMacroF1Callback(
    val_generator=val_generator_finetune,
    num_classes=NUM_CLASSES,
    verbose=1
)

# Fine-tune Phase 2b
print("\n[PHASE 2b] Starting training with all layers unfrozen...")
history_finetune = model.fit(
    train_generator_finetune,
    validation_data=val_generator_finetune,
    epochs=FINE_TUNE_EPOCHS // 2,  # Use remaining epochs for Phase 2b
    class_weight=class_weight_dict,
    callbacks=[checkpoint_finetune, early_stopping_finetune, reduce_lr, sklearn_macro_f1_callback_phase2b],
    verbose=1
)

# Load best fine-tuned model
print("\n[INFO] Loading best fine-tuned model...")
model = keras.models.load_model(
    'models/lung_3class_densenet121_macro_f1_finetuned.keras',
    custom_objects={
        'StreamingMacroF1': StreamingMacroF1,
    }
)

# ============================================================================
# FINAL EVALUATION
# ============================================================================

print("\n" + "="*70)
print("FINAL EVALUATION")
print("="*70)

test_generator.reset()
results = model.evaluate(test_generator, verbose=1)

# Get metric indices from model
metric_names = model.metrics_names
loss_idx = metric_names.index('loss')
accuracy_idx = metric_names.index('accuracy')
macro_f1_idx = metric_names.index('macro_f1_metric') if 'macro_f1_metric' in metric_names else -1

loss = results[loss_idx]
accuracy = results[accuracy_idx]
macro_f1 = results[macro_f1_idx] if macro_f1_idx >= 0 else 0

print(f"\n[RESULTS] Final Test Metrics:")
print(f"  Test Loss: {loss:.4f}")
print(f"  Test Accuracy: {accuracy*100:.2f}%")
print(f"  Test Macro F1: {macro_f1*100:.2f}%")

# Per-class metrics
test_generator.reset()
y_pred = model.predict(test_generator, verbose=0)
y_pred_classes = np.argmax(y_pred, axis=1)
y_true = test_generator.classes

# Classification Report
print("\n" + "="*70)
print("PER-CLASS PERFORMANCE (Classification Report)")
print("="*70)
print(classification_report(
    y_true, 
    y_pred_classes, 
    target_names=CLASS_NAMES, 
    zero_division=0,
    digits=4
))

# Calculate Macro F1 using sklearn
macro_f1_sklearn = f1_score(y_true, y_pred_classes, average='macro', zero_division=0)
weighted_f1_sklearn = f1_score(y_true, y_pred_classes, average='weighted', zero_division=0)

print(f"\n[RESULTS] Sklearn F1 Scores:")
print(f"  Macro F1: {macro_f1_sklearn*100:.2f}%")
print(f"  Weighted F1: {weighted_f1_sklearn*100:.2f}%")

# Per-class F1 scores
per_class_f1 = f1_score(y_true, y_pred_classes, average=None, zero_division=0)
print(f"\n[RESULTS] Per-Class F1 Scores:")
for i, class_name in enumerate(CLASS_NAMES):
    print(f"  {class_name}: {per_class_f1[i]*100:.2f}%")

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred_classes)
print("\n[RESULTS] Confusion Matrix:")
print(cm)

# Visualize confusion matrix
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES)
plt.title('Confusion Matrix - Lung Disease Classification')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.tight_layout()
plt.savefig('models/lung_3class_confusion_matrix.png', dpi=150)
print("\n  ✅ Confusion matrix saved: models/lung_3class_confusion_matrix.png")

# Training history plots
plt.figure(figsize=(16, 6))

# Calculate epoch offsets for plotting
phase1_epochs = len(history_initial.history['accuracy'])
phase2a_epochs = len(history_phase2a.history['accuracy'])
phase2b_epochs = len(history_finetune.history['accuracy'])

plt.subplot(1, 3, 1)
# Phase 1
plt.plot(history_initial.history['accuracy'], label='Train Accuracy (Phase 1)', alpha=0.7)
plt.plot(history_initial.history['val_accuracy'], label='Val Accuracy (Phase 1)', alpha=0.7)
# Phase 2a
plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
         history_phase2a.history['accuracy'], label='Train Accuracy (Phase 2a)', alpha=0.7)
plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
         history_phase2a.history['val_accuracy'], label='Val Accuracy (Phase 2a)', alpha=0.7)
# Phase 2b
plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
         history_finetune.history['accuracy'], label='Train Accuracy (Phase 2b)', alpha=0.7)
plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
         history_finetune.history['val_accuracy'], label='Val Accuracy (Phase 2b)', alpha=0.7)
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)

plt.subplot(1, 3, 2)
# Phase 1
plt.plot(history_initial.history['loss'], label='Train Loss (Phase 1)', alpha=0.7)
plt.plot(history_initial.history['val_loss'], label='Val Loss (Phase 1)', alpha=0.7)
# Phase 2a
plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
         history_phase2a.history['loss'], label='Train Loss (Phase 2a)', alpha=0.7)
plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
         history_phase2a.history['val_loss'], label='Val Loss (Phase 2a)', alpha=0.7)
# Phase 2b
plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
         history_finetune.history['loss'], label='Train Loss (Phase 2b)', alpha=0.7)
plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
         history_finetune.history['val_loss'], label='Val Loss (Phase 2b)', alpha=0.7)
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.grid(True)

plt.subplot(1, 3, 3)
# Phase 1
if 'macro_f1_metric' in history_initial.history:
    plt.plot(history_initial.history['macro_f1_metric'], label='Train Macro F1 (Phase 1)', alpha=0.7)
    plt.plot(history_initial.history['val_macro_f1_metric'], label='Val Macro F1 (Phase 1)', alpha=0.7)
# Phase 2a
if 'macro_f1_metric' in history_phase2a.history:
    plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
             history_phase2a.history['macro_f1_metric'], label='Train Macro F1 (Phase 2a)', alpha=0.7)
    plt.plot([x + phase1_epochs for x in range(phase2a_epochs)],
             history_phase2a.history['val_macro_f1_metric'], label='Val Macro F1 (Phase 2a)', alpha=0.7)
# Phase 2b
if 'macro_f1_metric' in history_finetune.history:
    plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
             history_finetune.history['macro_f1_metric'], label='Train Macro F1 (Phase 2b)', alpha=0.7)
    plt.plot([x + phase1_epochs + phase2a_epochs for x in range(phase2b_epochs)],
             history_finetune.history['val_macro_f1_metric'], label='Val Macro F1 (Phase 2b)', alpha=0.7)
plt.title('Macro F1 Score')
plt.xlabel('Epoch')
plt.ylabel('Macro F1')
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig('models/lung_3class_training_history.png', dpi=150)
print("  ✅ Training history saved: models/lung_3class_training_history.png")

# Save final model in both formats
final_model_path_keras = 'models/lung_3class_densenet121_macro_f1.keras'
model.save(final_model_path_keras)
print(f"\n[SUCCESS] Final model saved to: {final_model_path_keras}")

final_model_path_savedmodel = 'models/lung_3class_densenet121_macro_f1_savedmodel'
model.save(final_model_path_savedmodel, save_format='tf')
print(f"[SUCCESS] Final model saved to: {final_model_path_savedmodel} (SavedModel format)")

# Cleanup temporary directories
print("\n[CLEANUP] Removing temporary combined directories...")
shutil.rmtree(TRAIN_DIR_COMBINED, ignore_errors=True)
shutil.rmtree(VAL_DIR_COMBINED, ignore_errors=True)
shutil.rmtree(TEST_DIR_COMBINED, ignore_errors=True)
print("  ✅ Cleanup complete")

print("\n" + "="*70)
print("TRAINING COMPLETE!")
print("="*70)
print(f"✅ Final Macro F1: {macro_f1_sklearn*100:.2f}%")
print(f"✅ Model saved: {final_model_path_keras}")
print(f"✅ Model saved: {final_model_path_savedmodel} (SavedModel)")
print("="*70)

