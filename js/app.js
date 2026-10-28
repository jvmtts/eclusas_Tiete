import { CONFIG } from "../config.js";
import { initEffects } from "./effects.js";
import {
  STEPS,
  TERMS,
  HEALTH,
  SHIRTS,
  STATES,
  digits,
  clean,
  validateStep,
  validateFile,
  validEndpoint,
  formatDate,
  formatBytes,
  payloadEntries,
} from "./domain.js";

const form = document.querySelector("#expedition-form");
const content = document.querySelector("#step-content");
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const summary = document.querySelector("#error-summary");
const message = document.querySelector("#submission-message");
const formFields = document.querySelector("#form-fields");
const fileState = { boatDocument: null, licenseDocument: null };
const fileVersions = { boatDocument: 0, licenseDocument: 0 };
const completed = new Set();
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const icon = (name) =>
  `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
let currentStep = 0;
let sending = false;
let finished = false;
let uncertain = false;
let requestReference = "";
let pendingFiles = 0;
let furthestStep = 0;

function updateNextButton() {
  nextButton.disabled =
    sending ||
    pendingFiles > 0 ||
    (currentStep === 6 && (!validEndpoint(CONFIG.basinEndpoint) || uncertain));
}

function field(
  name,
  label,
  {
    type = "text",
    placeholder = "",
    autocomplete = "off",
    inputmode = "",
    max = 150,
    full = false,
    hint = "",
    attrs = "",
  } = {},
) {
  return `<div class="field${full ? " full" : ""}" data-field="${name}"><label for="${name}">${label} <span class="required-star" aria-hidden="true">*</span></label><input class="input" id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${inputmode ? `inputmode="${inputmode}"` : ""} maxlength="${max}" required aria-describedby="${name}-error${hint ? ` ${name}-hint` : ""}" ${attrs}>${hint ? `<p class="field-hint" id="${name}-hint">${hint}</p>` : ""}<p class="field-error" id="${name}-error"></p></div>`;
}

function select(
  name,
  label,
  options,
  { autocomplete = "off", full = false } = {},
) {
  return `<div class="field${full ? " full" : ""}" data-field="${name}"><label for="${name}">${label} <span class="required-star" aria-hidden="true">*</span></label><div class="select-wrap"><select class="input" name="${name}" id="${name}" autocomplete="${autocomplete}" required aria-describedby="${name}-error"><option value="" disabled selected>Selecione</option>${options.map((value) => `<option value="${escape(value)}">${escape(value)}</option>`).join("")}</select></div><p class="field-error" id="${name}-error"></p></div>`;
}

function shirt(name, label) {
  return `<fieldset class="choice-field" id="${name}-group" data-field="${name}" aria-describedby="${name}-error"><legend>${label} <span class="required-star" aria-hidden="true">*</span></legend><div class="shirt-options">${SHIRTS.map((size) => `<div class="shirt-choice"><input type="radio" id="${name}-${size}" name="${name}" value="${size}" required aria-describedby="${name}-error"><label for="${name}-${size}">${size}</label></div>`).join("")}</div><p class="field-error" id="${name}-error"></p></fieldset>`;
}

function binary(name, label) {
  return `<fieldset class="choice-field" id="${name}-group" data-field="${name}" aria-describedby="${name}-error"><legend>${label} <span class="required-star" aria-hidden="true">*</span></legend><div class="binary-options">${["Sim", "Não"].map((value, index) => `<div class="binary-choice"><input id="${name}-${index}" type="radio" name="${name}" value="${value}" required aria-describedby="${name}-error"><label for="${name}-${index}">${value}</label></div>`).join("")}</div><p class="field-error" id="${name}-error"></p></fieldset>`;
}

function upload(name, label) {
  return `<div class="field full" data-field="${name}"><label for="${name}">${label} <span class="required-star" aria-hidden="true">*</span></label><label class="upload-label" id="${name}-drop" for="${name}">${icon("upload")}<strong class="file-name" id="${name}-filename">Toque para escolher ou arraste aqui</strong><span id="${name}-size">PDF, JPG ou PNG · até 5 MB</span><input class="upload-native" id="${name}" name="${name}" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" required aria-describedby="${name}-error ${name}-size"></label><button class="file-remove" type="button" data-remove-file="${name}" hidden>Remover documento</button><p class="field-error" id="${name}-error" aria-live="polite"></p></div>`;
}

