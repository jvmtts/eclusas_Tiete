import type { ExpeditionConfig } from "./types.ts";

export const CONFIG: Readonly<ExpeditionConfig> = Object.freeze({
  basinEndpoint: "https://usebasin.com/f/9de4a82af40b",
  event: "Expedição Rio Tietê — JetChula & Usina do Jet",
  date: "22 a 29 de novembro de 2026",
  route: "Barra Bonita → Santa Clara D’Oeste",
  maxFileBytes: 5 * 1024 * 1024,
  timeoutMs: 120_000,
});

export const STEPS = [
  {
    label: "Seu perfil",
    short: "Perfil",
    title: "Quem vai pilotar essa história?",
    description:
      "Vamos começar com os dados do participante responsável pela inscrição.",
  },
  {
    label: "Endereço",
    short: "Endereço",
    title: "De onde você vai partir?",
    description: "Informe o endereço completo do participante.",
  },
  {
    label: "Tripulação",
    short: "Tripulação",
    title: "Boa companhia faz a viagem.",
    description:
      "Escolha sua camiseta, indique um contato de emergência e conte quem vai com você.",
  },
  {
    label: "Saúde",
    short: "Saúde",
    title: "Cuidado também faz parte.",
    description:
      "Compartilhe as informações que a equipe precisa conhecer para a expedição.",
  },
  {
    label: "Moto aquática",
    short: "Seu jet",
    title: "Seu jet também vai a bordo.",
    description:
      "Preencha os dados da moto aquática e anexe os documentos legíveis.",
  },
  {
    label: "Revisão e termos",
    short: "Revisão",
    title: "Quase na água. Vamos conferir?",
    description:
      "Revise suas informações e leia cada termo antes de enviar a inscrição.",
  },
] as const;
