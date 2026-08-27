// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import {
  ArrowRight, BookOpen, Boxes, BrainCircuit, CheckCircle2, ChevronRight,
  CircleGauge, DatabaseZap, Download, GitBranch, KeyRound, Network,
  ServerCog, ShieldCheck, Terminal, Workflow,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { XONE_BRAND, XONE_LINKS } from "@/xone";
import "./xone-docs.css";

const sections = [
  ["Overview", "#overview", BookOpen], ["Install & run", "#install", Download],
  ["Models", "#models", BrainCircuit], ["MCP & agents", "#mcp", Network],
  ["RAG & knowledge", "#rag", DatabaseZap], ["Train & export", "#train", Workflow],
  ["Serve & operate", "#operate", ServerCog],
] as const;

const capabilities = [
  ["Local inference", "Load supported local runtimes with hardware-aware defaults.", BrainCircuit],
  ["Knowledge systems", "Bring private documents into grounded workflows with retrieval and citations.", DatabaseZap],
  ["Tool networks", "Connect MCP servers and coding agents while keeping credentials under your control.", Network],
  ["Lifecycle operations", "Train adapters, export artifacts, and observe the local API.", CircleGauge],
] as const;

function CodeBlock({ children }: { children: string }) {
  return <pre className="xone-docs-code"><code>{children}</code></pre>;
}

