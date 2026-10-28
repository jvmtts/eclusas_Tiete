import { FileText, HeartPulse, Shirt, Users } from "lucide-react";
import { HEALTH, SHIRTS, STATES } from "../../data/expedition.ts";
import type { FieldName } from "../../types.ts";
import type { RegistrationController } from "../../hooks/useRegistration.ts";
import {
  ChoiceField,
  DetailField,
  SelectField,
  TextField,
} from "../Fields.tsx";
import { FileUpload } from "../FileUpload.tsx";
import { localDate } from "../../lib/format.ts";
import { Review } from "./Review.tsx";

function Divider({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Shirt;
  title: string;
  text?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-ocean/6 text-ocean">
        <Icon size={16} aria-hidden />
      </span>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        {text && (
          <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
        )}
      </div>
    </div>
  );
}

export function StepFields({
  controller,
}: {
  controller: RegistrationController;
}) {
  const {
    values,
    errors,
    setField,
    documents,
    pending,
    status,
    setDocument,
    fileError,
  } = controller;
  const shared = (name: FieldName) => ({
    name,
    value: values[name],
    onChange: setField,
    error: errors[name],
  });

  if (controller.step === 0)
    return (
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <TextField
          {...shared("name")}
          label="Nome completo"
          placeholder="Seu nome e sobrenome"
          autoComplete="name"
          maxLength={150}
          className="sm:col-span-2"
        />
        <TextField
          {...shared("birth")}
          label="Data de nascimento"
          type="date"
          autoComplete="bday"
          min="1900-01-01"
          max={localDate()}
        />
        <SelectField
          {...shared("sex")}
          label="Sexo"
          autoComplete="sex"
          options={["Masculino", "Feminino", "Outro", "Prefiro não informar"]}
        />
        <TextField
          {...shared("cpf")}
          label="CPF"
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
        />
        <TextField
          {...shared("rg")}
          label="RG"
          placeholder="Número do seu RG"
          maxLength={20}
        />
        <TextField
          {...shared("phone")}
          label="Telefone / WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(11) 99999-9999"
          maxLength={15}
        />
        <TextField
          {...shared("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@exemplo.com"
          maxLength={254}
        />
      </div>
    );

  if (controller.step === 1)
    return (
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <TextField
          {...shared("zip")}
          label="CEP"
          autoComplete="postal-code"
          inputMode="numeric"
          placeholder="00000-000"
          maxLength={9}
        />
        <SelectField
          {...shared("state")}
          label="Estado"
          autoComplete="address-level1"
          options={STATES}
        />
        <TextField
          {...shared("city")}
          label="Cidade"
          autoComplete="address-level2"
          placeholder="Sua cidade"
          maxLength={100}
          className="sm:col-span-2"
        />
        <TextField
          {...shared("address")}
          label="Endereço completo"
          autoComplete="street-address"
          placeholder="Rua, número, complemento e bairro"
          maxLength={250}
          className="sm:col-span-2"
        />
        <p className="rounded-xl bg-sand px-4 py-4 text-xs leading-relaxed text-muted sm:col-span-2">
          Confira os dados antes de continuar. Você poderá editar qualquer
          informação na revisão final.
        </p>
      </div>
    );

  if (controller.step === 2)
    return (
      <div className="space-y-8">
        <section>
          <Divider
            icon={Shirt}
            title="A camiseta faz parte da história"
            text="Escolha o tamanho que você costuma usar."
          />
          <ChoiceField
            {...shared("shirt")}
            label="Tamanho da sua camiseta"
            options={SHIRTS}
            compact
          />
        </section>
        <section className="border-t border-line pt-7">
          <Divider
            icon={HeartPulse}
            title="Contato de emergência"
            text="Quem a equipe deve avisar se precisar?"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              {...shared("emergencyName")}
              label="Nome completo do contato"
              placeholder="Nome e sobrenome"
              maxLength={150}
            />
            <TextField
              {...shared("emergencyPhone")}
              label="Telefone do contato"
              placeholder="(11) 99999-9999"
              type="tel"
              inputMode="tel"
              maxLength={15}
            />
          </div>
        </section>
        <section className="border-t border-line pt-7">
          <Divider icon={Users} title="Acompanhante" />
          <ChoiceField
            {...shared("companion")}
            label="Levará um acompanhante?"
          />
          {values.companion === "Sim" && (
            <div className="animate-field mt-5 space-y-6 rounded-2xl border border-ocean/10 bg-ocean/3 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  {...shared("companionName")}
                  label="Nome completo do acompanhante"
                  placeholder="Nome e sobrenome"
                  maxLength={150}
                  className="sm:col-span-2"
                />
                <TextField
                  {...shared("companionCpf")}
                  label="CPF do acompanhante"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <TextField
                  {...shared("companionRg")}
                  label="RG do acompanhante"
                  placeholder="Número do RG"
                  maxLength={20}
                />
              </div>
              <ChoiceField
                {...shared("companionShirt")}
                label="Tamanho da camiseta do acompanhante"
                options={SHIRTS}
                compact
              />
            </div>
          )}
        </section>
      </div>
    );

  if (controller.step === 3)
    return (
      <div className="space-y-6">
        {HEALTH.map(([key, question, detail], index) => (
          <section
            key={key}
            className={index ? "border-t border-line pt-6" : ""}
          >
            <ChoiceField {...shared(key)} label={question} />
            {values[key] === "Sim" && (
              <DetailField {...shared(`${key}Details`)} label={detail} />
            )}
          </section>
        ))}
      </div>
    );

  if (controller.step === 4)
    return (
      <div className="space-y-7">
        <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
          <SelectField
            {...shared("brand")}
            label="Marca"
            options={["Yamaha", "Sea-Doo", "Kawasaki", "Outra"]}
          />
          <TextField
            {...shared("model")}
            label="Modelo"
            placeholder="Ex.: GTX 170"
            maxLength={100}
          />
          {values.brand === "Outra" && (
            <TextField
              {...shared("otherBrand")}
              label="Qual marca?"
              placeholder="Marca da moto aquática"
              maxLength={80}
              className="animate-field sm:col-span-2"
            />
          )}
          <TextField
            {...shared("year")}
            label="Ano de fabricação"
            inputMode="numeric"
            placeholder="Ex.: 2025"
            maxLength={4}
          />
          <TextField
            {...shared("registration")}
            label="Nº de inscrição da moto aquática"
            placeholder="Como consta no documento"
            maxLength={40}
          />
          <TextField
            {...shared("license")}
            label="Nº da habilitação náutica"
            placeholder="Como consta na habilitação"
            maxLength={40}
            className="sm:col-span-2"
          />
        </div>
        <div className="border-t border-line pt-7">
          <Divider
            icon={FileText}
            title="Documentos para embarcar"
            text="Envie arquivos legíveis em PDF, JPG ou PNG, com até 5 MB cada."
          />
          <div className="grid gap-5 xl:grid-cols-2">
            <FileUpload
              name="boatDocument"
              label="Documento da moto aquática"
              value={documents.boatDocument}
              pending={pending.boatDocument}
              disabled={status === "sending"}
              error={errors.boatDocument}
              onSelect={setDocument}
              onError={fileError}
            />
            <FileUpload
              name="licenseDocument"
              label="Habilitação náutica"
              value={documents.licenseDocument}
              pending={pending.licenseDocument}
              disabled={status === "sending"}
              error={errors.licenseDocument}
              onSelect={setDocument}
              onError={fileError}
            />
          </div>
        </div>
      </div>
    );

  return <Review controller={controller} />;
}
