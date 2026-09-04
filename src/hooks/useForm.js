// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
    const [values, setValuesState] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // -----------------------------
    // Field Helpers
    // -----------------------------

    const setFieldValue = useCallback((name, value) => {
        setValuesState(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' })); // clear error on change
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    const setFieldTouched = useCallback((name, isTouched = true) => {
        setTouched(prev => ({ ...prev, [name]: isTouched }));
    }, []);

    const setValues = useCallback((newValues) => {
        setValuesState(prev => ({ ...prev, ...newValues }));
    }, []);

    // -----------------------------
    // Validation
    // -----------------------------

    const validateField = useCallback(
        (name, value) => {
            if (!validationSchema) return true;

            try {
                validationSchema.validateSyncAt(name, { ...values, [name]: value });
                setFieldError(name, '');
                return true;
            } catch (error) {
                setFieldError(name, error.message);
                return false;
            }
        },
        [validationSchema, values, setFieldError]
    );

    const validate = useCallback(() => {
        if (!validationSchema) return true;

        try {
            validationSchema.validateSync(values, { abortEarly: false });
            setErrors({});
            return true;
        } catch (error) {
            const formattedErrors = {};
            if (error.inner) {
                error.inner.forEach(err => {
                    formattedErrors[err.path] = err.message;
                });
            }
            setErrors(formattedErrors);
            return false;
        }
    }, [validationSchema, values]);

    // -----------------------------
    // Event Handlers
    // -----------------------------

    const handleChange = useCallback(
        (e) => {
            const { name, value, type, checked } = e.target;
            const finalValue = type === 'checkbox' ? checked : value;

            setFieldValue(name, finalValue);
        },
        [setFieldValue]
    );

    const handleBlur = useCallback(
        (e) => {
            const { name } = e.target;
            setFieldTouched(name, true);
            validateField(name, values[name]);
        },
        [setFieldTouched, validateField, values]
    );

    // -----------------------------
    // Submit Handler
    // -----------------------------

    const handleSubmit = useCallback(
        (onSubmit) => async (e) => {
            if (e) e.preventDefault();

            // Mark all fields touched
            const allTouched = Object.keys(values).reduce(
                (acc, key) => ({ ...acc, [key]: true }),
                {}
            );
            setTouched(allTouched);

            const isValid = validate();
            if (!isValid) return;

            setIsSubmitting(true);

            try {
                await onSubmit(values);
            } catch (error) {
                console.error("Form submission error:", error);

                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [values, validate]
    );

    // -----------------------------
    // Reset Form
    // -----------------------------

    const resetForm = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // -----------------------------

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,

        // helpers
        setFieldValue,
        setFieldError,
        setFieldTouched,
        setValues,
        resetForm,
        validate,
        validateField,
    };
};
