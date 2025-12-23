#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Model Doğruluk Karşılaştırma Grafiği Oluşturucu
RAPOR.txt için ŞEKİL 3.1 grafiğini oluşturur
"""

import matplotlib.pyplot as plt
import numpy as np
import matplotlib
matplotlib.rcParams['font.family'] = 'DejaVu Sans'
matplotlib.rcParams['axes.unicode_minus'] = False

# Model doğruluk verileri (RAPOR.txt'den alınan)
models = {
    'Deri Hastalıkları\n(EfficientNetB3)': {
        'accuracy': 87.5,  # %85-90 aralığının ortası
        'min': 85,
        'max': 90,
        'classes': 5,
        'color': '#2E86AB'  # Mavi
    },
    'Kemik Hastalıkları\n(DenseNet-121)': {
        'accuracy': 82.5,  # %80-85 aralığının ortası
        'min': 80,
        'max': 85,
        'classes': 4,
        'color': '#A23B72'  # Mor
    },
    'Akciğer Hastalıkları\n(CNN)': {
        'accuracy': 92.5,  # %90-95 aralığının ortası
        'min': 90,
        'max': 95,
        'classes': 2,
        'color': '#F18F01'  # Turuncu
    },
    'Göz Hastalıkları\n(ResNet50)': {
        'accuracy': 77.5,  # %75-80 aralığının ortası
        'min': 75,
        'max': 80,
        'classes': 5,
        'color': '#C73E1D'  # Kırmızı
    }
}

# Grafik oluştur
fig, ax = plt.subplots(figsize=(12, 7))

# Model isimleri ve doğruluk değerleri
model_names = list(models.keys())
accuracies = [models[m]['accuracy'] for m in model_names]
min_accuracies = [models[m]['min'] for m in model_names]
max_accuracies = [models[m]['max'] for m in model_names]
colors = [models[m]['color'] for m in model_names]

# Bar grafiği oluştur
bars = ax.barh(model_names, accuracies, color=colors, alpha=0.8, edgecolor='black', linewidth=1.5)

# Hata çubukları (min-max aralığı)
for i, (min_acc, max_acc, acc) in enumerate(zip(min_accuracies, max_accuracies, accuracies)):
    ax.errorbar(acc, i, xerr=[[acc - min_acc], [max_acc - acc]], 
                fmt='none', color='black', capsize=5, capthick=2, linewidth=1.5)

# Değerleri bar'ların üzerine yazdır
for i, (bar, acc, min_acc, max_acc) in enumerate(zip(bars, accuracies, min_accuracies, max_accuracies)):
    width = bar.get_width()
    ax.text(width + 1, bar.get_y() + bar.get_height()/2, 
            f'{acc:.1f}%\n({min_acc}-{max_acc}%)',
            ha='left', va='center', fontsize=10, fontweight='bold')

# Sınıf sayılarını göster
for i, (name, model_data) in enumerate(models.items()):
    ax.text(-5, i, f'{model_data["classes"]} sınıf', 
            ha='right', va='center', fontsize=9, style='italic', color='gray')

# Grafik özellikleri
ax.set_xlabel('Doğruluk (Accuracy) %', fontsize=12, fontweight='bold')
ax.set_title('Model Doğruluk Karşılaştırması', fontsize=14, fontweight='bold', pad=20)
ax.set_xlim(70, 100)
ax.grid(axis='x', alpha=0.3, linestyle='--')
ax.set_axisbelow(True)

# Y ekseni etiketlerini kalın yap
ax.set_yticks(range(len(model_names)))
ax.set_yticklabels(model_names, fontsize=11, fontweight='bold')

# Ortalama doğruluk çizgisi
mean_accuracy = np.mean(accuracies)
ax.axvline(mean_accuracy, color='red', linestyle='--', linewidth=2, alpha=0.7, label=f'Ortalama: {mean_accuracy:.1f}%')
ax.legend(loc='lower right', fontsize=10)

# Arka plan rengi
ax.set_facecolor('#F8F9FA')
fig.patch.set_facecolor('white')

# Layout ayarları
plt.tight_layout(rect=[0.05, 0.05, 0.95, 0.95])

# Kaydet
output_path = 'model_accuracy_comparison_chart.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
print(f"✅ Grafik oluşturuldu: {output_path}")
print(f"\n📊 Model Doğruluk Sonuçları:")
for name, data in models.items():
    print(f"  {name.replace(chr(10), ' ')}: {data['accuracy']:.1f}% ({data['min']}-{data['max']}%)")

# plt.show() GUI gerektirir, kaydetmek yeterli
print(f"\n✅ Grafik başarıyla kaydedildi: {output_path}")

