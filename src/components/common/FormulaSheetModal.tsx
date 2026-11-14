import { useEffect, useState } from 'react';
import { BookMarked, Printer, Search, X } from 'lucide-react';
import { KatexBlock } from './KatexBlock.tsx';

type FormulaGroup = 'all' | 'dugga1' | 'dugga2' | 'dugga3' | 'tenta4';

interface FormulaEntry {
  title: string;
  guide: string;
  group: Exclude<FormulaGroup, 'all'>;
  latex: string;
}

const FORMULA_ENTRIES: FormulaEntry[] = [
  {
    title: 'Kvadratkomplettering & konjugatregeln (ej pq-formel!)',
    guide: 'SG 1',
    group: 'dugga1',
    latex:
      'x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c, \\qquad a^2 - b^2 = (a - b)(a + b)',
  },
  {
    title: 'Faktorsatsen & cirkelns ekvation',
    guide: 'SG 1',
    group: 'dugga1',
    latex:
      '(x - a) \\text{ delar } p(x) \\iff p(a) = 0, \\qquad (x - x_0)^2 + (y - y_0)^2 = r^2',
  },
  {
    title: 'Potens- och logaritmlagar',
    guide: 'SG 2',
    group: 'dugga1',
    latex:
      'a^x = e^{x\\ln a}, \\quad \\ln(ab) = \\ln a + \\ln b, \\quad \\ln\\left(\\frac{a}{b}\\right) = \\ln a - \\ln b, \\quad \\ln(a^p) = p\\ln a',
  },
  {
    title: 'Trigonometriska identiteter & dubbla vinkeln',
    guide: 'SG 3',
    group: 'dugga2',
    latex:
      '\\sin^2 x + \\cos^2 x = 1, \\qquad \\sin(2x) = 2\\sin x\\cos x, \\qquad \\cos(2x) = \\cos^2 x - \\sin^2 x',
  },
  {
    title: 'Arcusfunktionernas värdemängder',
    guide: 'SG 3',
    group: 'dugga2',
    latex:
      '\\arcsin: [-1, 1] \\to \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right], \\quad \\arccos: [-1, 1] \\to [0, \\pi], \\quad \\arctan: \\mathbb{R} \\to \\left]-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right[',
  },
  {
    title: 'Standardgränsvärden (utan L’Hôpital!)',
    guide: 'SG 4',
    group: 'dugga2',
    latex:
      '\\lim_{t\\to 0} \\frac{\\sin t}{t} = 1, \\quad \\lim_{t\\to 0} \\frac{e^t - 1}{t} = 1, \\quad \\lim_{t\\to 0} \\frac{\\ln(1+t)}{t} = 1, \\quad \\lim_{t\\to 0} \\frac{1 - \\cos t}{t^2} = \\frac{1}{2}',
  },
  {
    title: 'Deriveringsregler: produkt, kvot & kedjeregeln',
    guide: 'SG 5',
    group: 'dugga3',
    latex:
      "(fg)' = f'g + fg', \\qquad \\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}, \\qquad (f(g(x)))' = f'(g(x))g'(x)",
  },
  {
    title: 'Standardderivator (inkl. inverser & arcus)',
    guide: 'SG 5',
    group: 'dugga3',
    latex:
      "(\\arcsin x)' = \\frac{1}{\\sqrt{1-x^2}}, \\quad (\\arccos x)' = -\\frac{1}{\\sqrt{1-x^2}}, \\quad (\\arctan x)' = \\frac{1}{1+x^2}, \\quad (f^{-1})'(y) = \\frac{1}{f'(x)}",
  },
  {
    title: 'Medelvärdessatsen (MVT) & sned asymptot',
    guide: 'SG 5–6',
    group: 'tenta4',
    latex:
      "f'(c) = \\frac{f(b) - f(a)}{b - a}, \\qquad k = \\lim_{x\\to\\pm\\infty} \\frac{f(x)}{x}, \\quad m = \\lim_{x\\to\\pm\\infty} (f(x) - kx)",
  },
  {
    title: 'Maclaurinutvecklingar: eˣ, sin x, cos x',
    guide: 'SG 7',
    group: 'tenta4',
    latex:
      'e^x = \\sum_{k=0}^{n} \\frac{x^k}{k!} + O(x^{n+1}), \\quad \\sin x = x - \\frac{x^3}{6} + \\frac{x^5}{120} + O(x^7), \\quad \\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + O(x^6)',
  },
  {
    title: 'Maclaurin: ln(1+x), arctan x, 1/(1-x) & (1+x)^α',
    guide: 'SG 7',
    group: 'tenta4',
    latex:
      '\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots, \\quad \\arctan x = x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\dots, \\quad \\frac{1}{1-x} = 1 + x + x^2 + \\dots, \\quad (1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + \\dots',
  },
  {
    title: 'Geometrisk serie & Newtons binomialsats',
    guide: 'SG 7',
    group: 'tenta4',
    latex:
      '\\sum_{k=0}^{\\infty} a_0 r^k = \\frac{a_0}{1 - r} \\;(|r|<1), \\qquad (a+b)^n = \\sum_{k=0}^n \\binom{n}{k} a^{n-k} b^k',
  },
];

