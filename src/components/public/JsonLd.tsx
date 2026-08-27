// Renders a JSON-LD <script> tag. Escaping `<` prevents a `</script>` (or
// `<!--`) substring inside any field — e.g. an article title — from
// breaking out of the script context; JSON.stringify alone doesn't guard
// against that since `<` is valid, unescaped JSON.
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
