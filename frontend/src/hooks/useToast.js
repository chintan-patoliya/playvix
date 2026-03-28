import { useState } from 'react';
import { TOAST_DURATION_MS } from '../constants';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const clearToast = () => setToast(null);

  return { toast, showToast, clearToast };
};
