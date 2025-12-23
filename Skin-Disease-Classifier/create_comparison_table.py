#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Benzer Sistemlerle Karşılaştırma Tablosu Oluşturucu
RAPOR.txt dosyasındaki karşılaştırma verilerini kullanarak görsel bir tablo oluşturur.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Rectangle
import numpy as np

# Türkçe font desteği
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

# Karşılaştırma verileri (RAPOR.txt'den alınan)
comparison_data = [
    {
        'feature': 'Çoklu Hastalık Desteği',
        'this_study': '4 Kategori\n(Deri, Kemik, Akciğer, Göz)',
        'similar_systems': 'Tek Kategori\n(Genellikle)',
        'advantage': '✓'
    },
    {
        'feature': 'Entegre Tele-Tıp',
        'this_study': 'Var\n(Jitsi Meet Entegrasyonu)',
        'similar_systems': 'Yok',
        'advantage': '✓'
    },
    {
        'feature': 'Kapsamlı Kullanıcı Yönetimi',
        'this_study': 'Var\n(Geçmiş, Favoriler, Paylaşım, İstatistikler)',
        'similar_systems': 'Sınırlı veya Yok',
        'advantage': '✓'
    }
]

# Figür oluştur - daha büyük ve düzenli
fig = plt.figure(figsize=(18, 10))
ax = fig.add_subplot(111)
ax.axis('off')

# Tablo başlığı
fig.suptitle('TABLO 3.6: BENZER SİSTEMLERLE KARŞILAŞTIRMA', 
             fontsize=20, fontweight='bold', y=0.97)

# Tablo başlıkları ve genişlikleri
headers = ['Özellik/Kriter', 'Bu Çalışma', 'Literatürdeki\nBenzer Sistemler']
num_cols = len(headers)
col_width = 1.0 / num_cols
col_positions = [i * col_width + col_width/2 for i in range(num_cols)]

# Tablo yüksekliği
header_height = 0.08
row_height = 0.16
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

for idx, data in enumerate(comparison_data):
    row_y = y_pos - idx * row_height
    
    # Satır arka planı
    row_color = colors[idx % 2]
    row_rect = Rectangle((0, row_y - row_height), 1, row_height,
                         facecolor=row_color, edgecolor='#dee2e6', linewidth=1.5, zorder=0)
    ax.add_patch(row_rect)
    
    # Özellik/Kriter
    ax.text(col_positions[0], row_y - row_height/2,
            data['feature'], ha='center', va='center', fontsize=12,
            fontweight='bold', color='#495057', transform=ax.transAxes)
    
    # Bu Çalışma
    this_study_text = data['this_study']
    # Çok satırlı metin için
    lines = this_study_text.split('\n')
    for i, line in enumerate(lines):
        y_offset = (len(lines) - 1) * 0.03 - i * 0.06
        ax.text(col_positions[1], row_y - row_height/2 + y_offset,
                line, ha='center', va='center', fontsize=11,
                color='#28a745', fontweight='600', transform=ax.transAxes)
    
    # Benzer Sistemler
    similar_text = data['similar_systems']
    lines = similar_text.split('\n')
    for i, line in enumerate(lines):
        y_offset = (len(lines) - 1) * 0.03 - i * 0.06
        ax.text(col_positions[2], row_y - row_height/2 + y_offset,
                line, ha='center', va='center', fontsize=11,
                color='#6c757d', transform=ax.transAxes)

# Notlar
notes_y = y_pos - len(comparison_data) * row_height - 0.08
notes_text = ("Not: Bu karşılaştırma, literatürdeki benzer yapay zeka destekli hastalık tespit sistemleri "
              "ile yapılmıştır. Bu çalışma, çoklu hastalık desteği ve entegre tele-tıp özellikleri ile "
              "farklılaşmaktadır.")
ax.text(0.5, notes_y, notes_text, ha='center', va='top', fontsize=10,
         style='italic', color='#6c757d', transform=ax.transAxes, wrap=True)

# Eksenleri tam ekran yap
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)

# Kaydet
output_file = 'comparison_table.png'
plt.tight_layout(rect=[0, 0, 1, 0.95])
plt.savefig(output_file, dpi=300, bbox_inches='tight', facecolor='white', 
            edgecolor='none', pad_inches=0.2)
print(f"✅ Tablo oluşturuldu: {output_file}")
print(f"📊 Toplam {len(comparison_data)} karşılaştırma kriteri işlendi.")
print(f"📐 Çözünürlük: 300 DPI (yüksek kalite)")

