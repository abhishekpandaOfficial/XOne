// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { apiUrl } from "@/lib/api-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XONE_BRAND } from "@/xone";
import { GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { SyntheticEvent } from "react";
import { refreshSession } from "../api";

import {
  getPostAuthRoute,
  hasAuthToken,
  hasRefreshToken,
  mustChangePassword,
  setMustChangePassword,
  storeAuthTokens,
} from "../session";

type AuthMode = "login" | "change-password";

type AuthStatusResponse = {
  initialized: boolean;
  requires_password_change: boolean;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  must_change_password: boolean;
};

async function loginWithPassword(
  username: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  const response = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      email: email.trim(),
      password,
    }),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(errorPayload?.detail ?? "Login failed.");
  }

  return (await response.json()) as TokenResponse;
}

type AuthFormProps = {
  mode: AuthMode;
};

const HIDDEN_LOGIN_USERNAME = "unsloth";
const RESET_PASSWORD_COMMAND = "xone studio reset-password";

function PasswordRecovery() {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(RESET_PASSWORD_COMMAND);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <details className="group rounded-2xl border border-violet-400/20 bg-violet-400/[0.055] p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground">
        <KeyRound className="h-4 w-4 text-violet-300" />
        I don&apos;t know the current password
        <span className="ml-auto text-xs text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 space-y-3 border-t border-white/10 pt-3 text-xs leading-5 text-muted-foreground">
        <p>Reset this installation from a terminal, choose a new password, then return here and refresh.</p>
        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-2.5">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[11px] text-violet-200">{RESET_PASSWORD_COMMAND}</code>
          <button type="button" onClick={() => void copyCommand()} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-foreground hover:bg-white/5">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p>You do not need the old password to run this XOne recovery command.</p>
      </div>
    </details>
  );
}

