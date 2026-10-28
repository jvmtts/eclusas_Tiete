import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { CONFIG, STEPS } from "../../config.ts";
import { validEndpoint } from "../../lib/validation.ts";
import { useRegistration } from "../../hooks/useRegistration.ts";
import { StepSidebar } from "./StepSidebar.tsx";
import { StepFields } from "./StepFields.tsx";
import { Success } from "./Success.tsx";

export function Registration() {
  const controller = useRegistration();
  const { step, status, errors, attention, pending } = controller;
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sending = status === "sending";
  const waiting = Object.values(pending).some(Boolean);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const lastStep = step === STEPS.length - 1;

  useEffect(() => {
    if (!attention.token) return;
    if (attention.field) {
      const input = formRef.current?.querySelector<HTMLElement>(
        `[name="${attention.field}"]`,
      );
      input?.focus({ preventScroll: true });
      input
        ?.closest("[data-field]")
        ?.scrollIntoView({ behavior: "auto", block: "center" });
    } else {
      cardRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      titleRef.current?.focus({ preventScroll: true });
    }
  }, [attention]);

  return (
    <section
      id="inscricao"
      aria-labelledby="registration-title"
      className="bg-sand py-14 sm:py-20 lg:py-24"
    >
      <div className="page-container">
        <div
          data-reveal
          className="mb-8 flex flex-col justify-between gap-5 lg:mb-11 lg:flex-row lg:items-end"
        >
          <div>
            <p className="eyebrow text-ocean">SEU LUGAR NESSA HISTÓRIA</p>
            <h2
              id="registration-title"
              className="mt-3 text-3xl leading-[1.15] font-medium tracking-[-0.04em] sm:text-[42px]"
            >
              Pronto para
              <br className="sm:hidden" /> fazer parte?
            </h2>
          </div>
          <p className="max-w-94 text-sm leading-[1.9] text-muted">
            Uma inscrição por piloto. Preencha seus dados e os do acompanhante,
            se houver. No final, você confere tudo.
          </p>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[258px_minmax(0,1fr)] lg:gap-9 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-12">
          <StepSidebar
            step={step}
            furthest={controller.furthestStep}
            disabled={sending || status === "success"}
            onNavigate={controller.navigate}
          />
          <div ref={cardRef} className="scroll-mt-6">
            {status === "success" ? (
              <Success reference={controller.reference} />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_12px_50px_#102c3a04]">
                <div className="px-5 pt-6 sm:px-9 sm:pt-8 xl:px-11">
                  <div className="mb-4 flex items-center justify-between text-[10px] font-medium tracking-[0.08em]">
                    <span className="flex items-center gap-2 text-ocean">
                      <ClipboardList size={14} aria-hidden />
                      SUA INSCRIÇÃO
                    </span>
                    <span className="text-muted">
                      ETAPA {String(step + 1).padStart(2, "0")} DE 06
                    </span>
                  </div>
                  <div
                    className="grid grid-cols-6 gap-1.5"
                    role="progressbar"
                    aria-label="Progresso da inscrição"
                    aria-valuemin={0}
                    aria-valuemax={6}
                    aria-valuenow={step}
                    aria-valuetext={`Etapa ${step + 1} de 6: ${STEPS[step].label}`}
                  >
                    {STEPS.map((item, index) => (
                      <span
                        key={item.label}
                        className={`h-1 rounded-full transition-colors ${index <= step ? (index === step ? "bg-accent" : "bg-ocean") : "bg-line/70"}`}
                      />
                    ))}
                  </div>
                </div>
                <form
                  ref={formRef}
                  noValidate
                  method="post"
                  encType="multipart/form-data"
                  aria-busy={sending}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void controller.next();
                  }}
                >
                  <fieldset disabled={sending} className="min-w-0">
                    <legend className="sr-only">
                      Inscrição para a Expedição Rio Tietê
                    </legend>
                    <div className="px-5 pt-7 sm:px-9 sm:pt-9 xl:px-11">
                      <p className="eyebrow text-[8px] text-action">
                        {String(step + 1).padStart(2, "0")} /{" "}
                        {STEPS[step].label.toUpperCase()}
                      </p>
                      <h3
                        ref={titleRef}
                        tabIndex={-1}
                        id="step-title"
                        className="mt-3 max-w-140 text-[25px] leading-[1.25] font-medium tracking-[-0.035em] outline-none sm:text-[30px]"
                      >
                        {STEPS[step].title}
                      </h3>
                      <p className="mt-3 max-w-135 text-[13px] leading-[1.85] text-muted">
                        {STEPS[step].description}
                      </p>
                      <p className="mt-5 mb-6 text-[10px] text-muted">
                        Os campos com{" "}
                        <span className="font-bold text-accent">*</span> são
                        obrigatórios.
                      </p>
                      {errorCount > 0 && (
                        <div
                          role="alert"
                          className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3 text-xs leading-relaxed text-red-800"
                        >
                          <CircleAlert
                            size={15}
                            className="mt-0.5 shrink-0"
                            aria-hidden
                          />
                          {errorCount === 1
                            ? "Confira o campo destacado para continuar."
                            : "Alguns campos precisam da sua atenção. Confira os destaques."}
                        </div>
                      )}
                      <div key={step} className="animate-field">
                        <StepFields controller={controller} />
                      </div>
                      {lastStep && !validEndpoint(CONFIG.basinEndpoint) && (
                        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                          O envio de inscrições ainda não está disponível. Fale
                          com a equipe da expedição.
                        </div>
                      )}
                      {controller.message && (
                        <div
                          role="alert"
                          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-[1.8] text-amber-950"
                        >
                          <p>{controller.message}</p>
                          <a
                            className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-4"
                            href="https://wa.me/5511964467000"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Falar com a equipe{" "}
                            <ArrowRight size={12} aria-hidden />
                          </a>
                        </div>
                      )}
                      <div className="mt-8 flex items-center justify-between gap-4 border-t border-line py-6 sm:mt-9 sm:py-7">
                        {step > 0 ? (
                          <button
                            type="button"
                            className="button-secondary min-h-12 gap-2 border-0 px-0 text-xs"
                            onClick={() => controller.navigate(step - 1)}
                          >
                            <ArrowLeft size={15} aria-hidden />
                            Voltar
                          </button>
                        ) : (
                          <span className="flex items-center gap-2 text-[10px] leading-relaxed text-muted">
                            <LockKeyhole
                              size={13}
                              className="shrink-0 text-ocean"
                              aria-hidden
                            />
                            <span>
                              Com calma.
                              <br />
                              Você pode revisar depois.
                            </span>
                          </span>
                        )}
                        <button
                          type="submit"
                          className="button-primary min-h-12 px-5 text-xs sm:min-h-13 sm:px-6 sm:text-[13px]"
                          disabled={
                            sending ||
                            waiting ||
                            (lastStep &&
                              (status === "uncertain" ||
                                !validEndpoint(CONFIG.basinEndpoint)))
                          }
                        >
                          {sending ? (
                            <>
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                                aria-hidden
                              />
                              Enviando…
                            </>
                          ) : waiting ? (
                            <>
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                                aria-hidden
                              />
                              Verificando…
                            </>
                          ) : lastStep ? (
                            <>
                              Enviar inscrição <Check size={16} aria-hidden />
                            </>
                          ) : controller.furthestStep === 5 ? (
                            <>
                              Salvar e revisar{" "}
                              <ArrowRight size={16} aria-hidden />
                            </>
                          ) : (
                            <>
                              Continuar <ArrowRight size={16} aria-hidden />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-center gap-2 border-t border-line/70 bg-sand/40 px-5 py-4 text-[10px] leading-relaxed text-muted sm:px-9">
                      <ShieldCheck
                        size={14}
                        className="mt-0.5 shrink-0 text-ocean"
                        aria-hidden
                      />
                      <span>
                        Seus dados só são enviados à organização quando você
                        finaliza a inscrição.
                      </span>
                    </div>
                    <div
                      aria-hidden
                      className="absolute -left-10000 size-px overflow-hidden"
                    >
                      <label htmlFor="website">Deixe este campo vazio</label>
                      <input
                        id="website"
                        name="website"
                        autoComplete="off"
                        tabIndex={-1}
                        value={controller.values.website}
                        onChange={(event) =>
                          controller.setField("website", event.target.value)
                        }
                      />
                    </div>
                  </fieldset>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
