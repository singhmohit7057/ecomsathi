import React from 'react';

interface CardProps {
  variant?: 'default' | 'shadowed' | 'sky' | 'foam' | 'sage' | 'blush' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white border border-[#E2E8F0]',
  shadowed: 'bg-white border border-[#E2E8F0] shadow-[#1E293B_2px_2px_0px_0px]',
  sky: 'bg-[var(--color-card-sky,#E0F2FE)] border border-[#BAE6FD]',
  foam: 'bg-[var(--color-card-foam,#F0FDF4)] border border-[#BBF7D0]',
  sage: 'bg-[var(--color-card-sage,#F0FDF4)] border border-[#A7F3D0]',
  blush: 'bg-[var(--color-card-blush,#FFF1F2)] border border-[#FFE4E6]',
  highlight: 'bg-[var(--color-card-highlight,#FFFBEB)] border border-[#FDE68A]',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  onClick,
}) => {
  const isClickable = !!onClick;

  const baseClasses = 'rounded-[8px]';
  const clickableClasses = isClickable
    ? 'cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]'
    : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    clickableClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isClickable) {
    return (
      <div
        className={classes}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
};

export default Card;
