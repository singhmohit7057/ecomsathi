import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  icon?: boolean;
}

const variantConfig: Record<
  NonNullable<AlertProps['variant']>,
  {
    bg: string;
    border: string;
    titleColor: string;
    messageColor: string;
    iconColor: string;
    Icon: React.ElementType;
  }
> = {
  info: {
    bg: 'bg-[#F0F9FF]',
    border: 'border-l-4 border-l-[#0284C7] border border-[#BAE6FD]',
    titleColor: 'text-[#0C4A6E]',
    messageColor: 'text-[#0369A1]',
    iconColor: 'text-[#0284C7]',
    Icon: Info,
  },
  success: {
    bg: 'bg-[#F0FDF4]',
    border: 'border-l-4 border-l-[#16A34A] border border-[#BBF7D0]',
    titleColor: 'text-[#14532D]',
    messageColor: 'text-[#15803D]',
    iconColor: 'text-[#16A34A]',
    Icon: CheckCircle,
  },
  warning: {
    bg: 'bg-[#FFFBEB]',
    border: 'border-l-4 border-l-[#D97706] border border-[#FDE68A]',
    titleColor: 'text-[#78350F]',
    messageColor: 'text-[#92400E]',
    iconColor: 'text-[#D97706]',
    Icon: AlertTriangle,
  },
  error: {
    bg: 'bg-[#FFF1F2]',
    border: 'border-l-4 border-l-[#DC2626] border border-[#FFE4E6]',
    titleColor: 'text-[#7F1D1D]',
    messageColor: 'text-[#991B1B]',
    iconColor: 'text-[#DC2626]',
    Icon: XCircle,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  icon = true,
}) => {
  const config = variantConfig[variant];
  const { Icon } = config;

  return (
    <div
      className={[
        'rounded-[8px] px-4 py-3 flex items-start gap-3',
        config.bg,
        config.border,
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      {icon && (
        <span className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
          <Icon size={18} />
        </span>
      )}

      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold leading-snug ${config.titleColor}`}>
            {title}
          </p>
        )}
        <p className={`text-sm leading-snug ${title ? 'mt-0.5' : ''} ${config.messageColor}`}>
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 rounded-[4px]`}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
