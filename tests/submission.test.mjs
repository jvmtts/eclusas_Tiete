import test from "node:test";
import assert from "node:assert/strict";
import { sendRegistration, SubmissionFailure } from "../src/lib/submission.ts";
import { CONFIG } from "../src/config.ts";
import { validValues, validDocuments } from "./fixtures.mjs";

const reference = "01234567-89ab-4cde-8fab-0123456789ab";
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("confirmed success sends a single multipart request with both documents and accepted terms", async () => {
  let calls = 0;
  const result = await sendRegistration(validValues(), validDocuments(), {
    reference,
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url, CONFIG.basinEndpoint);
      assert.equal(options.method, "POST");
      assert.equal(options.headers.Accept, "application/json");
      assert.ok(options.body instanceof FormData);
      assert.equal(options.body.get("Identificador do envio"), reference);
      assert.equal(options.body.get("email"), "pessoa@example.com");
      assert.ok(options.body.get("Documento da moto aquática") instanceof File);
      assert.ok(
        options.body.get("Habilitação náutica — documento") instanceof File,
      );
      assert.equal(
        [...options.body.keys()].filter((key) => key.startsWith("Termo —"))
          .length,
        6,
      );
      return json({ success: true });
    },
  });
  assert.equal(result, reference);
  assert.equal(calls, 1);
});

test("invalid fields or missing accepted terms never reach the network", async () => {
  for (const values of [
    { ...validValues(), term0: "" },
    { ...validValues(), email: "invalid" },
    { ...validValues(), website: "spam" },
  ]) {
    let called = false;
    await assert.rejects(
      sendRegistration(values, validDocuments(), {
        reference,
        fetcher: async () => {
          called = true;
          return json({ success: true });
        },
      }),
      SubmissionFailure,
    );
    assert.equal(called, false);
  }
});

test("invalid documents never reach the network", async () => {
  let called = false;
  await assert.rejects(
    sendRegistration(
      validValues(),
      {
        ...validDocuments(),
        boatDocument: new File(["renamed file"], "fake.pdf", {
          type: "application/pdf",
        }),
      },
      {
        reference,
        fetcher: async () => {
          called = true;
          return json({ success: true });
        },
      },
    ),
    SubmissionFailure,
  );
  assert.equal(called, false);
});

test("explicit client rejection permits a corrected manual attempt", async () => {
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      fetcher: async () => json({ success: false }, 400),
    }),
    (error) => error instanceof SubmissionFailure && !error.uncertain,
  );
});

test("rate limiting is displayed without an automatic retry", async () => {
  let calls = 0;
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      fetcher: async () => {
        calls++;
        return json({}, 429);
      },
    }),
    (error) => !error.uncertain && /Aguarde/.test(error.message),
  );
  assert.equal(calls, 1);
});

test("server failure marks receipt as uncertain", async () => {
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      fetcher: async () => json({}, 503),
    }),
    (error) => error instanceof SubmissionFailure && error.uncertain,
  );
});

test("network failure marks receipt as uncertain instead of claiming failure or success", async () => {
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      fetcher: async () => {
        throw new TypeError("Network failure");
      },
    }),
    (error) => error instanceof SubmissionFailure && error.uncertain,
  );
});

test("HTTP 200 with invalid or incomplete JSON never confirms success", async () => {
  for (const response of [new Response("<html>Invalid</html>"), json({})])
    await assert.rejects(
      sendRegistration(validValues(), validDocuments(), {
        reference,
        fetcher: async () => response,
      }),
      (error) => error.uncertain,
    );
});

test("explicit success false is an acknowledged rejection", async () => {
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      fetcher: async () => json({ success: false }),
    }),
    (error) => !error.uncertain,
  );
});

test("already aborted submission does not reach the network", async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(
    sendRegistration(validValues(), validDocuments(), {
      reference,
      signal: controller.signal,
      fetcher: async () => {
        called = true;
        return json({ success: true });
      },
    }),
    (error) => !error.uncertain,
  );
  assert.equal(called, false);
});

test(
  "cancellation after sending starts is treated as uncertain receipt",
  { timeout: 3000 },
  async () => {
    const controller = new AbortController();
    let started;
    const ready = new Promise((resolve) => {
      started = resolve;
    });
    const sending = sendRegistration(validValues(), validDocuments(), {
      reference,
      signal: controller.signal,
      fetcher: async (_url, options) => {
        started();
        return new Promise((_resolve, reject) =>
          options.signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          ),
        );
      },
    });
    const assertion = assert.rejects(sending, (error) => error.uncertain);
    await ready;
    controller.abort();
    await assertion;
  },
);
