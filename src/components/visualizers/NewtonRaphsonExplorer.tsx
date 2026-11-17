import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathText } from '../common/MathText.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

interface NewtonPreset {
  id: string;
  name: string;
  latexFn: string;
  latexdFn: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
  defaultX0: number;
  x0Range: [number, number];
  plotXRange: [number, number];
  plotYRange: [number, number];
  exactRootDescription: string;
}

const NEWTON_PRESETS: NewtonPreset[] = [
  {
    id: 'sqrt2',
    name: 'f(x) = x² − 2 (Beräkna √2)',
    latexFn: 'f(x) = x^2 - 2 = 0',
    latexdFn: "f'(x) = 2x",
    fn: (x) => x * x - 2,
    dfn: (x) => 2 * x,
    defaultX0: 2.0,
    x0Range: [0.5, 3.5],
    plotXRange: [0, 3],
    plotYRange: [-3, 7],
    exactRootDescription: '\\sqrt{2} \\approx 1{,}41421356',
  },
  {
    id: 'cubic',
    name: 'f(x) = x³ − 2x − 5',
    latexFn: 'f(x) = x^3 - 2x - 5 = 0',
    latexdFn: "f'(x) = 3x^2 - 2",
    fn: (x) => x * x * x - 2 * x - 5,
    dfn: (x) => 3 * x * x - 2,
    defaultX0: 3.0,
    x0Range: [1.2, 4.0],
    plotXRange: [0.5, 4],
    plotYRange: [-8, 25],
    exactRootDescription: 'x \\approx 2{,}09455148',
  },
  {
    id: 'dottie',
    name: 'f(x) = cos(x) − x',
    latexFn: 'f(x) = \\cos(x) - x = 0',
    latexdFn: "f'(x) = -\\sin(x) - 1",
    fn: (x) => Math.cos(x) - x,
    dfn: (x) => -Math.sin(x) - 1,
    defaultX0: 1.2,
    x0Range: [-0.5, 2.5],
    plotXRange: [-1, 2.5],
    plotYRange: [-2.5, 2.5],
    exactRootDescription: 'x \\approx 0{,}73908513',
  },
  {
    id: 'exp3x',
    name: 'f(x) = eˣ − 3x',
    latexFn: 'f(x) = e^x - 3x = 0',
    latexdFn: "f'(x) = e^x - 3",
    fn: (x) => Math.exp(x) - 3 * x,
    dfn: (x) => Math.exp(x) - 3,
    defaultX0: 0.2,
    x0Range: [-0.5, 1.0],
    plotXRange: [-0.5, 2.5],
    plotYRange: [-2, 6],
    exactRootDescription: 'x_1 \\approx 0{,}61906129',
  },
];

interface IterationRow {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  nextX: number;
  stepDiff: number;
}