const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const panels = [
  `<div class="fields-grid">${field("name", "Nome completo", { full: true, placeholder: "Seu nome e sobrenome", autocomplete: "name" })}${field("birth", "Data de nascimento", { type: "date", autocomplete: "bday", attrs: `min="1900-01-01" max="${localDate}"` })}${select("sex", "Sexo", ["Masculino", "Feminino", "Outro", "Prefiro não informar"], { autocomplete: "sex" })}${field("cpf", "CPF", { placeholder: "000.000.000-00", inputmode: "numeric", max: 14 })}${field("rg", "RG", { placeholder: "Número do seu RG", max: 20 })}${field("phone", "Telefone / WhatsApp", { type: "tel", placeholder: "(11) 99999-9999", autocomplete: "tel-national", inputmode: "tel", max: 15 })}${field("email", "Email", { type: "email", placeholder: "voce@exemplo.com", autocomplete: "email", inputmode: "email", max: 254 })}</div>`,
  `<div class="fields-grid">${field("zip", "CEP", { placeholder: "00000-000", autocomplete: "postal-code", inputmode: "numeric", max: 9 })}${select("state", "Estado", STATES, { autocomplete: "address-level1" })}${field("city", "Cidade", { placeholder: "Sua cidade", autocomplete: "address-level2", full: true, max: 100 })}${field("address", "Endereço completo", { placeholder: "Rua, número, complemento e bairro", autocomplete: "street-address", full: true, max: 250 })}</div>`,
  `${shirt("shirt", "Tamanho da sua camiseta")}<div class="shirt-note">${icon("waves")}<p>Sua camiseta também faz parte dessa história. Escolha o tamanho que você costuma usar.<br>Se levar um acompanhante, você escolherá o tamanho dele na etapa <strong>Tripulação</strong>.</p></div>`,
  HEALTH.map(
    ([key, question, detail]) =>
      `<div class="health-question">${binary(key, question)}<div class="conditional" data-conditional="${key}" hidden><div class="field" data-field="${key}Details"><label for="${key}Details">${detail} <span class="required-star" aria-hidden="true">*</span></label><textarea class="input" id="${key}Details" name="${key}Details" maxlength="1000" required disabled aria-describedby="${key}Details-error" placeholder="Descreva para a equipe"></textarea><p class="field-error" id="${key}Details-error"></p></div></div></div>`,
  ).join(""),
  `<h4 class="subsection-heading">Contato de emergência</h4><div class="fields-grid">${field("emergencyName", "Nome completo do contato", { placeholder: "Quem a equipe deve avisar?", max: 150 })}${field("emergencyPhone", "Telefone do contato", { type: "tel", inputmode: "tel", placeholder: "(11) 99999-9999", max: 15 })}</div><div class="subsection">${binary("companion", "Levará um acompanhante?")}<div class="conditional companion-block" data-conditional="companion" hidden><h4 class="subsection-heading">Dados do acompanhante</h4><div class="fields-grid">${field("companionName", "Nome completo", { placeholder: "Nome e sobrenome", full: true })}${field("companionCpf", "CPF", { placeholder: "000.000.000-00", inputmode: "numeric", max: 14 })}${field("companionRg", "RG", { placeholder: "Número do RG", max: 20 })}<div class="field full">${shirt("companionShirt", "Tamanho da camiseta do acompanhante")}</div></div></div></div>`,
  `<div class="fields-grid">${select("brand", "Marca", ["Yamaha", "Sea-Doo", "Kawasaki", "Outra"])}${field("model", "Modelo", { placeholder: "Ex.: GTX 170", max: 100 })}<div class="full conditional" data-conditional="brand" hidden>${field("otherBrand", "Qual marca?", { placeholder: "Marca da sua moto aquática", max: 80 })}</div>${field("year", "Ano de fabricação", { placeholder: "Ex.: 2024", inputmode: "numeric", max: 4 })}${field("registration", "Nº de inscrição da moto aquática", { placeholder: "Como consta no documento", max: 40 })}${field("license", "Nº da habilitação náutica", { placeholder: "Como consta na habilitação", full: true, max: 40 })}${upload("boatDocument", "Documento da moto aquática")}${upload("licenseDocument", "Habilitação náutica")}</div><p class="document-note">Envie documentos legíveis, com as informações completas. Cada arquivo pode ter até 5 MB.</p>`,
  `<div id="review-content"></div><div class="terms-heading"><h4>Termos de responsabilidade</h4><p>Leia cada item. A aceitação de todos os termos abaixo é obrigatória no formulário da expedição.</p></div>${TERMS.map(([title, text], index) => `<div class="term-item" data-field="term${index}"><label for="term${index}"><input id="term${index}" name="term${index}" type="checkbox" required aria-describedby="term${index}-error"><span class="term-copy"><strong>${escape(title)}</strong>${escape(text)}</span></label><p class="field-error" id="term${index}-error"></p></div>`).join("")}<div class="submission-notice" id="setup-notice"${validEndpoint(CONFIG.basinEndpoint) ? " hidden" : ""}>${icon("shield")}<p><strong>O envio de inscrições ainda não está disponível.</strong>Você já pode conferir e preencher o formulário. A inscrição só será recebida quando o envio estiver liberado.</p></div>`,
];

