"use client";

import { useCallback, useEffect, useState } from "react";
import type { AssistantTone } from "@/lib/finance/assistant-tone";
import {
  loadAssistantTone,
  saveAssistantTone,
} from "@/lib/storage/assistant-tone-storage";

export function useAssistantTone() {
  const [tone, setTone] = useState<AssistantTone>("gentle");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTone(loadAssistantTone());
    setReady(true);
  }, []);

  const updateTone = useCallback((next: AssistantTone) => {
    setTone(next);
    saveAssistantTone(next);
  }, []);

  return { tone, ready, updateTone };
}
