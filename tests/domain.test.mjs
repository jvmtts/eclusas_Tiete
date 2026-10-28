import test from "node:test";
import assert from "node:assert/strict";
import {
  validCPF,
  validName,
  validPhone,
  validBirth,
  validateStep,
  validateFile,
  validEndpoint,
} from "../src/lib/validation.ts";
import { payloadEntries } from "../src/lib/payload.ts";
import { HEALTH, TERMS } from "../src/data/expedition.ts";
import { formatDate } from "../src/lib/format.ts";
import { CONFIG } from "../src/config.ts";

const now = new Date("2026-10-28T12:00:00-03:00");
const pdf = () =>
  new File(["%PDF-1.7\nDocumento de teste sintético."], "teste.pdf", {
    type: "application/pdf",
  });
const base = {
  name: "Pessoa de Teste",
  birth: "1990-03-21",
  sex: "Prefiro não informar",
  cpf: "529.982.247-25",
  rg: "12.345.678-9",
  phone: "(11) 99999-9999",
  email: "pessoa@example.com",
  zip: "01001-000",
  state: "SP",
  city: "Cidade de Teste",
  address: "Rua de Teste, 10, Centro",
  shirt: "M",
  emergencyName: "Contato de Teste",
  emergencyPhone: "(11) 3333-4444",
  companion: "Não",
  brand: "Yamaha",
  model: "Modelo de teste",
  year: "2025",
  registration: "123456789",
  license: "1234567",
  ...Object.fromEntries(HEALTH.map(([key]) => [key, "Não"])),
  ...Object.fromEntries(TERMS.map((_, index) => [`term${index}`, "on"])),
};

test("CPF: validates both check digits with or without a mask", () => {
  assert.equal(validCPF("529.982.247-25"), true);
  assert.equal(validCPF("11144477735"), true);
  for (const value of [
    "",
    "11111111111",
    "00000000000",
    "52998224724",
    "5299822472",
    "529982247250",
  ])
    assert.equal(validCPF(value), false);
});

test("names accept accents, apostrophes and hyphens but require a surname", () => {
  for (const value of [
    "Ana D’Ávila",
    "João O'Connor",
    "Maria-Clara de Souza",
    "Renée Müller",
    " José   da Silva ",
  ])
    assert.equal(validName(value), true, value);
  for (const value of ["Ana", "", "<script> teste", "Pessoa 123"])
    assert.equal(validName(value), false, value);
});

test("phone accepts Brazilian mobile and landline with DDD", () => {
  assert.equal(validPhone("(11) 99999-9999"), true);
  assert.equal(validPhone("(21) 3333-4444"), true);
  assert.equal(validPhone("00000000000"), false);
  assert.equal(validPhone("119999999"), false);
});

test("birth date rejects impossible dates, future dates and invalid ranges", () => {
  assert.equal(validBirth("2000-02-29", now), true);
  for (const value of [
    "2001-02-29",
    "1990-13-01",
    "2026-10-29",
    "1899-01-01",
    "abc",
  ])
    assert.equal(validBirth(value, now), false);
});

test("complete participant without companion passes all six stages", () => {
  for (let step = 0; step < 6; step++)
    assert.deepEqual(
      validateStep(
        step,
        base,
        { boatDocument: pdf(), licenseDocument: pdf() },
        now,
      ),
      {},
      `step ${step}`,
    );
});

test("personal and address stages expose field-specific errors", () => {
  assert.equal(Object.keys(validateStep(0, {}, {}, now)).length, 7);
  assert.equal(Object.keys(validateStep(1, {}, {}, now)).length, 4);
  assert.ok(validateStep(0, { ...base, sex: "invalid" }, {}, now).sex);
  assert.ok(validateStep(1, { ...base, state: "XX" }, {}, now).state);
});

test("all health questions must be answered and yes requires details", () => {
  for (const [key] of HEALTH) {
    assert.ok(validateStep(3, { ...base, [key]: "" })[key]);
    assert.ok(validateStep(3, { ...base, [key]: "Sim" })[`${key}Details`]);
    assert.deepEqual(
      validateStep(3, {
        ...base,
        [key]: "Sim",
        [`${key}Details`]: "Informação de teste",
      }),
      {},
    );
  }
});

test("companion details are conditional and shirt is required only when present", () => {
  assert.deepEqual(validateStep(2, base), {});
  const errors = validateStep(2, { ...base, companion: "Sim" });
  assert.ok(
    errors.companionName &&
      errors.companionCpf &&
      errors.companionRg &&
      errors.companionShirt,
  );
  const withCompanion = {
    ...base,
    companion: "Sim",
    companionName: "Acompanhante de Teste",
    companionCpf: "111.444.777-35",
    companionRg: "1234567",
    companionShirt: "PP",
  };
  assert.deepEqual(validateStep(2, withCompanion), {});
  assert.ok(
    validateStep(2, { ...withCompanion, companionCpf: base.cpf }).companionCpf,
  );
});

