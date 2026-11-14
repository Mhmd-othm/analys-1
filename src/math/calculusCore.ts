import { Fraction, frac, numToLatex } from './fraction.ts';
import type {
  CalculationResult,
  CircleValue,
  GeometricSeriesValue,
  MaclaurinValue,
  MathStep,
  PolyDivisionValue,
  TrigSolutionValue,
} from './types.ts';

/**
 * Formaterar ett polynom med koefficienter från högsta grad till konstantterm till LaTeX.
 */
export function polyToLatex(coeffs: readonly Fraction[], variable = 'x'): string {
  const deg = coeffs.length - 1;
  const terms: string[] = [];

  coeffs.forEach((c, idx) => {
    if (c.isZero()) return;
    const power = deg - idx;
    const absC = c.abs();
    const isNeg = c.isNegative();
    let term = '';

    if (power === 0) {
      term = absC.toLatex();
    } else {
      const coeffStr = absC.isOne() ? '' : absC.toLatex();
      const varStr = power === 1 ? variable : `${variable}^{${power}}`;
      term = `${coeffStr}${varStr}`;
    }

    if (terms.length === 0) {
      terms.push(isNeg ? `-${term}` : term);
    } else {
      terms.push(isNeg ? ` - ${term}` : ` + ${term}`);
    }
  });

  return terms.length === 0 ? '0' : terms.join('');
}

/**
 * Utför polynomdivision p(x) / (x - a) med Horners schema och returnerar kvot + rest.
 */
export function solvePolynomialDivision(
  coeffs: readonly Fraction[],
  rootA: Fraction,
): CalculationResult<PolyDivisionValue> {
  if (coeffs.length < 2) {
    return {
      value: {
        dividendCoeffs: [...coeffs],
        rootA,
        quotientCoeffs: [],
        remainder: coeffs[0] ?? frac(0),
        isFactor: (coeffs[0] ?? frac(0)).isZero(),
        quotientLatex: '0',
      },
      latexResult: '0',
      steps: [],
      summary: 'Polynomet måste ha grad minst 1.',
      error: 'Ange ett polynom av minst grad 1.',
    };
  }

  const n = coeffs.length;
  const q: Fraction[] = [];
  let acc = coeffs[0];
  q.push(acc);

  for (let i = 1; i < n - 1; i++) {
    acc = coeffs[i].add(acc.mul(rootA));
    q.push(acc);
  }
  const remainder = coeffs[n - 1].add(acc.mul(rootA));
  const isFactor = remainder.isZero();

  const pLatex = polyToLatex(coeffs);
  const divisorLatex = rootA.isZero()
    ? 'x'
    : rootA.isNegative()
      ? `x + ${rootA.abs().toLatex()}`
      : `x - ${rootA.toLatex()}`;
  const quotientLatex = polyToLatex(q);

  const steps: MathStep[] = [
    {
      title: 'Faktorsatsen: testa p(a)',
      explanation: `Enligt faktorsatsen är $(${divisorLatex})$ en faktor i $p(x)$ om och endast om $p(${rootA.toLatex()}) = 0$.`,
      latex: `p(${rootA.toLatex()}) = ${remainder.toLatex()}`,
    },
    {
      title: 'Polynomdivision med kvot och rest',
      explanation:
        'Vi delar $p(x)$ med $(' +
        divisorLatex +
        ')$ steg för steg från högsta gradtermen (motsvarande Horners schema).',
      latex: `\\frac{${pLatex}}{${divisorLatex}} = ${quotientLatex}${
        isFactor ? '' : ` + \\frac{${remainder.toLatex()}}{${divisorLatex}}`
      }`,
    },
    {
      title: isFactor ? 'Faktorisering klar!' : 'Resten är nollskild',
      explanation: isFactor
        ? `Eftersom resten är $0$ är $(${divisorLatex})$ en faktor och vi får faktoriseringen:`
        : `Eftersom resten är $${remainder.toLatex()} \\neq 0$ är $(${divisorLatex})$ inte en faktor i $p(x)$.`,
      latex: isFactor
        ? `p(x) = (${divisorLatex})(${quotientLatex})`
        : `p(x) = (${divisorLatex})(${quotientLatex}) + ${remainder.toLatex()}`,
    },
  ];

  return {
    value: {
      dividendCoeffs: [...coeffs],
      rootA,
      quotientCoeffs: q,
      remainder,
      isFactor,
      quotientLatex,
    },
    latexResult: isFactor
      ? `(${divisorLatex})(${quotientLatex})`
      : `${quotientLatex},\\; \\text{rest } ${remainder.toLatex()}`,
    steps,
    summary: isFactor
      ? `(${divisorLatex}) är en faktor i p(x).`
      : `Resten vid division med (${divisorLatex}) blir ${remainder.toString()}.`,
  };
}