content.innerHTML = panels
  .map(
    (html, index) =>
      `<section data-step-panel="${index}" aria-labelledby="step-title"${index ? " hidden" : ""}>${html}</section>`,
  )
  .join("");

const nav = document.querySelector("#step-nav");
nav.innerHTML = STEPS.map(
  (step, index) =>
    `<button type="button" class="step-button" data-goto="${index}" aria-label="Etapa ${index + 1}: ${step.nav}"${index ? " disabled" : ""}><span class="step-number">${String(index + 1).padStart(2, "0")}</span><span class="step-name">${step.nav}</span></button>`,
).join("");

function readData() {
  return Object.fromEntries(new FormData(form).entries());
}

function clearError(name) {
  const error = document.getElementById(`${name}-error`);
  if (error) error.textContent = "";
  document
    .querySelectorAll(`[name="${name}"]`)
    .forEach((input) => input.removeAttribute("aria-invalid"));
  document.getElementById(`${name}-drop`)?.classList.remove("has-error");
}

function showErrors(errors, { focus = true } = {}) {
  const panel = content.querySelector(`[data-step-panel="${currentStep}"]`);
  panel
    .querySelectorAll("[data-field]")
    .forEach((field) => clearError(field.dataset.field));
  for (const [name, error] of Object.entries(errors)) {
    const target = document.getElementById(`${name}-error`);
    if (target) target.textContent = error;
    document
      .querySelectorAll(`[name="${name}"]`)
      .forEach((input) => input.setAttribute("aria-invalid", "true"));
    document.getElementById(`${name}-drop`)?.classList.add("has-error");
  }
  const keys = Object.keys(errors);
  summary.hidden = keys.length === 0;
  summary.textContent = keys.length
    ? `Confira ${keys.length === 1 ? "o campo destacado" : "os campos destacados"} para continuar.`
    : "";
  if (keys.length && focus) {
    const target = form.elements.namedItem(keys[0]);
    const input = target instanceof RadioNodeList ? target[0] : target;
    input?.focus({ preventScroll: true });
    input
      ?.closest("[data-field]")
      ?.scrollIntoView({ behavior: "auto", block: "center" });
  }
}

