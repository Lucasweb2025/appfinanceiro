"use client";

import { Badge } from "@/components/ui";
import type { RegisteredPayment } from "@/lib/finance/types";
import { formatPaidLabel } from "@/lib/finance/registered-payment";

export function PaidStatusBadge({ payment }: { payment: RegisteredPayment }) {
  return (
    <Badge tone={payment.paidEarly ? "warning" : "success"}>
      {formatPaidLabel(payment)}
    </Badge>
  );
}

export function paidRowClass(isPaid: boolean): string {
  return isPaid ? "opacity-75" : "";
}

export function paidTextClass(isPaid: boolean): string {
  return isPaid ? "line-through text-slate-400" : "text-slate-900";
}
