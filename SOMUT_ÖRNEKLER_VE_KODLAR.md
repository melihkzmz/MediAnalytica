# 💻 Somut Örnekler ve Kodlar

Bu dosya, eleştiri dokümanında bahsedilen tüm iyileştirmelerin **tam çalışır kod örnekleri** içerir.

---

## 1. ÖRNEK GÖRÜNTÜ SİSTEMİ

### A. Örnek Görüntü Kütüphanesi HTML

```html
<!-- analyze.html'e eklenecek -->
<section class="sample-images-section" id="sample-images-section">
    <div class="section-header">
        <h2><i class="fas fa-images"></i> Örnek Görüntülerle Deneyin</h2>
        <p>Test etmek için hazır örnek görüntüleri kullanabilirsiniz</p>
    </div>
    
    <div class="disease-tabs">
        <button class="tab-btn active" onclick="showSampleTab('skin')">
            <i class="fas fa-hand-sparkles"></i> Deri
        </button>
        <button class="tab-btn" onclick="showSampleTab('bone')">
            <i class="fas fa-bone"></i> Kemik
        </button>
        <button class="tab-btn" onclick="showSampleTab('lung')">
            <i class="fas fa-lungs"></i> Akciğer
        </button>
        <button class="tab-btn" onclick="showSampleTab('eye')">
            <i class="fas fa-eye"></i> Göz
        </button>
    </div>
    
    <div class="samples-grid" id="samples-grid">
        <!-- Dinamik olarak yüklenecek -->
    </div>
    
    <div class="sample-note">
        <i class="fas fa-info-circle"></i>
        <p>
            <strong>Not:</strong> Bu örnek görüntüler eğitim amaçlıdır. 
            Gerçek tıbbi görüntüler değildir. Analiz sonuçları demo amaçlıdır.
        </p>
    </div>
</section>

<style>
.sample-images-section {
    background: rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.samples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.sample-card {
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
}

.sample-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    border-color: var(--primary);
}

.sample-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
}

.sample-info {
    padding: 15px;
    text-align: center;
}

.sample-info strong {
    display: block;
    margin-bottom: 5px;
    color: var(--gray-800);
}

.sample-info small {
    color: var(--gray-600);
    font-size: 0.85rem;
}

.disease-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
    padding: 10px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
    font-weight: 600;
    color: var(--gray-600);
}

.tab-btn.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}
</style>

<script>
// Örnek görüntü verileri
const SAMPLE_IMAGES = {
    skin: [
        {
            name: 'Melanom Örneği',
            image: 'samples/skin/melanoma_sample.jpg',
            diseaseType: 'skin',
            expectedResult: 'mel'
        },
        {
            name: 'Bazal Hücreli Karsinom',
            image: 'samples/skin/bcc_sample.jpg',
            diseaseType: 'skin',
            expectedResult: 'bcc'
        },
        {
            name: 'İyi Huylu Keratoz',
            image: 'samples/skin/bkl_sample.jpg',
            diseaseType: 'skin',
            expectedResult: 'bkl'
        }
    ],
    bone: [
        {
            name: 'Kemik Kırığı',
            image: 'samples/bone/fracture_sample.jpg',
            diseaseType: 'bone',
            expectedResult: 'Fracture'
        },
        {
            name: 'Normal Kemik',
            image: 'samples/bone/normal_sample.jpg',
            diseaseType: 'bone',
            expectedResult: 'Normal'
        }
    ],
    lung: [
        {
            name: 'Pnömoni',
            image: 'samples/lung/pneumonia_sample.jpg',
            diseaseType: 'lung',
            expectedResult: 'Pneumonia'
        }
    ],
    eye: [
        {
            name: 'Katarakt',
            image: 'samples/eye/cataract_sample.jpg',
            diseaseType: 'eye',
            expectedResult: 'Cataract'
        }
    ]
};

function showSampleTab(diseaseType) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Örnekleri göster
    const samples = SAMPLE_IMAGES[diseaseType] || [];
    const grid = document.getElementById('samples-grid');
    
    grid.innerHTML = samples.map(sample => `
        <div class="sample-card" onclick="loadSampleImage('${sample.diseaseType}', '${sample.image}', '${sample.expectedResult}')">
            <img src="${sample.image}" alt="${sample.name}" onerror="this.src='images/placeholder.jpg'">
            <div class="sample-info">
                <strong>${sample.name}</strong>
                <small>${getDiseaseTypeName(sample.diseaseType)}</small>
            </div>
        </div>
    `).join('');
}

async function loadSampleImage(diseaseType, imagePath, expectedResult) {
    // Hastalık türünü seç
    document.getElementById('disease-type').value = diseaseType;
    
    // Model yüklenene kadar bekle
    await loadModel(diseaseType);
    
    // Görüntüyü yükle
    try {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
        
        // File input'a set et
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById('image-input').files = dataTransfer.files;
        
        // Preview göster
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-image').src = e.target.result;
            document.querySelector('.image-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        // Analiz butonunu aktif et
        document.getElementById('analyze-button').disabled = false;
        
        showToast('Örnek görüntü yüklendi. "Analiz Et" butonuna tıklayın.', 'success');
    } catch (error) {
        showToast('Örnek görüntü yüklenemedi.', 'error');
    }
}
</script>
```

