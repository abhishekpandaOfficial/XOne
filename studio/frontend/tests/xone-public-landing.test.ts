// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path: string) =>
  readFile(new URL(path, import.meta.url), "utf8");

test("the web root is public while native XOne keeps its workspace redirect", async () => {
  const source = await readSource("../src/app/routes/index.tsx");
  assert.match(source, /if \(isTauri\)/);
  assert.match(source, /requireAuth\(\)/);
  assert.match(source, /component: LandingPage/);
  assert.match(source, /isAuthFlow: true/);
});

test("the landing page uses stable official release downloads and honest signing guidance", async () => {
  const source = await readSource("../src/features/landing/landing-page.tsx");
  const downloads = await readSource("../src/xone/desktop-downloads.ts");
  assert.match(downloads, /\/downloads\/\$\{encodeURIComponent\(filename\)\}/);
  assert.match(downloads, /XOne-Desktop-macOS-Apple-Silicon\.dmg/);
  assert.match(downloads, /XOne-Desktop-macOS-Intel\.dmg/);
  assert.match(downloads, /XOne-Desktop-Windows-x64\.exe/);
  assert.match(downloads, /XOne-Desktop-Linux-x64\.deb/);
  assert.match(downloads, /XOne-Desktop-Linux-x64\.AppImage/);
  assert.match(downloads, /SHA256SUMS\.txt/);
  assert.match(source, /detectDesktopTarget/);
  assert.match(source, /System Settings → Privacy &amp; Security → Open Anyway/);
  assert.match(source, /More info → Run anyway/);
  assert.match(source, /Google[\s\S]*Coming soon/);
  assert.match(source, /GitHub[\s\S]*Coming soon/);
});

test("the dedicated XOne workflow publishes every stable portal asset", async () => {
  const workflow = await readSource("../../../.github/workflows/release-xone-desktop.yml");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /XOne-Desktop-macOS-Apple-Silicon\.dmg/);
  assert.match(workflow, /XOne-Desktop-macOS-Intel\.dmg/);
  assert.match(workflow, /XOne-Desktop-Windows-x64\.exe/);
  assert.match(workflow, /XOne-Desktop-Linux-x64\.deb/);
  assert.match(workflow, /XOne-Desktop-Linux-x64\.AppImage/);
  assert.match(workflow, /SHA256SUMS\.txt/);
  assert.match(workflow, /gh release create/);
  assert.match(workflow, /--latest/);
});

test("XOne Docs is first-party and documents the local operating loop", async () => {
  const route = await readSource("../src/app/routes/docs.tsx");
  const docs = await readSource("../src/features/docs/xone-docs-page.tsx");
  assert.match(route, /path: "\/docs"/);
  assert.match(docs, /MCP & AGENTS/);
  assert.match(docs, /RAG & KNOWLEDGE/);
  assert.match(docs, /xone studio --api-only --secure/);
  assert.doesNotMatch(docs, /unsloth studio|unsloth start/);
});

test("local password recovery is discoverable without the old password", async () => {
  const source = await readSource("../src/features/auth/components/auth-form.tsx");
  const authCss = await readSource("../src/features/auth/components/auth-shell.css");
  assert.match(source, /I don&apos;t know the current password/);
  assert.match(source, /xone studio reset-password/);
  assert.match(source, /You do not need the old password/);
  assert.match(source, /\/api\/auth\/local-initial-password/);
  assert.doesNotMatch(source, /id="current-password"/);
  assert.doesNotMatch(source, /id="confirm-password"/);
  assert.match(source, /id="email"/);
  assert.match(source, /xone-auth-input/);
  assert.match(source, /authStep === "email"/);
  assert.match(source, /Continue with email/);
  assert.match(source, /icon=\{GoogleIcon\}/);
  assert.match(source, /icon=\{GithubIcon\}/);
  assert.match(authCss, /\.xone-auth-input:-webkit-autofill/);
  assert.match(authCss, /-webkit-text-fill-color: #f7f5ff/);
});

test("XOne motion respects the operating system accessibility preference", async () => {
  const source = await readSource("../src/features/landing/landing-page.tsx");
  const landingCss = await readSource("../src/features/landing/landing.css");
  const authCss = await readSource("../src/features/auth/components/auth-shell.css");
  assert.match(source, /useScroll\(\)/);
  assert.match(source, /useReducedMotion\(\)/);
  assert.match(source, /xone-identity-chapters/);
  assert.match(source, /IdentityChapterVisual/);
  assert.match(source, /xone-chapter-workspace/);
  assert.match(source, /xone-chapter-route/);
  assert.match(source, /xone-chapter-signal/);
  assert.match(source, /xone-chapter-boundary/);
  assert.match(source, /AudioWorkflowPreview/);
  assert.match(source, /VideoWorkflowPreview/);
  assert.match(source, /xone-desktop-orbit/);
  assert.match(landingCss, /\.xone-identity-sticky \{ position: sticky/);
  assert.match(landingCss, /@keyframes xone-marquee/);
  assert.match(landingCss, /@keyframes xone-route-packet/);
  assert.match(landingCss, /@keyframes xone-boundary-pulse/);
  assert.match(landingCss, /prefers-reduced-motion: reduce/);
  assert.match(authCss, /prefers-reduced-motion: reduce/);
});