test("boat stage validates year, other brand, and both documents", () => {
  assert.ok(validateStep(4, { ...base, year: "2099" }, {}, now).year);
  assert.ok(validateStep(4, { ...base, brand: "Outra" }, {}, now).otherBrand);
  const errors = validateStep(4, base, {}, now);
  assert.ok(errors.boatDocument && errors.licenseDocument);
});

test("every individual term must be accepted", () => {
  for (let index = 0; index < TERMS.length; index++)
    assert.ok(
      validateStep(5, { ...base, [`term${index}`]: "" })[`term${index}`],
    );
});

test("uploads accept matching PDF, JPG and PNG signatures", async () => {
  assert.equal(await validateFile(pdf()), "");
  assert.equal(
    await validateFile(
      new File([new Uint8Array([255, 216, 255, 225])], "foto.jpg", {
        type: "image/jpeg",
      }),
    ),
    "",
  );
  assert.equal(
    await validateFile(
      new File(
        [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
        "foto.png",
        { type: "image/png" },
      ),
    ),
    "",
  );
});

test("uploads reject empty, oversized, renamed or unsupported files", async () => {
  assert.notEqual(await validateFile(new File([], "vazio.pdf")), "");
  assert.notEqual(
    await validateFile(
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "grande.pdf", {
        type: "application/pdf",
      }),
    ),
    "",
  );
  assert.notEqual(
    await validateFile(
      new File(["arquivo falso"], "falso.pdf", { type: "application/pdf" }),
    ),
    "",
  );
  assert.notEqual(
    await validateFile(new File(["%PDF-1.7"], "arquivo.exe")),
    "",
  );
  assert.notEqual(
    await validateFile(
      new File(["%PDF-1.7"], "arquivo.pdf", { type: "text/plain" }),
    ),
    "",
  );
});

test("unreadable file produces a useful validation error", async () => {
  const unreadable = {
    name: "teste.pdf",
    type: "application/pdf",
    size: 40,
    slice() {
      throw new Error("Unreadable");
    },
  };
  assert.notEqual(await validateFile(unreadable), "");
});

test("endpoint must be a direct HTTPS Basin form URL", () => {
  assert.equal(validEndpoint("https://usebasin.com/f/abc123"), true);
  for (const url of [
    "",
    "http://usebasin.com/f/abc",
    "https://usebasin.com.evil.test/f/abc",
    "https://evil.test/",
    "https://usebasin.com/f/abc?x=1",
    "https://user@usebasin.com/f/abc",
    "https://usebasin.com/f/abc#test",
  ])
    assert.equal(validEndpoint(url), false, url);
});

test("payload includes event, reference, six complete accepted terms and email", () => {
  const payload = Object.fromEntries(
    payloadEntries(base, CONFIG, "reference-test", "2026-10-28T12:00:00Z"),
  );
  assert.equal(payload.email, base.email);
  assert.equal(payload.Evento, CONFIG.event);
  assert.equal(payload["Identificador do envio"], "reference-test");
  assert.equal(payload["Data de nascimento"], "21/03/1990");
  TERMS.forEach(([title, text]) =>
    assert.equal(payload[`Termo — ${title}`], `Aceito: ${text}`),
  );
});

test("payload excludes stale companion and health data after switching to no", () => {
  const payload = Object.fromEntries(
    payloadEntries(
      {
        ...base,
        companionName: "Não enviar",
        restrictionDetails: "Não enviar",
      },
      CONFIG,
      "ref",
      "date",
    ),
  );
  assert.equal(
    Object.keys(payload).some((key) => key.startsWith("Acompanhante —")),
    false,
  );
  assert.equal(
    Object.keys(payload).some((key) => key.endsWith("— detalhes")),
    false,
  );
});

test("payload preserves companion and health details when applicable", () => {
  const payload = Object.fromEntries(
    payloadEntries(
      {
        ...base,
        companion: "Sim",
        companionName: "Pessoa de Teste",
        companionCpf: "11144477735",
        companionRg: "1234567",
        companionShirt: "G",
        medication: "Sim",
        medicationDetails: "Informação sintética",
      },
      CONFIG,
      "ref",
      "date",
    ),
  );
  assert.equal(payload["Acompanhante — camiseta"], "G");
  assert.equal(
    payload["Faz uso de medicação contínua? — detalhes"],
    "Informação sintética",
  );
});

test("date formatting does not depend on UTC timezone conversion", () => {
  assert.equal(formatDate("1990-03-21"), "21/03/1990");
});

test("configuration accepts only an empty or valid Basin endpoint", () => {
  assert.ok(CONFIG.basinEndpoint === "" || validEndpoint(CONFIG.basinEndpoint));
});
