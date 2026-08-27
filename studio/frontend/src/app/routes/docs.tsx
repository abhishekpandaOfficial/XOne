// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { createRoute } from "@tanstack/react-router";
import { XOneDocsPage } from "@/features/docs/xone-docs-page";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  staticData: { title: "XOne Docs", isAuthFlow: true },
  component: XOneDocsPage,
});