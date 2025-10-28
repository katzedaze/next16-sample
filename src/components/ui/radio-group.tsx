'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  options: RadioOption[];
  error?: string;
  helperText?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ label, options, error, helperText, orientation = 'vertical', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div
          className={cn(
            'space-y-3',
            orientation === 'horizontal' && 'flex flex-wrap gap-4 space-y-0'
          )}
          role="radiogroup"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${props.name}-error`
              : helperText
              ? `${props.name}-helper`
              : undefined
          }
        >
          {options.map((option, index) => (
            <div key={option.value} className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  ref={index === 0 ? ref : undefined}
                  type="radio"
                  id={`${props.name}-${option.value}`}
                  name={props.name}
                  value={option.value}
                  disabled={option.disabled || props.disabled}
                  className={cn(
                    'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0',
                    error && 'border-red-300',
                    (option.disabled || props.disabled) && 'cursor-not-allowed opacity-50',
                    className
                  )}
                  {...props}
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor={`${props.name}-${option.value}`}
                  className={cn(
                    'font-medium',
                    error ? 'text-red-900' : 'text-gray-700',
                    (option.disabled || props.disabled) && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p
                    className={cn(
                      'text-gray-500',
                      (option.disabled || props.disabled) && 'opacity-50'
                    )}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <p
            id={`${props.name}-error`}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.name}-helper`}
            className="mt-2 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
