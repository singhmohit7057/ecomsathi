import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
  primary: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  success: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  error: 'bg-[#FFF1F2] text-[#DC2626] border border-[#FFE4E6]',
  info: 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]',
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3.5 py-1.5 text-xs',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
}) => {
  return (
    <span
      className={[
        'inline-flex items-center justify-center font-medium rounded-[100px] leading-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
