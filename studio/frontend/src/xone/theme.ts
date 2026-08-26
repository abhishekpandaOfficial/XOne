// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

/** XOne-owned theme hooks. Existing Studio palettes remain the compatibility defaults. */
export const XONE_THEME = {
  color: {
    accent: "var(--primary)",
    background: "var(--background)",
    foreground: "var(--foreground)",
  },
  font: {
    display: '"Hellix", sans-serif',
    body: "var(--font-sans)",
  },
} as const;
