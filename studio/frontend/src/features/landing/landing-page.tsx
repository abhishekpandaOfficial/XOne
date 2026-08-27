// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import { Link } from "@tanstack/react-router";
import { GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight,
  AudioLines,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Clapperboard,
  Command,
  Copy,
  Cpu,
  Download,
  Globe2,
  Laptop,
  LockKeyhole,
  MonitorUp,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Terminal,
  WandSparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import {
  detectDesktopTarget,
  type DesktopTarget,
  XONE_BRAND,
  XONE_CHECKSUMS_URL,
  XONE_DESKTOP_DOWNLOADS,
  XONE_LATEST_RELEASE_URL,
  XONE_LINKS,
} from "@/xone";
import "./landing.css";
const SOURCE_SETUP = `git clone --branch xone/main https://github.com/abhishekpandaOfficial/XOne.git
cd XOne
./install.sh --local
xone studio`;


function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      src={XONE_BRAND.icons.app}
      alt="X1"
      className={`xone-mark ${className}`}
    />
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 42 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function CopyCommand({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" className="xone-copy-button" onClick={() => void copy()}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function AnalyticsPreview() {
  const points = [26, 38, 33, 54, 47, 68, 61, 82, 76, 91, 86, 96];
  return (
    <div className="xone-console xone-analytics-preview" aria-label="Animated local analytics preview">
      <div className="xone-console-bar">
        <div className="xone-window-dots" aria-hidden="true"><i /><i /><i /></div>
        <span>Local inference · live</span>
        <span className="xone-live-pill"><CircleDot size={11} /> private</span>
      </div>
      <div className="xone-metric-strip">
        <div><span>Requests</span><strong>Streaming</strong></div>
        <div><span>Token flow</span><strong>Measured locally</strong></div>
        <div><span>Provider</span><strong>On device</strong></div>
      </div>
      <div className="xone-chart-shell">
        <div className="xone-chart-grid" aria-hidden="true" />
        <svg viewBox="0 0 600 210" role="img" aria-label="Illustrative request throughput trend">
          <defs>
            <linearGradient id="xoneChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9b87f5" stopOpacity=".42" />
              <stop offset="1" stopColor="#9b87f5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={`M 0 190 ${points.map((point, index) => `L ${index * 54.5} ${198 - point * 1.72}`).join(" ")} L 600 210 L 0 210 Z`}
            fill="url(#xoneChartFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          />
          <motion.path
            d={`M ${points.map((point, index) => `${index * 54.5} ${198 - point * 1.72}`).join(" L ")}`}
            fill="none"
            stroke="#b5a7ff"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          />
        </svg>
        <div className="xone-chart-pulse" aria-hidden="true" />
      </div>
      <div className="xone-trace-row">
        <span className="xone-trace-status" />
        <code>POST /v1/chat/completions</code>
        <span>routed locally</span>
      </div>
    </div>
  );
}

function RoutingPreview() {
  const models = ["Reasoning", "Fast chat", "Vision"];
  return (
    <div className="xone-router-preview" aria-label="Animated model routing preview">
      <div className="xone-router-input">
        <Sparkles size={16} /> One request
      </div>
      <div className="xone-router-lines" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="xone-router-core">
        <BrandMark />
        <span>Policy router</span>
      </div>
      <div className="xone-router-models">
        {models.map((model, index) => (
          <motion.div
            key={model}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 }}
          >
            <span>{model}</span>
            <small>{index === 0 ? "selected" : "available"}</small>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TokenPreview() {
  const tokens = ["Private", " models", " route", " every", " token", " locally", "."];
  return (
    <div className="xone-token-preview" aria-label="Animated tokenizer preview">
      <div className="xone-token-header">
        <span><Command size={14} /> Token stream</span>
        <code>UTF-8 → IDs → context</code>
      </div>
      <div className="xone-token-sentence">
        {tokens.map((token, index) => (
          <motion.span
            key={`${token}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.7 }}
            transition={{ delay: index * 0.09 }}
            style={{ "--token-index": index } as CSSProperties}
          >
            {token}
            <small>{1042 + index * 619}</small>
          </motion.span>
        ))}
      </div>
      <div className="xone-context-track"><i /></div>
      <div className="xone-token-footer"><span>Context assembled</span><span>kept on device</span></div>
    </div>
  );
}

function AudioWorkflowPreview() {
  return (
    <div className="xone-audio-workflow" aria-label="Animated X1 audio generation workflow">
      <div className="xone-media-toolbar"><span><AudioLines size={14} /> X1 AUDIO TRACK</span><small>LOCAL · 48 kHz</small></div>
      <div className="xone-waveform" aria-hidden="true">
        {Array.from({ length: 42 }, (_, index) => <i key={index} style={{ "--wave": index, "--wave-height": `${12 + (index % 8) * 6}px` } as CSSProperties} />)}
        <span className="xone-audio-playhead" />
      </div>
      <div className="xone-audio-timeline"><span>00:00</span><b><i /></b><span>00:24</span></div>
      <div className="xone-audio-layers">
        <div><span>VOICE</span><strong>Speech synthesis</strong><em>ready</em></div>
        <div><span>STT</span><strong>Local transcription</strong><em>synced</em></div>
        <div><span>MIX</span><strong>Export track</strong><em>lossless</em></div>
      </div>
    </div>
  );
}

function VideoWorkflowPreview() {
  return (
    <div className="xone-video-workflow" aria-label="Animated X1 video generation workflow">
      <div className="xone-media-toolbar"><span><Clapperboard size={14} /> X1 VIDEO SEQUENCE</span><small>GENERATING LOCALLY</small></div>
      <div className="xone-video-stage">
        <div className="xone-video-frame"><BrandMark /><span className="xone-video-scan" /><strong>FRAME 018</strong></div>
        <div className="xone-video-prompt"><WandSparkles size={14} /><span><small>PROMPT ROUTE</small>Private cinematic product motion</span></div>
      </div>
      <div className="xone-frame-strip" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <i key={index} style={{ "--frame": index, "--frame-position": `${25 + index * 8}%` } as CSSProperties} />)}
      </div>
      <div className="xone-render-progress"><span>Temporal pass</span><b><i /></b><strong>72%</strong></div>
    </div>
  );
}

function IdentityChapterVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="xone-chapter-visual xone-chapter-workspace" aria-hidden="true">
        <div className="xone-chapter-core"><BrandMark /></div>
        <span className="xone-workspace-node node-chat"><Sparkles /> Chat</span>
        <span className="xone-workspace-node node-train"><Workflow /> Train</span>
        <span className="xone-workspace-node node-create"><Clapperboard /> Create</span>
        <span className="xone-workspace-node node-serve"><Terminal /> Serve</span>
        <i /><i />
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="xone-chapter-visual xone-chapter-route" aria-hidden="true">
        <span className="xone-route-source">TASK</span>
        <div className="xone-route-paths"><i /><i /><i /></div>
        <div className="xone-route-core"><Route /><BrandMark /></div>
        <div className="xone-route-targets"><span>LOCAL <b>01</b></span><span>FAST <b>02</b></span><span>DEEP <b>03</b></span></div>
        <em className="xone-route-packet" />
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="xone-chapter-visual xone-chapter-signal" aria-hidden="true">
        <div className="xone-signal-head"><CircleDot /> LIVE <span>24ms</span></div>
        <div className="xone-signal-bars">{[24, 42, 31, 68, 48, 82, 58, 92, 64, 78, 52, 88].map((height, bar) => <i key={bar} style={{ "--signal-height": `${height}%`, "--signal-delay": `${bar * -.11}s` } as CSSProperties} />)}</div>
        <div className="xone-signal-metrics"><span>TOKENS<strong>8.4K</strong></span><span>ROUTE<strong>X1-L</strong></span></div>
        <em />
      </div>
    );
  }
  return (
    <div className="xone-chapter-visual xone-chapter-boundary" aria-hidden="true">
      <i /><i /><i />
      <div className="xone-boundary-shield"><ShieldCheck /><BrandMark /><LockKeyhole /></div>
      <span>DEVICE BOUNDARY</span>
      <small>LOCAL · ENCRYPTED</small>
    </div>
  );
}

export function LandingPage() {
  const [recommendedTarget, setRecommendedTarget] = useState<DesktopTarget | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 115, damping: 28, mass: 0.32 });
  const heroMarkY = useTransform(scrollYProgress, [0, 0.22], [0, reduceMotion ? 0 : 130]);
  const heroMarkRotate = useTransform(scrollYProgress, [0, 0.22], [0, reduceMotion ? 0 : 12]);
  useEffect(() => {
    let active = true;
    void detectDesktopTarget().then((target) => {
      if (active) setRecommendedTarget(target);
    });
    return () => {
      active = false;
    };
  }, []);

  const recommended = XONE_DESKTOP_DOWNLOADS.find(
    (download) => download.id === recommendedTarget,
  );

  return (
    <div className="xone-landing">
      <motion.div className="xone-scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="xone-ambient" aria-hidden="true"><i /><i /><i /></div>
      <header className="xone-nav">
        <a href="#top" className="xone-brand-link" aria-label="XOne home">
          <BrandMark />
          <span>XOne</span>
          <small>PRIVATE ALPHA</small>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#platform">Platform</a>
          <a href="#intelligence">Engine</a>
          <a href="#downloads">Download</a>
          <Link to="/docs">Docs</Link>
        </nav>
        <div className="xone-nav-actions">
          <Link to="/login" className="xone-text-link">Sign in</Link>
          <AnimatedThemeToggler className="xone-theme-toggle" aria-label="Toggle light and dark mode" />
          <a href="#downloads" className="xone-button xone-button-light">Get XOne <ArrowRight size={15} /></a>
        </div>
      </header>

      <main id="top">
        <section className="xone-hero">
          <motion.div
            className="xone-hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <div className="xone-eyebrow"><Zap size={14} /> One local AI control plane</div>
            <h1>Every model.<br /><span>One intelligent route.</span></h1>
            <p>
              Run, route, observe, and fine-tune private AI from one refined local workspace.
              XOne brings model operations, token intelligence, and live analytics together—on your machine.
            </p>
            <div className="xone-hero-actions">
              <a href="#downloads" className="xone-button xone-button-primary">Download XOne <Download size={16} /></a>
              <Link to="/login" className="xone-button xone-button-ghost">Open local workspace <ChevronRight size={16} /></Link>
            </div>
            <div className="xone-trust-row">
              <span><ShieldCheck size={15} /> Local-first</span>
              <span><LockKeyhole size={15} /> Private by design</span>
              <span><HugeiconsIcon icon={GithubIcon} size={15} /> Open source</span>
            </div>
          </motion.div>
          <motion.div
            className="xone-hero-visual"
            style={{ y: heroMarkY, rotate: heroMarkRotate }}
            initial={{ opacity: 0, scale: 0.965, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12 }}
          >
            <div className="xone-orbit" aria-hidden="true"><i /><i /><i /></div>
            <AnalyticsPreview />
            <div className="xone-floating-card xone-floating-route"><Route size={15} /><span>Auto route</span><strong>Ready</strong></div>
            <div className="xone-floating-card xone-floating-token"><Workflow size={15} /><span>Token pipeline</span><strong>Local</strong></div>
          </motion.div>
        </section>

        <section className="xone-signal-strip" aria-label="XOne capabilities">
          <div><span>TEXT</span><i /> <span>VISION</span><i /> <span>AUDIO</span><i /> <span>VIDEO</span><i /> <span>AGENTS</span><i /> <span>FINE-TUNING</span><i /> <span>LOCAL API</span></div>
          <div aria-hidden="true"><span>TEXT</span><i /> <span>VISION</span><i /> <span>AUDIO</span><i /> <span>VIDEO</span><i /> <span>AGENTS</span><i /> <span>FINE-TUNING</span><i /> <span>LOCAL API</span></div>
        </section>

        <section className="xone-identity-section" aria-labelledby="xone-identity-title">
          <div className="xone-identity-sticky">
            <motion.div
              className="xone-identity-mark"
              initial={reduceMotion ? false : { opacity: 0, scale: .8, rotate: -8 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: .4 }}
              transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}
            >
              <BrandMark />
              <i aria-hidden="true" />
              <span>ONE</span>
            </motion.div>
            <span className="xone-identity-kicker">THE X1 SYSTEM</span>
            <h2 id="xone-identity-title">One mark.<br />One control plane.<br /><em>Every local workflow.</em></h2>
            <p>The X1 symbol compresses the XOne idea into a single signal: many model paths converging into one private workspace.</p>
          </div>
          <div className="xone-identity-chapters">
            {[
              ["01", "One workspace", "Chat, reason, create, fine-tune, export, and serve without scattering the work across disconnected tools."],
              ["02", "One intelligent route", "Keep the task in focus while XOne exposes the model, runtime, and policy path behind every request."],
              ["03", "One operational signal", "Read token flow, request activity, model state, and runtime health as one continuous local story."],
              ["04", "One private boundary", "The workspace, credentials, and local model activity remain anchored to the installation you control."],
            ].map(([number, title, description], index) => (
              <motion.article
                key={number}
                initial={reduceMotion ? false : { opacity: .18, x: 55 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ amount: .62 }}
                transition={{ duration: .65, delay: index * .035 }}
              >
                <IdentityChapterVisual index={index} />
                <span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRight />
              </motion.article>
            ))}
          </div>
        </section>

        <div className="xone-kinetic-word" aria-hidden="true">
          <motion.span
            initial={reduceMotion ? false : { x: "12%" }}
            whileInView={reduceMotion ? undefined : { x: "-12%" }}
            viewport={{ amount: .2 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          >X1 / ROUTE / OBSERVE / CREATE /</motion.span>
        </div>

        <section id="platform" className="xone-section xone-platform-section">
          <Reveal className="xone-section-heading">
            <span>THE LOCAL AI OPERATING LAYER</span>
            <h2>From prompt to production signal.</h2>
            <p>One workspace for the model lifecycle, with the operational context usually scattered across terminals and dashboards.</p>
          </Reveal>
          <div className="xone-feature-grid">
            <motion.article className="xone-feature-card xone-feature-wide" initial={reduceMotion ? false : { opacity: 0, y: 55 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .8 }}>
              <div className="xone-card-copy"><BarChart3 /><span>01 · Analytics</span><h3>See every request as it happens.</h3><p>Follow local request flow, token activity, model state, and runtime health from one live surface.</p></div>
              <AnalyticsPreview />
            </motion.article>
            <motion.article id="intelligence" className="xone-feature-card" initial={reduceMotion ? false : { opacity: 0, x: -35 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .7 }}>
              <div className="xone-card-copy"><Network /><span>02 · Model routing</span><h3>The right model, without workflow drift.</h3><p>Keep one interface while policies select the local model and runtime suited to the task.</p></div>
              <RoutingPreview />
            </motion.article>
            <motion.article className="xone-feature-card" initial={reduceMotion ? false : { opacity: 0, x: 35 }} whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .7 }}>
              <div className="xone-card-copy"><Cpu /><span>03 · Token intelligence</span><h3>Understand the context you send.</h3><p>Make token flow visible before context pressure becomes a surprise.</p></div>
              <TokenPreview />
            </motion.article>
          </div>
        </section>

        <section className="xone-section xone-capability-section">
          <Reveal className="xone-section-heading xone-heading-left">
            <span>ONE WORKSPACE, MULTIPLE MODALITIES</span>
            <h2>Build with the models your hardware can run.</h2>
          </Reveal>
          <div className="xone-capability-grid">
            {[
              [Sparkles, "Chat & reason", "Private conversations, tools, research, and local inference."],
              [Workflow, "Train & adapt", "Fine-tuning workflows, data recipes, checkpoints, and export."],
              [Globe2, "Connect anything", "OpenAI-compatible APIs, agents, LAN, and secure remote access."],
              [BarChart3, "Observe locally", "Runtime state, requests, costs, tokens, and model residency."],
            ].map(([Icon, title, text]) => {
              const CapabilityIcon = Icon as typeof Sparkles;
              return <motion.article key={title as string} initial={reduceMotion ? false : { opacity: 0, y: 35 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .6 }}><CapabilityIcon /><h3>{title as string}</h3><p>{text as string}</p><ArrowRight /></motion.article>;
            })}
          </div>
        </section>

        <section className="xone-section xone-media-section">
          <Reveal className="xone-section-heading xone-heading-left">
            <span>FROM SIGNAL TO FINISHED MEDIA</span>
            <h2>Hear the timeline.<br />See the generation.</h2>
            <p>X1 keeps audio and video workflows legible while local models move from prompt to track, frames, and export.</p>
          </Reveal>
          <div className="xone-media-grid">
            <motion.article initial={reduceMotion ? false : { opacity: 0, y: 48 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .75 }}>
              <div className="xone-card-copy"><AudioLines /><span>04 · Audio track</span><h3>Voice, transcription, and timing in one view.</h3><p>Generate speech, transcribe recordings, follow the playhead, and prepare a local export without losing the source context.</p></div>
              <AudioWorkflowPreview />
            </motion.article>
            <motion.article initial={reduceMotion ? false : { opacity: 0, y: 48 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .75, delay: .08 }}>
              <div className="xone-card-copy"><Clapperboard /><span>05 · Video generation</span><h3>Watch a prompt become a sequence.</h3><p>Keep generation state, frames, model route, and progress visible as X1 moves a local video task toward completion.</p></div>
              <VideoWorkflowPreview />
            </motion.article>
          </div>
        </section>

        <section className="xone-section xone-desktop-story">
          <Reveal className="xone-desktop-copy">
            <span>X1-STUDIO DESKTOP</span>
            <h2>The local control room that stays with the work.</h2>
            <p>X1-Studio starts and monitors the local backend, keeps the workspace close to your models, and connects chat, media, training, export, and API activity in one desktop surface.</p>
            <div className="xone-desktop-benefits"><span><Check /> Starts the managed local runtime</span><span><Check /> Keeps model and generation state visible</span><span><Check /> Provides one path into every XOne workspace</span></div>
          </Reveal>
          <motion.div className="xone-desktop-orbit" initial={reduceMotion ? false : { opacity: 0, scale: .92 }} whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }} viewport={{ once: true, amount: .35 }} transition={{ duration: .85 }}>
            <div className="xone-desktop-window">
              <div className="xone-desktop-window-bar"><i /><i /><i /><span>X1-Studio</span></div>
              <div className="xone-desktop-window-body"><BrandMark /><span>LOCAL CONTROL PLANE</span><strong>All systems ready</strong><small><CircleDot /> Apple Silicon · private runtime</small></div>
            </div>
            <span className="xone-orbit-node node-model"><Cpu /> Models</span>
            <span className="xone-orbit-node node-media"><Clapperboard /> Media</span>
            <span className="xone-orbit-node node-api"><MonitorUp /> API</span>
          </motion.div>
        </section>

        <section id="downloads" className="xone-section xone-download-section">
          <div className="xone-download-shell">
            <div className="xone-download-copy">
              <span className="xone-status-chip">DESKTOP ALPHA · GITHUB RELEASES</span>
              <h2>{recommended ? `XOne for ${recommended.platform}` : "XOne Desktop for every workstation"}</h2>
              <p>
                {recommended
                  ? `Recommended for this device: ${recommended.architecture} ${recommended.format}. You can choose another build at any time.`
                  : "Choose the macOS, Windows, or Linux build that matches your processor and package manager."}
              </p>
              <div className="xone-download-actions">
                {recommended && (
                  <a className="xone-button xone-button-primary" href={recommended.href}>Download recommended <Download size={16} /></a>
                )}
                <a className="xone-button xone-button-ghost" href={XONE_LATEST_RELEASE_URL} target="_blank" rel="noreferrer">Release notes <ArrowRight size={16} /></a>
                <a className="xone-button xone-button-ghost" href="#docs">Build from source <Terminal size={16} /></a>
              </div>
              <small>Downloads come directly from the official XOne GitHub Release. Verify the file with <a href={XONE_CHECKSUMS_URL}>SHA256SUMS.txt</a>.</small>
            </div>
            <div className="xone-platform-list">
              {XONE_DESKTOP_DOWNLOADS.map((download) => (
                <a key={download.id} href={download.href} className={recommendedTarget === download.id ? "is-recommended" : ""}>
                  <span className="xone-platform-icon"><Laptop size={20} /></span>
                  <span><strong>{download.platform}</strong><small>{download.architecture}</small></span>
                  <span className="xone-platform-format">{download.format}</span>
                  {recommendedTarget === download.id && <em>Recommended</em>}
                  <Download size={17} />
                </a>
              ))}
            </div>
          </div>
          <div className="xone-install-guide">
            <article>
              <span>01 · macOS</span>
              <h3>Open the DMG</h3>
              <p>Drag X1-Studio to Applications, then open it. Alpha builds are ad-hoc signed, so macOS may require <strong>System Settings → Privacy &amp; Security → Open Anyway</strong>.</p>
            </article>
            <article>
              <span>02 · Windows</span>
              <h3>Run the installer</h3>
              <p>Open the downloaded EXE and complete setup. The alpha is currently unsigned, so review the publisher warning before choosing <strong>More info → Run anyway</strong>.</p>
            </article>
            <article>
              <span>03 · Linux</span>
              <h3>Install or run</h3>
              <p>Install the DEB with <code>sudo apt install ./XOne-Desktop-Linux-x64.deb</code>, or mark the AppImage executable and launch it.</p>
            </article>
          </div>
        </section>

        <section id="docs" className="xone-section xone-docs-section">
          <div className="xone-section-heading xone-heading-left">
            <span>START WITH A VERIFIED PATH</span>
            <h2>From source to local workspace.</h2>
            <p>Install the source build, then use the <code>xone</code> command to start and manage X1-Studio.</p>
          </div>
          <div className="xone-docs-grid">
            <div className="xone-code-card">
              <div className="xone-code-title"><Terminal size={15} /><span>macOS · Linux · WSL</span><CopyCommand value={SOURCE_SETUP} label="Copy setup" /></div>
              <pre>{SOURCE_SETUP}</pre>
            </div>
            <div className="xone-doc-links">
              <a href={XONE_LINKS.repository} target="_blank" rel="noreferrer"><HugeiconsIcon icon={GithubIcon} /><span><strong>Source & README</strong><small>Architecture, build commands, status, and attribution.</small></span><ArrowRight /></a>
              <a href={XONE_LINKS.upstreamDocs} target="_blank" rel="noreferrer"><BookOpen /><span><strong>Runtime documentation</strong><small>Model, training, serving, export, and agent guides.</small></span><ArrowRight /></a>
              <a href={XONE_LINKS.issues} target="_blank" rel="noreferrer"><CircleDot /><span><strong>Issues & support</strong><small>Report reproducible XOne problems in the project repository.</small></span><ArrowRight /></a>
            </div>
          </div>
        </section>

        <section className="xone-section xone-auth-section">
          <div>
            <BrandMark />
            <span>YOUR LOCAL WORKSPACE</span>
            <h2>One identity surface.<br />No false promises.</h2>
            <p>Use your device-local password today. Google, GitHub, and email accounts will activate only when the cloud identity service and provider credentials are configured.</p>
          </div>
          <div className="xone-auth-card">
            <div className="xone-auth-provider-row"><button disabled aria-label="Google login coming soon"><HugeiconsIcon icon={GoogleIcon} size={17} /> Google <small>Coming soon</small></button><button disabled aria-label="GitHub login coming soon"><HugeiconsIcon icon={GithubIcon} size={17} /> GitHub <small>Coming soon</small></button></div>
            <div className="xone-auth-divider"><span>available now</span></div>
            <Link to="/login" className="xone-button xone-button-primary">Continue with local password <ArrowRight size={16} /></Link>
            <p><LockKeyhole size={13} /> Credentials stay with this XOne installation.</p>
          </div>
        </section>
      </main>

      <footer className="xone-footer">
        <div className="xone-brand-link"><BrandMark /><span>XOne</span></div>
        <p>X1 is the compact mark. XOne is the product.</p>
        <div><a href={XONE_LINKS.repository} target="_blank" rel="noreferrer">GitHub</a><a href={XONE_LINKS.license} target="_blank" rel="noreferrer">License</a><a href={XONE_LINKS.copying} target="_blank" rel="noreferrer">Notices</a></div>
      </footer>
    </div>
  );
}