export const NewtonRaphsonExplorer: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('sqrt2');
  const preset = useMemo(
    () => NEWTON_PRESETS.find((p) => p.id === selectedId) ?? NEWTON_PRESETS[0],
    [selectedId],
  );

  const [x0, setX0] = useState<number>(preset.defaultX0);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Beräkna upp till 6 iterationer
  const iterations = useMemo(() => {
    const rows: IterationRow[] = [];
    let curX = x0;

    for (let i = 0; i < 6; i++) {
      const fx = preset.fn(curX);
      const dfx = preset.dfn(curX);
      const nextX = Math.abs(dfx) > 1e-12 ? curX - fx / dfx : curX;
      const stepDiff = Math.abs(nextX - curX);

      rows.push({
        n: i,
        xn: curX,
        fxn: fx,
        dfxn: dfx,
        nextX,
        stepDiff,
      });

      curX = nextX;
    }
    return rows;
  }, [preset, x0]);

  const activeRow = iterations[Math.min(currentStep, iterations.length - 1)];

  return (
    <div className="section-stack">
      <div className="tool-grid">
        <div className="panel section-stack">
          <div>
            <h3>Newtons metod & Tangentiteration</h3>
            <p className="muted-text">
              Hitta nollställen till <KatexBlock latex="f(x) = 0" /> genom att upprepade gånger följa tangenten ner till x-axeln:
            </p>
            <div className="result-banner" style={{ margin: '0.4rem 0' }}>
              <KatexBlock
                latex="x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}"
                displayMode
              />
            </div>
          </div>

          <div className="row-wrap" style={{ gap: '0.35rem' }}>
            {NEWTON_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`seg-btn ${p.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedId(p.id);
                  setX0(p.defaultX0);
                  setCurrentStep(0);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="section-stack" style={{ gap: '0.6rem' }}>
            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>
                  Startgissning <KatexBlock latex="x_0" displayMode={false} />
                </span>
                <strong>x₀ = {x0.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={preset.x0Range[0]}
                max={preset.x0Range[1]}
                step={0.05}
                value={x0}
                onChange={(e) => {
                  setX0(Number(e.target.value));
                  setCurrentStep(0);
                }}
              />
            </label>

            {/* Iterationskontroller */}
            <div className="row-wrap" style={{ gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={currentStep <= 0}
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeft size={16} /> Backa
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={currentStep >= 5}
                onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              >
                Nästa steg (n = {currentStep + 1}) <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(0)}
              >
                <RotateCcw size={15} /> Tillbaka till x₀
              </button>
            </div>
          </div>

          {/* Aktivt stegs sammanfattning */}
          <div className="result-banner section-stack" style={{ gap: '0.45rem', overflowX: 'auto' }}>
            <div>
              <strong>Iteration n = {activeRow.n}:</strong>
            </div>
            <div style={{ overflowX: 'auto', padding: '0.15rem 0' }}>
              <KatexBlock
                latex={`x_{${activeRow.n}} = ${activeRow.xn.toFixed(6)}, \\quad f(x_{${activeRow.n}}) = ${activeRow.fxn.toFixed(6)}`}
                displayMode={false}
              />
            </div>
            <div style={{ overflowX: 'auto', padding: '0.15rem 0' }}>
              <KatexBlock
                latex={`x_{${activeRow.n + 1}} = ${activeRow.xn.toFixed(6)} - \\frac{${activeRow.fxn.toFixed(6)}}{${activeRow.dfxn.toFixed(6)}} = ${activeRow.nextX.toFixed(6)}`}
                displayMode={false}
              />
            </div>
            <div className="muted-text" style={{ fontSize: '0.84rem' }}>
              Närmevärde till rot:{' '}
              <KatexBlock latex={preset.exactRootDescription} displayMode={false} /> (Differens: {activeRow.stepDiff.toExponential(2)})
            </div>
          </div>

          {/* Kvadratisk konvergens & tentatips */}
          <div className="warn-box" style={{ fontSize: '0.86rem' }}>
            <strong>Tentateori: Kvadratisk konvergens</strong>
            <div style={{ margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              <MathText text="Om $f'(r) \neq 0$ vid roten $r$ och startgissningen $x_0$ är tillräckligt nära, så är felet $|x_{n+1} - r| \approx C |x_n - r|^2$. Det innebär att **antalet korrekta decimaler fördubblas** för varje iteration!" />
            </div>
          </div>
        </div>

        {/* Graf med kurva och tangentlinje */}
        <FunctionPlot2D
          title={`Iteration n = ${activeRow.n}: Tangent från (${activeRow.xn.toFixed(2)}, ${activeRow.fxn.toFixed(2)})`}
          initialXRange={preset.plotXRange}
          initialYRange={preset.plotYRange}
          curves={[
            {
              fn: preset.fn,
              color: 'var(--text-primary)',
              label: 'f(x)',
              strokeWidth: 2.5,
            },
            // Tangentlinje: y = f(xn) + f'(xn)*(x - xn)
            {
              fn: (x) => activeRow.fxn + activeRow.dfxn * (x - activeRow.xn),
              color: 'var(--amber)',
              label: `Tangent i x_${activeRow.n}`,
              strokeWidth: 2,
            },
          ]}
          horizontalLines={[{ y: 0, color: 'var(--svg-axis)', label: 'y = 0' }]}
          verticalLines={[
            {
              x: activeRow.xn,
              color: 'var(--svg-blue)',
              dashed: true,
              label: `x_${activeRow.n}`,
            },
            {
              x: activeRow.nextX,
              color: 'var(--sage)',
              dashed: true,
              label: `x_${activeRow.n + 1}`,
            },
          ]}
          points={[
            {
              x: activeRow.xn,
              y: activeRow.fxn,
              color: 'var(--svg-blue)',
              label: `(x_${activeRow.n}, f(x_${activeRow.n}))`,
            },
            {
              x: activeRow.nextX,
              y: 0,
              color: 'var(--sage)',
              label: `x_${activeRow.n + 1}`,
            },
          ]}
        />
      </div>

      {/* Fullständig iterationstabell */}
      <div className="panel section-stack">
        <h4>Iterationstabell (n = 0 till 5)</h4>
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Steg n</th>
                <th><KatexBlock latex="x_n" /></th>
                <th><KatexBlock latex="f(x_n)" /></th>
                <th><KatexBlock latex="f'(x_n)" /></th>
                <th><KatexBlock latex="x_{n+1}" /></th>
                <th>Korrigering <KatexBlock latex="|x_{n+1} - x_n|" /></th>
              </tr>
            </thead>
            <tbody>
              {iterations.map((row) => (
                <tr
                  key={row.n}
                  style={{
                    backgroundColor: row.n === activeRow.n ? 'var(--accent-soft)' : undefined,
                    fontWeight: row.n === activeRow.n ? 600 : 400,
                  }}
                >
                  <td>n = {row.n}</td>
                  <td>{row.xn.toFixed(8)}</td>
                  <td>{row.fxn.toExponential(4)}</td>
                  <td>{row.dfxn.toFixed(6)}</td>
                  <td>{row.nextX.toFixed(8)}</td>
                  <td>{row.stepDiff.toExponential(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
