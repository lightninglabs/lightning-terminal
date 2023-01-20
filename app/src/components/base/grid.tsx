import React, { CSSProperties } from 'react';

/**
 * This component represents a container in the bootstrap Grid layout
 */
export const Container: React.FC<{
  className?: string;
  style?: CSSProperties;
}> = ({ children, className, style }) => {
  const cn: string[] = ['container'];
  className && cn.push(className);
  return (
    <div className={cn.join(' ')} style={style}>
      {children}
    </div>
  );
};

/**
 * This component represents a Row in the bootstrap Grid layout
 */
export const Row: React.FC<{
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}> = ({ children, className, style, onClick }) => {
  const cn: string[] = ['row'];
  className && cn.push(className);
  return (
    <div className={cn.join(' ')} style={style} onClick={onClick}>
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
  colsXl?: number;
  right?: boolean;
  center?: boolean;
  truncate?: boolean;
  className?: string;
}> = ({ cols, colsXl, right, center, truncate, children, className }) => {
  const cn: string[] = ['col'];
  cols && cn.push(`col-${cols}`);
  colsXl && cn.push(`col-xl-${colsXl}`);
  className && cn.push(className);
  right && cn.push('text-right');
  center && cn.push('text-center');
  truncate && cn.push('text-truncate');
  return <div className={cn.join(' ')}>{children}</div>;
};
