import React, { useMemo, useState } from 'react';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'sketch' | 'opt';

interface SignRow {
  interval: string;
  fPrimeSign: string;
  fDoublePrimeSign: string;
  behavior: string;
}

interface SketchPreset {
  id: string;
  label: string;
  latex: string;
  domainLatex: string;
  asymptotesText: string;
  fn: (x: number) => number;
  obliqueAsymptote?: { fn: (x: number) => number; label: string };
  verticalAsymptotes?: number[];
  horizontalAsymptotes?: number[];
  extremaPoints: { x: number; y: number; label: string }[];
  signRows: SignRow[];
}

const SKETCH_PRESETS: SketchPreset[] = [
  {
    id: 'exp_prod',
    label: '(x² − 1)e⁻ˣ',
    latex: 'f(x) = (x^2 - 1)e^{-x}',
    domainLatex: '\\mathbb{R}',
    asymptotesText: 'Horisontell asymptot y = 0 då x → +∞.',
    fn: (x) => (x * x - 1) * Math.exp(-x),
    horizontalAsymptotes: [0],
    extremaPoints: [
      { x: 1 - Math.sqrt(2), y: ((1 - Math.sqrt(2)) ** 2 - 1) * Math.exp(-(1 - Math.sqrt(2))), label: 'Lok. min' },
      { x: 1 + Math.sqrt(2), y: ((1 + Math.sqrt(2)) ** 2 - 1) * Math.exp(-(1 + Math.sqrt(2))), label: 'Lok. max' },
    ],
    signRows: [
      { interval: 'x < 1 − √2', fPrimeSign: '−', fDoublePrimeSign: '+', behavior: 'Avtagande, konvex' },
      { interval: 'x = 1 − √2', fPrimeSign: '0', fDoublePrimeSign: '+', behavior: 'Lokalt minimum' },
      { interval: '1 − √2 < x < 1 + √2', fPrimeSign: '+', fDoublePrimeSign: 'växlar i 2−√3, 2+√3', behavior: 'Växande' },
      { interval: 'x = 1 + √2', fPrimeSign: '0', fDoublePrimeSign: '−', behavior: 'Lokalt maximum' },
      { interval: 'x > 1 + √2', fPrimeSign: '−', fDoublePrimeSign: '+ efter 2+√3', behavior: 'Avtagande mot y = 0' },
    ],
  },
  {
    id: 'rational_oblique',
    label: '(x² − 2x + 2) / (x − 1)',
    latex: 'f(x) = \\frac{x^2 - 2x + 2}{x - 1} = x - 1 + \\frac{1}{x - 1}',
    domainLatex: '\\mathbb{R} \\setminus \\{1\\}',
    asymptotesText: 'Lodrät asymptot x = 1; sned asymptot y = x − 1 då x → ±∞.',
    fn: (x) => (Math.abs(x - 1) < 1e-4 ? Number.NaN : (x * x - 2 * x + 2) / (x - 1)),
    verticalAsymptotes: [1],
    obliqueAsymptote: { fn: (x) => x - 1, label: 'Sned asymptot y = x − 1' },
    extremaPoints: [
      { x: 0, y: -2, label: 'Lok. max (0, −2)' },
      { x: 2, y: 2, label: 'Lok. min (2, 2)' },
    ],
    signRows: [
      { interval: 'x < 0', fPrimeSign: '+', fDoublePrimeSign: '−', behavior: 'Växande, konkav' },
      { interval: 'x = 0', fPrimeSign: '0', fDoublePrimeSign: '−', behavior: 'Lokalt maximum (0, −2)' },
      { interval: '0 < x < 1', fPrimeSign: '−', fDoublePrimeSign: '−', behavior: 'Avtagande mot −∞' },
      { interval: '1 < x < 2', fPrimeSign: '−', fDoublePrimeSign: '+', behavior: 'Avtagande från +∞' },
      { interval: 'x = 2', fPrimeSign: '0', fDoublePrimeSign: '+', behavior: 'Lokalt minimum (2, 2)' },
      { interval: 'x > 2', fPrimeSign: '+', fDoublePrimeSign: '+', behavior: 'Växande mot y = x − 1' },
    ],
  },
  {
    id: 'tenta_arcsin',
    label: '1 + arcsin(x) + 2√(1 − x²) (Tenta-klassiker)',
    latex: 'f(x) = 1 + \\arcsin(x) + 2\\sqrt{1 - x^2}',
    domainLatex: '[-1, 1]',
    asymptotesText: 'Inga asymptoter (slutet kompakt intervall [-1, 1]). Kontrollera ändpunkterna!',
    fn: (x) => (x < -1 || x > 1 ? Number.NaN : 1 + Math.asin(x) + 2 * Math.sqrt(1 - x * x)),
    extremaPoints: [
      {
        x: 0.5,
        y: 1 + Math.asin(0.5) + 2 * Math.sqrt(1 - 0.25),
        label: 'Max i x = 1/2',
      },
      { x: -1, y: 1 - Math.PI / 2, label: 'Ändpunkt (−1, 1−π/2)' },
      { x: 1, y: 1 + Math.PI / 2, label: 'Ändpunkt (1, 1+π/2)' },
    ],
    signRows: [
      { interval: 'x = −1', fPrimeSign: 'undef.', fDoublePrimeSign: '—', behavior: 'Globalt minimum 1 − π/2' },
      { interval: '−1 < x < 1/2', fPrimeSign: '+', fDoublePrimeSign: '−', behavior: 'Växande (derivata (1−2x)/√(1−x²))' },
      { interval: 'x = 1/2', fPrimeSign: '0', fDoublePrimeSign: '−', behavior: 'Globalt maximum ≈ 3,256' },
      { interval: '1/2 < x < 1', fPrimeSign: '−', fDoublePrimeSign: '−', behavior: 'Avtagande' },
      { interval: 'x = 1', fPrimeSign: 'undef.', fDoublePrimeSign: '—', behavior: 'Ändpunktsvärde 1 + π/2' },
    ],
  },
];

