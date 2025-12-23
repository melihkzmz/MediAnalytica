#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API Yanıt Süreleri Tablosu Oluşturucu
RAPOR.txt dosyasındaki API yanıt süreleri verilerini kullanarak görsel bir tablo oluşturur.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle
import numpy as np

# Türkçe font desteği
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

# API yanıt süreleri verileri (RAPOR.txt'den alınan)
api_data = [
    {
        'endpoint': '/api/user/stats',
        'description': 'Kullanıcı İstatistikleri',
        'avg_min': 150,
        'avg_max': 300,
        'cache': 'Evet'
    },
    {
        'endpoint': '/api/user/analyses',
        'description': 'Kullanıcı Analizleri',
        'avg_min': 200,
        'avg_max': 500,
        'cache': 'Hayır'
    },
    {
        'endpoint': '/api/user/favorites',
        'description': 'Kullanıcı Favorileri',
        'avg_min': 150,
        'avg_max': 250,
        'cache': 'Hayır'
    },
    {
        'endpoint': '/auth/verify',
        'description': 'Token Doğrulama',
        'avg_min': 100,
        'avg_max': 200,
        'cache': 'Hayır'
    }
]

# Figür oluştur - daha büyük ve düzenli
fig = plt.figure(figsize=(16, 10))
ax = fig.add_subplot(111)
ax.axis('off')

# Tablo başlığı
fig.suptitle('TABLO 3.3: API YANIT SÜRELERİ', 
             fontsize=20, fontweight='bold', y=0.97)

# Tablo başlıkları ve genişlikleri
headers = ['Endpoint', 'Açıklama', 'Ortalama Min\n(ms)', 'Ortalama Max\n(ms)', 'Cache']
num_cols = len(headers)
col_width = 1.0 / num_cols
col_positions = [i * col_width + col_width/2 for i in range(num_cols)]

# Tablo yüksekliği
header_height = 0.08
row_height = 0.12
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

for idx, data in enumerate(api_data):
    row_y = y_pos - idx * row_height
    
    # Satır arka planı
    row_color = colors[idx % 2]
    row_rect = Rectangle((0, row_y - row_height), 1, row_height,
                         facecolor=row_color, edgecolor='#dee2e6', linewidth=1.5, zorder=0)
    ax.add_patch(row_rect)
    
    # Endpoint
    ax.text(col_positions[0], row_y - row_height/2,
            data['endpoint'], ha='center', va='center', fontsize=11,
            fontweight='600', color='#495057', transform=ax.transAxes,
            family='monospace')
    
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
    
    # Cache
    cache_color = '#28a745' if data['cache'] == 'Evet' else '#6c757d'
    ax.text(col_positions[4], row_y - row_height/2,
            data['cache'], ha='center', va='center', fontsize=11,
            color=cache_color, fontweight='bold', transform=ax.transAxes)

# Notlar
notes_y = y_pos - len(api_data) * row_height - 0.08
notes_text = ("Not: Tüm ölçümler ortalama değerlerdir. Gerçek yanıt süreleri "
              "ağ koşullarına ve sunucu yüküne göre değişebilir.")
ax.text(0.5, notes_y, notes_text, ha='center', va='top', fontsize=10,
         style='italic', color='#6c757d', transform=ax.transAxes)

# Eksenleri tam ekran yap
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)

# Kaydet
output_file = 'api_response_times_table.png'
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='white', 
            edgecolor='none', pad_inches=0.2)
print(f"✅ Tablo oluşturuldu: {output_file}")
print(f"📊 Toplam {len(api_data)} API endpoint verisi işlendi.")
print(f"📐 Çözünürlük: 300 DPI (yüksek kalite)")
