/* Shared editorial prose styles (the `.bp-prose` system from BlogPost).
   Extracted so the legal pages (Privacy, Terms, Refund) render with the exact
   same single-blog-post design: Fraunces serif headings, Barlow body, warm
   paper, sharp flat cards, restrained red accent links. Uses the SAME style
   id ('bp-styles') as BlogPost, so the two are interchangeable and never
   double-inject. */
import { useEffect } from 'react'

const SERIF = "'Fraunces', Georgia, serif"
const SANS  = "'Barlow', system-ui, sans-serif"

export function useProseStyles() {
  useEffect(() => {
    if (document.getElementById('bp-styles')) return
    const style = document.createElement('style')
    style.id = 'bp-styles'
    style.textContent = `
      :root {
        --yte-bg: #f6f4ef; --yte-bg-2: #efece4; --yte-surface: #ffffff;
        --yte-ink: #14130f; --yte-soft: #5c574e; --yte-muted: #8a8378;
        --yte-line: rgba(20,19,15,0.12); --yte-line-2: rgba(20,19,15,0.22);
        --yte-accent: #e5302a; --yte-accent-soft: rgba(229,48,42,0.07); --yte-dark: #0d0d12;
      }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; scroll-padding-top: 84px; }
      body { background: var(--yte-bg); color: var(--yte-ink); font-family: ${SANS}; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
      @keyframes bpFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }

      .bp-eyebrow { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 22px; }
      .bp-eyebrow-rule { width: 26px; height: 1px; background: var(--yte-accent); }
      .bp-eyebrow-text { font-family: ${SANS}; font-size: 11px; font-weight: 600; color: var(--yte-accent); text-transform: uppercase; letter-spacing: 0.18em; }

      .bp-h1 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.06; color: var(--yte-ink); }
      .bp-h1 em { font-style: italic; color: var(--yte-accent); }
      .bp-h2 { font-family: ${SERIF}; font-weight: 400; letter-spacing: -0.01em; line-height: 1.08; color: var(--yte-ink); }
      .bp-h2 em { font-style: italic; color: var(--yte-accent); }

      /* Byline */
      .bp-byline { text-align: center; position: relative; }
      .bp-byline-rule { width: 28px; height: 1px; background: var(--yte-accent); margin: 0 auto 16px; }
      .bp-byline-author { font-family: ${SANS}; font-size: 14px; font-weight: 600; color: var(--yte-ink); letter-spacing: 0.01em; margin: 0; line-height: 1.3; }
      .bp-byline-meta { font-family: ${SANS}; font-size: 13px; color: var(--yte-muted); margin: 6px 0 0; line-height: 1.4; }

      /* PROSE, body typography */
      .bp-prose { max-width: 760px; margin: 0 auto; font-family: ${SANS}; font-size: 17.5px; line-height: 1.78; color: var(--yte-ink); }
      .bp-prose > * + * { margin-top: 1.6em; }
      .bp-prose > p + p { margin-top: 1.5em; }
      .bp-prose p { margin: 0; color: #312e26; }
      .bp-prose strong { font-weight: 600; color: var(--yte-ink); }
      .bp-prose em { font-style: italic; }

      .bp-prose h2 { font-family: ${SERIF}; font-size: 30px; font-weight: 400; letter-spacing: -0.3px; line-height: 1.15; color: var(--yte-ink); margin-top: 1.9em !important; margin-bottom: 0.5em !important; }
      .bp-prose h2 + p { margin-top: 0.5em !important; }
      .bp-prose h3 { font-family: ${SERIF}; font-size: 22px; font-weight: 400; letter-spacing: -0.2px; line-height: 1.3; color: var(--yte-ink); margin-top: 1.7em !important; margin-bottom: 0.45em !important; }
      .bp-prose h3 + p { margin-top: 0.5em !important; }

      .bp-prose a { color: var(--yte-accent); text-decoration: none; font-weight: 600; background-image: linear-gradient(transparent calc(100% - 1px), rgba(229,48,42,0.35) 1px); background-size: 100% 100%; background-repeat: no-repeat; transition: background-image 0.18s, color 0.18s; }
      .bp-prose a:hover { background-image: linear-gradient(transparent calc(100% - 1px), var(--yte-accent) 1px); }

      .bp-prose ul { padding-left: 1.5em; list-style: none; }
      .bp-prose ul > li { position: relative; padding-left: 0.5em; margin: 0.6em 0; line-height: 1.72; color: #312e26; }
      .bp-prose ul > li::before { content: ''; position: absolute; left: -0.85em; top: 0.62em; width: 5px; height: 5px; background: var(--yte-accent); }

      .bp-prose ol { padding-left: 1.6em; list-style: none; counter-reset: bp-list-counter; }
      .bp-prose ol > li { position: relative; padding-left: 0.4em; margin: 0.6em 0; line-height: 1.72; counter-increment: bp-list-counter; color: #312e26; }
      .bp-prose ol > li::before { content: counter(bp-list-counter) '.'; position: absolute; left: -1.5em; top: 0; color: var(--yte-accent); font-weight: 700; font-size: 0.95em; font-family: ${SANS}; }

      .bp-prose blockquote { margin: 2em 0; padding: 18px 22px; background: var(--yte-surface); border: 1px solid var(--yte-line); border-left: 3px solid var(--yte-accent); border-radius: 0; font-family: ${SANS}; font-size: 16px; font-style: normal; font-weight: 400; color: var(--yte-ink); line-height: 1.7; }
      .bp-prose blockquote p { margin: 0; color: var(--yte-ink); }
      .bp-prose blockquote strong { color: var(--yte-accent); font-weight: 700; font-style: normal; }

      .bp-prose img { width: 100%; height: auto; border: 1px solid var(--yte-line); border-radius: 0; margin: 2.4em 0; }

      .bp-prose code { background: var(--yte-bg-2); padding: 2px 7px; border-radius: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.86em; color: var(--yte-accent); font-weight: 500; }
      .bp-prose pre { background: var(--yte-ink); color: rgba(255,255,255,0.92); padding: 22px 24px; border-radius: 0; overflow-x: auto; margin: 2.4em 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; line-height: 1.65; }
      .bp-prose pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }

      .bp-prose hr { border: 0; border-top: 1px solid var(--yte-line); margin: 2.8em 0; }

      .bp-prose table { width: 100%; border-collapse: collapse; margin: 2em 0; font-size: 15px; border: 1px solid var(--yte-line); border-radius: 0; overflow: hidden; background: var(--yte-surface); }
      .bp-prose thead { background: var(--yte-bg-2); }
      .bp-prose th { padding: 13px 18px; font-family: ${SANS}; font-weight: 600; text-align: left; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--yte-muted); }
      .bp-prose td { padding: 15px 18px; border-top: 1px solid var(--yte-line); vertical-align: top; line-height: 1.6; color: #312e26; }

      @media (max-width: 768px) {
        .bp-prose { font-size: 16.5px; line-height: 1.74; }
        .bp-prose > * + * { margin-top: 1.4em; }
        .bp-prose > p + p { margin-top: 1.4em; }
        .bp-prose h2 { font-size: 25px; letter-spacing: -0.2px; margin-top: 1.7em !important; margin-bottom: 0.5em !important; }
        .bp-prose h3 { font-size: 20px; margin-top: 1.5em !important; }
        .bp-prose blockquote { padding: 15px 18px; font-size: 15px; margin: 1.6em 0; line-height: 1.65; }
        .bp-prose ul > li, .bp-prose ol > li { margin: 0.5em 0; }
        .bp-prose img { margin: 1.6em 0; }
        .bp-prose table { font-size: 13px; }
        .bp-prose th { padding: 10px 12px; font-size: 10px; }
        .bp-prose td { padding: 12px 12px; }
        .bp-section-pad { padding-left: 22px !important; padding-right: 22px !important; }
      }
      @media (max-width: 420px) {
        .bp-prose { font-size: 16px; }
        .bp-prose h2 { font-size: 23px; }
      }
    `
    document.head.appendChild(style)
  }, [])
}
