/* Emits FAQPage JSON-LD so Google can show the FAQ rich result on
   search listings for the tool/feature page. The component renders
   nothing visible. Drop it once anywhere in the page tree, pass the
   same FAQS array the page already maps over.

   Answers can be plain strings or JSX (incl. nested <a>, <i>, <>);
   extractText() walks React elements and pulls the visible copy.
   Anything Google can't render in a rich snippet (links, formatting)
   gets flattened to text. */

function extractText(node) {
  if (node == null || node === false) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node.props) return extractText(node.props.children)
  return ''
}

export default function FaqSchema({ items }) {
  if (!items || items.length === 0) return null
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: extractText(it.q).trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractText(it.a).trim(),
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  )
}
