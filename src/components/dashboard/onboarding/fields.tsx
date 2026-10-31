import type { ReactNode } from "react";

const chipBase =
  "flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary";

/** Kolom isian dengan label, petunjuk, dan pesan galat yang tersambung secara aksesibel. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-800">
        {label}
        {optional && <span className="text-xs font-normal text-gray-600">(opsional)</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-gray-600">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Kelompok pilihan (radio atau kotak centang) dengan judul. */
export function Group({
  legend,
  hint,
  error,
  optional,
  children,
}: {
  legend: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-800">
        {legend}
        {optional && <span className="text-xs font-normal text-gray-600">(opsional)</span>}
      </legend>
      {hint && <p className="mb-1.5 text-xs text-gray-600">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Choice({
  type,
  name,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className={chipBase}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-lg font-bold tracking-tight text-gray-900">{children}</h3>;
}

export function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p className={`mt-1 text-right text-xs ${value > max ? "font-semibold text-red-700" : "text-gray-600"}`}>
      {value} / {max}
    </p>
  );
}