export const CurveSketchAndOptTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('sketch');

  // --- Subtab 1: Kurvkonstruktion ---
  const [presetId, setPresetId] = useState('exp_prod');
  const preset = useMemo(
    () => SKETCH_PRESETS.find((p) => p.id === presetId) ?? SKETCH_PRESETS[0],
    [presetId],
  );

  // --- Subtab 2: Optimeringslabb ---
  const [parabolaH, setParabolaH] = useState(6);
  const maxWidthX = Math.sqrt(parabolaH);
  const [rectX, setRectX] = useState(1.4);
  const clampedRectX = Math.min(maxWidthX - 0.05, Math.max(0.1, rectX));
  const rectY = Math.max(0, parabolaH - clampedRectX * clampedRectX);
  const area = 2 * clampedRectX * rectY;
  const optX = Math.sqrt(parabolaH / 3);
  const maxArea = 2 * optX * (parabolaH - optX * optX);

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'sketch' ? 'active' : ''}`}
          onClick={() => setSubTab('sketch')}
        >
          Kurvkonstruktion, asymptoter & teckentabell
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'opt' ? 'active' : ''}`}
          onClick={() => setSubTab('opt')}
        >
          Optimeringslabb (innskriven rektangel)
        </button>
      </div>

      {subTab === 'sketch' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Systematisk funktionsundersökning</h3>
              <p className="muted-text">
                Välj en typisk MA1499-funktion och studera definitionsmängd, asymptoter och teckentabell för <KatexBlock latex="f', f''" />.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {SKETCH_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`seg-btn ${presetId === p.id ? 'active' : ''}`}
                  onClick={() => setPresetId(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="formula-box">
              <KatexBlock latex={preset.latex} displayMode />
              <div style={{ fontSize: '0.88rem' }}>
                <strong>Definitionsmängd:</strong> <KatexBlock latex={preset.domainLatex} />
              </div>
              <div className="muted-text" style={{ fontSize: '0.86rem', marginTop: '0.25rem' }}>
                <strong>Asymptoter:</strong> {preset.asymptotesText}
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Intervall / punkt</th>
                  <th>f&apos;(x)</th>
                  <th>f&apos;&apos;(x)</th>
                  <th>Slutsats</th>
                </tr>
              </thead>
              <tbody>
                {preset.signRows.map((row) => (
                  <tr key={row.interval}>
                    <td>{row.interval}</td>
                    <td><strong>{row.fPrimeSign}</strong></td>
                    <td>{row.fDoublePrimeSign}</td>
                    <td>{row.behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <FunctionPlot2D
            title="Funktionskurva med extrempunkter och asymptoter"
            initialXRange={preset.id === 'tenta_arcsin' ? [-1.5, 1.5] : [-4, 6]}
            initialYRange={[-5, 6]}
            curves={[
              { fn: preset.fn, color: 'var(--svg-blue)', label: 'f(x)' },
              ...(preset.obliqueAsymptote
                ? [
                    {
                      fn: preset.obliqueAsymptote.fn,
                      color: 'var(--amber)',
                      label: preset.obliqueAsymptote.label,
                      dashed: true,
                    },
                  ]
                : []),
            ]}
            verticalLines={(preset.verticalAsymptotes ?? []).map((x) => ({
              x,
              color: 'var(--amber)',
              label: `x = ${x}`,
            }))}
            horizontalLines={(preset.horizontalAsymptotes ?? []).map((y) => ({
              y,
              color: 'var(--amber)',
              label: `y = ${y}`,
            }))}
            points={preset.extremaPoints.map((pt) => ({
              x: pt.x,
              y: pt.y,
              color: 'var(--sage)',
              label: pt.label,
            }))}
          />
        </div>
      )}

      {subTab === 'opt' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Maximera rektangelns area under parabeln</h3>
              <p className="muted-text">
                En rektangel har basen längs x-axeln från <KatexBlock latex="-x" /> till <KatexBlock latex="x" /> och övre hörn på <KatexBlock latex="y = H - x^2" />.
              </p>
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Parabelns höjd H</span>
                <strong>{parabolaH}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={3}
                max={9}
                step={1}
                value={parabolaH}
                onChange={(e) => setParabolaH(Number(e.target.value))}
              />
            </label>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Vald halv bredd x</span>
                <strong>{clampedRectX.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0.1}
                max={Number((maxWidthX - 0.05).toFixed(2))}
                step={0.05}
                value={clampedRectX}
                onChange={(e) => setRectX(Number(e.target.value))}
              />
            </label>

            <div className={Math.abs(clampedRectX - optX) < 0.08 ? 'feedback-correct' : 'result-banner'}>
              <KatexBlock
                latex={`A(x) = 2x(${parabolaH} - x^2) \\implies A(${clampedRectX.toFixed(2)}) = ${area.toFixed(3)}`}
                displayMode
              />
              <div style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>
                <strong>Exakt optimum:</strong>{' '}
                <KatexBlock latex={`A'(x) = ${2 * parabolaH} - 6x^2 = 0 \\iff x = \\sqrt{${parabolaH}/3} \\approx ${optX.toFixed(3)}`} />
                {' '}(maxarea <KatexBlock latex={`A_{\\max} \\approx ${maxArea.toFixed(3)}`} />)
              </div>
            </div>
          </div>

          <FunctionPlot2D
            title="Parabel, inskriven rektangel och målfunktionen A(x)"
            initialXRange={[-3.5, 3.5]}
            initialYRange={[-1, 12]}
            curves={[
              {
                fn: (x) => (Math.abs(x) <= maxWidthX ? parabolaH - x * x : Number.NaN),
                color: 'var(--svg-blue)',
                label: `y = ${parabolaH} − x²`,
              },
              {
                fn: (x) => (x >= 0 && x <= maxWidthX ? 2 * x * (parabolaH - x * x) : Number.NaN),
                color: 'var(--sage)',
                label: 'Area A(x) (för x ≥ 0)',
                dashed: true,
              },
            ]}
            points={[
              { x: clampedRectX, y: area, color: 'var(--sage)', label: 'A(x)' },
              { x: optX, y: maxArea, color: 'var(--amber)', label: 'Max A(x)' },
            ]}
            extraSvg={(t) => {
              const xLeft = t.toSvgX(-clampedRectX);
              const xRight = t.toSvgX(clampedRectX);
              const yTop = t.toSvgY(rectY);
              const yBottom = t.toSvgY(0);
              return (
                <rect
                  x={xLeft}
                  y={yTop}
                  width={Math.max(0, xRight - xLeft)}
                  height={Math.max(0, yBottom - yTop)}
                  fill="color-mix(in srgb, var(--amber) 22%, transparent)"
                  stroke="var(--amber)"
                  strokeWidth={2}
                />
              );
            }}
          />
        </div>
      )}
    </div>
  );
};
