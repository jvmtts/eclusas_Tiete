import { HEALTH, TERMS } from "../data/expedition.ts";
import { clean, formatDate } from "./format.ts";
import type { ExpeditionConfig, FieldName, FormValues } from "../types.ts";

export function payloadEntries(
  data: FormValues,
  config: Readonly<ExpeditionConfig>,
  reference: string,
  sentAt: string,
): [string, string][] {
  const fields: Record<string, string> = {
    _subject: `Inscrição — Expedição Rio Tietê — ${clean(data.name)}`,
    email: clean(data.email),
    Evento: config.event,
    "Data da expedição": config.date,
    Percurso: config.route,
    "Identificador do envio": reference,
    "Data e hora do envio": sentAt,
    "Nome completo": clean(data.name),
    "Data de nascimento": formatDate(data.birth),
    Sexo: data.sex,
    CPF: clean(data.cpf),
    RG: clean(data.rg),
    "Telefone / WhatsApp": clean(data.phone),
    CEP: clean(data.zip),
    Cidade: clean(data.city),
    Estado: data.state,
    Endereço: clean(data.address),
    "Tamanho da camiseta": data.shirt,
    "Contato de emergência — nome": clean(data.emergencyName),
    "Contato de emergência — telefone": clean(data.emergencyPhone),
    "Levará acompanhante": data.companion,
    Marca: data.brand === "Outra" ? clean(data.otherBrand) : data.brand,
    Modelo: clean(data.model),
    Ano: data.year,
    "Inscrição da moto aquática": clean(data.registration),
    "Habilitação náutica — número": clean(data.license),
  };
  for (const [key, question] of HEALTH) {
    fields[question] = data[key];
    if (data[key] === "Sim")
      fields[`${question} — detalhes`] = clean(data[`${key}Details`]);
  }
  if (data.companion === "Sim") {
    fields["Acompanhante — nome"] = clean(data.companionName);
    fields["Acompanhante — CPF"] = clean(data.companionCpf);
    fields["Acompanhante — RG"] = clean(data.companionRg);
    fields["Acompanhante — camiseta"] = data.companionShirt;
  }
  TERMS.forEach(([title, text], index) => {
    fields[`Termo — ${title}`] =
      `${data[`term${index}` as FieldName] === "on" ? "Aceito" : "Não aceito"}: ${text}`;
  });
  return Object.entries(fields);
}
