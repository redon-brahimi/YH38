import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input-field w-full ${
          error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : ''
        } ${disabled ? 'bg-neutral-100 cursor-not-allowed' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;