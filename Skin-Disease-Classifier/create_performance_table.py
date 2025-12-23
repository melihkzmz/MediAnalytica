#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Performans Test Sonuçları Tablosu Oluşturucu
RAPOR.txt için TABLO 3.2 tablosunu oluşturur
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.table import Table
import numpy as np

# Performans test verileri (RAPOR.txt'den alınan)
performance_data = {
    'API Yanıt Süreleri': {
        '/api/user/stats': '150-300 ms',
        '/api/user/analyses': '200-500 ms',
        '/api/user/favorites': '150-250 ms',
        '/auth/verify': '100-200 ms',
        'Ortalama': '200-500 ms',
        'P95': '< 2 saniye'
    },
    'Model Tahmin Süreleri': {
        'Deri Hastalıkları (EfficientNetB3)': '3-5 saniye',
        'Kemik Hastalıkları (DenseNet-121)': '4-6 saniye',
        'Akciğer Hastalıkları': '2-4 saniye',
        'Göz Hastalıkları': '3-5 saniye',
        'Ortalama': '2-8 saniye',
        'P95': '-'
    },
    'Sayfa Yükleme Süreleri': {
        'First Contentful Paint (FCP)': '1-1.5 saniye',
        'Largest Contentful Paint (LCP)': '1.5-2.5 saniye',
        'Time to Interactive (TTI)': '2-3 saniye',
        'Ortalama': '1-2 saniye',
        'P95': '-',
        'P95 (LCP)': '< 2.5 saniye'
    }
}

# Tablo için veri hazırlama
table_data = []

# Başlık satırı
table_data.append(['Metrik Kategorisi', 'Test Parametresi', 'Sonuç'])

# API Yanıt Süreleri
for i, (param, result) in enumerate(performance_data['API Yanıt Süreleri'].items()):
    if i == 0:
        table_data.append(['API Yanıt Süreleri', param, result])
    else:
        table_data.append(['', param, result])

# Model Tahmin Süreleri
for i, (param, result) in enumerate(performance_data['Model Tahmin Süreleri'].items()):
    if i == 0:
        table_data.append(['Model Tahmin Süreleri', param, result])
    else:
        table_data.append(['', param, result])

# Sayfa Yükleme Süreleri
for i, (param, result) in enumerate(performance_data['Sayfa Yükleme Süreleri'].items()):
    if i == 0:
        table_data.append(['Sayfa Yükleme Süreleri', param, result])
    else:
        table_data.append(['', param, result])

# Grafik oluştur
fig, ax = plt.subplots(figsize=(14, 10))
ax.axis('tight')
ax.axis('off')

# Tablo oluştur
table = ax.table(cellText=table_data,
                  cellLoc='left',
                  loc='center',
                  colWidths=[0.25, 0.4, 0.35])

# Tablo stilini ayarla
table.auto_set_font_size(False)
table.set_fontsize(10)
table.scale(1, 2.5)

# Başlık satırını vurgula
for i in range(3):
    cell = table[(0, i)]
    cell.set_facecolor('#2E86AB')
    cell.set_text_props(weight='bold', color='white')
    cell.set_height(0.08)

# Kategori başlıklarını vurgula
category_rows = [1, 6, 11]  # Her kategori grubunun ilk satırı
for row_idx in category_rows:
    if row_idx < len(table_data):
        cell = table[(row_idx, 0)]
        cell.set_facecolor('#A23B72')
        cell.set_text_props(weight='bold', color='white')

# Alternatif satır renkleri
for i in range(1, len(table_data)):
    for j in range(3):
        cell = table[(i, j)]
        if i % 2 == 0:
            cell.set_facecolor('#F8F9FA')
        else:
            cell.set_facecolor('white')
        cell.set_edgecolor('#D3D3D3')
        cell.set_height(0.06)

# Başlık
fig.suptitle('TABLO 3.2: PERFORMANS TEST SONUÇLARI', 
             fontsize=16, fontweight='bold', y=0.98)

# Not ekle
note_text = ('Not: P95 = 95. persentil (tüm isteklerin %95\'inin tamamlandığı süre)\n'
             'FCP = First Contentful Paint, LCP = Largest Contentful Paint, TTI = Time to Interactive')
fig.text(0.5, 0.02, note_text, ha='center', fontsize=9, style='italic', color='gray')

# Kaydet
output_path = 'performance_test_results_table.png'
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
print(f"✅ Tablo oluşturuldu: {output_path}")
print(f"\n📊 Performans Test Sonuçları:")
print(f"  - API Yanıt Süreleri: {len(performance_data['API Yanıt Süreleri'])} metrik")
print(f"  - Model Tahmin Süreleri: {len(performance_data['Model Tahmin Süreleri'])} metrik")
print(f"  - Sayfa Yükleme Süreleri: {len(performance_data['Sayfa Yükleme Süreleri'])} metrik")
print(f"\n✅ Tablo başarıyla kaydedildi: {output_path}")

