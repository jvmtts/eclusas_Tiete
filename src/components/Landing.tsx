import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  LifeBuoy,
  MapPin,
  MoveRight,
  Waves,
} from "lucide-react";
import { Brand } from "./Brand.tsx";

export function Header() {
  return (
    <header id="inicio" className="border-b border-ink/8 bg-sand">
      <div className="page-container flex min-h-20 items-center justify-between gap-3 py-3 sm:min-h-23 sm:gap-5">
        <Brand />
        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-8 text-xs font-semibold"
        >
          <a
            href="#expedicao"
            className="hidden transition-colors hover:text-accent lg:block"
          >
            A expedição
          </a>
          <a
            href="#contato"
            className="hidden transition-colors hover:text-accent md:block"
          >
            Fale com a equipe
          </a>
          <a
            href="#inscricao"
            className="button-primary min-h-11 gap-2 px-3 text-xs sm:gap-4 sm:px-5"
          >
            <span className="sm:hidden">Inscrição</span>
            <span className="hidden sm:inline">Fazer inscrição</span>{" "}
            <ArrowUpRight size={16} aria-hidden />
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section
      id="expedicao"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-sand"
    >
      <div className="page-container grid items-center gap-10 pt-10 pb-12 sm:pt-14 sm:pb-16 md:grid-cols-2 md:gap-8 lg:gap-14 lg:py-17 xl:gap-20">
        <div className="relative z-10">
          <p className="eyebrow hero-enter flex items-center gap-2.5 text-ocean">
            <span className="size-1.5 rounded-full bg-accent" />
            EXPEDIÇÃO ECLUSAS DO TIETÊ
          </p>
          <h1
            id="hero-title"
            className="hero-enter mt-6 font-display text-[clamp(3.8rem,18vw,8.2rem)] leading-[0.88] font-bold tracking-[-0.015em] text-ink sm:text-[7rem] md:text-[clamp(4rem,8.2vw,7.5rem)] xl:text-[8.2rem]"
          >
            UM RIO.
            <br />
            INFINITAS
            <br />
            <span className="text-accent">HISTÓRIAS.</span>
          </h1>
          <p className="hero-enter mt-7 max-w-94 text-sm leading-[1.9] text-muted sm:text-[15px]">
            O Tietê por outro ângulo. Uma expedição de moto aquática entre{" "}
            <strong className="font-semibold text-ink">
              Barra Bonita e Santa Clara D’Oeste
            </strong>
            , com JetChula e Usina do Jet.
          </p>
          <div className="hero-enter mt-8 flex flex-wrap items-center gap-x-7 gap-y-5">
            <a href="#inscricao" className="button-primary min-h-14 px-6">
              Quero fazer parte <ArrowUpRight size={18} aria-hidden />
            </a>
            <a
              href="#rota"
              className="hidden min-h-11 items-center gap-2.5 text-xs font-semibold text-ink transition-colors hover:text-accent sm:flex"
            >
              Conheça o percurso <ArrowDown size={15} aria-hidden />
            </a>
          </div>
          <div className="hero-enter mt-9 flex items-center gap-3 border-t border-ink/10 pt-5 text-xs text-muted">
            <CalendarDays size={17} className="text-ocean" aria-hidden />
            <span>
              <strong className="font-semibold text-ink">
                22 a 29 de novembro
              </strong>{" "}
              · 2026
            </span>
          </div>
        </div>
        <div className="hero-photo relative mx-auto w-full max-w-160 pb-12 lg:pb-9">
          <div className="relative aspect-[1.18] overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-ocean sm:aspect-[1.3] md:aspect-[0.83] lg:aspect-[0.91]">
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet="/assets/eclusas-mobile.webp"
              />
              <img
                src="/assets/eclusas-hero.webp"
                alt="Cena ilustrativa de uma expedição de jets entrando em uma eclusa ao entardecer."
                width={1672}
                height={941}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
              />
            </picture>
            <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 flex items-center gap-2 text-[9px] tracking-[0.14em] text-white/75">
              <Waves size={17} aria-hidden /> SÃO PAULO, BRASIL
            </span>
          </div>
          <div className="absolute -top-4 -right-2 grid size-22 rotate-6 place-items-center rounded-full bg-action text-center text-white shadow-[0_8px_30px_#1760782a] sm:-right-4 sm:size-26">
            <div>
              <span className="block font-display text-3xl leading-none sm:text-4xl">
                22—29
              </span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.13em]">
                NOV. 2026
              </span>
            </div>
          </div>
          <div className="absolute right-5 bottom-0 left-5 flex items-center justify-between gap-4 rounded-2xl bg-ink px-5 py-5 text-white shadow-xl shadow-ink/10 sm:right-7 sm:left-7 sm:px-6">
            <div>
              <p className="text-[8px] font-semibold tracking-[0.15em] text-white/45">
                PONTO DE PARTIDA
              </p>
              <p className="mt-1.5 text-xs font-medium sm:text-sm">
                Barra Bonita
              </p>
            </div>
            <MoveRight className="shrink-0 text-accent" size={24} aria-hidden />
            <div>
              <p className="text-[8px] font-semibold tracking-[0.15em] text-white/45">
                NOSSO DESTINO
              </p>
              <p className="mt-1.5 text-xs font-medium sm:text-sm">
                Santa Clara D’Oeste
              </p>
            </div>
          </div>
          <p className="absolute -bottom-6 right-0 text-[8px] tracking-[0.08em] text-muted/80">
            CENA ILUSTRATIVA GERADA POR IA
          </p>
        </div>
      </div>
      <div id="rota" className="border-y border-ink/8 bg-white/60">
        <div className="page-container grid gap-5 py-6 sm:grid-cols-3 sm:gap-7 sm:py-7">
          <div className="flex items-center gap-4">
            <MapPin size={22} className="shrink-0 text-ocean" aria-hidden />
            <div>
              <p className="eyebrow text-[8px] text-muted">DO COMEÇO AO FIM</p>
              <p className="mt-1 text-xs font-semibold text-ink">
                Barra Bonita → Santa Clara D’Oeste
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:justify-center">
            <CalendarDays
              size={22}
              className="shrink-0 text-ocean"
              aria-hidden
            />
            <div>
              <p className="eyebrow text-[8px] text-muted">ANOTE NA AGENDA</p>
              <p className="mt-1 text-xs font-semibold text-ink">
                22 a 29 de novembro de 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:justify-end">
            <LifeBuoy size={22} className="shrink-0 text-ocean" aria-hidden />
            <div>
              <p className="eyebrow text-[8px] text-muted">
                ESSA HISTÓRIA É EM CONJUNTO
              </p>
              <p className="mt-1 text-xs font-semibold text-ink">
                JetChula + Usina do Jet
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contato" className="bg-ink py-13 text-white sm:py-17">
      <div className="page-container grid gap-9 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
        <div data-reveal>
          <p className="eyebrow text-accent-light">A CONVERSA TAMBÉM FAZ PARTE</p>
          <h2 className="mt-4 text-3xl leading-tight font-medium tracking-tight sm:text-4xl">
            Antes de acelerar,
            <br />
            pode perguntar.
          </h2>
          <p className="mt-4 max-w-90 text-sm leading-relaxed text-white/55">
            Nossa equipe ajuda com as dúvidas sobre a expedição e sua inscrição.
          </p>
        </div>
        <div data-reveal className="grid w-full max-w-sm gap-3 lg:justify-self-end">
          {[
            {
              name: "Renan",
              brand: "USINA DO JET",
              phone: "(11) 96446-7000",
              url: "5511964467000",
            },
          ].map((contact) => (
            <a
              key={contact.name}
              href={`https://wa.me/${contact.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-white/15 bg-white/3 p-6 transition-colors hover:border-accent/60 hover:bg-white/6"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-[8px] text-white/45">
                  {contact.brand}
                </span>
                <ArrowUpRight
                  className="text-accent-light transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  size={18}
                  aria-hidden
                />
              </div>
              <h3 className="mt-5 text-2xl font-medium">{contact.name}</h3>
              <p className="mt-2 text-xs text-white/60">{contact.phone}</p>
              <span className="mt-5 flex items-center gap-1.5 text-[10px] font-medium text-white/75">
                <Check size={12} className="text-accent-light" aria-hidden />
                Falar pelo WhatsApp
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-sand">
      <div className="page-container flex flex-wrap items-center justify-between gap-6 py-8">
        <Brand small />
        <span className="text-[9px] font-medium tracking-[0.13em] text-muted">
          EXPEDIÇÃO RIO TIETÊ · 2026
        </span>
        <a
          href="#inicio"
          className="flex items-center gap-2 text-xs text-muted hover:text-accent"
        >
          Voltar ao início{" "}
          <ArrowRight size={14} className="-rotate-90" aria-hidden />
        </a>
      </div>
    </footer>
  );
}
