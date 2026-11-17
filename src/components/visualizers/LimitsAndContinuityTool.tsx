import React, { useMemo, useState } from 'react';
import { analyzeLimitPreset } from '../../math/index.ts';
import type { LimitPresetId } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { EpsilonDeltaExplorer } from './EpsilonDeltaExplorer.tsx';
import { FunctionPlot2D } from './FunctionPlot2D.tsx';

type SubTab = 'stdlimits' | 'continuity' | 'epsilondelta';

const PRESET_OPTIONS: { id: LimitPresetId; label: string }[] = [
  { id: 'sin_kx_over_x', label: 'sin(kx) / x' },
  { id: 'exp_kx_minus_1', label: '(e^(kx) − 1) / x' },
  { id: 'ln_1_plus_kx', label: 'ln(1 + kx) / x' },
  { id: 'one_minus_cos_kx', label: '(1 − cos(kx)) / x²' },
  { id: 'factor_zero_over_zero', label: '(x² − k²) / (x − k)' },
];

export const LimitsAndContinuityTool: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('stdlimits');

  // --- Subtab 1: Standardgränsvärden ---
  const [preset, setPreset] = useState<LimitPresetId>('sin_kx_over_x');
  const [kVal, setKVal] = useState(3);

  const analysis = useMemo(() => analyzeLimitPreset(preset, kVal), [kVal, preset]);

  const approachOffsets = [-0.5, -0.1, -0.01, 0.01, 0.1, 0.5];
  const centerX = Number.isFinite(analysis.xApproach) ? analysis.xApproach : 0;

  // --- Subtab 2: Kontinuitet i styckvis funktion ---
  // f(x) = ln(1 + 5x)/x för x > 0 (gränsvärde 5), och ax + b? Låt oss ha x - k + 5? Nej: 2x + k för x <= 0
  const [contK, setContK] = useState(3);
  const leftLimit = contK; // f(0^-) = 2*0 + k = k
  const rightLimit = 5; // lim_{x->0^+} ln(1+5x)/x = 5
  const isContinuous = Math.abs(leftLimit - rightLimit) < 1e-6;

  return (
    <div className="section-stack">
      <div className="tool-subtabs">
        <button
          type="button"
          className={`seg-btn ${subTab === 'stdlimits' ? 'active' : ''}`}
          onClick={() => setSubTab('stdlimits')}
        >
          Standardgränsvärden & 0/0-form
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'continuity' ? 'active' : ''}`}
          onClick={() => setSubTab('continuity')}
        >
          Kontinuitet & gränsvärden i styckvis funktion
        </button>
        <button
          type="button"
          className={`seg-btn ${subTab === 'epsilondelta' ? 'active' : ''}`}
          onClick={() => setSubTab('epsilondelta')}
        >
          ε-δ-definitionen & bevisföring
        </button>
      </div>

      {subTab === 'stdlimits' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Standardgränsvärden (utan L’Hôpital)</h3>
              <p className="muted-text">
                Undersök uttrycket numeriskt från vänster och höger och se algebraisk omskrivning via standardgränsvärden.
              </p>
            </div>

            <div className="row-wrap" style={{ gap: '0.35rem' }}>
              {PRESET_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`seg-btn ${preset === opt.id ? 'active' : ''}`}
                  onClick={() => setPreset(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Konstant k</span>
                <strong>{kVal}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={1}
                max={6}
                step={1}
                value={kVal}
                onChange={(e) => setKVal(Number(e.target.value))}
              />
            </label>

            <div className="result-banner">
              <KatexBlock
                latex={`\\lim_{${analysis.targetLatex}} ${analysis.exprLatex} = ${analysis.limitValueLatex}`}
                displayMode
              />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>x</th>
                  <th>f(x)</th>
                </tr>
              </thead>
              <tbody>
                {approachOffsets.map((dx) => {
                  const x = centerX + dx;
                  const y = analysis.fn(x);
                  return (
                    <tr key={dx}>
                      <td>{x.toFixed(3)}</td>
                      <td>{Number.isFinite(y) ? y.toFixed(5) : 'odefinierad'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <MathStepsDisplay steps={analysis.steps} defaultOpen />
          </div>

          <FunctionPlot2D
            title="Hävbar diskontinuitet vid gränsvärdespunkten"
            initialXRange={[centerX - 4, centerX + 4]}
            initialYRange={[-2, Math.max(6, analysis.limitNumeric + 3)]}
            curves={[{ fn: analysis.fn, color: 'var(--svg-blue)', label: 'f(x)' }]}
            points={[
              {
                x: centerX,
                y: analysis.limitNumeric,
                color: 'var(--amber)',
                hollow: true,
                label: `Gränsvärde L = ${analysis.limitNumeric}`,
              },
            ]}
          />
        </div>
      )}

      {subTab === 'continuity' && (
        <div className="tool-grid">
          <div className="panel section-stack">
            <div>
              <h3>Justera k för kontinuitet i <KatexBlock latex="x = 0" /></h3>
              <p className="muted-text">
                Bestäm värdet på konstanten <KatexBlock latex="k" /> så att funktionen nedan är kontinuerlig överallt.
              </p>
            </div>

            <div className="formula-box">
              <KatexBlock
                latex={`f(x) = \\begin{cases} \\dfrac{\\ln(1 + 5x)}{x}, & x > 0 \\\\[6pt] 2x + k, & x \\le 0 \\end{cases}`}
                displayMode
              />
            </div>

            <label>
              <div className="space-between" style={{ fontSize: '0.88rem' }}>
                <span>Parameter k</span>
                <strong>{contK}</strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={0}
                max={8}
                step={0.5}
                value={contK}
                onChange={(e) => setContK(Number(e.target.value))}
              />
            </label>

            <div className={isContinuous ? 'feedback-correct' : 'warn-box'}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>
                  {isContinuous
                    ? 'Kontinuerlig i x = 0! Vänster- och högergränsvärdet sammanfaller.'
                    : 'Diskontinuitet (hopp) i x = 0.'}
                </strong>
              </div>
              <KatexBlock
                latex={`\\lim_{x \\to 0^-} f(x) = f(0) = ${leftLimit}, \\qquad \\lim_{x \\to 0^+} f(x) = 5 \\cdot \\lim_{x \\to 0^+} \\frac{\\ln(1+5x)}{5x} = ${rightLimit}`}
                displayMode
              />
            </div>
          </div>

          <FunctionPlot2D
            title="Vänster- och högerdel av den styckvisa funktionen"
            initialXRange={[-3, 3]}
            initialYRange={[-2, 9]}
            curves={[
              {
                fn: (x) => (x <= 0 ? 2 * x + contK : Number.NaN),
                color: 'var(--sage)',
                label: `2x + ${contK} (x ≤ 0)`,
              },
              {
                fn: (x) => (x > 0 ? Math.log(1 + 5 * x) / x : Number.NaN),
                color: 'var(--svg-blue)',
                label: 'ln(1+5x)/x (x > 0)',
              },
            ]}
            points={[
              { x: 0, y: leftLimit, color: 'var(--sage)', label: `f(0) = ${leftLimit}` },
              {
                x: 0,
                y: rightLimit,
                color: 'var(--svg-blue)',
                hollow: !isContinuous,
                label: 'Högergräns = 5',
              },
            ]}
          />
        </div>
      )}

      {subTab === 'epsilondelta' && <EpsilonDeltaExplorer />}
    </div>
  );
};
