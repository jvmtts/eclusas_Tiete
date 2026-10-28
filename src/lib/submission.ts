import { CONFIG } from "../config.ts";
import type { Documents, FormValues } from "../types.ts";
import { payloadEntries } from "./payload.ts";
import { validEndpoint, validateFile, validateStep } from "./validation.ts";

export class SubmissionFailure extends Error {
  readonly uncertain: boolean;

  constructor(message: string, uncertain = false) {
    super(message);
    this.name = "SubmissionFailure";
    this.uncertain = uncertain;
  }
}

interface SubmissionOptions {
  reference: string;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
}

export async function sendRegistration(
  values: FormValues,
  documents: Documents,
  options: SubmissionOptions,
): Promise<string> {
  if (!validEndpoint(CONFIG.basinEndpoint))
    throw new SubmissionFailure(
      "O envio de inscrições ainda não foi liberado.",
    );
  for (let step = 0; step < 6; step++) {
    if (Object.keys(validateStep(step, values, documents)).length)
      throw new SubmissionFailure(
        "Confira os campos e os termos antes de enviar.",
      );
  }
  if (values.website)
    throw new SubmissionFailure(
      "Não foi possível enviar. Recarregue o formulário ou fale com a equipe.",
    );
  if (options.signal?.aborted)
    throw new SubmissionFailure("O envio foi cancelado.");
  for (const file of Object.values(documents)) {
    const error = await validateFile(file, CONFIG.maxFileBytes);
    if (error) throw new SubmissionFailure(error);
  }

  const payload = new FormData();
  payloadEntries(
    values,
    CONFIG,
    options.reference,
    new Date().toISOString(),
  ).forEach(([key, value]) => payload.append(key, value));
  payload.append("Documento da moto aquática", documents.boatDocument!);
  payload.append("Habilitação náutica — documento", documents.licenseDocument!);
  payload.append("_gotcha", "");

  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, CONFIG.timeoutMs);
  let requestStarted = false;
  try {
    if (options.signal?.aborted)
      throw new SubmissionFailure("O envio foi cancelado.");
    requestStarted = true;
    const response = await (options.fetcher ?? fetch)(CONFIG.basinEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: payload,
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    });
    if (!response.ok) {
      requestStarted = response.status >= 500 || response.status === 408;
      if (requestStarted)
        throw new SubmissionFailure(
          "Não conseguimos confirmar o recebimento. Para evitar duplicidade, fale com a equipe antes de reenviar.",
          true,
        );
      throw new SubmissionFailure(
        response.status === 429
          ? "Muitas tentativas em pouco tempo. Aguarde alguns minutos antes de tentar novamente."
          : response.status === 413
            ? "Os anexos ultrapassaram o limite de recebimento. Fale com a equipe para enviar os documentos."
            : "O serviço recusou a inscrição. Confira os dados ou fale com a equipe.",
      );
    }
    const result: unknown = await response.json();
    const success =
      typeof result === "object" && result !== null && "success" in result
        ? result.success
        : undefined;
    if (success !== true) {
      requestStarted = success !== false;
      throw new SubmissionFailure(
        "O serviço não confirmou o recebimento. Fale com a equipe antes de tentar novamente.",
        requestStarted,
      );
    }
    return options.reference;
  } catch (error) {
    if (error instanceof SubmissionFailure) throw error;
    throw new SubmissionFailure(
      requestStarted
        ? "A conexão foi interrompida e não conseguimos confirmar o recebimento. Consulte a equipe antes de reenviar para evitar duplicidade."
        : "Não foi possível preparar sua inscrição. Confira os documentos e tente novamente.",
      requestStarted,
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
}
