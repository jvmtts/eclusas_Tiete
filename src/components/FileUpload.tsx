import { useRef, useState } from "react";
import { Check, FileText, LoaderCircle, Upload, X } from "lucide-react";
import type { DocumentKey } from "../types.ts";
import { formatBytes } from "../lib/format.ts";
import { FieldError } from "./Fields.tsx";

interface FileUploadProps {
  name: DocumentKey;
  label: string;
  value: File | null;
  error?: string;
  pending: boolean;
  disabled: boolean;
  onSelect: (name: DocumentKey, file: File | null) => Promise<void>;
  onError: (name: DocumentKey, error: string) => void;
}

export function FileUpload({
  name,
  label,
  value,
  error,
  pending,
  disabled,
  onSelect,
  onError,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  return (
    <div data-field={name}>
      <label htmlFor={`field-${name}`} className="field-label">
        {label}{" "}
        <span className="text-accent" aria-hidden>
          *
        </span>
      </label>
      <div
        className={`relative flex min-h-39 flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition-colors focus-within:ring-3 focus-within:ring-ocean/20 ${error ? "border-red-300 bg-red-50/30" : dragging ? "border-ocean bg-ocean/10" : value ? "border-emerald-300 bg-emerald-50/40" : "border-slate-300 bg-sand/50 hover:border-ocean/50"}`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            depth.current++;
            setDragging(true);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          depth.current = Math.max(0, depth.current - 1);
          if (!depth.current) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (disabled) return;
          if (event.dataTransfer.files.length !== 1) {
            onError(name, "Envie apenas um arquivo por documento.");
            return;
          }
          void onSelect(name, event.dataTransfer.files[0]);
        }}
      >
        <input
          id={`field-${name}`}
          type="file"
          name={name}
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          aria-label={label}
          disabled={disabled || pending}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={`${name}-error ${name}-hint`}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void onSelect(name, file);
          }}
        />
        <span
          className={`mb-3 grid size-10 place-items-center rounded-xl ${value ? "bg-emerald-100 text-emerald-700" : "bg-ocean/8 text-ocean"}`}
        >
          {pending ? (
            <LoaderCircle size={20} className="animate-spin" aria-hidden />
          ) : value ? (
            <Check size={20} aria-hidden />
          ) : (
            <Upload size={20} aria-hidden />
          )}
        </span>
        <span
          className="max-w-full text-sm font-medium break-all text-ink"
          aria-live="polite"
        >
          {pending
            ? "Verificando documento…"
            : value
              ? value.name
              : "Escolha um arquivo ou arraste aqui"}
        </span>
        <span id={`${name}-hint`} className="mt-1.5 text-xs text-muted">
          {value
            ? `${formatBytes(value.size)} · documento selecionado`
            : "PDF, JPG ou PNG · até 5 MB"}
        </span>
      </div>
      {value && (
        <button
          type="button"
          disabled={disabled || pending}
          className="mt-2 flex min-h-9 items-center gap-1.5 text-xs text-muted underline decoration-slate-300 underline-offset-4 hover:text-red-700"
          onClick={() => void onSelect(name, null)}
        >
          <FileText size={13} aria-hidden />
          Remover {label.toLowerCase()}
          <X size={12} aria-hidden />
        </button>
      )}
      <FieldError name={name} error={error} />
    </div>
  );
}