function syncConditionalFields() {
  const data = readData();
  form.querySelectorAll("[data-conditional]").forEach((block) => {
    const name = block.dataset.conditional;
    const show =
      name === "brand" ? data.brand === "Outra" : data[name] === "Sim";
    block.hidden = !show;
    block.querySelectorAll("input, select, textarea").forEach((input) => {
      input.disabled = !show;
    });
    if (!show)
      block
        .querySelectorAll("[data-field]")
        .forEach((field) => clearError(field.dataset.field));
  });
}

function goToStep(index, { focus = true } = {}) {
  if (sending || finished || index < 0 || index >= STEPS.length) return;
  currentStep = index;
  furthestStep = Math.max(furthestStep, index);
  const step = STEPS[index];
  content.querySelectorAll("[data-step-panel]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.stepPanel) !== index;
  });
  document.querySelector("#step-tag").textContent = step.tag;
  document.querySelector("#step-title").textContent = step.title;
  document.querySelector("#step-description").textContent = step.description;
  document.querySelector("#step-count").textContent =
    `ETAPA ${String(index + 1).padStart(2, "0")} DE 07`;
  document.querySelector("#sidebar-count").textContent =
    `${String(index + 1).padStart(2, "0")} / 07`;
  document.querySelector("#progress-label").textContent =
    index === 0 ? "Vamos começar" : `${index} de 7 etapas percorridas`;
  document.querySelector("#progress-fill").style.width =
    `${(index / STEPS.length) * 100}%`;
  document.querySelector("#progress").setAttribute("aria-valuenow", index);
  document
    .querySelector("#progress")
    .setAttribute("aria-valuetext", `Etapa ${index + 1} de 7: ${step.nav}`);
  nav.querySelectorAll("button").forEach((button, navIndex) => {
    const done = completed.has(navIndex) && navIndex !== index;
    button.disabled = navIndex > furthestStep;
    button.classList.toggle("is-complete", done);
    if (navIndex === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
    button.querySelector(".step-number").innerHTML = done
      ? icon("check")
      : String(navIndex + 1).padStart(2, "0");
  });
  backButton.hidden = index === 0;
  document.querySelector("#first-step-note").hidden = index !== 0;
  nextButton.innerHTML =
    index === STEPS.length - 1
      ? `Enviar inscrição ${icon("arrow")}`
      : `${furthestStep === 6 ? "Salvar e revisar" : "Continuar"} ${icon("arrow")}`;
  updateNextButton();
  summary.hidden = true;
  summary.textContent = "";
  message.hidden = true;
  if (index === STEPS.length - 1) renderReview();
  if (focus) {
    document
      .querySelector("#form-card")
      .scrollIntoView({ block: "start", behavior: "auto" });
    document.querySelector("#step-title").focus({ preventScroll: true });
  }
}

function renderReview() {
  const data = readData();
  const groups = [
    [
      "Seus dados",
      0,
      [
        ["Nome completo", data.name],
        ["Nascimento", formatDate(data.birth)],
        ["Sexo", data.sex],
        ["CPF", data.cpf],
        ["RG", data.rg],
        ["Telefone", data.phone],
        ["Email", data.email],
      ],
    ],
    [
      "Endereço",
      1,
      [
        ["CEP", data.zip],
        ["Endereço", data.address],
        ["Cidade / UF", `${data.city} / ${data.state}`],
      ],
    ],
    ["Camiseta", 2, [["Participante", data.shirt]]],
    [
      "Saúde",
      3,
      HEALTH.map(([key, title]) => [
        title,
        `${data[key] || "Não informado"}${data[key] === "Sim" ? ` — ${clean(data[`${key}Details`])}` : ""}`,
      ]),
    ],
    [
      "Tripulação",
      4,
      [
        ["Contato de emergência", data.emergencyName],
        ["Telefone do contato", data.emergencyPhone],
        ["Acompanhante", data.companion],
        ...(data.companion === "Sim"
          ? [
              ["Nome", data.companionName],
              ["CPF", data.companionCpf],
              ["RG", data.companionRg],
              ["Camiseta", data.companionShirt],
            ]
          : []),
      ],
    ],
    [
      "Moto aquática e documentos",
      5,
      [
        ["Marca", data.brand === "Outra" ? data.otherBrand : data.brand],
        ["Modelo", data.model],
        ["Ano", data.year],
        ["Nº de inscrição", data.registration],
        ["Habilitação náutica", data.license],
        ["Documento da moto", fileState.boatDocument?.name],
        ["Documento da habilitação", fileState.licenseDocument?.name],
      ],
    ],
  ];
  document.querySelector("#review-content").innerHTML = groups
    .map(
      ([title, index, rows]) =>
        `<details class="review-group" open><summary>${escape(title)}</summary><div class="review-group-content"><dl>${rows.map(([label, value]) => `<div class="review-row"><dt>${escape(label)}</dt><dd>${escape(value || "Não informado")}</dd></div>`).join("")}</dl><button type="button" class="review-edit" data-edit="${index}">${icon("edit")} Editar ${escape(title.toLowerCase())}</button></div></details>`,
    )
    .join("");
}

