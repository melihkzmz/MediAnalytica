type ToastType = 'success' | 'error' | 'warning' | 'info'

export const showToast = (message: string, type: ToastType = 'info') => {
  // Create toast element
  const toast = document.createElement('div')
  toast.className = `fixed top-20 right-4 z-[100] px-6 py-4 rounded-lg shadow-lg text-gray-900 font-medium transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
    type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
    type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
    'bg-blue-50 border-l-4 border-blue-500'
  }`
  toast.textContent = message
  
  // Add to DOM
  document.body.appendChild(toast)
  
  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateY(0)'
  }, 10)
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(-20px)'
    setTimeout(() => {
      document.body.removeChild(toast)
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

