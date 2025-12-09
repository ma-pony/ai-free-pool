/**
 * 视觉隐藏组件
 * 用于屏幕阅读器可访问但视觉隐藏的内容
 */

type VisuallyHiddenProps = {
  children: React.ReactNode;
  as?: 'span' | 'div' | 'label';
};

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component
      className="
        absolute -m-px h-px w-px overflow-hidden
        border-0 p-0 whitespace-nowrap
        [clip:rect(0,0,0,0)]
      "
    >
      {children}
    </Component>
  );
}
