import React, { useMemo, useState } from 'react';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathText } from '../common/MathText.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

interface EpsilonDeltaPreset {
  id: string;
  name: string;
  latexFn: string;
  fn: (x: number) => number;
  a: number;
  L: number;
  xRange: [number, number];
  yRange: [number, number];
  calcMaxDelta: (eps: number) => number;
  proofSteps: (eps: number) => { title: string; explanation: string; latex?: string }[];
}

const PRESETS: EpsilonDeltaPreset[] = [
  {
    id: 'linear2',
    name: 'f(x) = 2x − 1 då x → 3',
    latexFn: 'f(x) = 2x - 1, \\quad a = 3, \\quad L = 5',
    fn: (x) => 2 * x - 1,
    a: 3,
    L: 5,
    xRange: [1, 5],
    yRange: [1, 9],
    calcMaxDelta: (eps) => eps / 2,
    proofSteps: (eps) => [
      {
        title: '1. Ställ upp differensen',
        explanation: 'Vi vill uppskatta avståndet $|f(x) - L|$ och uttrycka det i termer av $|x - a|$:',
        latex: '|f(x) - L| = |(2x - 1) - 5| = |2x - 6| = 2|x - 3|',
      },
      {
        title: '2. Knyt differensen till ε',
        explanation: 'Vi kräver att $2|x - 3| < \\varepsilon$:',
        latex: '2|x - 3| < \\varepsilon \\iff |x - 3| < \\frac{\\varepsilon}{2}',
      },
      {
        title: '3. Slutsats & val av δ',
        explanation: `Om vi väljer $\\delta \\le \\frac{\\varepsilon}{2}$ (här $\\delta \\le ${(eps / 2).toFixed(3)}$), så medför $0 < |x - 3| < \\delta$ direkt att $|f(x) - 5| < 2\\delta \\le \\varepsilon$. Beviset är klart!`,
        latex: `\\delta = \\frac{\\varepsilon}{2} = ${(eps / 2).toFixed(3)}`,
      },
    ],
  },
  {
    id: 'linear3',
    name: 'f(x) = 3x + 2 då x → 1',
    latexFn: 'f(x) = 3x + 2, \\quad a = 1, \\quad L = 5',
    fn: (x) => 3 * x + 2,
    a: 1,
    L: 5,
    xRange: [-0.5, 2.5],
    yRange: [0.5, 9.5],
    calcMaxDelta: (eps) => eps / 3,
    proofSteps: (eps) => [
      {
        title: '1. Ställ upp differensen',
        explanation: 'Bilda $|f(x) - L|$:',
        latex: '|f(x) - L| = |(3x + 2) - 5| = |3x - 3| = 3|x - 1|',
      },
      {
        title: '2. Krav på differensen',
        explanation: 'Vi kräver $3|x - 1| < \\varepsilon$:',
        latex: '3|x - 1| < \\varepsilon \\iff |x - 1| < \\frac{\\varepsilon}{3}',
      },
      {
        title: '3. Slutsats',
        explanation: `Välj $\\delta = \\frac{\\varepsilon}{3} = ${(eps / 3).toFixed(3)}$. Då gäller $0 < |x - 1| < \\delta \\implies |f(x) - 5| < \\varepsilon$.`,
        latex: `\\delta = \\frac{\\varepsilon}{3}`,
      },
    ],
  },
  {
    id: 'quadratic',
    name: 'f(x) = x² då x → 2',
    latexFn: 'f(x) = x^2, \\quad a = 2, \\quad L = 4',
    fn: (x) => x * x,
    a: 2,
    L: 4,
    xRange: [0.5, 3.5],
    yRange: [0, 10],
    calcMaxDelta: (eps) => {
      // Exakt max delta så att (2+d)^2 - 4 <= eps och 4 - (2-d)^2 <= eps
      // (2+d)^2 - 4 = eps => d = sqrt(4+eps) - 2
      // 4 - (2-d)^2 = eps => 2-d = sqrt(4-eps) => d = 2 - sqrt(4-eps)
      const dRight = Math.sqrt(4 + eps) - 2;
      const dLeft = eps < 4 ? 2 - Math.sqrt(4 - eps) : 2;
      return Math.min(dRight, dLeft);
    },
    proofSteps: (eps) => [
      {
        title: '1. Faktorisera differensen',
        explanation: 'Bilda $|x^2 - 4|$ och faktorisera med konjugatregeln:',
        latex: '|x^2 - 4| = |x - 2| \\cdot |x + 2|',
      },
      {
        title: '2. Begränsa faktorn |x + 2| med en initial restriktion',
        explanation: 'Antag först att $\\delta \\le 1$. Då är $|x - 2| < 1$, vilket ger $1 < x < 3$, så $|x + 2| < 3 + 2 = 5$.',
        latex: '|x - 2| < 1 \\implies |x + 2| < 5',
      },
      {
        title: '3. Välj δ',
        explanation: `Under förutsättningen att $\\delta \\le 1$ är alltså $|x^2 - 4| < 5|x - 2|$. För att detta ska bli $< \\varepsilon$ krävs $|x - 2| < \\frac{\\varepsilon}{5}$. Alltså fungerar standardvalet $\\delta = \\min\\left(1, \\frac{\\varepsilon}{5}\\right)$.`,
        latex: `\\delta = \\min\\left(1, \\frac{\\varepsilon}{5}\\right) = ${Math.min(1, eps / 5).toFixed(3)}`,
      },
    ],
  },
  {
    id: 'sqrt',
    name: 'f(x) = √x då x → 4',
    latexFn: 'f(x) = \\sqrt{x}, \\quad a = 4, \\quad L = 2',
    fn: (x) => (x >= 0 ? Math.sqrt(x) : Number.NaN),
    a: 4,
    L: 2,
    xRange: [1, 7],
    yRange: [0.5, 3.5],
    calcMaxDelta: (eps) => {
      const dRight = Math.pow(2 + eps, 2) - 4;
      const dLeft = eps < 2 ? 4 - Math.pow(2 - eps, 2) : 4;
      return Math.min(dRight, dLeft);
    },
    proofSteps: (eps) => [
      {
        title: '1. Förläng med konjugat',
        explanation: 'Bilda $|\\sqrt{x} - 2|$ och förläng med $(\\sqrt{x} + 2)$:',
        latex: '|\\sqrt{x} - 2| = \\frac{|x - 4|}{\\sqrt{x} + 2}',
      },
      {
        title: '2. Begränsa nämnaren underifrån',
        explanation: 'Eftersom $\\sqrt{x} \\ge 0$ är $\\sqrt{x} + 2 \\ge 2$. Därför är kvoten som störst $\\frac{|x - 4|}{2}$.',
        latex: '\\frac{|x - 4|}{\\sqrt{x} + 2} \\le \\frac{|x - 4|}{2}',
      },
      {
        title: '3. Slutsats',
        explanation: `Vi kräver att $\\frac{|x - 4|}{2} < \\varepsilon \\iff |x - 4| < 2\\varepsilon$. Alltså garanterar valet $\\delta = 2\\varepsilon = ${(2 * eps).toFixed(3)}$ att differensen hålls under $\\varepsilon$.`,
        latex: `\\delta = 2\\varepsilon = ${(2 * eps).toFixed(3)}`,
      },
    ],
  },
];

