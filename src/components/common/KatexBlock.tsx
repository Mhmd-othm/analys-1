import katex from 'katex';

interface KatexBlockProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexBlock({ latex, displayMode = true, className }: KatexBlockProps) {
  const html = katex.renderToString(latex, {
    displayMode,
    throwOnError: false,
    strict: false,
  });

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
