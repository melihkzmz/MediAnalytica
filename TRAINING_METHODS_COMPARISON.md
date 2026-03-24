# Training Methods Comparison

This document summarizes the methods and techniques used in the three main training scripts for bone, lung, and skin disease detection.

---

## 1. Bone Disease Detection (4 Classes)
**File:** `train_bone_4class_macro_f1.py`
**Model:** DenseNet121
**Classes:** Normal, Fracture, Benign_Tumor, Malignant_Tumor

### Architecture & Model
- **Base Model:** DenseNet121 (ImageNet pretrained)
- **Input Size:** 384×384 pixels
- **Color Mode:** RGB (grayscale converted to RGB)
- **Custom Layer:** `GrayscaleToRGB` - Converts grayscale to RGB for pretrained model compatibility

### Loss Functions
1. **Primary Loss:** `categorical_crossentropy` (with class weights)
2. **Alternative Losses (defined but not used):**
   - `focal_macro_f1_loss`: Hybrid Focal Loss + Macro F1 (70% Focal + 30% Macro F1)
   - `soft_macro_f1_loss`: Differentiable Macro F1 Loss

### Metrics
- **Primary Metric:** `StreamingMacroF1` - Custom metric that accumulates TP/FP/FN globally
- **Additional Metrics:**
  - Accuracy
  - Top-2 Accuracy
  - Sklearn Macro F1 (via callback for validation)

### Preprocessing
- **CLAHE (Contrast Limited Adaptive Histogram Equalization):** Applied to grayscale X-ray images
  - `clipLimit=2.0`
  - `tileGridSize=(8, 8)`
- **DenseNet121 ImageNet Preprocessing:** Official normalization (mean/std subtraction)

### Data Augmentation
- **Rotation:** 22° (increased from 15°)
- **Translation:** 20% width/height shift
- **Shear:** 0.11
- **Zoom:** 0.22
- **Brightness:** [0.85, 1.15]
- **No flips:** Preserves anatomical correctness for X-rays
- **Fill Mode:** Constant (black background)

### Training Strategy
**Two-Phase Training:**
1. **Phase 1 (Initial Training):**
   - Unfreeze top 150 layers
   - Epochs: 150
   - Learning Rate: 0.0001
   - Loss: Categorical Crossentropy + Class Weights
   - Batch Size: 16

2. **Phase 2 (Fine-tuning):**
   - Unfreeze all layers
   - Epochs: 80
   - Learning Rate: 0.00001
   - Loss: Categorical Crossentropy + Class Weights
   - Batch Size: 16

### Class Imbalance Handling
- **Class Weights:** Computed using sklearn's `compute_class_weight('balanced')`
- **Weighting Strategy:**
  - Normal: Balanced weight
  - Fracture: 1.1× balanced weight
  - Benign_Tumor: 1.3× balanced weight (max 2.5×)
  - Malignant_Tumor: 1.2× balanced weight (max 2.0×)

### Regularization
- **Dropout:** 0.5 (increased from 0.3)
- **L2 Regularization:** 0.001 (increased from 0.0001)
- **Batch Normalization:** Applied after each dense layer

### Callbacks
- `ModelCheckpoint`: Saves best model based on `val_macro_f1_metric`
- `EarlyStopping`: Patience 25 (Phase 1), 20 (Phase 2)
- `ReduceLROnPlateau`: Factor 0.3, patience 15
- `SklearnMacroF1Callback`: Validates metric correctness

### Optimizer
- **Type:** Adam
- **Parameters:** β₁=0.9, β₂=0.999

---

## 2. Lung Disease Detection (3 Classes)
**File:** `train_lung_3class_densenet121_macro_f1.py`
**Model:** DenseNet121
**Classes:** COVID-19, Non-COVID, Normal

### Architecture & Model
- **Base Model:** DenseNet121 (ImageNet pretrained)
- **Input Size:** 384×384 pixels
- **Color Mode:** RGB
- **Datasets:** Combined Lung Segmentation Data + Infection Segmentation Data

### Loss Functions
- **Primary Loss:** `categorical_crossentropy` (with class weights)

### Metrics
- **Primary Metric:** `StreamingMacroF1` - Same implementation as bone disease
- **Additional Metrics:**
  - Accuracy
  - Top-2 Accuracy
  - Sklearn Macro F1 (via callback)

### Preprocessing
- **CLAHE:** Applied to grayscale X-ray images (same as bone)
- **DenseNet121 ImageNet Preprocessing:** Official normalization

### Data Augmentation
- Similar to bone disease (rotation, translation, shear, zoom, brightness)
- **No flips:** Preserves anatomical correctness

### Training Strategy
**Two-Phase Training:**
1. **Phase 1 (Initial Training):**
   - Unfreeze top layers
   - Epochs: 150
   - Learning Rate: 0.0001
   - Batch Size: 16

2. **Phase 2 (Fine-tuning):**
   - Unfreeze all layers
   - Epochs: 80
   - Learning Rate: 0.00001
   - Batch Size: 4 (reduced for memory efficiency)

### Class Imbalance Handling
- **Class Weights:** Computed using sklearn's `compute_class_weight('balanced')`

### Regularization
- **Dropout:** Applied in dense layers
- **L2 Regularization:** Applied
- **Batch Normalization:** Applied

### Callbacks
- Same as bone disease (ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, SklearnMacroF1Callback)

### Optimizer
- **Type:** Adam
- **Parameters:** β₁=0.9, β₂=0.999

---