/**
 * Kvadratkompletterar cirkelns ekvation x^2 + ax + y^2 + by = c (utan pq-formel!).
 */
export function solveCircleFromGeneral(
  a: Fraction,
  b: Fraction,
  c: Fraction,
): CalculationResult<CircleValue> {
  const half = frac(1, 2);
  const h = a.mul(half); // (x + h)^2
  const k = b.mul(half); // (y + k)^2
  const centerX = h.neg();
  const centerY = k.neg();
  const radiusSq = c.add(h.mul(h)).add(k.mul(k));
  const hasRealCircle = radiusSq.num > 0n;
  const radius = hasRealCircle ? Math.sqrt(radiusSq.toNumber()) : null;
  const radiusLatex = hasRealCircle ? `\\sqrt{${radiusSq.toLatex()}}` : '-';

  const xTerm = h.isZero()
    ? 'x^2'
    : h.isNegative()
      ? `(x - ${h.abs().toLatex()})^2`
      : `(x + ${h.toLatex()})^2`;
  const yTerm = k.isZero()
    ? 'y^2'
    : k.isNegative()
      ? `(y - ${k.abs().toLatex()})^2`
      : `(y + ${k.toLatex()})^2`;

  const steps: MathStep[] = [
    {
      title: 'Gruppera x-termer och y-termer',
      explanation: 'Samla termerna med $x$ för sig och termerna med $y$ för sig i vänsterledet.',
      latex: `(x^2 ${a.isNegative() ? '-' : '+'} ${a.abs().toLatex()}x) + (y^2 ${
        b.isNegative() ? '-' : '+'
      } ${b.abs().toLatex()}y) = ${c.toLatex()}`,
    },
    {
      title: 'Kvadratkomplettera både x och y',
      explanation:
        'Addera kvadraten av halva koefficienten framför $x$ och $y$ till båda leden.',
      latex: `${xTerm} + ${yTerm} = ${c.toLatex()} + \\left(${h.toLatex()}\\right)^2 + \\left(${k.toLatex()}\\right)^2 = ${radiusSq.toLatex()}`,
    },
    {
      title: 'Avläs medelpunkt och radie',
      explanation: hasRealCircle
        ? `Cirkeln har medelpunkt $(x_0, y_0) = (${centerX.toLatex()}, ${centerY.toLatex()})$ och radie $r = ${radiusLatex} \\approx ${radius!.toFixed(3)}$.`
        : radiusSq.isZero()
          ? `Högerledet är $0$, så ekvationen beskriver bara en enstaka punkt $(${centerX.toLatex()}, ${centerY.toLatex()})$.`
          : `Högerledet är negativt ($${radiusSq.toLatex()} < 0$), så ekvationen saknar reella lösningar.`,
      latex: hasRealCircle
        ? `(x_0, y_0) = (${centerX.toLatex()},\\, ${centerY.toLatex()}), \\qquad r = ${radiusLatex}`
        : `r^2 = ${radiusSq.toLatex()}`,
    },
  ];

  return {
    value: {
      centerX,
      centerY,
      radiusSq,
      radius,
      radiusLatex,
      hasRealCircle,
    },
    latexResult: `${xTerm} + ${yTerm} = ${radiusSq.toLatex()}`,
    steps,
    summary: hasRealCircle
      ? `Medelpunkt (${centerX.toString()}, ${centerY.toString()}), radie ≈ ${radius!.toFixed(2)}`
      : 'Ingen reell cirkel (r² ≤ 0)',
  };
}

