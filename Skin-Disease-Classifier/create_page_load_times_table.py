#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sayfa Yükleme Süreleri Tablosu Oluşturucu
RAPOR.txt dosyasındaki sayfa yükleme süreleri verilerini kullanarak görsel bir tablo oluşturur.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle
import numpy as np

# Türkçe font desteği
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

# Sayfa yükleme süreleri verileri (RAPOR.txt'den alınan)
page_load_data = [
    {
        'metric': 'First Contentful Paint (FCP)',
        'description': 'İlk İçerik Boyaması',
        'avg_min': 1.0,
        'avg_max': 1.5,
        'unit': 'saniye'
    },
    {
        'metric': 'Largest Contentful Paint (LCP)',
        'description': 'En Büyük İçerik Boyaması',
        'avg_min': 1.5,
        'avg_max': 2.5,
        'unit': 'saniye'
    },
    {
        'metric': 'Time to Interactive (TTI)',
        'description': 'Etkileşimli Olma Süresi',
        'avg_min': 2.0,
        'avg_max': 3.0,
        'unit': 'saniye'
    }
]

# Figür oluştur - daha büyük ve düzenli
fig = plt.figure(figsize=(16, 10))
ax = fig.add_subplot(111)
ax.axis('off')

# Tablo başlığı
fig.suptitle('TABLO 3.5: SAYFA YÜKLEME SÜRELERİ', 
             fontsize=20, fontweight='bold', y=0.97)

# Tablo başlıkları ve genişlikleri
headers = ['Metrik', 'Açıklama', 'Ortalama Min\n(saniye)', 'Ortalama Max\n(saniye)']
num_cols = len(headers)
col_width = 1.0 / num_cols
col_positions = [i * col_width + col_width/2 for i in range(num_cols)]

# Tablo yüksekliği
header_height = 0.08
row_height = 0.14
y_start = 0.85

# Başlık satırı
header_y = y_start
header_rect = Rectangle((0, header_y - header_height), 1, header_height,
                        facecolor='#667eea', edgecolor='#000000', linewidth=2, zorder=1)
ax.add_patch(header_rect)

# Başlık metinleri
for i, header in enumerate(headers):
    ax.text(col_positions[i], header_y - header_height/2, header,
            ha='center', va='center', fontsize=13, fontweight='bold',
            color='white', transform=ax.transAxes)

# Veri satırları
y_pos = header_y - header_height - 0.02
colors = ['#f8f9fa', '#ffffff']

for idx, data in enumerate(page_load_data):
    row_y = y_pos - idx * row_height
    
    # Satır arka planı
    row_color = colors[idx % 2]
    row_rect = Rectangle((0, row_y - row_height), 1, row_height,
                         facecolor=row_color, edgecolor='#dee2e6', linewidth=1.5, zorder=0)
    ax.add_patch(row_rect)
    
    # Metrik (kısaltılmış)
    metric_short = data['metric'].split('(')[0].strip()  # Parantez öncesi kısım
    metric_full = data['metric']
    # İki satırlı gösterim
    ax.text(col_positions[0], row_y - row_height/2 + 0.02,
            metric_short, ha='center', va='center', fontsize=11,
            fontweight='600', color='#495057', transform=ax.transAxes)
    ax.text(col_positions[0], row_y - row_height/2 - 0.02,
            '(' + metric_full.split('(')[1] if '(' in metric_full else '',
            ha='center', va='center', fontsize=9,
            color='#6c757d', transform=ax.transAxes, style='italic')
    
    # Açıklama
    ax.text(col_positions[1], row_y - row_height/2,
            data['description'], ha='center', va='center', fontsize=11,
            color='#6c757d', transform=ax.transAxes)
    
    # Ortalama Min
    min_text = f"{data['avg_min']}"
    ax.text(col_positions[2], row_y - row_height/2,
            min_text, ha='center', va='center', fontsize=11,
            color='#28a745', fontweight='bold', transform=ax.transAxes)
    
    # Ortalama Max
    max_text = f"{data['avg_max']}"
    ax.text(col_positions[3], row_y - row_height/2,
            max_text, ha='center', va='center', fontsize=11,
            color='#dc3545', fontweight='bold', transform=ax.transAxes)

# Notlar
notes_y = y_pos - len(page_load_data) * row_height - 0.08
notes_text = ("Not: Tüm ölçümler Web Vitals metrikleri kullanılarak yapılmıştır. "
              "Gerçek yükleme süreleri ağ hızına, cihaz performansına ve tarayıcıya göre değişebilir.")
ax.text(0.5, notes_y, notes_text, ha='center', va='top', fontsize=10,
         style='italic', color='#6c757d', transform=ax.transAxes)

# Eksenleri tam ekran yap
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)

# Kaydet
output_file = 'page_load_times_table.png'
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='white', 
            edgecolor='none', pad_inches=0.2)
print(f"✅ Tablo oluşturuldu: {output_file}")
print(f"📊 Toplam {len(page_load_data)} metrik verisi işlendi.")
print(f"📐 Çözünürlük: 300 DPI (yüksek kalite)")