## 3. Skin Disease Detection (5 Classes)
**File:** `train_skin_6class_efficientnetb3_macro_f1.py`
**Model:** EfficientNetB3
**Classes:** akiec, bcc, bkl, mel, nv (df and vasc excluded)

### Architecture & Model
- **Base Model:** EfficientNetB3 (ImageNet pretrained)
- **Input Size:** 300×300 pixels (EfficientNetB3 standard)
- **Color Mode:** RGB (dermatoscopic images)

### Loss Functions
- **Primary Loss:** `class_balanced_focal_loss`
  - Combines Focal Loss with class balancing
  - Formula: `FL(p_t) = -α_t * (1 - p_t)^γ * log(p_t)`
  - **Gamma (γ):** 2.0 (focusing parameter)
  - **Alpha (α):** Class-specific weights (auto-balanced)

### Metrics
- **Primary Metric:** `StreamingMacroF1` - Same implementation
- **Additional Metrics:**
  - Accuracy
  - Top-2 Accuracy
  - Sklearn Macro F1 (via callback)

### Preprocessing
- **EfficientNetB3 ImageNet Preprocessing:** Official normalization
- **No CLAHE:** Not needed for RGB dermatoscopic images

### Data Augmentation
- **Rotation:** Applied
- **Translation:** Applied
- **Shear:** Applied
- **Zoom:** Applied
- **Brightness:** Applied
- **Horizontal/Vertical Flip:** Allowed (skin images don't have anatomical constraints)
- **Channel Shift:** Applied for RGB variation

### Training Strategy
**Two-Phase Training:**
1. **Phase 1 (Initial Training):**
   - Unfreeze top layers
   - Epochs: 100
   - Learning Rate: 0.0001
   - Batch Size: 16

2. **Phase 2 (Fine-tuning):**
   - Unfreeze all layers
   - Epochs: 50
   - Learning Rate: 0.00005 (5× smaller than Phase 1, not 10×)
   - Batch Size: 16

### Class Imbalance Handling
- **Class-Balanced Focal Loss:** Built-in class balancing via alpha weights
- **Class Weights:** Computed and used in focal loss

### Regularization
- **Dropout:** Applied in dense layers
- **L2 Regularization:** Applied
- **Batch Normalization:** Applied

### Callbacks
- `ModelCheckpoint`: Saves best model based on `val_macro_f1_metric`
- `EarlyStopping`: Patience configured
- `ReduceLROnPlateau`: Learning rate reduction
- `SklearnMacroF1Callback`: Validates metric correctness
- `CosineAnnealingLR`: Optional cosine annealing learning rate schedule

### Optimizer
- **Type:** Adam
- **Parameters:** β₁=0.9, β₂=0.999

---

## Common Methods Across All Scripts

### 1. Streaming Macro F1 Metric
All three scripts use the same `StreamingMacroF1` custom metric:
- Accumulates TP/FP/FN across all batches
- Matches sklearn's macro F1 calculation
- Vectorized computation for efficiency

### 2. Sklearn Validation Callback
All scripts use `SklearnMacroF1Callback`:
- Validates metric correctness each epoch
- Computes sklearn macro F1 on full validation set
- Ensures metric implementation matches sklearn

### 3. Two-Phase Training
All scripts use a two-phase approach:
- **Phase 1:** Train top layers with higher learning rate
- **Phase 2:** Fine-tune all layers with lower learning rate

### 4. Class Imbalance Handling
- All scripts compute class weights using sklearn
- Bone & Lung: Use class weights with categorical crossentropy
- Skin: Uses class-balanced focal loss (built-in balancing)

### 5. Regularization Techniques
- Dropout in dense layers
- L2 regularization
- Batch normalization

### 6. Callbacks
- ModelCheckpoint (save best model)
- EarlyStopping (prevent overfitting)
- ReduceLROnPlateau (adaptive learning rate)
- SklearnMacroF1Callback (metric validation)

### 7. Evaluation Metrics
- Macro F1 (primary metric)
- Accuracy
- Top-2 Accuracy
- Per-class F1 scores
- Confusion matrix
- Classification report

---

## Key Differences

| Feature | Bone (DenseNet121) | Lung (DenseNet121) | Skin (EfficientNetB3) |
|---------|-------------------|-------------------|------------------------|
| **Input Size** | 384×384 | 384×384 | 300×300 |
| **Loss Function** | Categorical Crossentropy + Class Weights | Categorical Crossentropy + Class Weights | Class-Balanced Focal Loss |
| **Preprocessing** | CLAHE + ImageNet | CLAHE + ImageNet | ImageNet only |
| **Data Augmentation** | No flips (anatomical) | No flips (anatomical) | Flips allowed |
| **Phase 2 Batch Size** | 16 | 4 (memory) | 16 |
| **Phase 2 LR** | 0.00001 (10× smaller) | 0.00001 (10× smaller) | 0.00005 (2× smaller) |
| **Custom Layers** | GrayscaleToRGB | None | None |

---

## Summary

All three training scripts follow a similar structure but are optimized for their specific use cases:

1. **Bone & Lung:** Use DenseNet121 with CLAHE preprocessing for X-ray images, categorical crossentropy with class weights
2. **Skin:** Uses EfficientNetB3 with class-balanced focal loss for dermatoscopic images
3. **All:** Use Macro F1 as the primary metric, two-phase training, and comprehensive regularization

The methods are designed for medical imaging applications with emphasis on:
- Class imbalance handling
- Medical safety (equal importance to all classes)
- Professional standards (Macro F1 metric)
- Robust training (two-phase, regularization, early stopping)
