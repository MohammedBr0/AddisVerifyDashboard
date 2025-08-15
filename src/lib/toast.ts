// Simple toast implementation
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

class ToastManager {
  private toasts: Toast[] = []
  private listeners: ((toasts: Toast[]) => void)[] = []

  addToast(type: ToastType, message: string, duration: number = 5000) {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      message,
      duration
    }

    this.toasts.push(toast)
    this.notifyListeners()

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id)
      }, duration)
    }
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }
}

const toastManager = new ToastManager()

export const toast = {
  success: (message: string, duration?: number) => toastManager.addToast('success', message, duration),
  error: (message: string, duration?: number) => toastManager.addToast('error', message, duration),
  warning: (message: string, duration?: number) => toastManager.addToast('warning', message, duration),
  info: (message: string, duration?: number) => toastManager.addToast('info', message, duration),
}

export { toastManager }
export type { Toast, ToastType } 