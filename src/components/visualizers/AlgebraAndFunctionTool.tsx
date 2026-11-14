import React, { useMemo, useState } from 'react';
import {
  BASE_FUNCTIONS,
  Fraction,
  describeFunctionTransform,
  frac,
  polyToLatex,
  solveCircleFromGeneral,
  solvePolynomialDivision,
} from '../../math/index.ts';
import type { BaseFunctionId } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'poly' | 'transform' | 'circle';

const evalPoly = (coeffs: readonly Fraction[], x: number): number => {
  let acc = 0;
  for (const c of coeffs) {
    acc = acc * x + c.toNumber();
  }
  return acc;
};

export const AlgebraAndFunctionTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('poly');

  // --- Subtab 1: Polynomdivision ---
  const [c3, setC3] = useState('1');
  const [c2, setC2] = useState('-2');
  const [c1, setC1] = useState('-5');
  const [c0, setC0] = useState('6');
  const [rootInput, setRootInput] = useState('3');

  const polyCalc = useMemo(() => {
    const f3 = Fraction.tryFromInput(c3);
    const f2 = Fraction.tryFromInput(c2);
    const f1 = Fraction.tryFromInput(c1);
    const f0 = Fraction.tryFromInput(c0);
    const fa = Fraction.tryFromInput(rootInput);
    if (!f3 || !f2 || !f1 || !f0 || !fa) {
      return { ok: false as const, error: 'Ange giltiga bråk eller heltal i alla koefficientfält (t.ex. -3, 1/2).' };
    }
    const rawCoeffs = [f3, f2, f1, f0];
    while (rawCoeffs.length > 2 && rawCoeffs[0].isZero()) {
      rawCoeffs.shift();
    }
    const res = solvePolynomialDivision(rawCoeffs, fa);
    return { ok: true as const, res, coeffs: rawCoeffs, rootA: fa };
  }, [c0, c1, c2, c3, rootInput]);

  const polyOk = polyCalc.ok ? polyCalc : null;

  // --- Subtab 2: Translation & Dilatation ---
  const [baseId, setBaseId] = useState<BaseFunctionId>('x2');
  const [paramA, setParamA] = useState(1);
  const [paramB, setParamB] = useState(1);
  const [paramC, setParamC] = useState(1);
  const [paramD, setParamD] = useState(-2);

  const transformMeta = useMemo(() => {
    const base = BASE_FUNCTIONS[baseId];
    const safeB = Math.abs(paramB) < 0.05 ? 0.5 : paramB;
    const desc = describeFunctionTransform(baseId, paramA, safeB, paramC, paramD);
    return { base, safeB, desc };
  }, [baseId, paramA, paramB, paramC, paramD]);

  // --- Subtab 3: Cirkelns ekvation ---
  const [circA, setCircA] = useState('-6');
  const [circB, setCircB] = useState('4');
  const [circC, setCircC] = useState('3');

  const circleCalc = useMemo(() => {
    const fa = Fraction.tryFromInput(circA);
    const fb = Fraction.tryFromInput(circB);
    const fc = Fraction.tryFromInput(circC);
    if (!fa || !fb || !fc) {
      return { ok: false as const, error: 'Ange giltiga rationella tal för a, b och c.' };
    }
    return { ok: true as const, res: solveCircleFromGeneral(fa, fb, fc), a: fa, b: fb, c: fc };
  }, [circA, circB, circC]);

  const circleOk = circleCalc.ok ? circleCalc : null;

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'poly' ? 'active' : ''}`}
          onClick={() => setSubTab('poly')}
        >
          Polynomdivision & faktorsatsen
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'transform' ? 'active' : ''}`}
          onClick={() => setSubTab('transform')}
        >
          Translation & skalning av grafer
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'circle' ? 'active' : ''}`}
          onClick={() => setSubTab('circle')}
        >
          Cirkel & kvadratkomplettering
        </button>
      </div>

      {subTab === 'poly' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Polynomdivision <KatexBlock latex="p(x) / (x - a)" /></h3>
              <p className="muted-text">
                Testa faktorsatsen och beräkna kvot och rest exakt i bråkform.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.5rem' }}>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>x³</span>
                <input className="num-input" style={{ width: '4.5rem' }} value={c3} onChange={(e) => setC3(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>x²</span>
                <input className="num-input" style={{ width: '4.5rem' }} value={c2} onChange={(e) => setC2(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>x</span>
                <input className="num-input" style={{ width: '4.5rem' }} value={c1} onChange={(e) => setC1(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>Konstant</span>
                <input className="num-input" style={{ width: '4.5rem' }} value={c0} onChange={(e) => setC0(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>a i (x − a)</span>
                <input className="num-input" style={{ width: '4.5rem' }} value={rootInput} onChange={(e) => setRootInput(e.target.value)} />
              </label>
            </div>

            <div className="row-wrap" style={{ gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setC3('1'); setC2('-2'); setC1('-5'); setC0('6'); setRootInput('3'); }}
              >
                Exempel 1 (delbart)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setC3('2'); setC2('-1'); setC1('3'); setC0('-4'); setRootInput('2'); }}
              >
                Exempel 2 (med rest)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setC3('0'); setC2('1'); setC1('-4'); setC0('-5'); setRootInput('5'); }}
              >
                Andragradare
              </button>
            </div>

            {!polyCalc.ok ? (
              <div className="warn-box">{polyCalc.error}</div>
            ) : (
              <>
                <div className={polyCalc.res.value.isFactor ? 'feedback-correct' : 'result-banner'}>
                  <div style={{ marginBottom: '0.35rem' }}>
                    <strong>{polyCalc.res.summary}</strong>
                  </div>
                  <KatexBlock
                    latex={`p(x) = ${polyToLatex(polyCalc.coeffs)}`}
                    displayMode
                  />
                  <KatexBlock latex={polyCalc.res.latexResult} displayMode />
                </div>
                <MathStepsDisplay steps={polyCalc.res.steps} defaultOpen />
              </>
            )}
          </div>

          <FunctionPlot2D
            title="Graf av p(x) och markerat värde p(a)"
            initialXRange={[-5, 5]}
            initialYRange={[-10, 10]}
            curves={
              polyOk
                ? [
                    {
                      fn: (x) => evalPoly(polyOk.coeffs, x),
                      color: 'var(--svg-blue)',
                      label: 'p(x)',
                    },
                    ...(polyOk.res.value.quotientCoeffs.length > 0
                      ? [
                          {
                            fn: (x: number) => evalPoly(polyOk.res.value.quotientCoeffs, x),
                            color: 'var(--sage)',
                            label: 'Kvot q(x)',
                            dashed: true,
                          },
                        ]
                      : []),
                  ]
                : []
            }
            points={
              polyOk
                ? [
                    {
                      x: polyOk.rootA.toNumber(),
                      y: polyOk.res.value.remainder.toNumber(),
                      color: polyOk.res.value.isFactor ? 'var(--sage)' : 'var(--amber)',
                      label: `(a, p(a)) = (${polyOk.rootA.toString()}, ${polyOk.res.value.remainder.toString()})`,
                    },
                  ]
                : []
            }
            verticalLines={
              polyOk
                ? [{ x: polyOk.rootA.toNumber(), color: 'var(--amber)', label: 'x = a' }]
                : []
            }
          />
        </div>
      )}

      {subTab === 'transform' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Graftransformationer: <KatexBlock latex="g(x) = a \cdot f(b(x - c)) + d" /></h3>
              <p className="muted-text">
                Se hur vertikal/horisontell skalning, spegling och translation påverkar en basfunktion.
              </p>
            </div>

            <label>
              <span className="muted-text" style={{ fontSize: '0.84rem', display: 'block', marginBottom: '0.25rem' }}>
                Basfunktion f(x)
              </span>
              <select
                className="select-input"
                value={baseId}
                onChange={(e) => setBaseId(e.target.value as BaseFunctionId)}
              >
                {Object.values(BASE_FUNCTIONS).map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="section-stack" style={{ gap: '0.6rem' }}>
              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Vertikal skalning / spegling (a)</span>
                  <strong>{paramA}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={paramA}
                  onChange={(e) => setParamA(Number(e.target.value))}
                />
              </label>

              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Inre skalning (b)</span>
                  <strong>{transformMeta.safeB}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={-3}
                  max={3}
                  step={0.5}
                  value={paramB}
                  onChange={(e) => setParamB(Number(e.target.value))}
                />
              </label>

              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Horisontell förskjutning (c)</span>
                  <strong>{paramC}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={-4}
                  max={4}
                  step={0.5}
                  value={paramC}
                  onChange={(e) => setParamC(Number(e.target.value))}
                />
              </label>

              <label>
                <div className="space-between" style={{ fontSize: '0.88rem' }}>
                  <span>Vertikal förskjutning (d)</span>
                  <strong>{paramD}</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={-4}
                  max={4}
                  step={0.5}
                  value={paramD}
                  onChange={(e) => setParamD(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="formula-box">
              <KatexBlock latex={transformMeta.desc.formulaLatex} displayMode />
              <div className="muted-text" style={{ fontSize: '0.86rem' }}>
                Definitionsmängd för basfunktionen: <KatexBlock latex={transformMeta.base.domainDesc} />
              </div>
            </div>

            <MathStepsDisplay steps={transformMeta.desc.steps} title="Transformationens delar" defaultOpen />
          </div>

          <FunctionPlot2D
            title="Jämförelse mellan basfunktion f(x) och g(x)"
            initialXRange={[-6, 6]}
            initialYRange={[-5, 5]}
            curves={[
              {
                fn: transformMeta.base.fn,
                color: 'var(--svg-purple)',
                label: `Bas: ${transformMeta.base.label}`,
                dashed: true,
              },
              {
                fn: (x) => paramA * transformMeta.base.fn(transformMeta.safeB * (x - paramC)) + paramD,
                color: 'var(--svg-blue)',
                label: 'Transformerad g(x)',
              },
            ]}
          />
        </div>
      )}

      {subTab === 'circle' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Cirkelns ekvation via kvadratkomplettering</h3>
              <p className="muted-text">
                Bestäm medelpunkt och radie för <KatexBlock latex="x^2 + ax + y^2 + by = c" /> utan pq-formel.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.6rem' }}>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>a (framför x)</span>
                <input className="num-input" style={{ width: '5rem' }} value={circA} onChange={(e) => setCircA(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>b (framför y)</span>
                <input className="num-input" style={{ width: '5rem' }} value={circB} onChange={(e) => setCircB(e.target.value)} />
              </label>
              <label>
                <span className="muted-text" style={{ fontSize: '0.82rem', display: 'block' }}>c (högerled)</span>
                <input className="num-input" style={{ width: '5rem' }} value={circC} onChange={(e) => setCircC(e.target.value)} />
              </label>
            </div>

            <div className="row-wrap" style={{ gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setCircA('-6'); setCircB('4'); setCircC('3'); }}
              >
                Medelpunkt (3, −2), r = 4
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setCircA('2'); setCircB('-5'); setCircC('0'); }}
              >
                Bråktal i kvadratkomplettering
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setCircA('4'); setCircB('4'); setCircC('-10'); }}
              >
                Tom lösningsmängd (r² &lt; 0)
              </button>
            </div>

            {!circleCalc.ok ? (
              <div className="warn-box">{circleCalc.error}</div>
            ) : (
              <>
                <div className={circleCalc.res.value.hasRealCircle ? 'result-banner' : 'warn-box'}>
                  <div style={{ marginBottom: '0.3rem' }}>
                    <strong>{circleCalc.res.summary}</strong>
                  </div>
                  <KatexBlock latex={circleCalc.res.latexResult} displayMode />
                </div>
                <MathStepsDisplay steps={circleCalc.res.steps} defaultOpen />
              </>
            )}
          </div>

          <FunctionPlot2D
            title="Cirkelns läge i xy-planet"
            aspectSquare
            initialXRange={[-6, 8]}
            initialYRange={[-6, 6]}
            points={
              circleOk && circleOk.res.value.hasRealCircle
                ? [
                    {
                      x: circleOk.res.value.centerX.toNumber(),
                      y: circleOk.res.value.centerY.toNumber(),
                      color: 'var(--amber)',
                      labelPlacement: 'top-left',
                      label: `M(${circleOk.res.value.centerX.toString()}, ${circleOk.res.value.centerY.toString()})`,
                    },
                  ]
                : []
            }
            extraSvg={(t) => {
              if (!circleOk || !circleOk.res.value.hasRealCircle || circleOk.res.value.radius === null) {
                return null;
              }
              const cx = circleOk.res.value.centerX.toNumber();
              const cy = circleOk.res.value.centerY.toNumber();
              const r = circleOk.res.value.radius;
              const scx = t.toSvgX(cx);
              const scy = t.toSvgY(cy);
              const rx = Math.abs(t.toSvgX(cx + r) - scx);
              const ry = Math.abs(t.toSvgY(cy + r) - scy);
              return (
                <g>
                  <ellipse
                    cx={scx}
                    cy={scy}
                    rx={rx}
                    ry={ry}
                    fill="color-mix(in srgb, var(--svg-blue) 12%, transparent)"
                    stroke="var(--svg-blue)"
                    strokeWidth={2.5}
                  />
                  <line
                    x1={scx}
                    y1={scy}
                    x2={t.toSvgX(cx + r)}
                    y2={scy}
                    stroke="var(--amber)"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={(scx + t.toSvgX(cx + r)) / 2}
                    y={scy + 15}
                    fontSize={11.5}
                    fontWeight={600}
                    textAnchor="middle"
                    fill="var(--amber)"
                    style={{ paintOrder: 'stroke', stroke: 'var(--svg-bg)', strokeWidth: 3.5 }}
                  >
                    r = {frac(Math.round(r * 100), 100).toNumber().toFixed(2).replace('.', ',')}
                  </text>
                </g>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};
