export const STEPS = Object.freeze([
  {
    title: "Vamos começar por você.",
    nav: "Seus dados",
    tag: "01 / EMBARQUE",
    description: "Os dados do participante responsável pela inscrição.",
  },
  {
    title: "De onde você vem?",
    nav: "Endereço",
    tag: "02 / PONTO DE PARTIDA",
    description:
      "Preencha o endereço do participante. Confira o CEP e a cidade.",
  },
  {
    title: "Vista essa expedição.",
    nav: "Camisetas",
    tag: "03 / IDENTIDADE DA TRIPULAÇÃO",
    description: "Escolha o tamanho da sua camiseta oficial.",
  },
  {
    title: "Sua segurança vem primeiro.",
    nav: "Saúde",
    tag: "04 / CONDIÇÕES DE NAVEGAÇÃO",
    description:
      "Estas informações ajudam a equipe a conhecer as necessidades dos participantes.",
  },
  {
    title: "Quem vai com você?",
    nav: "Tripulação",
    tag: "05 / A BORDO",
    description:
      "Indique um contato de emergência e informe se levará um acompanhante.",
  },
  {
    title: "Agora, o seu jet.",
    nav: "Moto aquática",
    tag: "06 / EMBARCAÇÃO",
    description:
      "Tenha os documentos da moto aquática e sua habilitação náutica em mãos.",
  },
  {
    title: "Tudo certo para embarcar?",
    nav: "Revisão e termos",
    tag: "07 / ÚLTIMA CONFERÊNCIA",
    description:
      "Confira os dados e leia os termos antes de finalizar a inscrição.",
  },
]);

export const TERMS = Object.freeze([
  [
    "Condições de Saúde",
    "Confirmo que estou em plenas condições físicas e mentais para participar do passeio. Declaro não possuir nenhuma condição de saúde que possa ser agravada pela prática dessa atividade.",
  ],
  [
    "Riscos Envolvidos",
    "Estou ciente de que o passeio envolve riscos inerentes, incluindo, mas não se limitando a, quedas, colisões, capotamentos, lesões corporais, danos materiais, ou até mesmo risco de morte. Aceito participar por minha livre e espontânea vontade, assumindo total responsabilidade pelos riscos envolvidos.",
  ],
  [
    "Regras e Instruções",
    "Comprometo-me a seguir todas as orientações, regras de segurança e instruções fornecidas pela equipe responsável antes e durante o passeio. Reconheço que o descumprimento dessas regras pode aumentar os riscos.",
  ],
  [
    "Responsabilidade por Danos",
    "Concordo que serei responsável por quaisquer danos causados ao equipamento devido a uso inadequado ou imprudente.",
  ],
  [
    "Isenção de Responsabilidade",
    "Isento os organizadores de qualquer responsabilidade por acidentes, lesões ou danos que possam ocorrer durante o passeio, exceto nos casos de negligência comprovada da empresa.",
  ],
  [
    "Autorização de Uso de Imagem",
    "Autorizo a utilização de minha imagem, caso capturada durante o passeio, para fins de divulgação em materiais promocionais e publicitários da empresa, sem qualquer ônus ou cobrança.",
  ],
]);

export const HEALTH = Object.freeze([
  [
    "restriction",
    "Possui alguma restrição médica ou condição de saúde que possa limitar sua participação?",
    "Qual restrição ou condição?",
  ],
  [
    "pregnancy",
    "Está grávida ou possui alguma lesão recente?",
    "Informe a condição ou lesão.",
  ],
  ["medication", "Faz uso de medicação contínua?", "Quais medicamentos?"],
  [
    "allergy",
    "Possui algum tipo de alergia ou diabetes?",
    "Informe o tipo e, se houver, os medicamentos.",
  ],
]);

