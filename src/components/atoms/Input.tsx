/**
 * 输入框组件
 * 统一表单输入样式，确保可访问性
 */

import { useId } from 'react';

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = (
  { ref, label, error, hint, leftIcon, rightIcon, className = '', id, ...props }: InputProps & { ref?: React.RefObject<HTMLInputElement | null> },
) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={`
              block w-full rounded-lg border bg-white px-4 py-2.5
              text-gray-900 placeholder-gray-400
              transition-colors duration-200
              focus:ring-2 focus:ring-offset-0 focus:outline-none
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
              ${className}
            `}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

// Textarea 组件
type TextareaProps = {
  label?: string;
  error?: string;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = ({ ref, label, error, hint, className = '', id, ...props }: TextareaProps & { ref?: React.RefObject<HTMLTextAreaElement | null> }) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = error ? `${textareaId}-error` : undefined;
  const hintId = hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        className={`
            block w-full rounded-lg border bg-white px-4 py-2.5
            text-gray-900 placeholder-gray-400
            transition-colors duration-200
            focus:ring-2 focus:ring-offset-0 focus:outline-none
            disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
            ${error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    }
            ${className}
          `}
        {...props}
      />

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
};

Textarea.displayName = 'Textarea';
