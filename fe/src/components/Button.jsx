import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'focus:ring-2 focus:ring-offset-2 transition-all duration-200 inline-flex items-center justify-center font-medium rounded-xl shadow-sm transform hover:-translate-y-0.5 focus:outline-none';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    outline: 'border-2 border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-primary-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm min-h-9 min-w-9',
    medium: 'px-4 py-2 text-base min-h-11 min-w-11',
    large: 'px-6 py-3 text-lg min-h-12 min-w-12'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;