import { Component } from "react";
import type { ReactNode } from "react";
import { Header, Hero, Contact, Footer } from "./components/Landing.tsx";
import { Registration } from "./components/registration/Registration.tsx";
import { useReveal } from "./hooks/useReveal.ts";

class FormBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section id="inscricao" className="page-container py-20">
          <div
            role="alert"
            className="rounded-3xl border border-line bg-white p-8"
          >
            <h2 className="text-2xl font-medium">
              Não foi possível carregar o formulário.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Recarregue a página ou fale com a equipe para fazer sua inscrição.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="button-primary"
              >
                Recarregar página
              </button>
              <a
                href="https://wa.me/5511964467000"
                className="button-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com a equipe
              </a>
            </div>
          </div>
        </section>
      );
    return this.props.children;
  }
}

export default function App() {
  const revealRef = useReveal();
  return (
    <div ref={revealRef}>
      <a className="skip-link" href="#inscricao">
        Pular para a inscrição
      </a>
      <Header />
      <main>
        <Hero />
        <FormBoundary>
          <Registration />
        </FormBoundary>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}