---

## 2. GÖRSEL SONUÇ GÖSTERİMİ

### A. Modern Sonuç Kartı

```html
<!-- analyze.html - results div'ini değiştir -->
<div class="results-container" id="results">
    <!-- Ana Tahmin Kartı -->
    <div class="primary-result-card">
        <div class="result-header">
            <div class="result-icon-large">
                <i class="fas fa-diagnoses"></i>
            </div>
            <div class="result-title-group">
                <h2>Tespit Edilen Durum</h2>
                <p class="result-subtitle">En yüksek olasılık</p>
            </div>
        </div>
        
        <div class="result-main">
            <div class="result-name">
                <h1 id="top-prediction-name">-</h1>
                <span class="result-code" id="top-prediction-code">-</span>
            </div>
            
            <div class="confidence-meter">
                <div class="confidence-bar-container">
                    <div class="confidence-bar" id="confidence-bar" style="width: 0%">
                        <span class="confidence-text" id="confidence-text">0%</span>
                    </div>
                </div>
                <div class="confidence-label">
                    <span>Güven Skoru</span>
                </div>
            </div>
            
            <div class="result-description" id="result-description">
                <p>-</p>
            </div>
            
            <div class="result-alert" id="result-alert" style="display: none;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong id="alert-title">-</strong>
                    <p id="alert-message">-</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Diğer Olasılıklar -->
    <div class="secondary-results">
        <h3><i class="fas fa-list"></i> Diğer Olasılıklar</h3>
        <div class="results-list" id="other-results-list">
            <!-- Dinamik olarak yüklenecek -->
        </div>
    </div>
    
    <!-- Grad-CAM Görselleştirme -->
    <div class="gradcam-section" id="gradcam-section" style="display: none;">
        <h3><i class="fas fa-eye"></i> Model Odak Bölgeleri</h3>
        <div class="gradcam-container">
            <div class="gradcam-comparison">
                <div class="gradcam-item">
                    <img id="original-image" src="" alt="Orijinal görüntü" class="gradcam-image">
                    <p class="gradcam-label">Orijinal Görüntü</p>
                </div>
                <div class="gradcam-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="gradcam-item">
                    <img id="gradcam-image" src="" alt="Grad-CAM" class="gradcam-image">
                    <p class="gradcam-label">Model Odak Bölgeleri</p>
                </div>
            </div>
            <div class="gradcam-explanation">
                <i class="fas fa-info-circle"></i>
                <p>
                    <strong>Kırmızı/Sarı bölgeler:</strong> Modelin en çok dikkat ettiği alanlar. 
                    Bu bölgeler tanı için en önemli görülen kısımlardır.
                </p>
            </div>
        </div>
    </div>
    
    <!-- Sonraki Adımlar -->
    <div class="next-steps-card">
        <h3><i class="fas fa-route"></i> Önerilen Sonraki Adımlar</h3>
        <div class="steps-list">
            <div class="step-item">
                <div class="step-icon">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="step-content">
                    <strong>Doktora Danışın</strong>
                    <p>Bu sonuçlar sadece bilgilendirme amaçlıdır. Kesin tanı için mutlaka bir doktora danışın.</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="showAppointmentModal()">
                        <i class="fas fa-video"></i> Doktor ile Görüşme Talep Et
                    </button>
                </div>
            </div>
            <div class="step-item">
                <div class="step-icon">
                    <i class="fas fa-history"></i>
                </div>
                <div class="step-content">
                    <strong>Takip Edin</strong>
                    <p>Bu analizi kaydedin ve zaman içindeki değişiklikleri takip edin.</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="toggleFavorite()">
                        <i class="fas fa-heart"></i> Favorilere Ekle
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.primary-result-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 30px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
}

.result-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.result-icon-large {
    width: 80px;
    height: 80px;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
}

.result-name h1 {
    font-size: 3rem;
    margin: 0;
    font-weight: 700;
}

.result-code {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-left: 15px;
}

.confidence-meter {
    margin: 30px 0;
}

.confidence-bar-container {
    width: 100%;
    height: 40px;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
}

.confidence-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 1s ease;
    position: relative;
}

.confidence-text {
    color: white;
    font-weight: 700;
    font-size: 1.1rem;
    z-index: 1;
}

.secondary-results {
    background: white;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 20px;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: var(--gray-100);
    border-radius: 12px;
    transition: all 0.3s;
}

.result-item:hover {
    background: var(--gray-200);
    transform: translateX(5px);
}

.result-rank {
    width: 40px;
    height: 40px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.result-info {
    flex: 1;
}

.result-name-small {
    font-weight: 600;
    color: var(--gray-800);
}

.result-confidence-small {
    color: var(--gray-600);
    font-size: 0.9rem;
}

.result-bar-small {
    width: 150px;
    height: 8px;
    background: var(--gray-300);
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 4px;
    transition: width 0.5s ease;
}
</style>

<script>
function displayResults(results, data) {
    // Ana tahmin
    const topResult = results[0];
    document.getElementById('top-prediction-name').textContent = topResult.className;
    document.getElementById('top-prediction-code').textContent = topResult.class;
    
    // Güven skoru
    const confidence = topResult.probability * 100;
    document.getElementById('confidence-bar').style.width = confidence + '%';
    document.getElementById('confidence-text').textContent = confidence.toFixed(1) + '%';
    
    // Açıklama
    const description = CLASS_DESCRIPTIONS[topResult.class] || 'Açıklama bulunamadı';
    document.getElementById('result-description').innerHTML = `<p>${description}</p>`;
    
    // Uyarı
    const alertDiv = document.getElementById('result-alert');
    if (confidence > 80) {
        alertDiv.style.display = 'block';
        alertDiv.className = 'result-alert alert-high';
        document.getElementById('alert-title').textContent = 'Yüksek Güven Skoru';
        document.getElementById('alert-message').textContent = 
            'Bu sonuç yüksek güvenilirlikte. Ancak yine de profesyonel tıbbi görüş alın.';
    } else if (confidence < 50) {
        alertDiv.style.display = 'block';
        alertDiv.className = 'result-alert alert-medium';
        document.getElementById('alert-title').textContent = 'Düşük Güven Skoru';
        document.getElementById('alert-message').textContent = 
            'Sonuç kesin değil. Farklı açılardan görüntü çekmeyi deneyin veya doktora danışın.';
    } else {
        alertDiv.style.display = 'none';
    }
    
    // Diğer sonuçlar
    const otherResults = results.slice(1);
    const otherList = document.getElementById('other-results-list');
    otherList.innerHTML = otherResults.map((result, index) => `
        <div class="result-item">
            <div class="result-rank">${index + 2}</div>
            <div class="result-info">
                <div class="result-name-small">${result.className}</div>
                <div class="result-confidence-small">${(result.probability * 100).toFixed(1)}% olasılık</div>
            </div>
            <div class="result-bar-small">
                <div class="bar-fill" style="width: ${result.probability * 100}%"></div>
            </div>
        </div>
    `).join('');
    
    // Grad-CAM
    if (data.gradcam) {
        document.getElementById('gradcam-image').src = data.gradcam;
        document.getElementById('original-image').src = document.getElementById('preview-image').src;
        document.getElementById('gradcam-section').style.display = 'block';
    }
    
    // Sonuçları göster
    document.getElementById('results').classList.add('show');
}
</script>
```

