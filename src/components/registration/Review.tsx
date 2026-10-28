import { ChevronDown, Pencil, ScrollText } from "lucide-react";
import { HEALTH, TERMS } from "../../data/expedition.ts";
import type { RegistrationController } from "../../hooks/useRegistration.ts";
import type { FieldName } from "../../types.ts";
import { formatDate } from "../../lib/format.ts";
import { FieldError } from "../Fields.tsx";

interface ReviewSection {
  title: string;
  step: number;
  rows: [string, string][];
}

export function Review({ controller }: { controller: RegistrationController }) {
  const { values: v, documents, errors, setField, navigate } = controller;
  const sections: ReviewSection[] = [
    {
      title: "Seu perfil",
      step: 0,
      rows: [
        ["Nome completo", v.name],
        ["Nascimento", formatDate(v.birth)],
        ["Sexo", v.sex],
        ["CPF", v.cpf],
        ["RG", v.rg],
        ["Telefone", v.phone],
        ["Email", v.email],
      ],
    },
    {
      title: "Endereço",
      step: 1,
      rows: [
        ["CEP", v.zip],
        ["Cidade / UF", `${v.city} / ${v.state}`],
        ["Endereço", v.address],
      ],
    },
    {
      title: "Tripulação e camisetas",
      step: 2,
      rows: [
        ["Sua camiseta", v.shirt],
        ["Contato de emergência", v.emergencyName],
        ["Telefone do contato", v.emergencyPhone],
        ["Acompanhante", v.companion],
        ...(v.companion === "Sim"
          ? ([
              ["Nome", v.companionName],
              ["CPF", v.companionCpf],
              ["RG", v.companionRg],
              ["Camiseta", v.companionShirt],
            ] as [string, string][])
          : []),
      ],
    },
    {
      title: "Saúde",
      step: 3,
      rows: HEALTH.map(([key, question]) => [
        question,
        `${v[key]}${v[key] === "Sim" ? ` — ${v[`${key}Details`]}` : ""}`,
      ]),
    },
    {
      title: "Moto aquática e documentos",
      step: 4,
      rows: [
        ["Marca", v.brand === "Outra" ? v.otherBrand : v.brand],
        ["Modelo / ano", `${v.model} / ${v.year}`],
        ["Nº de inscrição", v.registration],
        ["Habilitação náutica", v.license],
        ["Documento da moto", documents.boatDocument?.name ?? "Não informado"],
        [
          "Documento da habilitação",
          documents.licenseDocument?.name ?? "Não informado",
        ],
      ],
    },
  ];

  return (
    <div>
      <div className="space-y-3">
        {sections.map((section) => (
          <details
            className="group rounded-2xl border border-line bg-white open:bg-sand/25"
            open
            key={section.title}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold sm:px-5">
              {section.title}
              <ChevronDown
                size={16}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="px-4 pb-4 sm:px-5">
              <dl>
                {section.rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid gap-1 border-t border-line/60 py-3 text-xs leading-relaxed sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-5"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="min-w-0 font-medium break-words text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="mt-2 flex min-h-9 items-center gap-1.5 text-xs font-medium text-ocean underline decoration-ocean/20 underline-offset-4 hover:text-accent"
                onClick={() => navigate(section.step)}
              >
                <Pencil size={12} aria-hidden />
                Editar {section.title.toLowerCase()}
              </button>
            </div>
          </details>
        ))}
      </div>
      <div className="mt-9 border-t border-line pt-7">
        <div className="flex items-start gap-3">
          <ScrollText
            size={20}
            className="mt-0.5 shrink-0 text-ocean"
            aria-hidden
          />
          <div>
            <h4 className="text-base font-semibold">
              Termos de responsabilidade
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Leia os itens abaixo. A aceitação de todos os termos é obrigatória
              no formulário da expedição.
            </p>
          </div>
        </div>
        <div className="mt-5 divide-y divide-line">
          {TERMS.map(([title, text], index) => {
            const name = `term${index}` as FieldName;
            return (
              <div key={title} data-field={name} className="py-5">
                <label
                  htmlFor={`field-${name}`}
                  className="flex cursor-pointer items-start gap-3.5"
                >
                  <input
                    name={name}
                    id={`field-${name}`}
                    type="checkbox"
                    checked={v[name] === "on"}
                    required
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={`${name}-error`}
                    onChange={(event) =>
                      setField(name, event.target.checked ? "on" : "")
                    }
                    className="mt-1 size-4.5 shrink-0 cursor-pointer accent-ocean"
                  />
                  <span className="text-xs leading-[1.9] text-muted">
                    <strong className="mb-1 block text-[13px] font-semibold text-ink">
                      {title}
                    </strong>
                    {text}
                  </span>
                </label>
                <div className="pl-8">
                  <FieldError name={name} error={errors[name]} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
