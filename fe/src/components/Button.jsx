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
  const baseClasses = 'btn focus:ring-2 focus:ring-offset-2 transition-colors duration-200 inline-flex items-center justify-center font-medium rounded-md shadow-sm';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    error: 'btn-error',
    outline: 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:ring-neutral-500'
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