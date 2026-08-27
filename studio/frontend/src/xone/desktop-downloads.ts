// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

export type DesktopTarget =
  | "macos-arm64"
  | "macos-x64"
  | "windows-x64"
  | "linux-deb-x64"
  | "linux-appimage-x64";

export type DesktopDownload = {
  id: DesktopTarget;
  platform: "macOS" | "Windows" | "Linux";
  architecture: string;
  format: string;
  filename: string;
  href: string;
};

export const XONE_RELEASES_URL = "https://github.com/abhishekpandaOfficial/XOne/releases";
export const XONE_LATEST_RELEASE_URL = `${XONE_RELEASES_URL}/latest`;

const latestAsset = (filename: string) =>
  `/downloads/${encodeURIComponent(filename)}`;

export const XONE_CHECKSUMS_URL = latestAsset("SHA256SUMS.txt");

export const XONE_DESKTOP_DOWNLOADS: DesktopDownload[] = [
  {
    id: "macos-arm64",
    platform: "macOS",
    architecture: "Apple Silicon",
    format: ".dmg",
    filename: "XOne-Desktop-macOS-Apple-Silicon.dmg",
    href: latestAsset("XOne-Desktop-macOS-Apple-Silicon.dmg"),
  },
  {
    id: "macos-x64",
    platform: "macOS",
    architecture: "Intel",
    format: ".dmg",
    filename: "XOne-Desktop-macOS-Intel.dmg",
    href: latestAsset("XOne-Desktop-macOS-Intel.dmg"),
  },
  {
    id: "windows-x64",
    platform: "Windows",
    architecture: "x64",
    format: ".exe",
    filename: "XOne-Desktop-Windows-x64.exe",
    href: latestAsset("XOne-Desktop-Windows-x64.exe"),
  },
  {
    id: "linux-deb-x64",
    platform: "Linux",
    architecture: "Debian / Ubuntu x64",
    format: ".deb",
    filename: "XOne-Desktop-Linux-x64.deb",
    href: latestAsset("XOne-Desktop-Linux-x64.deb"),
  },
  {
    id: "linux-appimage-x64",
    platform: "Linux",
    architecture: "Portable x64",
    format: "AppImage",
    filename: "XOne-Desktop-Linux-x64.AppImage",
    href: latestAsset("XOne-Desktop-Linux-x64.AppImage"),
  },
];

type NavigatorWithArchitecture = Navigator & {
  userAgentData?: {
    getHighEntropyValues?: (
      hints: string[],
    ) => Promise<{ architecture?: string; bitness?: string }>;
  };
};

export async function detectDesktopTarget(): Promise<DesktopTarget | null> {
  if (typeof navigator === "undefined") return null;

  const client = navigator as NavigatorWithArchitecture;
  const identity = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;

  if (/Mac|iPhone|iPad/i.test(identity)) {
    try {
      const hints = await client.userAgentData?.getHighEntropyValues?.([
        "architecture",
        "bitness",
      ]);
      if (/x86/i.test(hints?.architecture ?? "")) return "macos-x64";
    } catch {
      // Browser architecture hints are optional; current Macs default to Apple Silicon.
    }
    return "macos-arm64";
  }

  if (/Win/i.test(identity)) return "windows-x64";
  if (/Linux|X11/i.test(identity)) return "linux-deb-x64";
  return null;
}
