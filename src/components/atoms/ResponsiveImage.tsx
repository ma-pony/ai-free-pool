/**
 * 响应式图片组件
 * 优化图片加载和显示
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

type ResponsiveImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallback?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2';
};

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:2': 'aspect-[3/2]',
};

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '100vw',
  priority = false,
  className = '',
  containerClassName = '',
  fallback = '/placeholder.png',
  aspectRatio,
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imageSrc = error ? fallback : src;

  return (
    <div
      className={`
        relative overflow-hidden bg-gray-100
        ${aspectRatio ? aspectRatioClasses[aspectRatio] : ''}
        ${containerClassName}
      `}
    >
      {/* 加载占位 */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`
          transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

// 头像组件
export function Avatar({
  src,
  alt,
  size = 'md',
  fallbackInitial,
}: {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitial?: string;
}) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-16 text-lg',
  };

  if (!src || error) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-full
          bg-gray-200 font-medium text-gray-600
          ${sizeClasses[size]}
        `}
      >
        {fallbackInitial || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-full ${sizeClasses[size]}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
