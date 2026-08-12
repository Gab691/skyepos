import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  id: string;
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldWrapperProps
>(function Input({ label, error, id, className = "", ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`rounded-lg border px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500
          ${error ? "border-red-400" : "border-slate-300"} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldWrapperProps
>(function Select({ label, error, id, className = "", children, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`cursor-pointer rounded-lg border px-3.5 py-2.5 text-base text-slate-900
          focus:outline-none focus:ring-2 focus:ring-brand-500
          ${error ? "border-red-400" : "border-slate-300"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
});
