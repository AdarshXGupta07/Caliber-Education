// Thin wrapper around fetch() adding a timeout and a "this is taking a while"
// hook — neither existed anywhere in the app, so a cold Render free-tier
// backend (20-50s wake-up) just made every button look frozen with zero
// feedback. Deliberately close to native fetch's own signature so existing
// call sites migrate with a near-mechanical find/replace, not a rewrite.

export type ApiFetchErrorType = "timeout" | "network";

export class ApiFetchError extends Error {
  type: ApiFetchErrorType;
  constructor(type: ApiFetchErrorType, message: string) {
    super(message);
    this.type = type;
    this.name = "ApiFetchError";
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Abort and throw once the request has been in flight this long. Default 50s — generous enough not to cut off a legitimate cold-start wake. */
  timeoutMs?: number;
  /** Fire onSlow after this long if the request hasn't resolved yet. Default 9s. */
  slowAfterMs?: number;
  /** Called once if the request is still pending past slowAfterMs — use this to show a "still waking up" hint instead of a bare spinner. */
  onSlow?: () => void;
}

const DEFAULT_TIMEOUT_MS = 50_000;
const DEFAULT_SLOW_AFTER_MS = 9_000;

export async function apiFetch(input: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, slowAfterMs = DEFAULT_SLOW_AFTER_MS, onSlow, ...init } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const slowId = onSlow ? setTimeout(onSlow, slowAfterMs) : undefined;

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiFetchError("timeout", "That's taking longer than expected — the server may still be waking up. Please try again in a moment.");
    }
    throw new ApiFetchError("network", "Couldn't reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
    if (slowId) clearTimeout(slowId);
  }
}
