import { HEALTH, SHIRTS, STATES, TERMS } from "../data/expedition.ts";
import type { Documents, Errors, FieldName, FormValues } from "../types.ts";
import { clean, digits, localDate } from "./format.ts";

export function validCPF(value: unknown): boolean {
  const cpf = digits(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let length = 9; length <= 10; length++) {
    const sum = [...cpf.slice(0, length)].reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const result = (sum * 10) % 11;
    if ((result === 10 ? 0 : result) !== Number(cpf[length])) return false;
  }
  return true;
}

export function validName(value: unknown): boolean {
  const name = clean(value);
  return (
    name.length <= 150 &&
    /^[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*(?:\s[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*)+$/u.test(
      name,
    )
  );
}

export function validPhone(value: unknown): boolean {
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(digits(value));
}

export function validBirth(value: unknown, now = new Date()): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00`);
  const [year, month, day] = value.split("-").map(Number);
  return (
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day &&
    value <= localDate(now)
  );
}

export function validateStep(
  step: number,
  data: Partial<FormValues>,
  files: Partial<Documents> = {},
  now = new Date(),
): Errors {
  const errors: Errors = {};
  const required = (key: FieldName, message: string) => {
    if (!clean(data[key])) errors[key] = message;
  };
  const validRG = (value: unknown) =>
    /^[\p{L}\d.\s\-/]{5,20}$/u.test(clean(value));
  if (step === 0) {
    if (!validName(data.name)) errors.name = "Informe seu nome e sobrenome.";
    if (!validBirth(data.birth, now))
      errors.birth = "Informe uma data de nascimento válida.";
    if (
      !["Masculino", "Feminino", "Outro", "Prefiro não informar"].includes(
        data.sex ?? "",
      )
    )
      errors.sex = "Selecione uma opção.";
    if (!validCPF(data.cpf)) errors.cpf = "Confira os 11 dígitos do CPF.";
    if (!validRG(data.rg)) errors.rg = "Informe um RG válido.";
    if (!validPhone(data.phone))
      errors.phone = "Informe um telefone brasileiro com DDD.";
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.email)) ||
      clean(data.email).length > 254
    )
      errors.email = "Informe um email válido.";
  }
  if (step === 1) {
    if (digits(data.zip).length !== 8)
      errors.zip = "Informe os 8 dígitos do CEP.";
    required("city", "Informe a cidade.");
    required("address", "Informe rua, número e bairro.");
    if (!(STATES as readonly string[]).includes(data.state ?? ""))
      errors.state = "Selecione o estado.";
  }
  if (step === 2) {
    if (!(SHIRTS as readonly string[]).includes(data.shirt ?? ""))
      errors.shirt = "Escolha o tamanho da sua camiseta.";
    if (!validName(data.emergencyName))
      errors.emergencyName = "Informe nome e sobrenome do contato.";
    if (!validPhone(data.emergencyPhone))
      errors.emergencyPhone = "Informe o telefone do contato com DDD.";
    if (!["Sim", "Não"].includes(data.companion ?? ""))
      errors.companion = "Informe se levará um acompanhante.";
    if (data.companion === "Sim") {
      if (!validName(data.companionName))
        errors.companionName = "Informe o nome completo do acompanhante.";
      if (!validCPF(data.companionCpf))
        errors.companionCpf = "Confira o CPF do acompanhante.";
      else if (digits(data.companionCpf) === digits(data.cpf))
        errors.companionCpf = "O CPF deve ser diferente do participante.";
      if (!validRG(data.companionRg))
        errors.companionRg = "Informe o RG do acompanhante.";
      if (!(SHIRTS as readonly string[]).includes(data.companionShirt ?? ""))
        errors.companionShirt =
          "Escolha o tamanho da camiseta do acompanhante.";
    }
  }
  if (step === 3) {
    for (const [key] of HEALTH) {
      if (!["Sim", "Não"].includes(data[key] ?? ""))
        errors[key] = "Responda sim ou não.";
      if (data[key] === "Sim")
        required(`${key}Details`, "Descreva a informação para a equipe.");
    }
  }
  if (step === 4) {
    if (!["Yamaha", "Sea-Doo", "Kawasaki", "Outra"].includes(data.brand ?? ""))
      errors.brand = "Selecione a marca.";
    if (data.brand === "Outra")
      required("otherBrand", "Informe a marca da moto aquática.");
    required("model", "Informe o modelo.");
    if (
      !/^\d{4}$/.test(data.year ?? "") ||
      Number(data.year) < 1970 ||
      Number(data.year) > now.getFullYear() + 1
    )
      errors.year = "Informe um ano de fabricação válido.";
    required("registration", "Informe o número de inscrição da moto aquática.");
    required("license", "Informe o número da habilitação náutica.");
    if (!files.boatDocument)
      errors.boatDocument = "Anexe o documento da moto aquática.";
    if (!files.licenseDocument)
      errors.licenseDocument = "Anexe a habilitação náutica.";
  }
  if (step === 5) {
    TERMS.forEach((_, index) => {
      const key = `term${index}` as FieldName;
      if (data[key] !== "on")
        errors[key] = "É necessário aceitar este item para continuar.";
    });
  }
  return errors;
}

export function validEndpoint(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.origin === "https://usebasin.com" &&
      /^\/f\/[a-zA-Z0-9]+$/.test(url.pathname) &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export async function validateFile(
  file: File | null | undefined,
  maxBytes = 5 * 1024 * 1024,
): Promise<string> {
  if (!file || file.size === 0)
    return "O arquivo está vazio. Escolha outro documento.";
  if (file.size > maxBytes) return "O arquivo deve ter até 5 MB.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  };
  if (
    !extension ||
    !types[extension] ||
    (file.type && file.type !== types[extension])
  )
    return "Envie um arquivo PDF, JPG ou PNG.";
  try {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const signatures: Record<string, number[]> = {
      pdf: [37, 80, 68, 70, 45],
      jpg: [255, 216, 255],
      jpeg: [255, 216, 255],
      png: [137, 80, 78, 71, 13, 10, 26, 10],
    };
    if (!signatures[extension].every((byte, index) => byte === bytes[index]))
      return "O conteúdo não corresponde ao formato do arquivo. Escolha outro documento.";
  } catch {
    return "Não foi possível ler o arquivo. Selecione-o novamente.";
  }
  return "";
}
