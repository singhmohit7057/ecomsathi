import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

const iconSizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-11',
};

const iconRightSizeClasses: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'pr-8',
  md: 'pr-10',
  lg: 'pr-11',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      size = 'md',
      className = '',
      id,
      disabled,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const baseInputClasses =
      'w-full bg-white border rounded-[4px] font-[var(--font-sans)] text-[#0F172A] placeholder-[#94A3B8] transition-all duration-150 focus:outline-none focus:ring-2';

    const errorClasses = error
      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
      : 'border-[#94A3B8] focus:border-[#2563EB] focus:ring-[#2563EB]/20';

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-[#F8FAFC]' : '';

    const leftPadding = leftIcon ? iconSizeClasses[size] : '';
    const rightPadding = rightIcon ? iconRightSizeClasses[size] : '';

    const inputClasses = [
      baseInputClasses,
      sizeClasses[size],
      errorClasses,
      disabledClasses,
      leftPadding,
      rightPadding,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconContainerBase =
      'absolute inset-y-0 flex items-center pointer-events-none text-[#94A3B8]';
    const iconLeft =
      size === 'sm' ? 'left-2.5' : size === 'lg' ? 'left-3.5' : 'left-3';
    const iconRight =
      size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-3.5' : 'right-3';

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#0F172A] leading-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className={`${iconContainerBase} ${iconLeft}`}>
              <span className="flex items-center">{leftIcon}</span>
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helper
                ? `${inputId}-helper`
                : undefined
            }
            {...rest}
          />
          {rightIcon && (
            <span className={`${iconContainerBase} ${iconRight}`}>
              <span className="flex items-center">{rightIcon}</span>
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[#DC2626] leading-tight"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helper && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-[#64748B] leading-tight"
          >
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
