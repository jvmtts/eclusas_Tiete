export interface FormValues {
  name: string;
  birth: string;
  sex: string;
  cpf: string;
  rg: string;
  phone: string;
  email: string;
  zip: string;
  city: string;
  state: string;
  address: string;
  shirt: string;
  restriction: string;
  restrictionDetails: string;
  pregnancy: string;
  pregnancyDetails: string;
  medication: string;
  medicationDetails: string;
  allergy: string;
  allergyDetails: string;
  emergencyName: string;
  emergencyPhone: string;
  companion: string;
  companionName: string;
  companionCpf: string;
  companionRg: string;
  companionShirt: string;
  brand: string;
  otherBrand: string;
  model: string;
  year: string;
  registration: string;
  license: string;
  term0: string;
  term1: string;
  term2: string;
  term3: string;
  term4: string;
  term5: string;
  website: string;
}

export type FieldName = keyof FormValues;
export type DocumentKey = "boatDocument" | "licenseDocument";
export type Documents = Record<DocumentKey, File | null>;
export type Errors = Partial<Record<FieldName | DocumentKey, string>>;
export type FieldChange = (name: FieldName, value: string) => void;

export interface ExpeditionConfig {
  basinEndpoint: string;
  event: string;
  date: string;
  route: string;
  maxFileBytes: number;
  timeoutMs: number;
}

export function createInitialValues(): FormValues {
  return {
    name: "",
    birth: "",
    sex: "",
    cpf: "",
    rg: "",
    phone: "",
    email: "",
    zip: "",
    city: "",
    state: "",
    address: "",
    shirt: "",
    restriction: "",
    restrictionDetails: "",
    pregnancy: "",
    pregnancyDetails: "",
    medication: "",
    medicationDetails: "",
    allergy: "",
    allergyDetails: "",
    emergencyName: "",
    emergencyPhone: "",
    companion: "",
    companionName: "",
    companionCpf: "",
    companionRg: "",
    companionShirt: "",
    brand: "",
    otherBrand: "",
    model: "",
    year: "",
    registration: "",
    license: "",
    term0: "",
    term1: "",
    term2: "",
    term3: "",
    term4: "",
    term5: "",
    website: "",
  };
}