---

## 3. İLK KULLANIM REHBERİ (ONBOARDING)

### A. Intro.js ile Tour

```html
<!-- analyze.html'e ekle -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intro.js@7.2.0/minified/intro.min.css">
<script src="https://cdn.jsdelivr.net/npm/intro.js@7.2.0/minified/intro.min.js"></script>

<script>
function showOnboarding() {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') return;
    
    introJs().setOptions({
        steps: [
            {
                element: '.welcome-card',
                intro: 'Hoş geldiniz! DermaScan\'e hoş geldiniz. Size kısa bir tur yapalım.',
                position: 'bottom'
            },
            {
                element: '#disease-type',
                intro: 'İlk olarak, analiz etmek istediğiniz hastalık türünü seçin.',
                position: 'bottom'
            },
            {
                element: '#image-input',
                intro: 'Sonra, analiz etmek istediğiniz görüntüyü yükleyin. JPEG veya PNG formatında olmalı.',
                position: 'top'
            },
            {
                element: '#analyze-button',
                intro: 'Görüntüyü yükledikten sonra "Analiz Et" butonuna tıklayın. Model görüntünüzü analiz edecek.',
                position: 'top'
            },
            {
                element: '.sidebar',
                intro: 'Sol menüden analiz geçmişinizi, istatistiklerinizi ve diğer özellikleri görüntüleyebilirsiniz.',
                position: 'right'
            }
        ],
        showProgress: true,
        showBullets: true,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        nextLabel: 'Sonraki',
        prevLabel: 'Önceki',
        skipLabel: 'Atla',
        doneLabel: 'Tamam'
    }).start().oncomplete(function() {
        localStorage.setItem('hasSeenOnboarding', 'true');
    }).onexit(function() {
        localStorage.setItem('hasSeenOnboarding', 'true');
    });
}

// Sayfa yüklendiğinde kontrol et
window.addEventListener('load', () => {
    setTimeout(() => {
        showOnboarding();
    }, 2000); // 2 saniye bekle
});
</script>
```

