/* SEO helpers used by feature/blog pages to bake structured data into the
   prerendered HTML. The prerender script (puppeteer + networkidle0) lets
   any useEffect that calls these helpers run before the snapshot, so the
   JSON-LD ends up in the static file crawlers fetch. */

/* Walks a React node tree and returns a flat string. Used to convert the
   JSX `a` field on each feature page's FAQS array into plain text suitable
   for an `Answer.text` field in FAQPage JSON-LD. Handles strings, arrays,
   fragments, and nested element children. */
export function reactToText(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(reactToText).join('')
  if (node?.props?.children) return reactToText(node.props.children)
  return ''
}

/* Inject (or update on re-render) a FAQPage JSON-LD script in <head>.
   Single script reused via id, so client-side navigation between pages
   never accumulates duplicates. */
export function injectFaqJsonLd(faqs, scriptId = 'faq-jsonld') {
  if (typeof document === 'undefined') return
  const payload = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name:    f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    reactToText(f.a),
      },
    })),
  }
  let script = document.getElementById(scriptId)
  if (!script) {
    script = document.createElement('script')
    script.id   = scriptId
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(payload)
}