export type BaseFunctionId = 'x2' | 'sqrt' | 'abs' | 'inv' | 'sin' | 'exp' | 'ln';

export interface BaseFunctionMeta {
  id: BaseFunctionId;
  label: string;
  latex: string;
  fn: (x: number) => number;
  domainDesc: string;
}

export const BASE_FUNCTIONS: Record<BaseFunctionId, BaseFunctionMeta> = {
  x2: {
    id: 'x2',
    label: 'f(x) = x²',
    latex: 'x^2',
    fn: (x) => x * x,
    domainDesc: '\\mathbb{R}',
  },
  sqrt: {
    id: 'sqrt',
    label: 'f(x) = √x',
    latex: '\\sqrt{x}',
    fn: (x) => (x < 0 ? Number.NaN : Math.sqrt(x)),
    domainDesc: '[0, \\infty[',
  },
  abs: {
    id: 'abs',
    label: 'f(x) = |x|',
    latex: '|x|',
    fn: (x) => Math.abs(x),
    domainDesc: '\\mathbb{R}',
  },
  inv: {
    id: 'inv',
    label: 'f(x) = 1/x',
    latex: '\\frac{1}{x}',
    fn: (x) => (Math.abs(x) < 1e-9 ? Number.NaN : 1 / x),
    domainDesc: '\\mathbb{R} \\setminus \\{0\\}',
  },
  sin: {
    id: 'sin',
    label: 'f(x) = sin(x)',
    latex: '\\sin(x)',
    fn: (x) => Math.sin(x),
    domainDesc: '\\mathbb{R}',
  },
  exp: {
    id: 'exp',
    label: 'f(x) = eˣ',
    latex: 'e^x',
    fn: (x) => Math.exp(x),
    domainDesc: '\\mathbb{R}',
  },
  ln: {
    id: 'ln',
    label: 'f(x) = ln(x)',
    latex: '\\ln(x)',
    fn: (x) => (x <= 0 ? Number.NaN : Math.log(x)),
    domainDesc: ']0, \\infty[',
  },
};

export function describeFunctionTransform(
  baseId: BaseFunctionId,
  a: number,
  b: number,
  c: number,
  d: number,
): { formulaLatex: string; steps: MathStep[] } {
  const base = BASE_FUNCTIONS[baseId];
  const innerArg =
    c === 0
      ? b === 1
        ? 'x'
        : `${b}x`
      : b === 1
        ? `x ${c > 0 ? '-' : '+'} ${Math.abs(c)}`
        : `${b}(x ${c > 0 ? '-' : '+'} ${Math.abs(c)})`;

  const aPrefix = a === 1 ? '' : a === -1 ? '-' : `${a} \\cdot `;
  const dSuffix = d === 0 ? '' : d > 0 ? ` + ${d}` : ` - ${Math.abs(d)}`;
  const formulaLatex = `g(x) = ${aPrefix}f(${innerArg})${dSuffix}`;

  const steps: MathStep[] = [
    {
      title: 'Horisontell skalning & spegling (faktorn b)',
      explanation:
        b === 1
          ? 'Ingen horisontell skalning ($b = 1$).'
          : b < 0
            ? `Grafen speglas i $y$-axeln och skalas horisontellt med faktor $1/${Math.abs(b)}$.`
            : `Grafen komprimeras/sträcks horisontellt med faktor $1/${b}$.`,
    },
    {
      title: 'Horisontell translation (skift c)',
      explanation:
        c === 0
          ? 'Ingen förskjutning i $x$-led ($c = 0$).'
          : c > 0
            ? `Grafen förskjuts $${c}$ enheter åt höger.`
            : `Grafen förskjuts $${Math.abs(c)}$ enheter åt vänster.`,
    },
    {
      title: 'Vertikal skalning & translation (a och d)',
      explanation: `Varje $y$-värde multipliceras med $a = ${a}$${
        a < 0 ? ' (speglas i $x$-axeln)' : ''
      } och förskjuts med $d = ${d}$ i $y$-led. Ursprunglig definitionsmängd är $${base.domainDesc}$.`,
      latex: formulaLatex,
    },
  ];

  return { formulaLatex, steps };
}