function maskInput(input) {
  const name = input.name;
  const start = input.selectionStart;
  const before = input.value;
  const numericBeforeCursor = digits(
    before.slice(0, start ?? before.length),
  ).length;
  const wasEnd = start === before.length;
  if (["cpf", "companionCpf"].includes(name)) {
    const value = digits(before).slice(0, 11);
    input.value = value
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  } else if (["phone", "emergencyPhone"].includes(name)) {
    const value = digits(before).slice(0, 11);
    if (value.length <= 2) input.value = value;
    else {
      const local = value.slice(2);
      const split = local.length > 8 ? 5 : 4;
      input.value = `(${value.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? `-${local.slice(split)}` : ""}`;
    }
  } else if (name === "zip")
    input.value = digits(before)
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");
  else if (name === "year") input.value = digits(before).slice(0, 4);
  else return;
  if (before === input.value) return;
  if (wasEnd) input.setSelectionRange?.(input.value.length, input.value.length);
  else {
    let index = 0;
    let count = 0;
    while (index < input.value.length && count < numericBeforeCursor) {
      if (/\d/.test(input.value[index])) count++;
      index++;
    }
    input.setSelectionRange?.(index, index);
  }
}

async function processFile(name, file) {
  if (sending || !file) return;
  const version = ++fileVersions[name];
  const input = document.getElementById(name);
  pendingFiles++;
  updateNextButton();
  try {
    const error = await validateFile(file, CONFIG.maxFileBytes);
    if (fileVersions[name] !== version) return;
    if (error) {
      input.value = "";
      fileState[name] = null;
      renderFile(name);
      document.getElementById(`${name}-error`).textContent = error;
      input.setAttribute("aria-invalid", "true");
      document.getElementById(`${name}-drop`).classList.add("has-error");
    } else {
      fileState[name] = file;
      clearError(name);
      renderFile(name);
    }
  } finally {
    pendingFiles--;
    updateNextButton();
  }
}

function renderFile(name) {
  const file = fileState[name];
  const drop = document.getElementById(`${name}-drop`);
  document.getElementById(`${name}-filename`).textContent = file
    ? file.name
    : "Toque para escolher ou arraste aqui";
  document.getElementById(`${name}-size`).textContent = file
    ? `${formatBytes(file.size)} · pronto para enviar`
    : "PDF, JPG ou PNG · até 5 MB";
  drop.classList.toggle("has-file", Boolean(file));
  const remove = form.querySelector(`[data-remove-file="${name}"]`);
  remove.hidden = !file;
  remove.textContent = `Remover ${name === "boatDocument" ? "documento da moto aquática" : "habilitação náutica"}`;
  const graphic = drop.querySelector("use");
  graphic.setAttribute("href", file ? "#check" : "#upload");
}

function setMessage(text, { help = false } = {}) {
  message.replaceChildren(document.createTextNode(text));
  if (help) {
    message.append(document.createTextNode(" "));
    const link = document.createElement("a");
    link.href = "https://wa.me/5511964467000";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Falar com a equipe pelo WhatsApp.";
    message.append(link);
  }
  message.hidden = false;
  message.scrollIntoView({ behavior: "auto", block: "center" });
}

