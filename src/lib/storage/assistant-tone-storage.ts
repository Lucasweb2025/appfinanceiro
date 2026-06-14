import {
  DEFAULT_ASSISTANT_TONE,
  isAssistantTone,
  type AssistantTone,
} from "@/lib/finance/assistant-tone";

const STORAGE_KEY = "app-financas-assistant-tone";

export function loadAssistantTone(): AssistantTone {
  if (typeof window === "undefined") {
    return DEFAULT_ASSISTANT_TONE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw && isAssistantTone(raw) ? raw : DEFAULT_ASSISTANT_TONE;
  } catch {
    return DEFAULT_ASSISTANT_TONE;
  }
}

export function saveAssistantTone(tone: AssistantTone): void {
  window.localStorage.setItem(STORAGE_KEY, tone);
}
