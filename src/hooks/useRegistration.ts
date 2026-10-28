import { useEffect, useRef, useState } from "react";
import { CONFIG, STEPS } from "../config.ts";
import { createInitialValues } from "../types.ts";
import type { DocumentKey, Documents, Errors, FieldName } from "../types.ts";
import { validateFile, validateStep } from "../lib/validation.ts";
import { sendRegistration, SubmissionFailure } from "../lib/submission.ts";

export function useRegistration() {
  const [values, setValues] = useState(createInitialValues);
  const [documents, setDocuments] = useState<Documents>({
    boatDocument: null,
    licenseDocument: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [pending, setPending] = useState({
    boatDocument: false,
    licenseDocument: false,
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "uncertain" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [attention, setAttention] = useState({ token: 0, field: "" });
  const mounted = useRef(false);
  const sending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const requestReference = useRef("");
  const versions = useRef({ boatDocument: 0, licenseDocument: 0 });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);

  const isDirty =
    Object.values(values).some(Boolean) ||
    Object.values(documents).some(Boolean);
  useEffect(() => {
    if (!isDirty || status === "success") return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, status]);

  function setField(name: FieldName, value: string) {
    if (sending.current) return;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      if (
        ["restriction", "pregnancy", "medication", "allergy"].includes(name) &&
        value !== "Sim"
      )
        delete next[`${name}Details` as FieldName];
      if (name === "companion" && value !== "Sim")
        [
          "companionName",
          "companionCpf",
          "companionRg",
          "companionShirt",
        ].forEach((key) => delete next[key as FieldName]);
      if (name === "brand" && value !== "Outra") delete next.otherBrand;
      return next;
    });
  }

  function fileError(name: DocumentKey, error: string) {
    setErrors((previous) => ({ ...previous, [name]: error }));
  }

  async function setDocument(name: DocumentKey, file: File | null) {
    if (sending.current) return;
    const version = ++versions.current[name];
    if (!file) {
      setDocuments((previous) => ({ ...previous, [name]: null }));
      setPending((previous) => ({ ...previous, [name]: false }));
      setErrors((previous) => ({ ...previous, [name]: undefined }));
      return;
    }
    setPending((previous) => ({ ...previous, [name]: true }));
    const error = await validateFile(file, CONFIG.maxFileBytes);
    if (!mounted.current || version !== versions.current[name]) return;
    setDocuments((previous) => ({ ...previous, [name]: error ? null : file }));
    setErrors((previous) => ({ ...previous, [name]: error || undefined }));
    setPending((previous) => ({ ...previous, [name]: false }));
  }

  function moveTo(target: number, field = "") {
    setStep(target);
    setFurthestStep((previous) => Math.max(previous, target));
    setAttention((previous) => ({ token: previous.token + 1, field }));
  }

  function navigate(target: number) {
    if (sending.current || target < 0 || target > furthestStep) return;
    setErrors({});
    moveTo(target);
  }

  async function next() {
    if (
      sending.current ||
      Object.values(pending).some(Boolean) ||
      status === "success"
    )
      return;
    const currentErrors = validateStep(step, values, documents);
    if (Object.keys(currentErrors).length) {
      setErrors(currentErrors);
      moveTo(step, Object.keys(currentErrors)[0]);
      return;
    }
    setErrors({});
    if (step < STEPS.length - 1) {
      moveTo(furthestStep === STEPS.length - 1 ? STEPS.length - 1 : step + 1);
      return;
    }
    if (status === "uncertain") return;
    for (let index = 0; index < STEPS.length; index++) {
      const sectionErrors = validateStep(index, values, documents);
      if (Object.keys(sectionErrors).length) {
        setErrors(sectionErrors);
        moveTo(index, Object.keys(sectionErrors)[0]);
        return;
      }
    }
    if (!navigator.onLine) {
      setStatus("error");
      setMessage(
        "Você está sem conexão. Conecte-se à internet antes de enviar. Seus dados continuam nesta página.",
      );
      return;
    }
    sending.current = true;
    setStatus("sending");
    setMessage("");
    controller.current = new AbortController();
    try {
      requestReference.current ||= crypto.randomUUID();
      const receipt = await sendRegistration(
        { ...values },
        { ...documents },
        {
          reference: requestReference.current,
          signal: controller.current.signal,
        },
      );
      if (!mounted.current) return;
      setReference(receipt);
      setStatus("success");
      setValues(createInitialValues());
      setDocuments({ boatDocument: null, licenseDocument: null });
    } catch (error) {
      if (!mounted.current) return;
      const failure =
        error instanceof SubmissionFailure
          ? error
          : new SubmissionFailure(
              "Não conseguimos confirmar o envio. Fale com a equipe.",
              true,
            );
      setStatus(failure.uncertain ? "uncertain" : "error");
      setMessage(failure.message);
    } finally {
      sending.current = false;
      controller.current = null;
    }
  }

  return {
    values,
    documents,
    errors,
    step,
    furthestStep,
    pending,
    status,
    message,
    reference,
    attention,
    setField,
    setDocument,
    fileError,
    navigate,
    next,
  };
}

export type RegistrationController = ReturnType<typeof useRegistration>;
