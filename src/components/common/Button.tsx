import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#2563EB] text-white shadow-[#1E293B_2px_2px_0px_0px] hover:bg-[#1D4ED8] border border-[#2563EB]',
  ghost:
    'bg-white text-[#0F172A] border border-[#E2E8F0] shadow-[#1E293B_1px_1px_0px_0px] hover:bg-[#F8FAFC]',
  outline:
    'bg-transparent text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF]',
  danger:
    'bg-[#DC2626] text-white border border-[#DC2626] shadow-[#1E293B_2px_2px_0px_0px] hover:bg-[#B91C1C]',
  link: 'bg-transparent text-[#2563EB] border-0 shadow-none hover:underline p-0',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  const isDisabled = disabled || loading;

  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-[4px] transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 focus-visible:ring-offset-1';

  const disabledClasses = isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const widthClass = fullWidth ? 'w-full' : '';

  const linkSizeOverride = variant === 'link' ? '' : sizeClasses[size];

  const classes = [
    baseClasses,
    variantClasses[variant],
    linkSizeOverride,
    disabledClasses,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