export type TrigFnKind = 'sin' | 'cos' | 'tan';

/**
 * Löser A*trig(omega*x) = C på intervallet [intervalStart, intervalEnd].
 */
export function solveTrigEquation(
  fn: TrigFnKind,
  amp: number,
  omega: number,
  rhs: number,
  intervalStart: number,
  intervalEnd: number,
): CalculationResult<TrigSolutionValue> {
  if (amp === 0 || omega === 0) {
    return {
      value: { solutions: [], generalLatex: '\\text{Ogiltig parameter}', hasSolution: false },
      latexResult: '\\text{Saknar giltig ekvation}',
      steps: [],
      summary: 'A och ω måste vara nollskilda.',
      error: 'Amplitud A och frekvens ω måste vara skilda från 0.',
    };
  }

  const ratio = rhs / amp;
  const solutions: number[] = [];

  if ((fn === 'sin' || fn === 'cos') && Math.abs(ratio) > 1 + 1e-9) {
    const steps: MathStep[] = [
      {
        title: 'Isolera den trigonometriska funktionen',
        explanation: `Dividera båda led med $A = ${amp}$.`,
        latex: `\\${fn}(${omega === 1 ? '' : omega}x) = ${numToLatex(ratio)}`,
      },
      {
        title: 'Kontrollera värdemängden',
        explanation: `Eftersom $-1 \\le \\${fn}(u) \\le 1$ för alla reella tal $u$ och $|${numToLatex(
          ratio,
        )}| > 1$ saknar ekvationen reella lösningar.`,
        latex: '\\text{Lösning saknas } (\\emptyset)',
      },
    ];
    return {
      value: { solutions: [], generalLatex: '\\emptyset', hasSolution: false },
      latexResult: '\\emptyset',
      steps,
      summary: 'Saknar reella lösningar.',
    };
  }

  const clamped = Math.max(-1, Math.min(1, ratio));
  let baseAngles: number[] = [];
  let period = 2 * Math.PI;
  let generalLatex = '';
  const argLatex = omega === 1 ? 'x' : `${omega}x`;

  if (fn === 'sin') {
    const alpha = Math.asin(clamped);
    baseAngles =
      Math.abs(Math.abs(clamped) - 1) < 1e-9
        ? [alpha]
        : [alpha, Math.PI - alpha];
    generalLatex =
      Math.abs(Math.abs(clamped) - 1) < 1e-9
        ? `x = ${numToLatex(alpha / omega)} + ${numToLatex((2 * Math.PI) / Math.abs(omega))}\\,n,\\; n\\in\\mathbb{Z}`
        : `x = ${numToLatex(alpha / omega)} + ${numToLatex(
            (2 * Math.PI) / Math.abs(omega),
          )}\\,n \\;\\text{ eller }\\; x = ${numToLatex((Math.PI - alpha) / omega)} + ${numToLatex(
            (2 * Math.PI) / Math.abs(omega),
          )}\\,n`;
  } else if (fn === 'cos') {
    const alpha = Math.acos(clamped);
    baseAngles =
      Math.abs(clamped - 1) < 1e-9 || Math.abs(clamped + 1) < 1e-9
        ? [alpha]
        : [alpha, -alpha];
    generalLatex =
      baseAngles.length === 1
        ? `x = ${numToLatex(alpha / omega)} + ${numToLatex((2 * Math.PI) / Math.abs(omega))}\\,n,\\; n\\in\\mathbb{Z}`
        : `x = \\pm ${numToLatex(Math.abs(alpha / omega))} + ${numToLatex(
            (2 * Math.PI) / Math.abs(omega),
          )}\\,n,\\; n\\in\\mathbb{Z}`;
  } else {
    const alpha = Math.atan(ratio);
    baseAngles = [alpha];
    period = Math.PI;
    generalLatex = `x = ${numToLatex(alpha / omega)} + ${numToLatex(
      Math.PI / Math.abs(omega),
    )}\\,n,\\; n\\in\\mathbb{Z}`;
  }

  const xPeriod = period / Math.abs(omega);
  for (const b of baseAngles) {
    const x0 = b / omega;
    const nMin = Math.floor((intervalStart - x0) / xPeriod) - 1;
    const nMax = Math.ceil((intervalEnd - x0) / xPeriod) + 1;
    for (let n = nMin; n <= nMax; n++) {
      const candidate = x0 + n * xPeriod;
      if (candidate >= intervalStart - 1e-7 && candidate <= intervalEnd + 1e-7) {
        if (!solutions.some((s) => Math.abs(s - candidate) < 1e-6)) {
          solutions.push(candidate);
        }
      }
    }
  }
  solutions.sort((u, v) => u - v);

  const solLatexList =
    solutions.length > 0 ? solutions.map((s) => numToLatex(s)).join(',\\; ') : '\\text{Inga i intervallet}';

  const steps: MathStep[] = [
    {
      title: 'Isolera trigonometriskt uttryck',
      explanation: `Dividera ekvationen med $A = ${amp}$.`,
      latex: `\\${fn}(${argLatex}) = ${numToLatex(ratio)}`,
    },
    {
      title: 'Allmän lösning med periodicitet',
      explanation:
        fn === 'tan'
          ? 'Tangens har period $\\pi$.'
          : fn === 'sin'
            ? 'Sinus har två lösningsgrenar per varv: $u = \\alpha + 2\\pi n$ och $u = \\pi - \\alpha + 2\\pi n$.'
            : 'Cosinus har två lösningsgrenar per varv: $u = \\pm\\alpha + 2\\pi n$.',
      latex: generalLatex,
    },
    {
      title: `Lösningar i [${numToLatex(intervalStart).replace(/\\pi/g, 'π')}, ${numToLatex(intervalEnd).replace(/\\pi/g, 'π')}]`,
      explanation: `Vi testar heltal $n \\in \\mathbb{Z}$ som faller inom det valda intervallet (totalt ${solutions.length} st).`,
      latex: solLatexList,
    },
  ];

  return {
    value: { solutions, generalLatex, hasSolution: solutions.length > 0 },
    latexResult: generalLatex,
    steps,
    summary: `${solutions.length} lösningar i intervallet`,
  };
}

