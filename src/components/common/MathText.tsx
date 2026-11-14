import katex from 'katex';
import type { ReactNode } from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Renderar svensk text med inline-matte ($...$), blockmatte ($$...$$) och enkel **fetstil**.
 */
export function MathText({ text, className }: MathTextProps) {
  const parts: ReactNode[] = [];
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+\$|\*\*[\s\S]+?\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      parts.push(
        <strong key={keyCounter++}>
          <MathText text={inner} />
        </strong>,
      );
    } else {
      const isDisplay = token.startsWith('$$') && token.endsWith('$$');
      const latex = isDisplay ? token.slice(2, -2) : token.slice(1, -1);
      const html = katex.renderToString(latex, {
        displayMode: isDisplay,
        throwOnError: false,
        strict: false,
      });
      parts.push(<span key={keyCounter++} dangerouslySetInnerHTML={{ __html: html }} />);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
