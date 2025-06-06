// src/utils/toastService.ts
import { toast, ToastOptions } from 'react-toastify';

const baseOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  pauseOnHover: true,
  draggable: true,
  closeOnClick: true,
};

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, { ...baseOptions, ...options });

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, { ...baseOptions, ...options });

export const toastInfo = (message: string, options?: ToastOptions) =>
  toast.info(message, { ...baseOptions, ...options });

export const toastWarn = (message: string, options?: ToastOptions) =>
  toast.warn(message, { ...baseOptions, ...options });

// Optional: support dynamic JSX content
export const toastCustom = (content: React.ReactNode, options?: ToastOptions) =>
  toast(content, { ...baseOptions, ...options });