export function AuthForm({ mode }: AuthFormProps): ReactElement | null {
  const navigate = useNavigate();
  const isLoginMode = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const username = HIDDEN_LOGIN_USERNAME;
  const [email, setEmail] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "password">("email");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reloadReadySent = useRef(false);

  useEffect(() => {
    let canceled = false;

    async function initializeAuthForm(): Promise<void> {
      // Always check the server first; localStorage flags can be stale (e.g.
      // tokens from a previous install). /api/auth/status is the source of
      // truth for requires_password_change.
      try {
        const response = await fetch(apiUrl("/api/auth/status"));
        if (!response.ok) throw new Error("Failed to load auth status.");
        const result = (await response.json()) as AuthStatusResponse;
        if (!canceled) {
          setInitialized(result.initialized);
          setRequiresPasswordChange(result.requires_password_change);

          // Server truth wins; keep localStorage in sync both ways.
          if (result.requires_password_change !== mustChangePassword()) {
            setMustChangePassword(result.requires_password_change);
          }

          // Redirect between login / change-password per server state
          if (mode === "login" && result.requires_password_change) {
            navigate({ to: "/change-password" });
            return;
          }
          if (mode === "change-password" && !result.requires_password_change) {
            navigate({ to: "/login" });
            return;
          }

          // On login, skip to the app if a valid session exists and no
          // password change is required.
          if (isLoginMode && !result.requires_password_change) {
            if (hasRefreshToken()) {
              const refreshed = await refreshSession();
              if (refreshed) {
                if (!canceled) setStatusLoading(false);
                navigate({ to: getPostAuthRoute() });
                return;
              }
            }
            if (hasAuthToken()) {
              if (!canceled) setStatusLoading(false);
              navigate({ to: getPostAuthRoute() });
              return;
            }
          }
        }
      } catch (err: unknown) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : "Failed to load.");
        }
      } finally {
        if (!canceled) setStatusLoading(false);
      }
    }

    void initializeAuthForm();

    return () => {
      canceled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (statusLoading || reloadReadySent.current) return;
    reloadReadySent.current = true;
    window.dispatchEvent(new Event("unsloth:app-shell-ready"));
  }, [statusLoading]);

  const blockedByState =
    initialized === false ||
    (mode === "login" && requiresPasswordChange) ||
    (mode === "change-password" && !requiresPasswordChange);

  let helperText: string | null = null;
  if (initialized === false) {
    helperText = "XOne is preparing profile storage.";
  } else if (isLoginMode && requiresPasswordChange) {
    helperText = "Create your local profile before signing in.";
  } else if (!isLoginMode && !requiresPasswordChange) {
    helperText = "Password already updated. Use the login screen.";
  }
  const title = authStep === "email"
    ? (isLoginMode ? "Welcome back" : "Create your XOne profile")
    : (isLoginMode ? "Enter your password" : "Protect your workspace");
  const subtitle = authStep === "email"
    ? "Start with the email for this local XOne profile."
    : (isLoginMode
      ? "Use the local password connected to this email."
      : "Choose one private password. No current or confirmation password is required.");
  const submitLabel = authStep === "email"
    ? "Continue with email"
    : (isLoginMode ? "Open XOne" : "Create profile");
  const showSwitchLink = !isLoginMode;
  const switchText = "Already created your profile? ";
  const switchLinkTo = "/login";
  const switchLinkText = "Back to login";
  const invalidChangePasswordForm =
    !isLoginMode &&
    (newPassword.length < 8 ||
      /\s/.test(newPassword));
  const showWhitespaceWarning = !isLoginMode && /\s/.test(newPassword);
  const emailIsValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (authStep === "email") {
      if (!emailIsValid) {
        setError("Enter a valid email address.");
        return;
      }
      setAuthStep("password");
      return;
    }

    if (!isLoginMode) {
      // Mirror the disable gate: Enter / autofill can bypass the button.
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (/\s/.test(newPassword)) {
        setError("New password cannot contain spaces.");
        return;
      }
    }

    setLoading(true);
    try {
      let token: TokenResponse;

      if (isLoginMode) {
        token = await loginWithPassword(username, email, password);
      } else {
        const response = await fetch(apiUrl("/api/auth/local-initial-password"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-XOne-Local-Setup": "1",
          },
          body: JSON.stringify({
            email: email.trim(),
            new_password: newPassword,
          }),
        });

        if (!response.ok) {
          let message = "Password update failed.";
          const errorPayload = (await response
            .json()
            .catch(() => null)) as { detail?: string } | null;
          if (errorPayload?.detail) message = errorPayload.detail;
          throw new Error(message);
        }

        token = (await response.json()) as TokenResponse;
      }

      if (!isLoginMode) {
        setRequiresPasswordChange(false);
        setMustChangePassword(false);
      } else {
        setMustChangePassword(token.must_change_password);
      }
      storeAuthTokens(token.access_token, token.refresh_token);
      navigate({ to: getPostAuthRoute() });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Auth failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (statusLoading && initialized === null && error === null) return null;

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <img src={XONE_BRAND.icons.app} alt="X1" className="mb-5 h-14 w-14 rounded-[22%] object-cover shadow-2xl" />
        <p className="text-[10px] font-semibold tracking-[0.16em] text-violet-300">XONE LOCAL IDENTITY</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" disabled aria-label="Google login coming soon" className="h-11 justify-start gap-2 rounded-xl border-white/10 bg-white/[0.025] text-muted-foreground"><HugeiconsIcon icon={GoogleIcon} size={17} /> Google <small className="ml-auto text-[8px]">Soon</small></Button>
        <Button type="button" variant="outline" disabled aria-label="GitHub login coming soon" className="h-11 justify-start gap-2 rounded-xl border-white/10 bg-white/[0.025] text-muted-foreground"><HugeiconsIcon icon={GithubIcon} size={17} /> GitHub <small className="ml-auto text-[8px]">Soon</small></Button>
      </div>
      <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.13em] text-muted-foreground"><span className="h-px flex-1 bg-border" />Available now<span className="h-px flex-1 bg-border" /></div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {authStep === "email" ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
              <Input id="email" type="email" className="xone-auth-input h-12 pl-10" autoComplete="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">This identifies the profile on this XOne installation.</p>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => { setAuthStep("email"); setError(null); }} className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left text-xs text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /><span className="min-w-0 flex-1 truncate">{email.trim()}</span><small>Change</small>
            </button>
            <div className="space-y-2">
              <Label htmlFor={isLoginMode ? "password" : "new-password"}>{isLoginMode ? "Password" : "Create password"}</Label>
              <div className="relative">
                <Input
                  id={isLoginMode ? "password" : "new-password"}
                  type={(isLoginMode ? showPassword : showNewPassword) ? "text" : "password"}
                  className="xone-auth-input h-12 pr-10"
                  autoComplete={isLoginMode ? "current-password" : "new-password"}
                  autoFocus
                  value={isLoginMode ? password : newPassword}
                  onChange={(event) => isLoginMode ? setPassword(event.target.value) : setNewPassword(event.target.value)}
                  minLength={8}
                  required
                  placeholder={isLoginMode ? "Enter your password" : "At least 8 characters"}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent" onClick={() => isLoginMode ? setShowPassword((prev) => !prev) : setShowNewPassword((prev) => !prev)}>
                  {(isLoginMode ? showPassword : showNewPassword) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {!isLoginMode && <p className={`min-h-4 text-xs ${showWhitespaceWarning ? "text-destructive" : "text-muted-foreground"}`} aria-live="polite">{showWhitespaceWarning ? "Password cannot contain spaces." : "Must be at least 8 characters."}</p>}
          </>
        )}

        {helperText && (
          <p className="text-center text-sm text-amber-600">{helperText}</p>
        )}
        {error && (
          <p className="text-center text-sm text-destructive [overflow-wrap:anywhere]">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="flex h-11 w-full rounded-xl bg-gradient-to-r from-white to-violet-200 text-neutral-950 hover:from-white hover:to-violet-100"
          disabled={
            loading ||
            statusLoading ||
            blockedByState ||
            (authStep === "email" ? !emailIsValid : (isLoginMode ? password.length < 8 : invalidChangePasswordForm))
          }
        >
          {loading ? "Please wait..." : submitLabel}
        </Button>
      </form>

      {isLoginMode && authStep === "password" && <PasswordRecovery />}

      <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground"><LockKeyhole className="h-3 w-3" /> Password authentication is local to this installation.</p>

      {showSwitchLink && (
        <p className="text-center text-sm text-muted-foreground">
          {switchText}
          <Link to={switchLinkTo} className="text-primary hover:underline">
            {switchLinkText}
          </Link>
        </p>
      )}
    </div>
  );
}