export type LimitPresetId =
  | 'sin_kx_over_x'
  | 'exp_kx_minus_1'
  | 'ln_1_plus_kx'
  | 'one_minus_cos_kx'
  | 'sqrt_conjugate_inf'
  | 'rational_inf'
  | 'factor_zero_over_zero';

export interface LimitAnalysis {
  title: string;
  exprLatex: string;
  targetLatex: string;
  limitValueLatex: string;
  limitNumeric: number;
  fn: (x: number) => number;
  xApproach: number; // NaN betyder +oo
  steps: MathStep[];
}

export function analyzeLimitPreset(id: LimitPresetId, k: number): LimitAnalysis {
  const safeK = k === 0 ? 1 : k;
  switch (id) {
    case 'sin_kx_over_x':
      return {
        title: 'Standardgränsvärde med sin(kx)/x',
        exprLatex: `\\frac{\\sin(${safeK}x)}{x}`,
        targetLatex: 'x \\to 0',
        limitValueLatex: `${safeK}`,
        limitNumeric: safeK,
        xApproach: 0,
        fn: (x) => (Math.abs(x) < 1e-12 ? Number.NaN : Math.sin(safeK * x) / x),
        steps: [
          {
            title: 'Identifiera 0/0-form (använd ej L’Hôpital!)',
            explanation:
              'Både täljare och nämnare går mot $0$. På MA1499-tentamen löser vi detta med standardgränsvärdet $\\lim_{t\\to 0}\\frac{\\sin t}{t} = 1$.',
          },
          {
            title: 'Förläng och sätt t = kx',
            explanation: `Multiplicera och dividera med $${safeK}$ så att argumentet och nämnaren blir lika.`,
            latex: `\\lim_{x\\to 0}\\frac{\\sin(${safeK}x)}{x} = \\lim_{x\\to 0}\\left(${safeK} \\cdot \\frac{\\sin(${safeK}x)}{${safeK}x}\\right) = ${safeK} \\cdot 1 = ${safeK}`,
          },
        ],
      };
    case 'exp_kx_minus_1':
      return {
        title: 'Standardgränsvärde med (e^(kx) - 1)/x',
        exprLatex: `\\frac{e^{${safeK}x} - 1}{x}`,
        targetLatex: 'x \\to 0',
        limitValueLatex: `${safeK}`,
        limitNumeric: safeK,
        xApproach: 0,
        fn: (x) => (Math.abs(x) < 1e-12 ? Number.NaN : (Math.exp(safeK * x) - 1) / x),
        steps: [
          {
            title: 'Använd standardgränsvärdet för eᵗ',
            explanation: 'Vi utnyttjar $\\lim_{t\\to 0}\\frac{e^t - 1}{t} = 1$ med substitutionen $t = ' + safeK + 'x$.',
            latex: `\\lim_{x\\to 0}\\frac{e^{${safeK}x}-1}{x} = \\lim_{x\\to 0}\\left(${safeK}\\cdot\\frac{e^{${safeK}x}-1}{${safeK}x}\\right) = ${safeK}`,
          },
        ],
      };
    case 'ln_1_plus_kx':
      return {
        title: 'Standardgränsvärde med ln(1 + kx)/x',
        exprLatex: `\\frac{\\ln(1 + ${safeK}x)}{x}`,
        targetLatex: 'x \\to 0',
        limitValueLatex: `${safeK}`,
        limitNumeric: safeK,
        xApproach: 0,
        fn: (x) =>
          Math.abs(x) < 1e-12 || 1 + safeK * x <= 0 ? Number.NaN : Math.log(1 + safeK * x) / x,
        steps: [
          {
            title: 'Använd standardgränsvärdet för ln(1 + t)',
            explanation: 'Vi skriver om uttrycket så att $\\lim_{t\\to 0}\\frac{\\ln(1+t)}{t} = 1$ kan användas.',
            latex: `\\lim_{x\\to 0}\\frac{\\ln(1+${safeK}x)}{x} = \\lim_{x\\to 0}\\left(${safeK}\\cdot\\frac{\\ln(1+${safeK}x)}{${safeK}x}\\right) = ${safeK}`,
          },
        ],
      };
    case 'one_minus_cos_kx':
      return {
        title: 'Standardgränsvärde med (1 - cos(kx))/x²',
        exprLatex: `\\frac{1 - \\cos(${safeK}x)}{x^2}`,
        targetLatex: 'x \\to 0',
        limitValueLatex: numToLatex((safeK * safeK) / 2),
        limitNumeric: (safeK * safeK) / 2,
        xApproach: 0,
        fn: (x) => (Math.abs(x) < 1e-12 ? Number.NaN : (1 - Math.cos(safeK * x)) / (x * x)),
        steps: [
          {
            title: 'Skriv om med halva vinkeln / trig. identitet',
            explanation: 'Använd $1 - \\cos(u) = 2\\sin^2(u/2)$ med $u = ' + safeK + 'x$.',
            latex: `\\frac{1 - \\cos(${safeK}x)}{x^2} = \\frac{2\\sin^2(${numToLatex(safeK / 2)}x)}{x^2} = 2\\left(\\frac{\\sin(${numToLatex(
              safeK / 2,
            )}x)}{x}\\right)^2`,
          },
          {
            title: 'Beräkna gränsvärdet',
            explanation: 'Faktorn inuti kvadraten går mot $k/2$.',
            latex: `2\\cdot \\left(\\frac{${safeK}}{2}\\right)^2 = \\frac{${safeK * safeK}}{2}`,
          },
        ],
      };
    case 'sqrt_conjugate_inf':
      return {
        title: 'Rotuttryck då x → ∞ (konjugatförlängning)',
        exprLatex: `\\sqrt{x^2 + ${safeK}x} - x`,
        targetLatex: 'x \\to \\infty',
        limitValueLatex: numToLatex(safeK / 2),
        limitNumeric: safeK / 2,
        xApproach: Number.NaN,
        fn: (x) => (x * x + safeK * x < 0 ? Number.NaN : Math.sqrt(x * x + safeK * x) - x),
        steps: [
          {
            title: 'Förläng med konjugatet',
            explanation: 'Eftersom uttrycket är av typen $\\infty - \\infty$ förlänger vi med $\\sqrt{x^2 + kx} + x$.',
            latex: `\\frac{(\\sqrt{x^2 + ${safeK}x} - x)(\\sqrt{x^2 + ${safeK}x} + x)}{\\sqrt{x^2 + ${safeK}x} + x} = \\frac{${safeK}x}{\\sqrt{x^2 + ${safeK}x} + x}`,
          },
          {
            title: 'Bryt ut dominerande term x (för x > 0)',
            explanation: 'För $x > 0$ gäller $\\sqrt{x^2} = x$. Förkorta med $x$.',
            latex: `\\frac{${safeK}}{\\sqrt{1 + \\frac{${safeK}}{x}} + 1} \\xrightarrow{x\\to\\infty} \\frac{${safeK}}{2}`,
          },
        ],
      };
    case 'rational_inf':
      return {
        title: 'Rationell funktion då x → ∞',
        exprLatex: `\\frac{${safeK}x^2 + 3x - 1}{2x^2 - x + 5}`,
        targetLatex: 'x \\to \\infty',
        limitValueLatex: numToLatex(safeK / 2),
        limitNumeric: safeK / 2,
        xApproach: Number.NaN,
        fn: (x) => (safeK * x * x + 3 * x - 1) / (2 * x * x - x + 5),
        steps: [
          {
            title: 'Bryt ut högsta potensen x²',
            explanation: 'Bryt ut $x^2$ i både täljare och nämnare och förkorta.',
            latex: `\\frac{x^2(${safeK} + \\frac{3}{x} - \\frac{1}{x^2})}{x^2(2 - \\frac{1}{x} + \\frac{5}{x^2})} \\xrightarrow{x\\to\\infty} \\frac{${safeK}}{2}`,
          },
        ],
      };
    case 'factor_zero_over_zero':
      return {
        title: 'Faktorisering vid 0/0-form',
        exprLatex: `\\frac{x^2 - ${safeK * safeK}}{x - ${safeK}}`,
        targetLatex: `x \\to ${safeK}`,
        limitValueLatex: `${2 * safeK}`,
        limitNumeric: 2 * safeK,
        xApproach: safeK,
        fn: (x) => (Math.abs(x - safeK) < 1e-12 ? Number.NaN : (x * x - safeK * safeK) / (x - safeK)),
        steps: [
          {
            title: 'Faktorisera täljaren med konjugatregeln',
            explanation: `För $x \\neq ${safeK}$ kan vi förkorta bort $(x - ${safeK})$.`,
            latex: `\\lim_{x\\to ${safeK}}\\frac{(x-${safeK})(x+${safeK})}{x-${safeK}} = \\lim_{x\\to ${safeK}}(x + ${safeK}) = ${2 * safeK}`,
          },
        ],
      };
  }
}

