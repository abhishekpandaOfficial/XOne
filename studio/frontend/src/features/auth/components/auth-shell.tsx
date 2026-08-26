// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { Link } from "@tanstack/react-router";
import { Activity, ArrowLeft, LockKeyhole, Route, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { XONE_BRAND } from "@/xone";
import "./auth-shell.css";

export function AuthShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "change-password";
}) {
  const isSetup = mode === "change-password";

  return (
    <main className="xone-auth-shell">
      <div className="xone-auth-aurora" aria-hidden="true"><i /><i /></div>
      <section className="xone-auth-story">
        <Link to="/" className="xone-auth-back"><ArrowLeft size={14} /> Back to XOne</Link>
        <div className="xone-auth-wordmark">
          <img src={XONE_BRAND.icons.app} alt="X1" />
          <span>XOne</span>
          <small>PRIVATE ALPHA</small>
        </div>
        <div className="xone-auth-story-copy">
          <span>{isSetup ? "CREATE YOUR XONE PROFILE" : "LOCAL WORKSPACE ACCESS"}</span>
          <h1>{isSetup ? "Your workspace.\nYour identity." : "Private AI starts\nwith local control."}</h1>
          <p>
            {isSetup
              ? "Choose a new local password directly—there is no generated current password to find or enter."
              : "Sign in to the XOne workspace running on this device. Your local password never becomes a cloud identity."}
          </p>
        </div>
        <div className="xone-auth-signals">
          <div><Activity /><span>Runtime</span><strong>Local</strong></div>
          <div><Route /><span>Model route</span><strong>Private</strong></div>
          <div><ShieldCheck /><span>Session</span><strong>Protected</strong></div>
        </div>
        <p className="xone-auth-footnote"><LockKeyhole size={13} /> Device-local authentication</p>
      </section>
      <section className="xone-auth-form-side">
        <div className="xone-auth-form-card">{children}</div>
      </section>
    </main>
  );
}
