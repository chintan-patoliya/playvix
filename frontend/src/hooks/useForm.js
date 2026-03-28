import { useState } from 'react';

export const useForm = (initialState = {}) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const setFieldValue = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const setError = (error) => {
    if (typeof error === 'string') {
      setErrors({ general: error });
    } else {
      setErrors(error);
    }
  };

  const clearErrors = () => setErrors({});

  const resetForm = () => {
    setForm(initialState);
    setErrors({});
    setLoading(false);
  };

  return {
    form,
    setForm,
    errors,
    setErrors,
    loading,
    setLoading,
    handleChange,
    setFieldValue,
    setError,
    clearErrors,
    resetForm,
  };
};
