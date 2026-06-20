import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width,
  height,
  borderRadius = 'var(--radius-md)',
  className,
  style,
}: SkeletonProps) {
  const inlineStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    display: 'block',
    ...style,
  };

  return (
    <div
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={inlineStyle}
      aria-hidden="true"
      role="presentation"
    />
  );
}
