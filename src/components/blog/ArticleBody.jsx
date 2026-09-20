/**
 * Renders the stored article body.
 * Content is authored as light Markdown (## headings, **bold**, - lists) and
 * converted to elements here rather than injected as HTML, so an admin cannot
 * accidentally introduce script content into a public page.
 */
function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      // eslint-disable-next-line react/no-array-index-key
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export function ArticleBody({ content = '' }) {
  const blocks = content.split(/\n{2,}/).filter((b) => b.trim());

  return (
    <div className="prose-article">
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        const trimmed = block.trim();

        if (trimmed.startsWith('### ')) return <h3 key={key}>{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={key}>{trimmed.slice(3)}</h2>;

        if (/^[-*]\s/m.test(trimmed) && trimmed.split('\n').every((l) => /^[-*]\s/.test(l.trim()))) {
          return (
            <ul key={key}>
              {trimmed.split('\n').map((line, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`${key}-${j}`}>{inline(line.trim().replace(/^[-*]\s/, ''), `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s/.test(trimmed) && trimmed.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={key}>
              {trimmed.split('\n').map((line, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`${key}-${j}`}>{inline(line.trim().replace(/^\d+\.\s/, ''), `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }

        return <p key={key}>{inline(trimmed, key)}</p>;
      })}
    </div>
  );
}
