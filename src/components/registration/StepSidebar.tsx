import {
  Anchor,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  FileText,
  HeartPulse,
  MapPin,
  Ship,
  UserRound,
  Users,
} from "lucide-react";
import { STEPS } from "../../config.ts";

const icons = [UserRound, MapPin, Users, HeartPulse, Ship, ClipboardCheck];

interface StepSidebarProps {
  step: number;
  furthest: number;
  disabled: boolean;
  onNavigate: (step: number) => void;
}

export function StepSidebar({
  step,
  furthest,
  disabled,
  onNavigate,
}: StepSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-6" aria-label="Roteiro da inscrição">
      <div className="overflow-hidden rounded-3xl bg-ink text-white lg:p-6">
        <div className="hidden border-b border-white/10 pb-6 lg:block">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-white/45">SEU EMBARQUE</p>
            <Anchor size={17} className="text-accent-light" aria-hidden />
          </div>
          <p className="mt-4 font-display text-3xl leading-none tracking-wide">
            EXPEDIÇÃO
            <br />
            <span className="text-accent-light">RIO TIETÊ.</span>
          </p>
        </div>
        <nav aria-label="Etapas da inscrição">
          <ol className="grid grid-cols-6 gap-1 px-2 py-3 sm:p-4 lg:flex lg:flex-col lg:gap-1 lg:px-0 lg:pt-5 lg:pb-0">
            {STEPS.map((item, index) => {
              const Icon = icons[index];
              const active = index === step;
              const done = index < furthest && !active;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate(index)}
                    disabled={disabled || index > furthest}
                    aria-label={`Etapa ${index + 1}: ${item.label}`}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2.5 transition-colors disabled:cursor-default lg:flex-row lg:gap-3 lg:px-3 lg:py-3 ${active ? "bg-white/10 text-white" : done ? "text-white/70 enabled:hover:bg-white/5" : "text-white/35 enabled:hover:bg-white/5"}`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg text-xs ${active ? "bg-accent text-white" : done ? "bg-white/8 text-white/70" : "border border-white/15"}`}
                    >
                      {done ? (
                        <Check size={15} aria-hidden />
                      ) : (
                        <Icon size={15} aria-hidden />
                      )}
                    </span>
                    <span className="hidden text-left text-xs font-medium sm:block lg:flex-1">
                      {item.label}
                    </span>
                    <span
                      className={`text-[9px] lg:hidden ${active ? "text-white" : "text-white/40"}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {active && (
                      <span className="hidden size-1 rounded-full bg-accent lg:block" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="mt-6 hidden border-t border-white/10 pt-6 lg:block">
          <p className="eyebrow text-[8px] text-white/40">
            22—29 NOVEMBRO · 2026
          </p>
          <p className="mt-3 text-xs leading-[1.8] text-white/65">
            Barra Bonita
            <br />
            <span className="text-accent-light">↓</span>
            <br />
            Santa Clara D’Oeste
          </p>
        </div>
      </div>
      <div className="mt-5 hidden rounded-2xl border border-line bg-white/60 p-5 lg:block">
        <div className="flex gap-3">
          <FileText
            size={18}
            className="mt-0.5 shrink-0 text-ocean"
            aria-hidden
          />
          <div>
            <p className="text-xs font-semibold">Separe antes de começar</p>
            <p className="mt-2 text-xs leading-[1.8] text-muted">
              CPF, RG, documento da moto aquática e habilitação náutica.
            </p>
            <p className="mt-3 text-[10px] text-muted">
              PDF, JPG ou PNG · até 5 MB
            </p>
          </div>
        </div>
      </div>
      <a
        href="#contato"
        className="mt-5 hidden items-center justify-between px-1 text-xs font-medium text-ocean hover:text-accent-light lg:flex"
      >
        Precisa de ajuda? <ArrowUpRight size={15} aria-hidden />
      </a>
    </aside>
  );
}
