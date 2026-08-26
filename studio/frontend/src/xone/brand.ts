// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

export const XONE_BRAND = {
  name: "XOne",
  wordmark: "xone",
  publisher: "XOne AI",
  stage: "Private Alpha",
  description: "A private-alpha desktop experience for local AI workflows.",
  icons: {
    app: import.meta.env?.VITE_XONE_APP_ICON ?? "/xone/icon.png",
    wordmark: import.meta.env?.VITE_XONE_WORDMARK_ICON ?? "/xone/icon.png",
  },
} as const;

/** Keep legacy catalog wording out of every translated, user-visible surface. */
export function applyXOneDisplayBrand(_key: string, value: string): string {
  return value.replaceAll("Unsloth", XONE_BRAND.name);
}