export const EpsilonDeltaExplorer: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('linear2');
  const [eps, setEps] = useState<number>(0.6);
  const [delta, setDelta] = useState<number>(0.3);

  const preset = useMemo(
    () => PRESETS.find((p) => p.id === selectedPresetId) ?? PRESETS[0],
    [selectedPresetId],
  );

  const theoreticalMaxDelta = useMemo(() => preset.calcMaxDelta(eps), [eps, preset]);

  // Kontrollera om nuvarande delta är giltigt genom att sampla intervallet [a - delta, a + delta]
  const validityCheck = useMemo(() => {
    const N = 40;
    let maxDiff = 0;
    let worstX = preset.a;
    let worstY = preset.L;

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = preset.a - delta + 2 * delta * t;
      if (Math.abs(x - preset.a) < 1e-7) continue; // 0 < |x - a|
      const y = preset.fn(x);
      if (!Number.isFinite(y)) continue;
      const diff = Math.abs(y - preset.L);
      if (diff > maxDiff) {
        maxDiff = diff;
        worstX = x;
        worstY = y;
      }
    }

    const isValid = maxDiff < eps + 1e-5;
    return { isValid, maxDiff, worstX, worstY };
  }, [delta, eps, preset]);

  const setOptimalDelta = () => {
    // Sätt till 98% av max för säkerhetsmarginal vid avrundning
    setDelta(Number((theoreticalMaxDelta * 0.98).toFixed(3)));
  };

  const steps = useMemo(() => preset.proofSteps(eps), [eps, preset]);

  return (
    <div className="section-stack">
      <div className="tool-grid">
        <div className="panel section-stack">
          <div>
            <h3>
              Formell definition: <KatexBlock latex="\lim_{x \to a} f(x) = L" displayMode={false} />
            </h3>
            <div className="muted-text" style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: '0.3rem 0' }}>
              <MathText text="Definitionen säger: För varje $\varepsilon > 0$ måste det finnas ett $\delta > 0$ så att när $0 < |x - a| < \delta$, så är $|f(x) - L| < \varepsilon$." />
            </div>
          </div>

          <div className="row-wrap" style={{ gap: '0.35rem' }}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`seg-btn ${p.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPresetId(p.id);
                  setDelta(Number((p.calcMaxDelta(eps) * 0.9).toFixed(3)));
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="result-banner">
            <KatexBlock latex={preset.latexFn} displayMode />
          </div>

          {/* Sliders för epsilon och delta */}
          <div className="section-stack" style={{ gap: '0.8rem' }}>
            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>
                  Tolerans <KatexBlock latex="\varepsilon" displayMode={false} /> (tillåten avvikelse i y-led)
                </span>
                <strong style={{ color: 'var(--sage)' }}>ε = {eps.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0.1}
                max={1.5}
                step={0.05}
                value={eps}
                onChange={(e) => {
                  const newEps = Number(e.target.value);
                  setEps(newEps);
                }}
              />
            </label>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>
                  Intervallradie <KatexBlock latex="\delta" displayMode={false} /> (krav på närhet i x-led)
                </span>
                <strong style={{ color: 'var(--svg-blue)' }}>δ = {delta.toFixed(3)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0.02}
                max={1.8}
                step={0.02}
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </label>

            <div className="row-wrap" style={{ gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={setOptimalDelta}>
                Auto-beräkna giltigt δ ({theoreticalMaxDelta.toFixed(3)})
              </button>
            </div>
          </div>

          {/* Valideringsstatus */}
          {validityCheck.isValid ? (
            <div className="result-banner" style={{ borderLeft: '4px solid var(--sage)' }}>
              <strong style={{ color: 'var(--sage)' }}>✓ Giltigt δ!</strong>
              <div style={{ margin: '0.3rem 0 0', fontSize: '0.86rem', lineHeight: 1.5 }}>
                <MathText
                  text={`För alla $x \\in (${(preset.a - delta).toFixed(2)}, ${(preset.a + delta).toFixed(2)})$ håller sig funktionsvärdet $f(x)$ inuti målkorridoren $[${(preset.L - eps).toFixed(2)}, ${(preset.L + eps).toFixed(2)}]$. Maximal avvikelse är bara **${validityCheck.maxDiff.toFixed(3)}** (< ${eps.toFixed(2)}).`}
                />
              </div>
            </div>
          ) : (
            <div className="warn-box" style={{ borderLeft: '4px solid var(--amber)' }}>
              <strong style={{ color: 'var(--amber)' }}>⚠ För stort δ!</strong>
              <div style={{ margin: '0.3rem 0 0', fontSize: '0.86rem', lineHeight: 1.5 }}>
                <MathText
                  text={`Funktionen rymmer utanför $\\varepsilon$-korridoren! Vid $x = ${validityCheck.worstX.toFixed(3)}$ är $|f(x) - ${preset.L}| = ${validityCheck.maxDiff.toFixed(3)} \\ge \\varepsilon = ${eps.toFixed(2)}$. Minska $\\delta$ till maximalt **${theoreticalMaxDelta.toFixed(3)}**.`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Graf med FunctionPlot2D och extraSvg för korridorer */}
        <FunctionPlot2D
          title="ε-korridor (grön) och δ-intervall (blå)"
          initialXRange={preset.xRange}
          initialYRange={preset.yRange}
          curves={[
            {
              fn: preset.fn,
              color: 'var(--text-primary)',
              label: 'f(x)',
              strokeWidth: 2.5,
            },
          ]}
          points={[
            {
              x: preset.a,
              y: preset.L,
              color: 'var(--accent)',
              label: `(a, L) = (${preset.a}, ${preset.L})`,
            },
            ...(validityCheck.isValid
              ? []
              : [
                  {
                    x: validityCheck.worstX,
                    y: validityCheck.worstY,
                    color: '#e11d48',
                    label: 'Rymmer!',
                  },
                ]),
          ]}
          horizontalLines={[
            { y: preset.L + eps, color: 'var(--sage)', dashed: true, label: `L + ε = ${(preset.L + eps).toFixed(2)}` },
            { y: preset.L - eps, color: 'var(--sage)', dashed: true, label: `L − ε = ${(preset.L - eps).toFixed(2)}` },
          ]}
          verticalLines={[
            { x: preset.a - delta, color: 'var(--svg-blue)', dashed: true, label: `a − δ` },
            { x: preset.a + delta, color: 'var(--svg-blue)', dashed: true, label: `a + δ` },
          ]}
          extraSvg={(t) => {
            const xLeft = t.toSvgX(preset.a - delta);
            const xRight = t.toSvgX(preset.a + delta);
            const yTop = t.toSvgY(preset.L + eps);
            const yBottom = t.toSvgY(preset.L - eps);

            const w = Math.abs(xRight - xLeft);
            const h = Math.abs(yBottom - yTop);

            return (
              <g pointerEvents="none">
                {/* Epsilon-band tvärs över hela grafen */}
                <rect
                  x={0}
                  y={Math.min(yTop, yBottom)}
                  width={t.width}
                  height={h}
                  fill="var(--sage)"
                  fillOpacity="0.08"
                />

                {/* Delta-remsa */}
                <rect
                  x={Math.min(xLeft, xRight)}
                  y={0}
                  width={w}
                  height={t.height}
                  fill="var(--svg-blue)"
                  fillOpacity="0.08"
                />

                {/* Den säkra målrutan där kurvan måste befinna sig */}
                <rect
                  x={Math.min(xLeft, xRight)}
                  y={Math.min(yTop, yBottom)}
                  width={w}
                  height={h}
                  fill={validityCheck.isValid ? 'var(--sage)' : '#e11d48'}
                  fillOpacity="0.22"
                  stroke={validityCheck.isValid ? 'var(--sage)' : '#e11d48'}
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              </g>
            );
          }}
        />
      </div>

      {/* Matematisk bevisföring och tentamensguide */}
      <div className="panel section-stack">
        <h4>Hur man skriver ett formellt ε-δ-bevis på tentan</h4>
        <div className="exercise-steps" style={{ marginTop: '0.4rem' }}>
          {steps.map((st, i) => (
            <div key={i} className="math-step-card" style={{ marginBottom: '0.6rem' }}>
              <div className="math-step-title">{st.title}</div>
              <div className="math-step-body" style={{ margin: '0.25rem 0' }}>
                <MathText text={st.explanation} />
              </div>
              {st.latex && <KatexBlock latex={st.latex} displayMode />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
