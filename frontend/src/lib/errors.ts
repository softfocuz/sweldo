import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return "Could not reach the server. Confirm the backend is running and reachable.";
    }
    const data = error.response.data as { detail?: unknown } | undefined;
    const detail = data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => (typeof item === "object" && item && "msg" in item ? String((item as { msg: unknown }).msg) : null))
        .filter((message): message is string => Boolean(message));
      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
    if (error.response.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    return fallback;
  }

  if (error instanceof Error) {
    const horizonExtras = (error as unknown as { response?: { data?: { extras?: { result_codes?: unknown } } } }).response
      ?.data?.extras?.result_codes;
    if (horizonExtras) {
      return `Stellar rejected the transaction: ${JSON.stringify(horizonExtras)}`;
    }
    if (error.message.toLowerCase().includes("user declined")) {
      return "Transaction rejected in Freighter.";
    }
    return error.message;
  }

  return fallback;
}
