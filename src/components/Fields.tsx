import { ChevronDown, Check, CircleAlert } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import type { FieldChange, FieldName } from "../types.ts";
import { maskValue } from "../lib/format.ts";

interface SharedFieldProps {
  name: FieldName;
  label: string;
  value: string;
  onChange: FieldChange;
  error?: string;
  hint?: string;
  className?: string;
}

export function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return <span id={`${name}-error`} />;
  return (
    <p
      id={`${name}-error`}
      className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-red-700"
      aria-live="polite"
    >
      {error && (
        <>
          <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </>
      )}
    </p>
  );
}

export function TextField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  className = "",
  ...inputProps
}: SharedFieldProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "name" | "value" | "onChange" | "className"
  >) {
  return (
    <div data-field={name} className={className}>
      <label className="field-label" htmlFor={`field-${name}`}>
        {label}{" "}
        <span className="text-accent" aria-hidden>
          *
        </span>
      </label>
      <input
        {...inputProps}
        id={`field-${name}`}
        name={name}
        className="field-input"
        value={value}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-error${hint ? ` ${name}-hint` : ""}`}
        onChange={(event) => {
          const input = event.currentTarget;
          const raw = input.value;
          const position = input.selectionStart;
          const formatted = maskValue(name, raw);
          onChange(name, formatted);
          if (
            formatted !== raw &&
            position !== null &&
            ["text", "tel"].includes(input.type)
          ) {
            const count = raw.slice(0, position).replace(/\D/g, "").length;
            const end = position === raw.length;
            let cursor = 0;
            let seen = 0;
            while (cursor < formatted.length && seen < count) {
              if (/\d/.test(formatted[cursor])) seen++;
              cursor++;
            }
            requestAnimationFrame(() => {
              if (input.isConnected && document.activeElement === input)
                input.setSelectionRange(
                  end ? formatted.length : cursor,
                  end ? formatted.length : cursor,
                );
            });
          }
        }}
      />
      {hint && (
        <p
          id={`${name}-hint`}
          className="mt-2 text-xs leading-relaxed text-muted"
        >
          {hint}
        </p>
      )}
      {error && <FieldError name={name} error={error} />}
      {!error && <span id={`${name}-error`} />}
    </div>
  );
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  error,
  options,
  className = "",
  autoComplete = "off",
}: SharedFieldProps & { options: readonly string[]; autoComplete?: string }) {
  return (
    <div data-field={name} className={className}>
      <label htmlFor={`field-${name}`} className="field-label">
        {label}{" "}
        <span className="text-accent" aria-hidden>
          *
        </span>
      </label>
      <div className="relative">
        <select
          name={name}
          id={`field-${name}`}
          className={`field-input appearance-none pr-11 ${!value ? "text-muted" : ""}`}
          value={value}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={`${name}-error`}
          onChange={(event) => onChange(name, event.target.value)}
        >
          <option value="" disabled>
            Selecione
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-4.5 right-4 text-muted"
          aria-hidden
        />
      </div>
      <FieldError name={name} error={error} />
    </div>
  );
}

export function ChoiceField({
  name,
  label,
  value,
  onChange,
  options = ["Sim", "Não"],
  error,
  compact = false,
}: SharedFieldProps & { options?: readonly string[]; compact?: boolean }) {
  return (
    <fieldset data-field={name} aria-describedby={`${name}-error`}>
      <legend className="field-label mb-3">
        {label}{" "}
        <span className="text-accent" aria-hidden>
          *
        </span>
      </legend>
      <div
        className={
          compact
            ? "grid grid-cols-3 gap-2 sm:grid-cols-6"
            : "grid grid-cols-2 gap-3"
        }
      >
        {options.map((option, index) => (
          <label
            key={option}
            htmlFor={`${name}-${index}`}
            className="relative cursor-pointer"
          >
            <input
              id={`${name}-${index}`}
              name={name}
              type="radio"
              className="peer sr-only"
              value={option}
              checked={value === option}
              onChange={() => onChange(name, option)}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={`${name}-error`}
            />
            <span
              className={`flex min-h-13 items-center justify-center gap-3 rounded-xl border border-line bg-white px-3 text-sm font-medium transition-colors peer-checked:border-ocean peer-checked:bg-ocean/5 peer-checked:text-ocean peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ocean/50 ${error ? "border-red-300" : "hover:border-ocean/40"}`}
            >
              {!compact && (
                <span
                  className={`grid size-4 place-items-center rounded-full border ${value === option ? "border-ocean bg-ocean text-white" : "border-slate-300"}`}
                >
                  {value === option && <Check size={10} aria-hidden />}
                </span>
              )}
              {option}
            </span>
          </label>
        ))}
      </div>
      <FieldError name={name} error={error} />
    </fieldset>
  );
}

export function DetailField({
  name,
  label,
  value,
  onChange,
  error,
}: SharedFieldProps) {
  return (
    <div data-field={name} className="animate-field mt-4">
      <label htmlFor={`field-${name}`} className="field-label">
        {label}{" "}
        <span className="text-accent" aria-hidden>
          *
        </span>
      </label>
      <textarea
        name={name}
        id={`field-${name}`}
        className="field-input min-h-24 resize-y py-3"
        value={value}
        maxLength={1000}
        placeholder="Descreva para a equipe"
        required
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-error`}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <FieldError name={name} error={error} />
    </div>
  );
}
