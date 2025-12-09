/**
 * 触摸目标包装器
 * 解决问题：触摸目标尺寸不一致
 *
 * 确保所有可交互元素满足 44x44px 最小触摸目标
 */

type TouchTargetProps = {
  children: React.ReactNode;
  className?: string;
};

export function TouchTarget({ children, className = '' }: TouchTargetProps) {
  return (
    <div className={`relative ${className}`}>
      {/* 扩展触摸区域 */}
      <span
        className="absolute -inset-2 min-h-[44px] min-w-[44px]"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

// 用于小型按钮/图标的触摸目标扩展
export function TouchTargetButton({
  children,
  onClick,
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-[44px] min-w-[44px] ${className}`}
      aria-label={ariaLabel}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
}
