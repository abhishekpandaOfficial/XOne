// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { createRoute, redirect } from "@tanstack/react-router";
import { getPostAuthRoute } from "@/features/auth";
import { LandingPage } from "@/features/landing/landing-page";
import { isTauri } from "@/lib/api-base";
import { requireAuth } from "../auth-guards";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    // The website owns `/` as its public product surface. The native shell
    // keeps the existing fast path into the authenticated local workspace.
    if (isTauri) {
      await requireAuth();
      throw redirect({ to: getPostAuthRoute() });
    }
  },
  staticData: { title: "Local AI control plane", isAuthFlow: true },
  component: LandingPage,
});
