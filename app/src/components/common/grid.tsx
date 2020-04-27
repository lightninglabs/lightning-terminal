import React, { HTMLAttributes } from 'react';

/**
 * This component represents a Row in the bootstrap Grid layout
 */
export const Row: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...rest
}) => {
  const cn: string[] = ['row'];
  className && cn.push(className);
  return (
    <div className={cn.join(' ')} {...rest}>
      {children}
    </div>
  );
};

/**
 * A column in the bootstrap Grid layout
 * @param cols the number of columns wide (optional)
 */
export const Column: React.FC<{
  cols?: number;
  right?: boolean;
  className?: string;
}> = ({ cols, right, children, className }) => {
  const cn: string[] = [];
  cn.push(cols ? `col-${cols}` : 'col');
  className && cn.push(className);
  right && cn.push('text-right');
  return <div className={cn.join(' ')}>{children}</div>;
};