async function submitRegistration() {
  if (sending || finished || uncertain || pendingFiles > 0) return;
  if (!validEndpoint(CONFIG.basinEndpoint)) {
    setMessage(
      "O envio de inscrições ainda não foi liberado. Nenhum dado foi enviado.",
      { help: true },
    );
    return;
  }
  syncConditionalFields();
  const data = readData();
  for (let index = 0; index < STEPS.length; index++) {
    const errors = validateStep(index, data, fileState);
    if (Object.keys(errors).length) {
      goToStep(index);
      showErrors(errors);
      return;
    }
  }
  if (data.website) {
    setMessage(
      "Não foi possível enviar o formulário. Recarregue a página e tente novamente.",
    );
    return;
  }
  if (!navigator.onLine) {
    setMessage(
      "Você está sem conexão. Conecte-se à internet antes de enviar. Seus dados continuam nesta página.",
    );
    return;
  }
  sending = true;
  formFields.disabled = true;
  nav.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  form.setAttribute("aria-busy", "true");
  form.classList.add("is-submitting");
  nextButton.textContent = "Enviando…";
  message.hidden = true;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CONFIG.timeoutMs);
  let requestStarted = false;
  try {
    for (const [name, file] of Object.entries(fileState)) {
      const error = await validateFile(file, CONFIG.maxFileBytes);
      if (error) {
        formFields.disabled = false;
        sending = false;
        goToStep(5);
        showErrors({ [name]: error });
        return;
      }
    }
    requestReference ||= crypto.randomUUID();
    const payload = new FormData();
    payloadEntries(
      data,
      CONFIG,
      requestReference,
      new Date().toISOString(),
    ).forEach(([key, value]) => payload.append(key, value));
    payload.append("Documento da moto aquática", fileState.boatDocument);
    payload.append(
      "Habilitação náutica — documento",
      fileState.licenseDocument,
    );
    payload.append("_gotcha", "");
    requestStarted = true;
    const response = await fetch(CONFIG.basinEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      if (response.status >= 500 || response.status === 408) {
        uncertain = true;
        throw new Error(
          "Não foi possível confirmar o recebimento. Para evitar inscrições duplicadas, fale com a equipe antes de reenviar.",
        );
      }
      requestStarted = false;
      throw new Error(
        response.status === 429
          ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente."
          : response.status === 413
            ? "Os anexos ultrapassaram o limite de recebimento. Fale com a equipe para enviar os documentos."
            : "O serviço recusou a inscrição. Confira os dados ou fale com a equipe.",
      );
    }
    const result = await response.json();
    if (result.success !== true) {
      if (result.success === false) {
        requestStarted = false;
        throw new Error(
          "O serviço não confirmou a inscrição. Fale com a equipe antes de tentar novamente.",
        );
      }
      throw new Error(
        "A resposta do serviço não confirmou o recebimento. Fale com a equipe antes de reenviar.",
      );
    }
    finished = true;
    showSuccess();
  } catch (error) {
    if (requestStarted) uncertain = true;
    const text =
      error.name === "AbortError" ||
      (requestStarted && error instanceof TypeError)
        ? "A conexão foi interrompida e não conseguimos confirmar o recebimento. Para evitar duplicidade, consulte a equipe antes de reenviar."
        : error.message ||
          "Não foi possível enviar sua inscrição. Fale com a equipe.";
    setMessage(text, { help: true });
  } finally {
    window.clearTimeout(timeout);
    sending = false;
    formFields.disabled = false;
    form.classList.remove("is-submitting");
    form.removeAttribute("aria-busy");
    if (!finished) {
      syncConditionalFields();
      nav.querySelectorAll("button").forEach((button, index) => {
        button.disabled = index > furthestStep;
      });
      nextButton.innerHTML =
        currentStep === 6
          ? `Enviar inscrição ${icon("arrow")}`
          : `${furthestStep === 6 ? "Salvar e revisar" : "Continuar"} ${icon("arrow")}`;
      updateNextButton();
    }
  }
}