---

## 4. GELİŞMİŞ LOADING STATES

### A. Adım Adım Loading

```html
<div class="loading-overlay" id="loading-overlay">
    <div class="loading-content">
        <div class="loading-spinner">
            <div class="spinner-ring"></div>
        </div>
        <h3 id="loading-title">Analiz Yapılıyor</h3>
        <p id="loading-description">Görüntü işleniyor, lütfen bekleyin...</p>
        
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <span class="progress-text" id="progress-text">0%</span>
        </div>
        
        <div class="loading-steps">
            <div class="loading-step active" id="step-1">
                <div class="step-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <span>Görüntü yüklendi</span>
            </div>
            <div class="loading-step" id="step-2">
                <div class="step-icon">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <span>Model hazırlanıyor...</span>
            </div>
            <div class="loading-step" id="step-3">
                <div class="step-icon">
                    <i class="fas fa-circle"></i>
                </div>
                <span>Analiz yapılıyor...</span>
            </div>
            <div class="loading-step" id="step-4">
                <div class="step-icon">
                    <i class="fas fa-circle"></i>
                </div>
                <span>Sonuçlar hazırlanıyor...</span>
            </div>
        </div>
    </div>
</div>

<style>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(10px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.loading-overlay.show {
    display: flex;
}

.loading-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
}

.loading-spinner {
    margin-bottom: 30px;
}

.spinner-ring {
    width: 80px;
    height: 80px;
    border: 8px solid #f3f4f6;
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.progress-container {
    margin: 30px 0;
}

.progress-bar {
    width: 100%;
    height: 20px;
    background: #f3f4f6;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.progress-text {
    display: block;
    margin-top: 10px;
    font-weight: 600;
    color: var(--gray-700);
}

.loading-steps {
    margin-top: 30px;
    text-align: left;
}

.loading-step {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 10px;
    background: var(--gray-100);
    transition: all 0.3s;
}

.loading-step.active {
    background: var(--primary-50);
    border-left: 4px solid var(--primary);
}

.loading-step.completed {
    background: #d1fae5;
    border-left: 4px solid #10b981;
}

.step-icon {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
}

.loading-step.active .step-icon {
    color: var(--primary);
}

.loading-step.completed .step-icon {
    color: #10b981;
}
</style>

<script>
function updateLoadingStep(stepNumber, status) {
    const step = document.getElementById(`step-${stepNumber}`);
    const icon = step.querySelector('.step-icon i');
    
    step.classList.remove('active', 'completed');
    
    if (status === 'active') {
        step.classList.add('active');
        icon.className = 'fas fa-spinner fa-spin';
    } else if (status === 'completed') {
        step.classList.add('completed');
        icon.className = 'fas fa-check-circle';
    } else {
        icon.className = 'fas fa-circle';
    }
}

async function analyzeImageWithSteps() {
    // Loading overlay'i göster
    document.getElementById('loading-overlay').classList.add('show');
    
    // Adım 1: Görüntü yüklendi
    updateLoadingStep(1, 'completed');
    updateProgress(10, 'Görüntü yüklendi');
    
    // Adım 2: Model hazırlanıyor
    updateLoadingStep(2, 'active');
    updateProgress(30, 'Model hazırlanıyor...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateLoadingStep(2, 'completed');
    
    // Adım 3: Analiz yapılıyor
    updateLoadingStep(3, 'active');
    updateProgress(50, 'Analiz yapılıyor...');
    
    // API çağrısı
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
    });
    
    updateProgress(80, 'Sonuçlar alınıyor...');
    const data = await response.json();
    updateLoadingStep(3, 'completed');
    
    // Adım 4: Sonuçlar hazırlanıyor
    updateLoadingStep(4, 'active');
    updateProgress(90, 'Sonuçlar hazırlanıyor...');
    
    // Sonuçları göster
    displayResults(data.top_3, data);
    
    updateLoadingStep(4, 'completed');
    updateProgress(100, 'Tamamlandı!');
    
    // Loading overlay'i kapat
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.remove('show');
    }, 1000);
}
</script>
```

