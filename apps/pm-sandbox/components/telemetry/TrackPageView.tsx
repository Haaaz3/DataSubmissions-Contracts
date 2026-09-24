"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/telemetry/service";

export default function TrackPageView({
  page,
  module,
  properties,
}: {
  page: string;
  module: string;
  properties?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    trackEvent({
      eventName: "page_viewed",
      page,
      module,
      userId: "demo-user",
      userRole: "operator",
      properties,
    });
  }, [page, module, properties]);

  return null;
}
