"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardSummary } from "@/lib/finance/dashboard";
import {
  isNotificationsEnabled,
  notifyUpcomingAlerts,
  requestNotificationPermission,
  setNotificationsEnabled,
} from "@/lib/notifications/alerts";

export function useNotifications(summary: DashboardSummary | null) {
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabled(isNotificationsEnabled());
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !enabled || !summary) return;
    if (permission !== "granted") return;

    void notifyUpcomingAlerts(summary.upcomingAlerts);
  }, [ready, enabled, permission, summary]);

  const toggleNotifications = useCallback(async (next: boolean) => {
    if (next) {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        setEnabled(false);
        setNotificationsEnabled(false);
        return false;
      }
    }

    setEnabled(next);
    setNotificationsEnabled(next);
    return true;
  }, []);

  return {
    enabled,
    permission,
    ready,
    toggleNotifications,
  };
}
