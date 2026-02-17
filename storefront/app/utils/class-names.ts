import React from 'react';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// Backwards compatible alias for existing usages.
export const classNames = cn;

export function mergeClassName(
  props: React.HTMLAttributes<any>,
  className: ClassValue,
) {
  return {
    ...props,
    className: cn(props.className, className),
  };
}