export function XOneDocsPage() {
  return (
    <div className="xone-docs-page">
      <header className="xone-docs-header">
        <Link to="/" className="xone-docs-brand" aria-label="XOne home"><img src={XONE_BRAND.icons.app} alt="" /><span>XOne</span></Link>
        <div className="xone-docs-header-actions"><Link to="/" className="xone-docs-header-link">Product</Link><a href={XONE_LINKS.repository} target="_blank" rel="noreferrer" className="xone-docs-header-link">Source <ArrowRight size={14} /></a><AnimatedThemeToggler className="xone-docs-theme-toggle" aria-label="Toggle light and dark mode" /><Link to="/login" className="xone-docs-header-button">Open workspace <ChevronRight size={15} /></Link></div>
      </header>
      <div className="xone-docs-layout">
        <aside className="xone-docs-sidebar"><span className="xone-docs-eyebrow">X1 SYSTEM DOCUMENTATION</span><strong>Build on your own infrastructure.</strong><nav aria-label="XOne documentation sections">{sections.map(([label, href, Icon]) => <a href={href} key={label}><Icon size={15} />{label}<ChevronRight size={13} /></a>)}</nav><div className="xone-docs-sidebar-note"><ShieldCheck size={15} /><span>Local-first by default. Cloud connectivity is opt-in.</span></div></aside>
        <main className="xone-docs-main">
          <section id="overview" className="xone-docs-hero"><div><span className="xone-docs-kicker"><GitBranch size={14} /> XONE DOCS · PRIVATE AI OPERATIONS</span><h1>One control plane for models, knowledge, and agents.</h1><p>XOne is a local AI workspace for running models, grounding answers in private data, connecting tools through MCP, and moving from experiment to an observable API.</p><div className="xone-docs-hero-actions"><Link to="/" className="xone-docs-primary"><Download size={16} /> Download XOne</Link><a href="#install" className="xone-docs-secondary"><Terminal size={16} /> Start from a terminal</a></div></div><div className="xone-docs-signal"><div className="xone-docs-signal-top"><span><i /> X1 CONTROL PLANE</span><code>LOCAL / READY</code></div><div className="xone-docs-signal-core"><img src={XONE_BRAND.icons.app} alt="" /><strong>Private by design</strong><small>Models, tools, and context remain observable.</small></div><div className="xone-docs-signal-grid"><span><CheckCircle2 /> Runtime</span><span><CheckCircle2 /> Retrieval</span><span><CheckCircle2 /> Tooling</span><span><CheckCircle2 /> API</span></div></div></section>
          <section className="xone-docs-section xone-docs-capabilities"><div className="xone-docs-section-heading"><span>THE OPERATING MODEL</span><h2>Designed for the complete local loop.</h2><p>Use the same workspace to discover a model, prepare context, call tools, evaluate outputs, and ship a controlled endpoint.</p></div><div className="xone-docs-capability-grid">{capabilities.map(([title, text, Icon]) => <article key={title}><Icon size={19} /><h3>{title}</h3><p>{text}</p><ArrowRight size={15} /></article>)}</div></section>
          <section id="install" className="xone-docs-section xone-docs-split"><div className="xone-docs-copy"><span className="xone-docs-kicker"><Download size={14} /> 01 · INSTALL & RUN</span><h2>Get a local control plane in minutes.</h2><p>Use the XOne CLI for a managed install, then open the web workspace or launch the desktop runtime. The command is intentionally named <code>xone</code> throughout the product.</p><div className="xone-docs-checks"><span><CheckCircle2 /> Local install and updates</span><span><CheckCircle2 /> API-compatible serving</span><span><CheckCircle2 /> Hardware-aware model loading</span></div></div><div className="xone-docs-code-stack"><CodeBlock>{`# macOS, Linux, or WSL
curl -fsSL https://raw.githubusercontent.com/abhishekpandaOfficial/XOne/main/install.sh | sh

# Start the local workspace
xone studio`}</CodeBlock><CodeBlock>{`# Windows PowerShell
irm https://raw.githubusercontent.com/abhishekpandaOfficial/XOne/main/install.ps1 | iex

# Start the local workspace
xone studio`}</CodeBlock></div></section>
          <section id="models" className="xone-docs-section xone-docs-split xone-docs-reverse"><div className="xone-docs-panel"><div className="xone-docs-panel-header"><Boxes size={16} /> MODEL REGISTRY <span>LOCAL + HUB</span></div>{[["Qwen family", "Reasoning · chat · vision", "READY"], ["Gemma family", "Efficient local assistants", "READY"], ["Custom GGUF", "Bring your own checkpoint", "IMPORT"]].map(([name, detail, state]) => <div className="xone-docs-model-row" key={name}><strong>{name}</strong><small>{detail}</small><b>{state}</b></div>)}</div><div className="xone-docs-copy"><span className="xone-docs-kicker"><BrainCircuit size={14} /> 02 · MODELS</span><h2>Choose by task, hardware, and context.</h2><p>Start with a chat or instruct checkpoint, prefer a smaller model while iterating, and scale when quality and context requirements justify it. XOne keeps model identity, quantization, residency, and runtime state visible.</p><a className="xone-docs-inline-link" href="#operate">Read the serving contract <ArrowRight size={15} /></a></div></section>
          <section id="mcp" className="xone-docs-section xone-docs-split"><div className="xone-docs-copy"><span className="xone-docs-kicker"><Network size={14} /> 03 · MCP & AGENTS</span><h2>Give agents tools without giving up control.</h2><p>Model Context Protocol servers expose focused capabilities such as documentation search, repositories, or data systems. Enable only the servers a workspace needs, review tool calls, and keep secrets in the local credential boundary.</p><div className="xone-docs-callout"><KeyRound size={17} /><span><strong>Operational rule</strong> Treat every tool as a capability boundary. Start with read-only access, then expand deliberately.</span></div></div><div className="xone-docs-terminal-card"><div><span><i /><i /><i /></span><small>xone / agent bridge</small></div><CodeBlock>{`xone start claude

MCP server: XOne Docs
transport: streamable HTTP
tools: search, fetch
policy: local approval`}</CodeBlock></div></section>
          <section id="rag" className="xone-docs-section xone-docs-rag"><div className="xone-docs-section-heading"><span>04 · RAG & KNOWLEDGE</span><h2>Ground answers in the material your team trusts.</h2><p>RAG is a workflow: ingest authoritative sources, retrieve the smallest useful context, cite it in the response, and measure retrieval quality separately from model quality.</p></div><div className="xone-docs-rag-flow">{[[DatabaseZap, "Ingest", "PDF, DOCX, CSV, URLs"], [Network, "Retrieve", "Scoped semantic context"], [BrainCircuit, "Generate", "Answer with citations"], [CircleGauge, "Evaluate", "Trace quality and drift"]].map(([Icon, title, detail], index) => <span key={title as string}><Icon /><strong>{title as string}</strong><small>{detail as string}</small>{index < 3 && <ArrowRight />}</span>)}</div></section>
          <section id="train" className="xone-docs-section xone-docs-split"><div className="xone-docs-copy"><span className="xone-docs-kicker"><Workflow size={14} /> 05 · TRAIN & EXPORT</span><h2>Adapt models, then ship the artifact.</h2><p>Use LoRA or QLoRA for efficient adaptation, inspect loss and evaluation behavior, and export a checkpoint for the runtime you intend to operate. Dataset formatting and validation remain first-class steps.</p></div><div className="xone-docs-metric-card"><span>MODEL LIFECYCLE</span><div><b>01</b><strong>Prepare dataset</strong><small>Schema, splits, quality</small></div><div><b>02</b><strong>Train adapter</strong><small>LoRA, QLoRA, full tuning</small></div><div><b>03</b><strong>Export & serve</strong><small>GGUF, API, local runtime</small></div></div></section>
          <section id="operate" className="xone-docs-section xone-docs-operate"><div className="xone-docs-section-heading"><span>06 · SERVE & OPERATE</span><h2>Make local inference observable.</h2><p>XOne exposes an OpenAI-compatible path for applications and agents. Keep the server on loopback for private use, or deliberately configure a protected network boundary.</p></div><CodeBlock>{`# Run a local API
xone studio --api-only --secure -p 8888

# OpenAI-compatible request
curl http://127.0.0.1:8888/v1/chat/completions \\
  -H 'Content-Type: application/json' \\
  -d '{"model":"local-model","messages":[{"role":"user","content":"Hello"}]}'`}</CodeBlock><div className="xone-docs-footer-note"><ShieldCheck size={16} /><span>Security baseline: loopback first, explicit credentials, auditable tools, and no cloud dependency for the local path.</span></div></section>
        </main>
      </div>
    </div>
  );
}
