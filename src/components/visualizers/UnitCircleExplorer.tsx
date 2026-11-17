import React, { useId, useMemo, useState } from 'react';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathText } from '../common/MathText.tsx';

interface SpecialAngle {
  deg: number;
  radLatex: string;
  cosLatex: string;
  sinLatex: string;
  tanLatex: string;
  cosVal: number;
  sinVal: number;
}

const SPECIAL_ANGLES: SpecialAngle[] = [
  { deg: 0, radLatex: '0', cosLatex: '1', sinLatex: '0', tanLatex: '0', cosVal: 1, sinVal: 0 },
  { deg: 30, radLatex: '\\frac{\\pi}{6}', cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '\\frac{1}{\\sqrt{3}}', cosVal: Math.sqrt(3) / 2, sinVal: 0.5 },
  { deg: 45, radLatex: '\\frac{\\pi}{4}', cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}', tanLatex: '1', cosVal: Math.SQRT1_2, sinVal: Math.SQRT1_2 },
  { deg: 60, radLatex: '\\frac{\\pi}{3}', cosLatex: '\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}', cosVal: 0.5, sinVal: Math.sqrt(3) / 2 },
  { deg: 90, radLatex: '\\frac{\\pi}{2}', cosLatex: '0', sinLatex: '1', tanLatex: '\\text{ej def.}', cosVal: 0, sinVal: 1 },
  { deg: 120, radLatex: '\\frac{2\\pi}{3}', cosLatex: '-\\frac{1}{2}', sinLatex: '\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}', cosVal: -0.5, sinVal: Math.sqrt(3) / 2 },
  { deg: 135, radLatex: '\\frac{3\\pi}{4}', cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '\\frac{\\sqrt{2}}{2}', tanLatex: '-1', cosVal: -Math.SQRT1_2, sinVal: Math.SQRT1_2 },
  { deg: 150, radLatex: '\\frac{5\\pi}{6}', cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '\\frac{1}{2}', tanLatex: '-\\frac{1}{\\sqrt{3}}', cosVal: -Math.sqrt(3) / 2, sinVal: 0.5 },
  { deg: 180, radLatex: '\\pi', cosLatex: '-1', sinLatex: '0', tanLatex: '0', cosVal: -1, sinVal: 0 },
  { deg: 210, radLatex: '\\frac{7\\pi}{6}', cosLatex: '-\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '\\frac{1}{\\sqrt{3}}', cosVal: -Math.sqrt(3) / 2, sinVal: -0.5 },
  { deg: 225, radLatex: '\\frac{5\\pi}{4}', cosLatex: '-\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '1', cosVal: -Math.SQRT1_2, sinVal: -Math.SQRT1_2 },
  { deg: 240, radLatex: '\\frac{4\\pi}{3}', cosLatex: '-\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '\\sqrt{3}', cosVal: -0.5, sinVal: -Math.sqrt(3) / 2 },
  { deg: 270, radLatex: '\\frac{3\\pi}{2}', cosLatex: '0', sinLatex: '-1', tanLatex: '\\text{ej def.}', cosVal: 0, sinVal: -1 },
  { deg: 300, radLatex: '\\frac{5\\pi}{3}', cosLatex: '\\frac{1}{2}', sinLatex: '-\\frac{\\sqrt{3}}{2}', tanLatex: '-\\sqrt{3}', cosVal: 0.5, sinVal: -Math.sqrt(3) / 2 },
  { deg: 315, radLatex: '\\frac{7\\pi}{4}', cosLatex: '\\frac{\\sqrt{2}}{2}', sinLatex: '-\\frac{\\sqrt{2}}{2}', tanLatex: '-1', cosVal: Math.SQRT1_2, sinVal: -Math.SQRT1_2 },
  { deg: 330, radLatex: '\\frac{11\\pi}{6}', cosLatex: '\\frac{\\sqrt{3}}{2}', sinLatex: '-\\frac{1}{2}', tanLatex: '-\\frac{1}{\\sqrt{3}}', cosVal: Math.sqrt(3) / 2, sinVal: -0.5 },
];

function radToLatexApprox(rad: number): string {
  if (Math.abs(rad) < 1e-5) return '0';
  if (Math.abs(rad - (-Math.PI / 6)) < 1e-4) return '-\\frac{\\pi}{6}';
  if (Math.abs(rad - (-Math.PI / 4)) < 1e-4) return '-\\frac{\\pi}{4}';
  if (Math.abs(rad - (-Math.PI / 3)) < 1e-4) return '-\\frac{\\pi}{3}';
  if (Math.abs(rad - (-Math.PI / 2)) < 1e-4) return '-\\frac{\\pi}{2}';
  if (Math.abs(rad - (-2 * Math.PI / 3)) < 1e-4) return '-\\frac{2\\pi}{3}';
  if (Math.abs(rad - (-3 * Math.PI / 4)) < 1e-4) return '-\\frac{3\\pi}{4}';
  if (Math.abs(rad - (-5 * Math.PI / 6)) < 1e-4) return '-\\frac{5\\pi}{6}';
  if (Math.abs(rad - (-Math.PI)) < 1e-4) return '-\\pi';

  for (const sa of SPECIAL_ANGLES) {
    const saRad = (sa.deg * Math.PI) / 180;
    if (Math.abs(rad - saRad) < 1e-4) return sa.radLatex;
  }

  const norm = ((rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  for (const sa of SPECIAL_ANGLES) {
    const saRad = (sa.deg * Math.PI) / 180;
    if (Math.abs(norm - saRad) < 1e-4) return sa.radLatex;
  }
  return `${rad.toFixed(3)}\\text{ rad}`;
}

export const UnitCircleExplorer: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState<number>(150);
  const [highlightArc, setHighlightArc] = useState<'both' | 'arcsin' | 'arccos'>('both');

  const clipId = useId();

  // Beräkningar
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(angleRad);
  const sinVal = Math.sin(angleRad);
  const tanVal = Math.abs(cosVal) > 1e-6 ? sinVal / cosVal : null;

  // Huvudvärden för inverser
  const arcsinVal = Math.asin(sinVal); // in [-pi/2, pi/2]
  const arccosVal = Math.acos(cosVal); // in [0, pi]
  const arctanVal = tanVal !== null ? Math.atan(tanVal) : null;

  const arcsinDeg = (arcsinVal * 180) / Math.PI;
  const arccosDeg = (arccosVal * 180) / Math.PI;

  const isExactAngle = SPECIAL_ANGLES.find((sa) => sa.deg === ((angleDeg % 360) + 360) % 360);

  // SVG-geometri: Cirkel med radie R = 110, mittpunkt (160, 160)
  const cx = 160;
  const cy = 160;
  const R = 110;

  // Koordinater för punkten P
  const px = cx + R * cosVal;
  const py = cy - R * sinVal; // SVG har y nedåt

  // Arcsin-punkt på höger halvcirkel
  const arcsinPx = cx + R * Math.cos(arcsinVal);
  const arcsinPy = cy - R * Math.sin(arcsinVal);

  // Arccos-punkt på övre halvcirkel
  const arccosPx = cx + R * Math.cos(arccosVal);
  const arccosPy = cy - R * Math.sin(arccosVal);

  // Vinkelbåge i SVG för theta
  const arcPath = useMemo(() => {
    const rArc = 28;
    const rad = (angleDeg * Math.PI) / 180;
    const endX = cx + rArc * Math.cos(rad);
    const endY = cy - rArc * Math.sin(rad);
    const largeArc = Math.abs(angleDeg) > 180 ? 1 : 0;
    return `M ${cx + rArc} ${cy} A ${rArc} ${rArc} 0 ${largeArc} ${angleDeg < 0 ? 1 : 0} ${endX} ${endY}`;
  }, [angleDeg]);

  const differsFromArcsin = Math.abs(angleDeg - arcsinDeg) > 0.5 && Math.abs(angleDeg - (arcsinDeg + 360)) > 0.5;
  const differsFromArccos = Math.abs(angleDeg - arccosDeg) > 0.5;

  return (
    <div className="tool-grid">
      <div className="panel section-stack">
        <div>
          <h3>Interaktiv Enhetscirkel & Arcus-huvudvärden</h3>
          <p className="muted-text">
            Utforska trigonometriska värden och se varför inverserna <KatexBlock latex="\arcsin" /> och <KatexBlock latex="\arccos" /> ger andra vinklar utanför sina principgrenar.
          </p>
        </div>

        {/* Snabbval av vanliga vinklar */}
        <div>
          <div className="muted-text" style={{ fontSize: '0.82rem', marginBottom: '0.35rem' }}>
            Vanliga tentalägen (klicka för att testa):
          </div>
          <div className="row-wrap" style={{ gap: '0.3rem' }}>
            {[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 315, 330].map((deg) => (
              <button
                key={deg}
                type="button"
                className={`seg-btn ${angleDeg === deg ? 'active' : ''}`}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setAngleDeg(deg)}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        <label>
          <div className="space-between" style={{ fontSize: '0.88rem' }}>
            <span>
              Vinkel <KatexBlock latex="\theta" displayMode={false} />
            </span>
            <strong>
              {angleDeg}° (<KatexBlock latex={radToLatexApprox(angleRad)} displayMode={false} />)
            </strong>
          </div>
          <input
            type="range"
            className="range-slider"
            min={0}
            max={360}
            step={5}
            value={((angleDeg % 360) + 360) % 360}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
          />
        </label>

        {/* Värdetabell */}
        <div className="table-card" style={{ padding: '0.5rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Funktion</th>
                <th>Exakt / Avrundat</th>
                <th>Invers huvudvärde</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><KatexBlock latex="\sin(\theta)" displayMode={false} /></td>
                <td>
                  {isExactAngle ? (
                    <KatexBlock latex={isExactAngle.sinLatex} displayMode={false} />
                  ) : (
                    sinVal.toFixed(4)
                  )}
                </td>
                <td>
                  <KatexBlock
                    latex={`\\arcsin(\\sin\\theta) = ${radToLatexApprox(arcsinVal)}`}
                    displayMode={false}
                  />{' '}
                  <span className="muted-text">({arcsinDeg.toFixed(1)}°)</span>
                </td>
              </tr>
              <tr>
                <td><KatexBlock latex="\cos(\theta)" displayMode={false} /></td>
                <td>
                  {isExactAngle ? (
                    <KatexBlock latex={isExactAngle.cosLatex} displayMode={false} />
                  ) : (
                    cosVal.toFixed(4)
                  )}
                </td>
                <td>
                  <KatexBlock
                    latex={`\\arccos(\\cos\\theta) = ${radToLatexApprox(arccosVal)}`}
                    displayMode={false}
                  />{' '}
                  <span className="muted-text">({arccosDeg.toFixed(1)}°)</span>
                </td>
              </tr>
              <tr>
                <td><KatexBlock latex="\tan(\theta)" displayMode={false} /></td>
                <td>
                  {isExactAngle ? (
                    <KatexBlock latex={isExactAngle.tanLatex} displayMode={false} />
                  ) : tanVal !== null ? (
                    tanVal.toFixed(4)
                  ) : (
                    'ej def.'
                  )}
                </td>
                <td>
                  {arctanVal !== null ? (
                    <>
                      <KatexBlock
                        latex={`\\arctan(\\tan\\theta) = ${radToLatexApprox(arctanVal)}`}
                        displayMode={false}
                      />{' '}
                      <span className="muted-text">({((arctanVal * 180) / Math.PI).toFixed(1)}°)</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tentavarning & pedagogisk förklaring */}
        {differsFromArcsin && (
          <div className="warn-box" style={{ fontSize: '0.86rem' }}>
            <strong>
              Tentafälla för <KatexBlock latex="\arcsin" displayMode={false} />:
            </strong>
            <div style={{ margin: '0.3rem 0 0', lineHeight: 1.5 }}>
              <MathText
                text={`Vinkeln $\\theta = ${angleDeg}^\\circ$ har $\\sin(${angleDeg}^\\circ) = ${sinVal.toFixed(3)}$. Men $\\arcsin$ kan **bara** svara i intervallet $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ ([-90°, 90°]). Därför projiceras svaret horisontellt till högra halvan av cirkeln: **$\\arcsin(\\sin(${angleDeg}^\\circ)) = ${arcsinDeg.toFixed(1)}^\\circ$** ($${radToLatexApprox(arcsinVal)}$$).`}
              />
            </div>
          </div>
        )}

        <div className="row-wrap" style={{ gap: '0.4rem', marginTop: '0.2rem' }}>
          <span className="muted-text" style={{ fontSize: '0.82rem', alignSelf: 'center' }}>
            Visa intervall:
          </span>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${highlightArc === 'both' ? 'active' : ''}`}
            onClick={() => setHighlightArc('both')}
          >
            Alla
          </button>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${highlightArc === 'arcsin' ? 'active' : ''}`}
            onClick={() => setHighlightArc('arcsin')}
          >
            Endast arcsin ([-π/2, π/2])
          </button>
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${highlightArc === 'arccos' ? 'active' : ''}`}
            onClick={() => setHighlightArc('arccos')}
          >
            Endast arccos ([0, π])
          </button>
        </div>
      </div>

      {/* SVG-graf för enhetscirkeln */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }}>
          Enhetscirkeln <KatexBlock latex="x^2 + y^2 = 1" />
        </h4>

        <svg
          viewBox="0 0 320 320"
          width="100%"
          style={{ maxWidth: '340px', background: 'var(--svg-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}
          aria-label="Enhetscirkeln med vinkel, cosinus och sinus"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="320" height="320" />
            </clipPath>
          </defs>

          {/* Arcsin principal branch highlight: högra halvcirkeln [-pi/2, pi/2] */}
          {(highlightArc === 'both' || highlightArc === 'arcsin') && (
            <path
              d={`M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R}`}
              fill="none"
              stroke="var(--sage)"
              strokeWidth="6"
              strokeOpacity="0.45"
            />
          )}

          {/* Arccos principal branch highlight: övre halvcirkeln [0, pi] */}
          {(highlightArc === 'both' || highlightArc === 'arccos') && (
            <path
              d={`M ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx - R} ${cy}`}
              fill="none"
              stroke="var(--svg-blue)"
              strokeWidth="6"
              strokeOpacity="0.35"
            />
          )}

          {/* Cirkelns axlar */}
          <line x1={20} y1={cy} x2={300} y2={cy} stroke="var(--svg-axis)" strokeWidth="1.2" />
          <line x1={cx} y1={20} x2={cx} y2={300} stroke="var(--svg-axis)" strokeWidth="1.2" />

          {/* Ticks vid 1 och -1 */}
          <line x1={cx + R} y1={cy - 4} x2={cx + R} y2={cy + 4} stroke="var(--svg-axis)" strokeWidth="1.5" />
          <line x1={cx - R} y1={cy - 4} x2={cx - R} y2={cy + 4} stroke="var(--svg-axis)" strokeWidth="1.5" />
          <line x1={cx - 4} y1={cy - R} x2={cx + 4} y2={cy - R} stroke="var(--svg-axis)" strokeWidth="1.5" />
          <line x1={cx - 4} y1={cy + R} x2={cx + 4} y2={cy + R} stroke="var(--svg-axis)" strokeWidth="1.5" />

          <text x={cx + R + 5} y={cy + 14} fontSize="11" fill="var(--text-muted)">1</text>
          <text x={cx - R - 16} y={cy + 14} fontSize="11" fill="var(--text-muted)">-1</text>
          <text x={cx + 6} y={cy - R + 4} fontSize="11" fill="var(--text-muted)">1</text>
          <text x={cx + 6} y={cy + R + 12} fontSize="11" fill="var(--text-muted)">-1</text>

          {/* Själva enhetscirkeln */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border-strong)" strokeWidth="1.8" />

          {/* Rätvinklig referenstriangel */}
          <polygon
            points={`${cx},${cy} ${px},${cy} ${px},${py}`}
            fill="var(--accent-soft)"
            opacity="0.5"
          />

          {/* Cosinus (horisontell katet) */}
          <line
            x1={cx}
            y1={cy}
            x2={px}
            y2={cy}
            stroke="var(--svg-blue)"
            strokeWidth="3"
          />

          {/* Sinus (vertikal katet) */}
          <line
            x1={px}
            y1={cy}
            x2={px}
            y2={py}
            stroke="var(--amber)"
            strokeWidth="3"
          />

          {/* Hypotenusa / radievektor */}
          <line
            x1={cx}
            y1={cy}
            x2={px}
            y2={py}
            stroke="var(--text-primary)"
            strokeWidth="2"
          />

          {/* Vinkelbåge */}
          {Math.abs(angleDeg) > 2 && (
            <path d={arcPath} fill="none" stroke="var(--svg-purple)" strokeWidth="2" />
          )}

          {/* Streckad linje till arcsin-motsvarighet om vinkeln skiljer sig */}
          {differsFromArcsin && (
            <>
              <line
                x1={px}
                y1={py}
                x2={arcsinPx}
                y2={arcsinPy}
                stroke="var(--sage)"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
              <circle cx={arcsinPx} cy={arcsinPy} r={4.5} fill="var(--sage)" />
              <text x={arcsinPx + 6} y={arcsinPy - 5} fontSize="10.5" fill="var(--sage)" fontWeight="bold">
                arcsin
              </text>
            </>
          )}

          {/* Streckad linje till arccos-motsvarighet om vinkeln skiljer sig */}
          {differsFromArccos && (
            <>
              <line
                x1={px}
                y1={py}
                x2={arccosPx}
                y2={arccosPy}
                stroke="var(--svg-blue)"
                strokeDasharray="4 3"
                strokeWidth="1.5"
              />
              <circle cx={arccosPx} cy={arccosPy} r={4.5} fill="var(--svg-blue)" />
              <text x={arccosPx + 6} y={arccosPy + 12} fontSize="10.5" fill="var(--svg-blue)" fontWeight="bold">
                arccos
              </text>
            </>
          )}

          {/* Vald punkt P */}
          <circle cx={px} cy={py} r={6} fill="var(--accent)" stroke="#fff" strokeWidth="2" />
          <text
            x={px + (cosVal >= 0 ? 8 : -48)}
            y={py + (sinVal >= 0 ? -8 : 16)}
            fontSize="11.5"
            fontWeight="bold"
            fill="var(--text-primary)"
          >
            P(cos, sin)
          </text>
        </svg>

        {/* Färgförklaring */}
        <div className="row-wrap" style={{ gap: '0.8rem', marginTop: '0.75rem', fontSize: '0.82rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '4px', background: 'var(--svg-blue)', borderRadius: '2px' }} />
            <KatexBlock latex="\cos\theta" /> (x-led)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '4px', background: 'var(--amber)', borderRadius: '2px' }} />
            <KatexBlock latex="\sin\theta" /> (y-led)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '4px', background: 'var(--sage)', borderRadius: '2px' }} />
            <KatexBlock latex="\arcsin" /> gren
          </span>
        </div>
      </div>
    </div>
  );
};
