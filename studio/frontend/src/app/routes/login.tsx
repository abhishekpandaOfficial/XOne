// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { createRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { isTauri } from "@/lib/api-base";
import { requireGuest } from "../auth-guards";
import { Route as rootRoute } from "./__root";

const LoginPage = lazy(() =>
  import("@/features/auth").then((m) => ({ default: m.LoginPage })),
);

function isLocalWorkspaceHost(): boolean {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    return true;
  }
  if (/^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host)) {
    return true;
  }
  const private172 = host.match(/^172\.(\d{1,2})\./);
  return private172 ? Number(private172[1]) >= 16 && Number(private172[1]) <= 31 : false;
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  staticData: { title: "Login", isAuthFlow: true },
  beforeLoad: () => {
    if (!isTauri && !isLocalWorkspaceHost()) {
      throw redirect({ to: "/", search: { notice: "cloud-coming-soon" } });
    }
    return requireGuest();
  },
  component: LoginPage,
});
