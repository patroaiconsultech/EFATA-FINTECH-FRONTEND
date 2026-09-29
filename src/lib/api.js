import { config } from "../config.js";
import { getAuthHeaders } from "./auth.js";

const traceBuffer = [];
const TRACE_LIMIT = 80;

export class ApiClientError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ApiClientError";
    Object.assign(this, details);
  }
}

function pushTrace(trace) {
  traceBuffer.unshift(trace);
  traceBuffer.splice(TRACE_LIMIT);
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("efata:trace", { detail: trace }));
  }
}

export function getTraceHistory() {
  return [...traceBuffer];
}

export function buildIfMatchHeader(version) {
  const normalized = String(version ?? "").trim().replaceAll('"', "");
  if (!normalized) throw new Error("Versão obrigatória para If-Match.");
  return { "If-Match": `"${normalized}"` };
}

export async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const requestId = crypto.randomUUID();
  const correlationId = options.correlationId || requestId;
  const started = performance.now();

  const headers = {
    "X-Request-ID": requestId,
    "X-Correlation-ID": correlationId,
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  let body;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const url = new URL(`${config.apiBaseUrl}${path}`);
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  let response;
  try {
    response = await fetch(url, { method, headers, body });
  } catch (networkError) {
    const trace = {
      method,
      path,
      status: 0,
      requestId,
      correlationId,
      durationMs: Math.round(performance.now() - started),
      code: "NETWORK_ERROR",
    };
    pushTrace(trace);
    throw new ApiClientError("Não foi possível alcançar a API.", {
      ...trace,
      cause: networkError,
    });
  }

  const responseRequestId = response.headers.get("X-Request-ID") || requestId;
  const responseCorrelationId =
    response.headers.get("X-Correlation-ID") || correlationId;
  const durationMs =
    Number(response.headers.get("X-Duration-Ms")) ||
    Math.round(performance.now() - started);
  const contentType = response.headers.get("content-type") || "";

  let payload = null;
  if (response.status !== 204) {
    try {
      payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      payload = null;
    }
  }

  const trace = {
    method,
    path: `${url.pathname}${url.search}`,
    status: response.status,
    requestId: responseRequestId,
    correlationId: responseCorrelationId,
    durationMs,
    code: payload?.error?.code || null,
  };
  pushTrace(trace);

  if (!response.ok) {
    throw new ApiClientError(
      payload?.error?.message || `A API respondeu ${response.status}.`,
      {
        status: response.status,
        code: payload?.error?.code || "HTTP_ERROR",
        details: payload?.error?.details || [],
        requestId: payload?.meta?.request_id || responseRequestId,
        correlationId:
          payload?.meta?.correlation_id || responseCorrelationId,
        trace,
        payload,
      },
    );
  }

  return { data: payload, trace };
}

export async function apiData(path, options = {}) {
  const result = await apiRequest(path, options);
  return result.data;
}

export function getCurrentIdentity() {
  return apiData("/api/v1/me");
}