---

## 5. HASTALIK BİLGİLENDİRME SİSTEMİ

### A. Hastalık Veritabanı

```javascript
// js/disease-info.js
const DISEASE_INFO = {
    'mel': {
        name: 'Melanom',
        definition: 'Melanom, cilt kanserinin en tehlikeli türüdür. Melanosit hücrelerinden kaynaklanır ve erken teşhis edilmezse hayati risk oluşturabilir.',
        symptoms: [
            'Asimetrik ben veya leke',
            'Düzensiz kenarlar',
            'Renk değişikliği',
            'Çapın 6mm\'den büyük olması',
            'Zaman içinde değişim göstermesi'
        ],
        whenToSeeDoctor: 'Melanom şüphesi varsa DERHAL bir dermatoloğa danışın. Erken teşhis hayat kurtarır.',
        preventionTips: [
            'Güneşten korunun (SPF 30+)',
            'Düzenli ben kontrolü yapın',
            'UV ışınlarından kaçının',
            'Yılda bir kez dermatolog kontrolü'
        ],
        severity: 'high',
        urgency: 'immediate'
    },
    'bcc': {
        name: 'Bazal Hücreli Karsinom',
        definition: 'En yaygın cilt kanseri türüdür. Genellikle yavaş büyür ve nadiren yayılır, ancak tedavi edilmesi gerekir.',
        symptoms: [
            'İnci gibi parlak yumru',
            'Açık yara veya kabuk',
            'Kırmızı yamalar',
            'Yara izi benzeri alan'
        ],
        whenToSeeDoctor: 'Birkaç hafta içinde iyileşmeyen yara veya leke varsa dermatoloğa danışın.',
        preventionTips: [
            'Güneşten korunun',
            'Düzenli cilt kontrolü',
            'UV ışınlarından kaçının'
        ],
        severity: 'medium',
        urgency: 'soon'
    },
    // ... diğer hastalıklar
};

function showDiseaseInfo(diseaseCode) {
    const info = DISEASE_INFO[diseaseCode];
    if (!info) return;
    
    const modal = document.createElement('div');
    modal.className = 'disease-info-modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${info.name} Hakkında</h2>
                <button class="modal-close" onclick="this.closest('.disease-info-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="disease-section">
                    <h3><i class="fas fa-question-circle"></i> Nedir?</h3>
                    <p>${info.definition}</p>
                </div>
                <div class="disease-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> Belirtiler</h3>
                    <ul class="symptoms-list">
                        ${info.symptoms.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
                <div class="disease-section">
                    <h3><i class="fas fa-user-md"></i> Ne Zaman Doktora Gitmeli?</h3>
                    <p>${info.whenToSeeDoctor}</p>
                </div>
                <div class="disease-section">
                    <h3><i class="fas fa-shield-alt"></i> Önleme</h3>
                    <ul class="prevention-list">
                        ${info.preventionTips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                <div class="disease-alert">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Önemli:</strong> Bu bilgiler sadece eğitim amaçlıdır. 
                    Kesin tanı için mutlaka bir doktora danışın.
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="showAppointmentModal(); this.closest('.disease-info-modal').remove();">
                    <i class="fas fa-user-md"></i> Doktor Randevusu Al
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.disease-info-modal').remove()">
                    Kapat
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
```