const GROUP_FILTERS: { id: FormulaGroup; label: string }[] = [
  { id: 'all', label: 'Alla formler' },
  { id: 'dugga1', label: 'Dugga 1 (SG 1–2)' },
  { id: 'dugga2', label: 'Dugga 2 (SG 3–4)' },
  { id: 'dugga3', label: 'Dugga 3 (SG 5)' },
  { id: 'tenta4', label: 'Tenta 4 (SG 6–7)' },
];

interface FormulaSheetModalProps {
  open: boolean;
  onClose: () => void;
}

export function FormulaSheetModal({ open, onClose }: FormulaSheetModalProps) {
  const [group, setGroup] = useState<FormulaGroup>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const visible = FORMULA_ENTRIES.filter((item) => {
    if (group !== 'all' && item.group !== group) return false;
    if (!q) return true;
    return `${item.title} ${item.guide} ${item.latex}`.toLowerCase().includes(q);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Formelsamling för Envariabelanalys 1"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '86vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="space-between" style={{ marginBottom: '0.75rem' }}>
          <div className="row-wrap">
            <BookMarked size={20} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
              Snabb formelsamling — MA1499 (SG 1–7)
            </h2>
          </div>
          <div className="row-wrap no-print">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Skriv ut / PDF
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              aria-label="Stäng formelsamling"
            >
              <X size={15} /> Stäng
            </button>
          </div>
        </div>

        <div className="warn-box" style={{ marginTop: 0, marginBottom: '0.85rem' }}>
          <strong>Tentamensregler i MA1499:</strong> Inga hjälpmedel är tillåtna på salstentamen.
          Andragradsekvationer får <strong>inte</strong> lösas med pq-/abc-formeln och L’Hôspitals
          regel får <strong>inte</strong> användas.
        </div>

        <div className="no-print" style={{ marginBottom: '0.85rem' }}>
          <div className="search-input-wrap" style={{ marginBottom: '0.6rem' }}>
            <Search size={16} className="search-icon" />
            <input
              type="search"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sök formel (t.ex. standardgränsvärde, arcsin, maclaurin, derivata)..."
              aria-label="Sök i formelsamlingen"
              style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
          </div>
          <div className="row-wrap">
            {GROUP_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`seg-btn${group === f.id ? ' active' : ''}`}
                onClick={() => setGroup(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section-stack" style={{ gap: '0.75rem' }}>
          {visible.length === 0 ? (
            <p className="muted-text" style={{ textAlign: 'center', margin: '1rem 0' }}>
              Inga formler matchade sökningen.
            </p>
          ) : (
            visible.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-recessed)',
                }}
              >
                <div className="space-between" style={{ marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.94rem' }}>{item.title}</strong>
                  <span className="sg-badge">{item.guide}</span>
                </div>
                <div className="formula-box" style={{ margin: 0 }}>
                  <KatexBlock latex={item.latex} displayMode />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
