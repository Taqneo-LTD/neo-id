"use client";

import { Suspense } from "react";
import {
  PlanBillingTab,
  type PlanBillingData,
} from "@/components/settings/plan-billing-tab";

export function SettingsPageClient({ data }: { data: PlanBillingData }) {
  return (
    <Suspense>
      <PlanBillingTab data={data} />
    </Suspense>
  );
}