function showSuccess() {
  const card = document.querySelector("#form-card");
  card.innerHTML = `<div class="success-panel"><span class="success-check">${icon("check")}</span><p class="eyebrow text-teal">EXPEDIÇÃO RIO TIETÊ / 2026</p><h3 id="success-title" tabindex="-1">Inscrição recebida.<br>Nos vemos na água!</h3><p>Seus dados foram enviados à organização da expedição, de <strong>22 a 29 de novembro de 2026</strong>. Para acompanhar sua participação ou tirar dúvidas, fale com a equipe.</p><a class="button button-dark" href="https://wa.me/5511964467000" target="_blank" rel="noopener noreferrer">Falar com a organização ${icon("arrow")}</a><div class="reference">Identificador deste envio<code>${escape(requestReference)}</code></div></div>`;
  document.querySelector("#success-title").focus({ preventScroll: true });
  card.scrollIntoView({ behavior: "auto", block: "start" });
  nav.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.add("is-complete");
    button.removeAttribute("aria-current");
    button.querySelector(".step-number").innerHTML = icon("check");
  });
  form.reset();
  Object.keys(fileState).forEach((key) => {
    fileState[key] = null;
  });
}

form.addEventListener("input", (event) => {
  const input = event.target;
  if (
    !(
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement ||
      input instanceof HTMLSelectElement
    )
  )
    return;
  if (input instanceof HTMLInputElement && input.type !== "file")
    maskInput(input);
  clearError(input.name);
  if (input.type === "radio" || input.name === "brand") syncConditionalFields();
  if (currentStep !== 6) completed.delete(currentStep);
});

form.addEventListener("change", (event) => {
  const input = event.target;
  if (input instanceof HTMLInputElement && input.type === "file")
    void processFile(input.name, input.files?.[0]);
  if (
    input instanceof HTMLSelectElement ||
    (input instanceof HTMLInputElement && input.type === "radio")
  )
    syncConditionalFields();
});

form.addEventListener("click", (event) => {
  const remove = event.target.closest("[data-remove-file]");
  if (remove && !sending) {
    const name = remove.dataset.removeFile;
    fileVersions[name]++;
    fileState[name] = null;
    document.getElementById(name).value = "";
    clearError(name);
    renderFile(name);
    document.getElementById(name).focus();
  }
  const edit = event.target.closest("[data-edit]");
  if (edit) goToStep(Number(edit.dataset.edit));
});

Object.keys(fileState).forEach((name) => {
  const drop = document.getElementById(`${name}-drop`);
  ["dragenter", "dragover"].forEach((type) =>
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      if (!sending) drop.classList.add("is-dragover");
    }),
  );
  ["dragleave", "drop"].forEach((type) =>
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.remove("is-dragover");
    }),
  );
  drop.addEventListener("drop", (event) => {
    if (sending) return;
    const files = event.dataTransfer?.files;
    if (files?.length !== 1) {
      document.getElementById(`${name}-error`).textContent =
        "Envie apenas um arquivo por documento.";
      return;
    }
    void processFile(name, files[0]);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (sending || finished || pendingFiles > 0) return;
  if (currentStep === STEPS.length - 1) {
    void submitRegistration();
    return;
  }
  syncConditionalFields();
  const errors = validateStep(currentStep, readData(), fileState);
  showErrors(errors);
  if (!Object.keys(errors).length) {
    completed.add(currentStep);
    goToStep(furthestStep === 6 ? 6 : currentStep + 1);
  }
});

backButton.addEventListener("click", () => goToStep(currentStep - 1));
nav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-goto]");
  if (button && !button.disabled) goToStep(Number(button.dataset.goto));
});
window.addEventListener("beforeunload", (event) => {
  if (finished) return;
  const dirty =
    sending || currentStep > 0 || clean(form.elements.namedItem("name")?.value);
  if (dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});

syncConditionalFields();
goToStep(0, { focus: false });
initEffects();