---

## 6. CHART.JS ENTEGRASYONU

### A. İstatistik Grafikleri

```html
<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- İstatistikler sayfası -->
<div class="charts-dashboard">
    <div class="chart-card">
        <h3>Hastalık Dağılımı</h3>
        <canvas id="disease-chart"></canvas>
    </div>
    
    <div class="chart-card">
        <h3>Aylık Trend</h3>
        <canvas id="trend-chart"></canvas>
    </div>
    
    <div class="chart-card">
        <h3>Güven Skorları</h3>
        <canvas id="confidence-chart"></canvas>
    </div>
</div>

<script>
async function loadCharts() {
    // Verileri al
    const stats = await getUserStats();
    
    // Pie Chart - Hastalık Dağılımı
    const ctx1 = document.getElementById('disease-chart').getContext('2d');
    new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Deri', 'Kemik', 'Akciğer', 'Göz'],
            datasets: [{
                data: [
                    stats.diseaseTypeCounts.skin || 0,
                    stats.diseaseTypeCounts.bone || 0,
                    stats.diseaseTypeCounts.lung || 0,
                    stats.diseaseTypeCounts.eye || 0
                ],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(78, 205, 196, 0.8)',
                    'rgba(255, 230, 109, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
    
    // Line Chart - Trend
    const ctx2 = document.getElementById('trend-chart').getContext('2d');
    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: getLast12Months(),
            datasets: [{
                label: 'Aylık Analiz',
                data: getMonthlyCounts(),
                borderColor: 'rgb(102, 126, 234)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
</script>
```

---

## 7. MOBİL KAMERA ERİŞİMİ

### A. Mobil Görüntü Yükleme

```html
<div class="mobile-upload-options">
    <button class="btn btn-primary btn-large" onclick="openCamera()">
        <i class="fas fa-camera"></i> Kamera ile Çek
    </button>
    <button class="btn btn-outline-primary btn-large" onclick="openGallery()">
        <i class="fas fa-images"></i> Galeriden Seç
    </button>
</div>

<script>
function openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Arka kamera
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Görüntüyü optimize et
            const optimized = await optimizeImage(file);
            handleImageUpload(optimized);
        }
    };
    input.click();
}

function openGallery() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const optimized = await optimizeImage(file);
            handleImageUpload(optimized);
        }
    };
    input.click();
}
</script>
```

---

Bu dosya, tüm iyileştirmelerin **tam çalışır kod örnekleri** içerir. Bu kodları doğrudan projeye ekleyebilirsin.

