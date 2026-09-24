"use client";

import { TelemetryEvent } from "@/lib/models/telemetry";

type TrackEventInput = Omit<TelemetryEvent, "id" | "occurredAt"> & { occurredAt?: string };

export async function trackEvent(input: TrackEventInput) {
  void input;
  return;
}

export async function getTelemetryEvents() {
  return [] as TelemetryEvent[];
}
