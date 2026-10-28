import { useEffect, useRef } from "react";
import { ArrowUpRight, Check, Waves } from "lucide-react";
import { CONFIG } from "../../config.ts";

export function Success({ reference }: { reference: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ behavior: "auto", block: "center" });
  }, []);
  return (
    <div className="rounded-3xl border border-line bg-white px-6 py-15 text-center sm:px-12">
      <span className="mx-auto grid size-18 place-items-center rounded-full bg-ocean/8 text-ocean">
        <Check size={32} aria-hidden />
      </span>
      <p className="eyebrow mt-7 text-ocean">INSCRIÇÃO RECEBIDA</p>
      <h3
        ref={ref}
        tabIndex={-1}
        className="mt-4 text-3xl leading-tight font-medium tracking-tight outline-none sm:text-4xl"
      >
        A próxima história
        <br />é na água.
      </h3>
      <p className="mx-auto mt-5 max-w-100 text-sm leading-[1.9] text-muted">
        Seus dados foram enviados à organização da{" "}
        <strong className="font-medium text-ink">Expedição Rio Tietê</strong>,
        de {CONFIG.date}. Para acompanhar sua participação, fale com a equipe.
      </p>
      <a
        href="https://wa.me/5511964467000"
        target="_blank"
        rel="noopener noreferrer"
        className="button-primary mt-8"
      >
        Falar com a organização <ArrowUpRight size={17} aria-hidden />
      </a>
      <div className="mt-10 border-t border-line pt-6 text-[10px] leading-relaxed text-muted">
        <Waves className="mx-auto mb-3 text-ocean" size={20} aria-hidden />
        Identificador deste envio
        <code className="mt-2 block break-all text-ocean">{reference}</code>
      </div>
    </div>
  );
}