export const SHIRTS = Object.freeze(["PP", "P", "M", "G", "GG", "XG"]);
export const STATES = Object.freeze([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);
export const digits = (value) => String(value ?? "").replace(/\D/g, "");
export const clean = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");

export function validCPF(value) {
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

export function validName(value) {
  const name = clean(value);
  return (
    name.length <= 150 &&
    /^[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*(?:\s[\p{L}\p{M}]+(?:[’'\-][\p{L}\p{M}]+)*)+$/u.test(
      name,
    )
  );
}

export function validPhone(value) {
  const phone = digits(value);
  return /^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(phone);
}

export function validBirth(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const date = new Date(`${value}T12:00:00`);
  const [year, month, day] = value.split("-").map(Number);
  if (
    year < 1900 ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  )
    return false;
  return (
    value <=
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );
}

export function validateStep(step, data, files = {}, now = new Date()) {
  const errors = {};
  const required = (key, message) => {
    if (!clean(data[key])) errors[key] = message;
  };
  const rgValid = (value) => /^[\p{L}\d.\s\-/]{5,20}$/u.test(clean(value));
  if (step === 0) {
    if (!validName(data.name)) errors.name = "Informe seu nome e sobrenome.";
    if (!validBirth(data.birth, now))
      errors.birth = "Informe uma data de nascimento válida.";
    if (
      !["Masculino", "Feminino", "Outro", "Prefiro não informar"].includes(
        data.sex,
      )
    )
      errors.sex = "Selecione uma opção.";
    if (!validCPF(data.cpf)) errors.cpf = "Confira os 11 dígitos do CPF.";
    if (!rgValid(data.rg)) errors.rg = "Informe um RG válido.";
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
    if (!STATES.includes(data.state)) errors.state = "Selecione o estado.";
  }
  if (step === 2 && !SHIRTS.includes(data.shirt))
    errors.shirt = "Escolha o tamanho da sua camiseta.";
  if (step === 3) {
    for (const [key] of HEALTH) {
      if (!["Sim", "Não"].includes(data[key]))
        errors[key] = "Responda sim ou não.";
      if (data[key] === "Sim")
        required(`${key}Details`, "Descreva a informação para a equipe.");
    }
  }
  if (step === 4) {
    if (!validName(data.emergencyName))
      errors.emergencyName = "Informe nome e sobrenome do contato.";
    if (!validPhone(data.emergencyPhone))
      errors.emergencyPhone = "Informe o telefone do contato com DDD.";
    if (!["Sim", "Não"].includes(data.companion))
      errors.companion = "Informe se levará um acompanhante.";
    if (data.companion === "Sim") {
      if (!validName(data.companionName))
        errors.companionName = "Informe o nome completo do acompanhante.";
      if (!validCPF(data.companionCpf))
        errors.companionCpf = "Confira o CPF do acompanhante.";
      else if (digits(data.companionCpf) === digits(data.cpf))
        errors.companionCpf = "O CPF deve ser diferente do participante.";
      if (!rgValid(data.companionRg))
        errors.companionRg = "Informe o RG do acompanhante.";
      if (!SHIRTS.includes(data.companionShirt))
        errors.companionShirt =
          "Escolha o tamanho da camiseta do acompanhante.";
    }
  }
  if (step === 5) {
    if (!["Yamaha", "Sea-Doo", "Kawasaki", "Outra"].includes(data.brand))
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
  if (step === 6) {
    TERMS.forEach((_, index) => {
      if (data[`term${index}`] !== "on")
        errors[`term${index}`] =
          "É necessário aceitar este item para continuar.";
    });
  }
  return errors;
}

export function validEndpoint(value) {
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

export async function validateFile(file, maxBytes = 5 * 1024 * 1024) {
  if (!file || file.size === 0)
    return "O arquivo está vazio. Escolha outro documento.";
  if (file.size > maxBytes) return "O arquivo deve ter até 5 MB.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  const types = {
    pdf: ["application/pdf"],
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
  };
  if (!types[extension] || (file.type && !types[extension].includes(file.type)))
    return "Envie um arquivo PDF, JPG ou PNG.";
  try {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const signatures = {
      pdf: [0x25, 0x50, 0x44, 0x46, 0x2d],
      jpg: [0xff, 0xd8, 0xff],
      jpeg: [0xff, 0xd8, 0xff],
      png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    };
    if (!signatures[extension].every((byte, index) => byte === bytes[index]))
      return "O conteúdo não corresponde ao formato do arquivo. Escolha outro documento.";
  } catch {
    return "Não foi possível ler o arquivo. Selecione-o novamente.";
  }
  return "";
}

export function formatDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "")
    ? value.split("-").reverse().join("/")
    : value;
}

export function formatBytes(value) {
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function payloadEntries(data, config, reference, sentAt) {
  const fields = {
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
      `${data[`term${index}`] === "on" ? "Aceito" : "Não aceito"}: ${text}`;
  });
  return Object.entries(fields);
}
