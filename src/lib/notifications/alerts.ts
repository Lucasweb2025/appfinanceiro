import type { DashboardAlert } from "@/lib/finance/dashboard";

const STORAGE_KEY = "app-financas-notifications-enabled";
const DISMISSED_KEY = "app-financas-notifications-dismissed";

export function isNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function setNotificationsEnabled(enabled: boolean): void {
  window.localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

function dismissedToday(): string[] {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function dismissNotificationTag(tag: string): void {
  const today = new Date().toISOString().slice(0, 10);
  const prefix = `${today}:`;
  const next = [
    ...dismissedToday().filter((item) => !item.startsWith(prefix)),
    `${prefix}${tag}`,
  ];
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
}

function wasDismissedToday(tag: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dismissedToday().includes(`${today}:${tag}`);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

async function showViaServiceWorker(title: string, body: string, tag: string) {
  if (!("serviceWorker" in navigator)) return false;

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration?.active) return false;

  registration.active.postMessage({
    type: "SHOW_NOTIFICATION",
    title,
    body,
    tag,
  });
  return true;
}

export async function notifyAlert(alert: DashboardAlert): Promise<void> {
  if (!isNotificationsEnabled()) return;
  if (alert.kind === "income" || alert.kind === "card-closing") return;
  if (alert.isPaid) return;

  const tag = `${alert.date}-${alert.label}`;
  if (wasDismissedToday(tag)) return;

  const title =
    alert.date < new Date().toISOString().slice(0, 10)
      ? "Conta vencida"
      : "Conta hoje";
  const body = `${alert.label} · R$ ${alert.amount.toFixed(2).replace(".", ",")}`;

  if (Notification.permission !== "granted") return;

  const viaSw = await showViaServiceWorker(title, body, tag);
  if (viaSw) {
    dismissNotificationTag(tag);
    return;
  }

  new Notification(title, { body, tag, icon: "./icon.svg" });
  dismissNotificationTag(tag);
}

export async function notifyUpcomingAlerts(alerts: DashboardAlert[]): Promise<void> {
  if (!isNotificationsEnabled()) return;
  if (Notification.permission !== "granted") return;

  const today = new Date().toISOString().slice(0, 10);

  for (const alert of alerts) {
    if (alert.isPaid) continue;
    if (alert.kind === "income" || alert.kind === "card-closing") continue;
    if (alert.date <= today) {
      await notifyAlert(alert);
    }
  }
}

export function isInstallable(): boolean {
  return typeof window !== "undefined";
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}
