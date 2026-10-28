import { createInitialValues } from "../src/types.ts";

export function validValues() {
  return {
    ...createInitialValues(),
    name: "Pessoa de Teste",
    birth: "1990-03-21",
    sex: "Prefiro não informar",
    cpf: "529.982.247-25",
    rg: "123456789",
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
    restriction: "Não",
    pregnancy: "Não",
    medication: "Não",
    allergy: "Não",
    brand: "Yamaha",
    model: "Modelo de teste",
    year: "2025",
    registration: "123456789",
    license: "1234567",
    term0: "on",
    term1: "on",
    term2: "on",
    term3: "on",
    term4: "on",
    term5: "on",
  };
}

export function validDocuments() {
  const pdf = () =>
    new File(["%PDF-1.7\nDocumento sintético para teste local."], "teste.pdf", {
      type: "application/pdf",
    });
  return { boatDocument: pdf(), licenseDocument: pdf() };
}
