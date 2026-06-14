export type AssistantTone = "direct" | "gentle";

export const DEFAULT_ASSISTANT_TONE: AssistantTone = "gentle";

export function isAssistantTone(value: string): value is AssistantTone {
  return value === "direct" || value === "gentle";
}
