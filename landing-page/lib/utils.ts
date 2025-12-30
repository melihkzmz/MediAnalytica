type ToastType = 'success' | 'error' | 'warning' | 'info'

export const showToast = (message: string, type: ToastType = 'info') => {
  // Remove any existing toasts first
  const existingToasts = document.querySelectorAll('[data-toast]')
  existingToasts.forEach(toast => toast.remove())
  
  // Create toast element
  const toast = document.createElement('div')
  toast.setAttribute('data-toast', 'true')
  
  // Set base styles inline to ensure they work
  toast.style.position = 'fixed'
  toast.style.top = '80px'
  toast.style.right = '16px'
  toast.style.zIndex = '9999'
  toast.style.padding = '16px 24px'
  toast.style.borderRadius = '12px'
  toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)'
  toast.style.color = '#111827'
  toast.style.fontWeight = '500'
  toast.style.fontSize = '14px'
  toast.style.lineHeight = '1.5'
  toast.style.maxWidth = '400px'
  toast.style.minWidth = '300px'
  toast.style.transition = 'all 0.3s ease'
  toast.style.pointerEvents = 'auto'
  
  // Set type-specific styles
  if (type === 'success') {
    toast.style.backgroundColor = '#f0fdf4'
    toast.style.borderLeft = '4px solid #10b981'
  } else if (type === 'error') {
    toast.style.backgroundColor = '#fef2f2'
    toast.style.borderLeft = '4px solid #ef4444'
  } else if (type === 'warning') {
    toast.style.backgroundColor = '#fffbeb'
    toast.style.borderLeft = '4px solid #f59e0b'
  } else {
    toast.style.backgroundColor = '#eff6ff'
    toast.style.borderLeft = '4px solid #3b82f6'
  }
  
  toast.textContent = message
  
  // Set initial styles for animation
  toast.style.opacity = '0'
  toast.style.transform = 'translateX(400px)'
  
  // Add to DOM
  document.body.appendChild(toast)
  
  // Force reflow to ensure initial styles are applied
  toast.offsetHeight
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  })
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(400px)'
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

export const validateImageFile = (file: File): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
  
  if (!file) {
    showToast('Lütfen bir dosya seçin.', 'error')
    return false
  }
  
  if (file.size > MAX_FILE_SIZE) {
    showToast('Dosya boyutu 10MB\'dan küçük olmalıdır.', 'error')
    return false
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    const fileExtension = file.name.split('.').pop()?.toUpperCase()
    showToast(`Yüklediğiniz görüntü formatı (${fileExtension}) desteklenmiyor. Lütfen JPEG veya PNG formatında bir görüntü yükleyin.`, 'error')
    return false
  }
  
  return true
}

export const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not compress image'))
              return
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

