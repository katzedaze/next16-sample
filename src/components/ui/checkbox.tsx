'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0',
              error && 'border-red-300',
              props.disabled && 'cursor-not-allowed opacity-50',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${props.id}-error`
                : description
                ? `${props.id}-description`
                : undefined
            }
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={cn(
                  'font-medium',
                  error ? 'text-red-900' : 'text-gray-700',
                  props.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={`${props.id}-description`}
                className={cn(
                  'text-gray-500',
                  props.disabled && 'opacity-50'
                )}
              >
                {description}
              </p>
            )}
            {error && (
              <p
                id={`${props.id}-error`}
                className="text-red-600 mt-1"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