export type MaclaurinFnId = 'exp' | 'sin' | 'cos' | 'ln1px' | 'arctan' | 'geom';

export function solveMaclaurin(fnId: MaclaurinFnId, order: number): MaclaurinValue {
  const n = Math.max(0, Math.min(9, Math.floor(order)));
  const coeffs: number[] = Array(n + 1).fill(0);

  const factorial = (m: number): number => {
    let res = 1;
    for (let i = 2; i <= m; i++) res *= i;
    return res;
  };

  for (let k = 0; k <= n; k++) {
    switch (fnId) {
      case 'exp':
        coeffs[k] = 1 / factorial(k);
        break;
      case 'sin':
        if (k % 2 === 1) coeffs[k] = ((k - 1) / 2) % 2 === 0 ? 1 / factorial(k) : -1 / factorial(k);
        break;
      case 'cos':
        if (k % 2 === 0) coeffs[k] = (k / 2) % 2 === 0 ? 1 / factorial(k) : -1 / factorial(k);
        break;
      case 'ln1px':
        if (k >= 1) coeffs[k] = (k % 2 === 1 ? 1 : -1) / k;
        break;
      case 'arctan':
        if (k % 2 === 1) coeffs[k] = ((k - 1) / 2) % 2 === 0 ? 1 / k : -1 / k;
        break;
      case 'geom':
        coeffs[k] = 1;
        break;
    }
  }

  const termStrings: string[] = [];
  for (let k = 0; k <= n; k++) {
    const c = coeffs[k];
    if (Math.abs(c) < 1e-12) continue;
    const isNeg = c < 0;
    const absC = Math.abs(c);

    let coeffLatex = '';
    if (fnId === 'exp' || fnId === 'sin' || fnId === 'cos') {
      const f = factorial(k);
      coeffLatex = f === 1 ? (k === 0 ? '1' : '') : `\\frac{1}{${f}}`;
    } else if (fnId === 'ln1px' || fnId === 'arctan') {
      coeffLatex = k === 1 ? '' : `\\frac{1}{${k}}`;
    } else {
      coeffLatex = k === 0 ? '1' : '';
    }

    const xPart = k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`;
    const body = `${coeffLatex}${xPart}` || `${absC}`;
    if (termStrings.length === 0) {
      termStrings.push(isNeg ? `-${body}` : body);
    } else {
      termStrings.push(isNeg ? ` - ${body}` : ` + ${body}`);
    }
  }

  const polynomialLatex = termStrings.length > 0 ? termStrings.join('') : '0';

  return {
    order: n,
    center: 0,
    coeffs,
    polynomialLatex,
    remainderOrder: n + 1,
    evaluate: (x: number) => {
      let sum = 0;
      let xp = 1;
      for (let k = 0; k <= n; k++) {
        sum += coeffs[k] * xp;
        xp *= x;
      }
      return sum;
    },
  };
}

export function solveGeometricSeries(
  a0: Fraction,
  r: Fraction,
  numTerms = 8,
): CalculationResult<GeometricSeriesValue> {
  const absR = r.abs().toNumber();
  const converges = absR < 1 - 1e-12;
  const sum = converges ? a0.div(frac(1).sub(r)) : null;

  const partialSums: { n: number; term: number; sum: number }[] = [];
  let running = 0;
  const aNum = a0.toNumber();
  const rNum = r.toNumber();
  for (let k = 0; k < numTerms; k++) {
    const term = aNum * Math.pow(rNum, k);
    running += term;
    partialSums.push({ n: k, term, sum: running });
  }

  const steps: MathStep[] = [
    {
      title: 'Kontrollera konvergensvillkoret |r| < 1',
      explanation: converges
        ? `Här är kvoten $|r| = |${r.toLatex()}| < 1$, så den geometriska serien konvergerar.`
        : `Här är $|r| = |${r.toLatex()}| \\ge 1$, så serien divergerar.`,
      latex: `|r| = ${r.abs().toLatex()} ${converges ? '< 1' : '\\ge 1'}`,
    },
    {
      title: converges ? 'Beräkna gränssumman' : 'Ingen ändlig summa',
      explanation: converges
        ? 'Använd formeln för oändlig geometrisk serie $S = \\frac{a_0}{1 - r}$.'
        : 'Delsummorna $S_N$ konvergerar inte mot något ändligt tal då $N \\to \\infty$.',
      latex: converges
        ? `\\sum_{k=0}^{\\infty} ${a0.toLatex()}\\left(${r.toLatex()}\\right)^k = \\frac{${a0.toLatex()}}{1 - (${r.toLatex()})} = ${sum!.toLatex()}`
        : '\\text{Serien är divergent}',
    },
  ];

  return {
    value: { a0, r, converges, sum, partialSums },
    latexResult: converges ? sum!.toLatex() : '\\text{Divergent}',
    steps,
    summary: converges ? `Konvergerar mot ${sum!.toString()}` : 'Divergerar (|r| ≥ 1)',
  };
}
