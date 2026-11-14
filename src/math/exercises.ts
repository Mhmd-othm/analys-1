import { areExprsEquivalent, evaluateConstantExpr } from './exprParser.ts';
import { Fraction, numToLatex } from './fraction.ts';
import type {
  Difficulty,
  Exercise,
  StudyGuideId,
  ValidationFeedback,
} from './types.ts';

export const STUDY_GUIDE_TITLES: Record<StudyGuideId, string> = {
  sg1: 'SG 1: Algebra, polynom & ekvationer',
  sg2: 'SG 2: Funktionsegenskaper & elementära funktioner',
  sg3: 'SG 3: Trigonometri, arcus & gränsvärden mot ±∞',
  sg4: 'SG 4: Gränsvärden då x → a & kontinuitet',
  sg5: 'SG 5: Derivata, deriveringsregler & MVT',
  sg6: 'SG 6: Högre derivator, asymptoter & optimering',
  sg7: 'SG 7: Maclaurin, Taylor, serier & binomialsatsen',
};

let exerciseCounter = 0;
function nextExerciseId(guideId: StudyGuideId): string {
  exerciseCounter += 1;
  return `${guideId}-${Date.now().toString(36)}-${exerciseCounter}`;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randNonZeroInt(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = randInt(min, max);
  return v;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ============================================================================
// SG 1: Algebra, polynom, faktorsatsen, ekvationer, cirkel & funktionsgrunder
// ============================================================================

function genSg1(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    const mode = pick(['factor', 'comp', 'complete_square']);
    if (mode === 'factor') {
      const a = pick([-2, -1, 1, 2]);
      const b = randNonZeroInt(-4, 4);
      const c = randNonZeroInt(-5, 5);
      const r = pick([-2, -1, 1, 2]);
      const rem = r * r * r + a * r * r + b * r + c;
      const divStr = r > 0 ? `x - ${r}` : `x + ${-r}`;
      return {
        id: nextExerciseId('sg1'),
        guideId: 'sg1',
        guideTitle: STUDY_GUIDE_TITLES.sg1,
        difficulty: diff,
        prompt: `Bestäm resten när polynomet $p(x)$ delas med $(${divStr})$.`,
        promptLatex: `p(x) = x^3 ${a >= 0 ? `+ ${a}` : `- ${-a}`}x^2 ${b >= 0 ? `+ ${b}` : `- ${-b}`}x ${c >= 0 ? `+ ${c}` : `- ${-c}`}`,
        kind: 'scalar',
        placeholder: 'Ange resten som ett heltal, t.ex. -4',
        hint: `Enligt faktorsatsen / restsatsen är resten vid division med $(${divStr})$ lika med $p(${r})$.`,
        answerDisplay: `${rem}`,
        answerLatex: `${rem}`,
        expectedValue: rem,
        steps: [
          {
            title: 'Tillämpa restsatsen',
            explanation: `Resten då $p(x)$ divideras med $(${divStr})$ är $p(${r})$.`,
            latex: `p(${r}) = (${r})^3 ${a >= 0 ? `+ ${a}` : `- ${-a}`}(${r})^2 ${b >= 0 ? `+ ${b}` : `- ${-b}`}(${r}) ${c >= 0 ? `+ ${c}` : `- ${-c}`} = ${rem}`,
          },
        ],
      };
    }

    if (mode === 'comp') {
      const k = randInt(2, 4);
      const base = pick([2, 3]);
      const ans = Math.pow(base, k);
      return {
        id: nextExerciseId('sg1'),
        guideId: 'sg1',
        guideTitle: STUDY_GUIDE_TITLES.sg1,
        difficulty: diff,
        prompt: `Låt $f(x) = ${k}x^3$ och $g(x) = ${base}^x$. Beräkna det sammansatta värdet $g(f(1))$.`,
        kind: 'scalar',
        placeholder: 'Ange heltal, t.ex. 16',
        hint: 'Beräkna först $f(1)$ och sätt sedan in resultatet i $g$.',
        answerDisplay: `${ans}`,
        answerLatex: `${ans}`,
        expectedValue: ans,
        steps: [
          {
            title: 'Beräkna inre funktionen f(1)',
            explanation: 'Sätt in $x = 1$ i $f(x)$.',
            latex: `f(1) = ${k} \\cdot 1^3 = ${k}`,
          },
          {
            title: 'Beräkna yttre funktionen g(f(1))',
            explanation: `Sätt in $${k}$ i $g(x) = ${base}^x$.`,
            latex: `g(${k}) = ${base}^{${k}} = ${ans}`,
          },
        ],
      };
    }

    // Kvadratkomplettering (utan pq-formel!)
    const p = randNonZeroInt(-4, 4);
    const d = pick([1, 4, 9]);
    const q = p * p - d; // (x + p)^2 = d => x = -p +- sqrt(d)
    const r1 = -p + Math.sqrt(d);
    const r2 = -p - Math.sqrt(d);
    const largest = Math.max(r1, r2);
    return {
      id: nextExerciseId('sg1'),
      guideId: 'sg1',
      guideTitle: STUDY_GUIDE_TITLES.sg1,
      difficulty: diff,
      prompt: `Lös andragradsekvationen med kvadratkomplettering (ej pq-formel!) och ange den största roten.`,
      promptLatex: `x^2 ${2 * p >= 0 ? `+ ${2 * p}` : `- ${-2 * p}`}x ${q >= 0 ? `+ ${q}` : `- ${-q}`} = 0`,
      kind: 'scalar',
      placeholder: 'Ange den största roten',
      hint: `Skriv $x^2 ${2 * p >= 0 ? `+ ${2 * p}` : `- ${-2 * p}`}x = (x ${p >= 0 ? `+ ${p}` : `- ${-p}`})^2 - ${p * p}$.`,
      answerDisplay: `${largest}`,
      answerLatex: `${largest}`,
      expectedValue: largest,
      steps: [
        {
          title: 'Kvadratkomplettera vänsterledet',
          explanation: 'Använd att $(x + p)^2 = x^2 + 2px + p^2$.',
          latex: `(x ${p >= 0 ? `+ ${p}` : `- ${-p}`})^2 - ${p * p} ${q >= 0 ? `+ ${q}` : `- ${-q}`} = 0 \\iff (x ${p >= 0 ? `+ ${p}` : `- ${-p}`})^2 = ${d}`,
        },
        {
          title: 'Dra roten ur båda led',
          explanation: `Det ger $x ${p >= 0 ? `+ ${p}` : `- ${-p}`} = \\pm ${Math.sqrt(d)}$, alltså rötterna $${r2}$ och $${r1}$.`,
          latex: `x_{\\max} = ${largest}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    const mode = pick(['domain_sqrt', 'inverse_pt', 'root_eq']);
    if (mode === 'domain_sqrt') {
      const a = pick([1, 2, 3]);
      const c = randNonZeroInt(-4, 4);
      const ans = `]-∞, -${a}[ ∪ ]${a}, ∞[`;
      const choices = [
        `]-∞, -${a}[ ∪ ]${a}, ∞[`,
        `ℝ \\ {${a}, -${a}}`,
        `ℝ \\ {${c}}`,
        `[-${a}, ${a}]`,
      ];
      return {
        id: nextExerciseId('sg1'),
        guideId: 'sg1',
        guideTitle: STUDY_GUIDE_TITLES.sg1,
        difficulty: diff,
        prompt: 'Vilken är den maximala definitionsmängden för funktionen nedan?',
        promptLatex: `f(x) = \\frac{x ${c >= 0 ? `+ ${c}` : `- ${-c}`}}{\\sqrt{x^2 - ${a * a}}}`,
        kind: 'choice',
        choices,
        placeholder: '',
        hint: 'Rotuttrycket i nämnaren kräver att det som står under roten är strikt positivt (> 0).',
        answerDisplay: ans,
        answerLatex: `]-\\infty, -${a}[ \\cup ]${a}, \\infty[`,
        expectedValue: ans,
        steps: [
          {
            title: 'Ställ upp villkor för nämnare och kvadratrot',
            explanation: `Vi kräver $x^2 - ${a * a} > 0$, eftersom nämnaren varken får vara $0$ eller negativ under roten.`,
            latex: `x^2 > ${a * a} \\iff |x| > ${a}`,
          },
          {
            title: 'Skriv som intervallunion',
            explanation: `Teckenanalys av $(x - ${a})(x + ${a}) > 0$ (eller $|x| > ${a}$) ger $x < -${a}$ eller $x > ${a}$.`,
            latex: `D_f = ]-\\infty, -${a}[ \\cup ]${a}, \\infty[`,
          },
        ],
      };
    }

    if (mode === 'inverse_pt') {
      const k = randInt(1, 3);
      const r = randInt(1, 3); // x = r > -k
      const y0 = r * r + 2 * k * r;
      return {
        id: nextExerciseId('sg1'),
        guideId: 'sg1',
        guideTitle: STUDY_GUIDE_TITLES.sg1,
        difficulty: diff,
        prompt: `Låt $f(x) = x^2 + ${2 * k}x$ för $x > -${k}$. Bestäm $f^{-1}(${y0})$.`,
        kind: 'scalar',
        placeholder: 'Ange ett tal, t.ex. 1',
        hint: `Sätt $x^2 + ${2 * k}x = ${y0}$ och kom ihåg att $x > -${k}$.`,
        answerDisplay: `${r}`,
        answerLatex: `${r}`,
        expectedValue: r,
        steps: [
          {
            title: 'Lös f(x) = y₀ med kvadratkomplettering',
            explanation: `Vi söker det $x > -${k}$ som uppfyller $x^2 + ${2 * k}x = ${y0}$.`,
            latex: `(x + ${k})^2 = ${y0} + ${k * k} = ${(r + k) * (r + k)}`,
          },
          {
            title: 'Välj den gren som ligger i definitionsmängden',
            explanation: `Eftersom $x > -${k}$ är $x + ${k} > 0$, så vi väljer den positiva roten.`,
            latex: `x + ${k} = ${r + k} \\implies f^{-1}(${y0}) = ${r}`,
          },
        ],
      };
    }

    // Rotekvation med falsk rot: sqrt(2x^2 - 1) = 2x - 3 (Dugga 1)
    return {
      id: nextExerciseId('sg1'),
      guideId: 'sg1',
      guideTitle: STUDY_GUIDE_TITLES.sg1,
      difficulty: diff,
      prompt: 'Hur många reella lösningar har ekvationen $\\sqrt{2x^2 - 1} = 2x - 3$?',
      kind: 'choice',
      choices: ['0', '1', '2', '3'],
      placeholder: '',
      hint: 'Kvadrera båda led, lös med kvadratkomplettering och testa alla rötter i ursprungsekvationen (krav: $2x - 3 \\ge 0$).',
      answerDisplay: '1',
      answerLatex: '1',
      expectedValue: '1',
      steps: [
        {
          title: 'Krav på högerledet',
          explanation: 'Eftersom kvadratroten är $\\ge 0$ måste $2x - 3 \\ge 0 \\iff x \\ge \\frac{3}{2}$.',
        },
        {
          title: 'Kvadrera och lös med kvadratkomplettering',
          explanation: 'Kvadrering ger $2x^2 - 1 = 4x^2 - 12x + 9 \\iff 2x^2 - 12x + 10 = 0 \\iff x^2 - 6x + 5 = 0$.',
          latex: '(x - 3)^2 = 4 \\implies x = 5 \\text{ eller } x = 1',
        },
        {
          title: 'Pröva mot villkoret x ≥ 3/2',
          explanation: '$x = 1$ är en falsk rot (ger $HL = -1 < 0$), medan $x = 5$ ger $\\sqrt{49} = 7$. Alltså exakt $1$ lösning.',
          latex: '\\text{Antal lösningar: } 1',
        },
      ],
    };
  }

  // Utmaning: cirkel eller rationell invers
  if (Math.random() < 0.5) {
    const x0 = randNonZeroInt(-4, 4);
    const y0 = randNonZeroInt(-4, 4);
    const r = randInt(2, 6);
    const a = -2 * x0;
    const b = -2 * y0;
    const c = r * r - x0 * x0 - y0 * y0;
    return {
      id: nextExerciseId('sg1'),
      guideId: 'sg1',
      guideTitle: STUDY_GUIDE_TITLES.sg1,
      difficulty: diff,
      prompt: 'Bestäm radien $r$ för cirkeln som beskrivs av ekvationen nedan (använd kvadratkomplettering).',
      promptLatex: `x^2 ${a >= 0 ? `+ ${a}` : `- ${-a}`}x + y^2 ${b >= 0 ? `+ ${b}` : `- ${-b}`}y = ${c}`,
      kind: 'scalar',
      placeholder: 'Ange radien r',
      hint: 'Kvadratkomplettera både x-termerna och y-termerna så att du får $(x - x_0)^2 + (y - y_0)^2 = r^2$.',
      answerDisplay: `${r}`,
      answerLatex: `${r}`,
      expectedValue: r,
      steps: [
        {
          title: 'Kvadratkomplettera i x och y',
          explanation: `Halva koefficienterna är $${a / 2}$ och $${b / 2}$.`,
          latex: `(x ${x0 > 0 ? `- ${x0}` : `+ ${-x0}`})^2 + (y ${y0 > 0 ? `- ${y0}` : `+ ${-y0}`})^2 = ${c} + ${x0 * x0} + ${y0 * y0} = ${r * r}`,
        },
        {
          title: 'Avläs radien',
          explanation: `Högerledet är $r^2 = ${r * r}$, alltså är $r = ${r}$.`,
          latex: `r = ${r}`,
        },
      ],
    };
  }

  const k = randInt(2, 6);
  return {
    id: nextExerciseId('sg1'),
    guideId: 'sg1',
    guideTitle: STUDY_GUIDE_TITLES.sg1,
    difficulty: diff,
    prompt: `Bestäm inversen $f^{-1}(x)$ till funktionen $f(x) = \\frac{x}{x - ${k}}$ ($x \\neq ${k}$).`,
    kind: 'expr',
    placeholder: 'Skriv uttryck i x, t.ex. 3*x/(x-1)',
    hint: 'Sätt $y = \\frac{x}{x - k}$ och lös ut $x$ som funktion av $y$. Byt sedan namn på variablerna.',
    answerDisplay: `${k}x / (x - 1)`,
    answerLatex: `\\frac{${k}x}{x - 1}`,
    expectedValue: `${k}*x/(x-1)`,
    samplePoints: [2, 3, -1, 5.5],
    steps: [
      {
        title: 'Lös ut x ur y = x / (x - k)',
        explanation: 'Multiplicera båda led med $(x - k)$ och samla alla $x$-termer.',
        latex: `y(x - ${k}) = x \\iff xy - x = ${k}y \\iff x(y - 1) = ${k}y \\iff x = \\frac{${k}y}{y - 1}`,
      },
      {
        title: 'Byt tillbaka till variabeln x',
        explanation: 'Inversen blir:',
        latex: `f^{-1}(x) = \\frac{${k}x}{x - 1}`,
      },
    ],
  };
}

// ============================================================================
// SG 2: Funktionsegenskaper, exponential, logaritmer & enhetscirkeln
// ============================================================================

function genSg2(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    const mode = pick(['parity', 'unit_circle', 'log_eq']);
    if (mode === 'parity') {
      const choices = ['sin(x) / x', 'sin(x) · cos(x)', 'cos(x) + sin(x)', 'x³ - 2x'];
      return {
        id: nextExerciseId('sg2'),
        guideId: 'sg2',
        guideTitle: STUDY_GUIDE_TITLES.sg2,
        difficulty: diff,
        prompt: 'Vilken av följande funktioner är **jämn** ($f(-x) = f(x)$)?',
        kind: 'choice',
        choices,
        placeholder: '',
        hint: 'Kom ihåg att $\\sin(-x) = -\\sin(x)$ och $\\cos(-x) = \\cos(x)$.',
        answerDisplay: 'sin(x) / x',
        answerLatex: '\\frac{\\sin(x)}{x}',
        expectedValue: 'sin(x) / x',
        steps: [
          {
            title: 'Testa f(-x) för varje alternativ',
            explanation: 'För $f(x) = \\frac{\\sin x}{x}$ blir kvoten av två udda funktioner jämn.',
            latex: 'f(-x) = \\frac{\\sin(-x)}{-x} = \\frac{-\\sin(x)}{-x} = \\frac{\\sin(x)}{x} = f(x)',
          },
        ],
      };
    }

    if (mode === 'unit_circle') {
      const cases = [
        { q: '\\sin\\left(\\frac{5\\pi}{6}\\right)', val: 0.5, tex: '\\frac{1}{2}', expr: '1/2' },
        { q: '\\cos\\left(\\frac{2\\pi}{3}\\right)', val: -0.5, tex: '-\\frac{1}{2}', expr: '-1/2' },
        { q: '\\cos\\left(\\frac{3\\pi}{4}\\right)', val: -Math.SQRT1_2, tex: '-\\frac{1}{\\sqrt{2}}', expr: '-1/sqrt(2)' },
        { q: '\\sin\\left(\\frac{4\\pi}{3}\\right)', val: -Math.sqrt(3) / 2, tex: '-\\frac{\\sqrt{3}}{2}', expr: '-sqrt(3)/2' },
      ];
      const item = pick(cases);
      return {
        id: nextExerciseId('sg2'),
        guideId: 'sg2',
        guideTitle: STUDY_GUIDE_TITLES.sg2,
        difficulty: diff,
        prompt: 'Beräkna det exakta värdet med hjälp av enhetscirkeln.',
        promptLatex: item.q,
        kind: 'expr',
        placeholder: 'Exakt uttryck, t.ex. -1/2 eller -sqrt(3)/2',
        hint: 'Rita upp vinkeln i enhetscirkeln och använd symmetri mot första kvadranten.',
        answerDisplay: item.expr,
        answerLatex: item.tex,
        expectedValue: item.expr,
        samplePoints: [],
        steps: [
          {
            title: 'Avläs referensvinkel och tecken i enhetscirkeln',
            explanation: 'Cosinus motsvarar $x$-koordinaten och sinus motsvarar $y$-koordinaten.',
            latex: `${item.q} = ${item.tex}`,
          },
        ],
      };
    }

    const r1 = pick([3, 5, 6, 7]);
    const r2 = pick([2, 4, 8]);
    // 4^x + (r2 - r1)*2^x - r1*r2 = 0 => (2^x - r1)(2^x + r2) = 0 => 2^x = r1
    const b = r2 - r1;
    const c = r1 * r2;
    return {
      id: nextExerciseId('sg2'),
      guideId: 'sg2',
      guideTitle: STUDY_GUIDE_TITLES.sg2,
      difficulty: diff,
      prompt: 'Lös exponentialekvationen exakt.',
      promptLatex: `4^x ${b >= 0 ? `+ ${b}` : `- ${-b}`}\\cdot 2^x - ${c} = 0`,
      kind: 'expr',
      placeholder: 'Exakt svar, t.ex. ln(6)/ln(2)',
      hint: 'Sätt $t = 2^x > 0$ så att ekvationen blir en andragradsekvation i $t$.',
      answerDisplay: `ln(${r1}) / ln(2)`,
      answerLatex: `\\frac{\\ln ${r1}}{\\ln 2}`,
      expectedValue: `ln(${r1})/ln(2)`,
      samplePoints: [],
      steps: [
        {
          title: 'Substituera t = 2ˣ > 0',
          explanation: `Eftersom $4^x = (2^x)^2 = t^2$ får vi $t^2 ${b >= 0 ? `+ ${b}` : `- ${-b}`}t - ${c} = 0$.`,
          latex: `(t - ${r1})(t + ${r2}) = 0 \\implies t = ${r1} \\quad (\\text{då } t > 0)`,
        },
        {
          title: 'Logaritmera båda led',
          explanation: `Lös $2^x = ${r1}$ med naturliga logaritmen $\\ln$.`,
          latex: `x\\ln 2 = \\ln ${r1} \\implies x = \\frac{\\ln ${r1}}{\\ln 2}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    const a = randInt(2, 6);
    return {
      id: nextExerciseId('sg2'),
      guideId: 'sg2',
      guideTitle: STUDY_GUIDE_TITLES.sg2,
      difficulty: diff,
      prompt: `Betrakta funktionen $f(x) = \\frac{${a}x - 1}{\\cos(2x)}$. Vilket påstående är sant?`,
      kind: 'choice',
      choices: [
        'Funktionen är varken jämn eller udda, och den är obegränsad',
        'Funktionen är udda och begränsad',
        'Funktionen är jämn och obegränsad',
        'Funktionen är varken jämn eller udda, men den är begränsad',
      ],
      placeholder: '',
      hint: 'Testa $f(-x)$ och undersök vad som händer när $\\cos(2x) \\to 0$ (t.ex. nära $x = \\pi/4$).',
      answerDisplay: 'Funktionen är varken jämn eller udda, och den är obegränsad',
      answerLatex: '\\text{Varken jämn eller udda, samt obegränsad}',
      expectedValue: 'Funktionen är varken jämn eller udda, och den är obegränsad',
      steps: [
        {
          title: 'Testa paritet (jämn/udda)',
          explanation: `$f(-x) = \\frac{-${a}x - 1}{\\cos(2x)}$, vilket varken är lika med $f(x)$ eller $-f(x)$.`,
        },
        {
          title: 'Testa begränsning',
          explanation: `Då $x \\to \\frac{\\pi}{4}^-$ går nämnaren $\\cos(2x) \\to 0^+$ medan täljaren går mot $\\frac{${a}\\pi}{4} - 1 \\neq 0$, så $|f(x)| \\to \\infty$.`,
        },
      ],
    };
  }

  // Utmaning: logaritmfunktions invers
  const a = randInt(5, 9);
  const b = a + randInt(2, 5);
  return {
    id: nextExerciseId('sg2'),
    guideId: 'sg2',
    guideTitle: STUDY_GUIDE_TITLES.sg2,
    difficulty: diff,
    prompt: `Funktionen $f(x) = \\ln(${a} - 2x) - \\ln(${b} - x)$ har maximal definitionsmängd $x < ${numToLatex(a / 2)}$. Bestäm $f^{-1}(0)$.`,
    kind: 'scalar',
    placeholder: 'Ange x-värdet som tal eller bråk',
    hint: '$f^{-1}(0) = x \\iff f(x) = 0 \\iff \\frac{' + a + ' - 2x}{' + b + ' - x} = 1$.',
    answerDisplay: `${a - b}`,
    answerLatex: `${a - b}`,
    expectedValue: a - b,
    steps: [
      {
        title: 'Använd logaritmlag ln(A) - ln(B) = ln(A/B)',
        explanation: 'Vi sätter $f(x) = 0$, vilket ger $\\ln\\frac{' + a + ' - 2x}{' + b + ' - x} = 0$.',
        latex: `\\frac{${a} - 2x}{${b} - x} = e^0 = 1`,
      },
      {
        title: 'Lös ut x och kontrollera definitionsmängden',
        explanation: `$${a} - 2x = ${b} - x \\implies x = ${a - b}$, vilket uppfyller $x < ${numToLatex(a / 2)}$.`,
        latex: `f^{-1}(0) = ${a - b}`,
      },
    ],
  };
}

// ============================================================================
// SG 3: Trigonometriska ekvationer, arcusfunktioner & lim x -> ±oo
// ============================================================================

function genSg3(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    if (Math.random() < 0.5) {
      const k = pick([2, 3, 4, 5]);
      return {
        id: nextExerciseId('sg3'),
        guideId: 'sg3',
        guideTitle: STUDY_GUIDE_TITLES.sg3,
        difficulty: diff,
        prompt: `Bestäm den maximala definitionsmängden för $f(x) = \\arcsin(${k}x)$.`,
        kind: 'choice',
        choices: [`[-1/${k}, 1/${k}]`, `[-${k}, ${k}]`, '[-π/2, π/2]', 'ℝ'],
        placeholder: '',
        hint: '$\\arcsin(u)$ är definierad då $-1 \\le u \\le 1$.',
        answerDisplay: `[-1/${k}, 1/${k}]`,
        answerLatex: `\\left[-\\frac{1}{${k}}, \\frac{1}{${k}}\\right]`,
        expectedValue: `[-1/${k}, 1/${k}]`,
        steps: [
          {
            title: 'Krav på argumentet i arcsin',
            explanation: `Vi kräver $-1 \\le ${k}x \\le 1$. Dividera alla led med $${k}$.`,
            latex: `-\\frac{1}{${k}} \\le x \\le \\frac{1}{${k}}`,
          },
        ],
      };
    }

    const a = randNonZeroInt(2, 7);
    const c = pick([2, 3, 4]);
    const b = randInt(-5, 5);
    const ans = new Fraction(a, c);
    return {
      id: nextExerciseId('sg3'),
      guideId: 'sg3',
      guideTitle: STUDY_GUIDE_TITLES.sg3,
      difficulty: diff,
      prompt: 'Beräkna gränsvärdet:',
      promptLatex: `\\lim_{x\\to\\infty} \\frac{${a}x^2 ${b >= 0 ? `+ ${b}` : `- ${-b}`}x + 1}{${c}x^2 - 3x + 5}`,
      kind: 'scalar',
      placeholder: 'T.ex. 3/2',
      hint: 'Bryt ut den dominerande termen $x^2$ i både täljare och nämnare.',
      answerDisplay: ans.toString(),
      answerLatex: ans.toLatex(),
      expectedValue: ans.toNumber(),
      steps: [
        {
          title: 'Bryt ut x² i täljare och nämnare',
          explanation: 'Termerna $\\frac{1}{x}$ och $\\frac{1}{x^2}$ går mot $0$ då $x \\to \\infty$.',
          latex: `\\lim_{x\\to\\infty} \\frac{x^2(${a} + \\frac{${b}}{x} + \\frac{1}{x^2})}{x^2(${c} - \\frac{3}{x} + \\frac{5}{x^2})} = ${ans.toLatex()}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    if (Math.random() < 0.5) {
      const k = pick([2, 3, 4, 5, 6]);
      const ans = new Fraction(-k, 2);
      return {
        id: nextExerciseId('sg3'),
        guideId: 'sg3',
        guideTitle: STUDY_GUIDE_TITLES.sg3,
        difficulty: diff,
        prompt: 'Beräkna gränsvärdet:',
        promptLatex: `\\lim_{x\\to\\infty} \\left(\\sqrt{x^2 - ${k}x} - x\\right)`,
        kind: 'scalar',
        placeholder: 'Ange tal eller bråk, t.ex. -3/2',
        hint: 'Förläng med konjugatet $\\sqrt{x^2 - ' + k + 'x} + x$ och bryt sedan ut $x$.',
        answerDisplay: ans.toString(),
        answerLatex: ans.toLatex(),
        expectedValue: ans.toNumber(),
        steps: [
          {
            title: 'Förläng med konjugatet',
            explanation: 'Använd konjugatregeln $(A - B)(A + B) = A^2 - B^2$.',
            latex: `\\frac{(x^2 - ${k}x) - x^2}{\\sqrt{x^2 - ${k}x} + x} = \\frac{-${k}x}{x\\left(\\sqrt{1 - \\frac{${k}}{x}} + 1\\right)}`,
          },
          {
            title: 'Förkorta med x och ta gränsvärdet',
            explanation: 'För $x > 0$ är $\\sqrt{x^2} = x$. Då $x \\to \\infty$ får vi:',
            latex: `\\frac{-${k}}{\\sqrt{1 - 0} + 1} = ${ans.toLatex()}`,
          },
        ],
      };
    }

    // Arcsin(sin(theta)) fälla!
    const cases = [
      { num: 3, den: 4, ansTex: '\\frac{\\pi}{4}', expr: 'pi/4' },
      { num: 5, den: 6, ansTex: '\\frac{\\pi}{6}', expr: 'pi/6' },
      { num: 2, den: 3, ansTex: '\\frac{\\pi}{3}', expr: 'pi/3' },
    ];
    const item = pick(cases);
    return {
      id: nextExerciseId('sg3'),
      guideId: 'sg3',
      guideTitle: STUDY_GUIDE_TITLES.sg3,
      difficulty: diff,
      prompt: 'Beräkna det exakta värdet (tänk på värdemängden för $\\arcsin$!).',
      promptLatex: `\\arcsin\\left(\\sin\\left(\\frac{${item.num}\\pi}{${item.den}}\\right)\\right)`,
      kind: 'expr',
      placeholder: 'T.ex. pi/4',
      hint: '$\\arcsin$ har värdemängd $[-\\pi/2, \\pi/2]$, så svaret måste ligga i det intervallet.',
      answerDisplay: item.expr,
      answerLatex: item.ansTex,
      expectedValue: item.expr,
      samplePoints: [],
      steps: [
        {
          title: 'Utvärdera sin och hitta vinkel i [-π/2, π/2]',
          explanation: `Eftersom $\\frac{${item.num}\\pi}{${item.den}} > \\frac{\\pi}{2}$ använder vi $\\sin(\\pi - v) = \\sin(v)$.`,
          latex: `\\sin\\left(\\frac{${item.num}\\pi}{${item.den}}\\right) = \\sin\\left(${item.ansTex}\\right) \\implies \\arcsin(\\dots) = ${item.ansTex}`,
        },
      ],
    };
  }

  // Utmaning: x -> -oo med kvadratrot!
  const a = pick([2, 3, 4]);
  const c = pick([1, 2, 3]);
  const ans = new Fraction(-a, c);
  return {
    id: nextExerciseId('sg3'),
    guideId: 'sg3',
    guideTitle: STUDY_GUIDE_TITLES.sg3,
    difficulty: diff,
    prompt: 'Beräkna gränsvärdet då $x \\to -\\infty$ (var noga med tecknet på $\\sqrt{x^2}$!).',
    promptLatex: `\\lim_{x\\to -\\infty} \\frac{\\sqrt{${a * a}x^2 + 5x}}{${c}x - 2}`,
    kind: 'scalar',
    placeholder: 'Ange tal eller bråk',
    hint: 'För negativa $x$ gäller $\\sqrt{x^2} = |x| = -x$!',
    answerDisplay: ans.toString(),
    answerLatex: ans.toLatex(),
    expectedValue: ans.toNumber(),
    steps: [
      {
        title: 'Bryt ut x² ur roten för x < 0',
        explanation: 'Eftersom $x < 0$ gäller $\\sqrt{x^2} = |x| = -x$.',
        latex: `\\frac{|x|\\sqrt{${a * a} + \\frac{5}{x}}}{x\\left(${c} - \\frac{2}{x}\\right)} = \\frac{-x\\sqrt{${a * a} + \\frac{5}{x}}}{x\\left(${c} - \\frac{2}{x}\\right)}`,
      },
      {
        title: 'Förkorta med x och ta gränsvärdet',
        explanation: 'Då $x \\to -\\infty$ går $\\frac{5}{x} \\to 0$ och $\\frac{2}{x} \\to 0$.',
        latex: `\\frac{-${a}}{${c}} = ${ans.toLatex()}`,
      },
    ],
  };
}

// ============================================================================
// SG 4: Gränsvärden då x -> a, kontinuitet & standardgränsvärden
// ============================================================================

function genSg4(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    const a = randInt(2, 7);
    const b = pick([1, 2, 3, 5]);
    const ans = new Fraction(a, b);
    const kind = pick(['sin', 'exp', 'ln']);
    const latexExpr =
      kind === 'sin'
        ? `\\lim_{x\\to 0} \\frac{\\sin(${a}x)}{${b === 1 ? '' : b}x}`
        : kind === 'exp'
          ? `\\lim_{x\\to 0} \\frac{e^{${a}x} - 1}{${b === 1 ? '' : b}x}`
          : `\\lim_{x\\to 0} \\frac{\\ln(1 + ${a}x)}{${b === 1 ? '' : b}x}`;

    return {
      id: nextExerciseId('sg4'),
      guideId: 'sg4',
      guideTitle: STUDY_GUIDE_TITLES.sg4,
      difficulty: diff,
      prompt: 'Beräkna gränsvärdet med hjälp av standardgränsvärden (utan L’Hôpital!).',
      promptLatex: latexExpr,
      kind: 'scalar',
      placeholder: 'Ange tal eller bråk, t.ex. 5/3',
      hint: 'Förläng så att du får samma argument i täljare och nämnare, och använd standardgränsvärdet $\\lim_{t\\to 0} = 1$.',
      answerDisplay: ans.toString(),
      answerLatex: ans.toLatex(),
      expectedValue: ans.toNumber(),
      steps: [
        {
          title: 'Skala argumentet till standardgränsvärdet',
          explanation: `Multiplicera och dividera med $${a}$ så att $t = ${a}x$ matchar nämnaren.`,
          latex: `${latexExpr} = \\frac{${a}}{${b}} \\cdot 1 = ${ans.toLatex()}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    const a = randInt(2, 7);
    const mode = pick(['cont', 'cos']);
    if (mode === 'cont') {
      return {
        id: nextExerciseId('sg4'),
        guideId: 'sg4',
        guideTitle: STUDY_GUIDE_TITLES.sg4,
        difficulty: diff,
        prompt: 'För vilket värde på $k$ är funktionen kontinuerlig i $x = 0$?',
        promptLatex: `f(x) = \\begin{cases} \\dfrac{\\ln(1 + ${a}x)}{x}, & x \\neq 0 \\\\ x - k, & x = 0 \\end{cases}`,
        kind: 'scalar',
        placeholder: 'Ange k',
        hint: 'Kravet för kontinuitet i $x = 0$ är $\\lim_{x\\to 0} f(x) = f(0)$.',
        answerDisplay: `${-a}`,
        answerLatex: `${-a}`,
        expectedValue: -a,
        steps: [
          {
            title: 'Beräkna gränsvärdet då x → 0',
            explanation: 'Använd standardgränsvärdet $\\lim_{t\\to 0}\\frac{\\ln(1+t)}{t} = 1$.',
            latex: `\\lim_{x\\to 0} \\frac{\\ln(1 + ${a}x)}{x} = ${a}`,
          },
          {
            title: 'Sätt gränsvärdet lika med f(0)',
            explanation: `Vi har $f(0) = 0 - k = -k$. Likhet ger $-k = ${a} \\iff k = ${-a}$.`,
            latex: `k = ${-a}`,
          },
        ],
      };
    }

    const ans = new Fraction(a * a, 2);
    return {
      id: nextExerciseId('sg4'),
      guideId: 'sg4',
      guideTitle: STUDY_GUIDE_TITLES.sg4,
      difficulty: diff,
      prompt: 'Beräkna gränsvärdet:',
      promptLatex: `\\lim_{x\\to 0} \\frac{1 - \\cos(${a}x)}{x^2}`,
      kind: 'scalar',
      placeholder: 'Ange tal eller bråk',
      hint: 'Använd $1 - \\cos(u) = 2\\sin^2(u/2)$ eller standardgränsvärdet $\\lim_{t\\to 0}\\frac{1-\\cos t}{t^2} = \\frac{1}{2}$.',
      answerDisplay: ans.toString(),
      answerLatex: ans.toLatex(),
      expectedValue: ans.toNumber(),
      steps: [
        {
          title: 'Sätt t = ax',
          explanation: `Multiplicera och dividera med $${a * a}$.`,
          latex: `\\lim_{x\\to 0} ${a * a}\\cdot\\frac{1 - \\cos(${a}x)}{(${a}x)^2} = ${a * a}\\cdot\\frac{1}{2} = ${ans.toLatex()}`,
        },
      ],
    };
  }

  // Utmaning: kombinerat standardgränsvärde (utan L'Hôpital)
  const a = randInt(2, 5);
  const b = pick([2, 3, 5]);
  const ans = new Fraction(a * a, b);
  return {
    id: nextExerciseId('sg4'),
    guideId: 'sg4',
    guideTitle: STUDY_GUIDE_TITLES.sg4,
    difficulty: diff,
    prompt: 'Beräkna gränsvärdet utan att använda L’Hôspitals regel:',
    promptLatex: `\\lim_{x\\to 0} \\frac{\\sin^2(${a}x)}{x\\tan(${b}x)}`,
    kind: 'scalar',
    placeholder: 'Ange tal eller bråk',
    hint: 'Skriv $\\tan(bx) = \\frac{\\sin(bx)}{\\cos(bx)}$ och dela upp i faktorer med $\\frac{\\sin(t)}{t}$.',
    answerDisplay: ans.toString(),
    answerLatex: ans.toLatex(),
    expectedValue: ans.toNumber(),
    steps: [
      {
        title: 'Skriv om tan(bx) och bryt ut standardgränsvärden',
        explanation: 'Vi grupperar faktorer så att varje bråk går mot $1$.',
        latex: `\\frac{\\sin^2(${a}x)}{x\\frac{\\sin(${b}x)}{\\cos(${b}x)}} = \\frac{${a}^2}{${b}} \\cdot \\left(\\frac{\\sin(${a}x)}{${a}x}\\right)^2 \\cdot \\frac{${b}x}{\\sin(${b}x)} \\cdot \\cos(${b}x)`,
      },
      {
        title: 'Låt x → 0',
        explanation: 'Alla standardfaktorer samt $\\cos(0)$ går mot $1$.',
        latex: `\\frac{${a * a}}{${b}} \\cdot 1^2 \\cdot 1 \\cdot 1 = ${ans.toLatex()}`,
      },
    ],
  };
}

// ============================================================================
// SG 5: Derivata, deriveringsregler, implicit derivering & MVT
// ============================================================================

function genSg5(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    const k = randInt(2, 5);
    if (Math.random() < 0.5) {
      return {
        id: nextExerciseId('sg5'),
        guideId: 'sg5',
        guideTitle: STUDY_GUIDE_TITLES.sg5,
        difficulty: diff,
        prompt: `Derivera funktionen $f(x) = \\arctan(e^{${k}x})$.`,
        kind: 'expr',
        placeholder: 'Skriv uttryck i x, t.ex. a*exp(a*x)/(1 + exp(2*a*x))',
        hint: 'Använd kedjeregeln: $(\\arctan u)\' = \\frac{u\'}{1 + u^2}$ med $u = e^{' + k + 'x}$.',
        answerDisplay: `${k}e^(${k}x) / (1 + e^(${2 * k}x))`,
        answerLatex: `\\frac{${k}e^{${k}x}}{1 + e^{${2 * k}x}}`,
        expectedValue: `${k}*exp(${k}*x)/(1 + exp(${2 * k}*x))`,
        samplePoints: [-0.5, 0, 0.3, 0.7],
        steps: [
          {
            title: 'Tillämpa kedjeregeln på arctan(u)',
            explanation: `Yttre derivata av $\\arctan(u)$ är $\\frac{1}{1+u^2}$ och inre derivata av $e^{${k}x}$ är $${k}e^{${k}x}$.`,
            latex: `f'(x) = \\frac{1}{1 + (e^{${k}x})^2} \\cdot ${k}e^{${k}x} = \\frac{${k}e^{${k}x}}{1 + e^{${2 * k}x}}`,
          },
        ],
      };
    }

    // Produktregeln i en punkt
    const a = randInt(2, 4);
    const val = 1 + a; // f(x) = x * e^(ax), f'(0) = 1, f'(x) = (1 + ax)e^(ax) => vid x=0 blir 1; låt oss ta ln/polynom vid x=1: f(x) = x^a * e^(x-1) => f'(1) = a + 1
    return {
      id: nextExerciseId('sg5'),
      guideId: 'sg5',
      guideTitle: STUDY_GUIDE_TITLES.sg5,
      difficulty: diff,
      prompt: `Låt $f(x) = x^{${a}} e^{x - 1}$. Beräkna $f'(1)$.`,
      kind: 'scalar',
      placeholder: 'Ange heltal',
      hint: 'Använd produktregeln $f\'(x) = (x^a)\' e^{x-1} + x^a (e^{x-1})\'$ och sätt sedan in $x = 1$.',
      answerDisplay: `${val}`,
      answerLatex: `${val}`,
      expectedValue: val,
      steps: [
        {
          title: 'Derivera med produktregeln',
          explanation: 'Vi deriverar en faktor i taget.',
          latex: `f'(x) = ${a}x^{${a - 1}} e^{x-1} + x^{${a}} e^{x-1} = (${a} + x)x^{${a - 1}}e^{x-1}`,
        },
        {
          title: 'Sätt in x = 1',
          explanation: `Eftersom $e^0 = 1$ får vi:`,
          latex: `f'(1) = (${a} + 1)\\cdot 1 \\cdot 1 = ${val}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    if (Math.random() < 0.5) {
      // Dugga 3 uppgift 8 typ: (x^2 - k)e^(-x) -> stationära punkter x^2 - 2x - k = 0
      return {
        id: nextExerciseId('sg5'),
        guideId: 'sg5',
        guideTitle: STUDY_GUIDE_TITLES.sg5,
        difficulty: diff,
        prompt: 'Vilka stationära punkter har funktionen $f(x) = (x^2 - 1)e^{-x}$?',
        kind: 'choice',
        choices: ['1 ± √2', '±1', '1', 'Saknas (finns inga)'],
        placeholder: '',
        hint: 'Sätt $f\'(x) = 0$ och lös den uppkomna andragradsekvationen med kvadratkomplettering.',
        answerDisplay: '1 ± √2',
        answerLatex: '1 \\pm \\sqrt{2}',
        expectedValue: '1 ± √2',
        steps: [
          {
            title: 'Derivera med produktregeln',
            explanation: 'Kom ihåg inre derivatan $-1$ för $e^{-x}$.',
            latex: "f'(x) = 2x e^{-x} - (x^2 - 1)e^{-x} = (-x^2 + 2x + 1)e^{-x}",
          },
          {
            title: 'Lös f\'(x) = 0 (eftersom e⁻ˣ > 0 alltid)',
            explanation: 'Kvadratkomplettera $x^2 - 2x - 1 = 0$.',
            latex: '(x - 1)^2 = 2 \\implies x = 1 \\pm \\sqrt{2}',
          },
        ],
      };
    }

    // Implicit derivering (likt Dugga 3 uppgift 7!)
    const a = randInt(2, 5);
    const c = randInt(4, 9);
    const choices = [
      `${a}y(x) + ${a}xy'(x) + 3(y(x))²·y'(x) = ${c}`,
      `${a}y'(x) + 3(y(x))²·y'(x) = ${c}`,
      `${a}xy'(x) + 3(y(x))²·y'(x) = ${c}x`,
      `${a}y(x) + ${a}xy'(x) + 3(y(x))² = ${c}`,
    ];
    return {
      id: nextExerciseId('sg5'),
      guideId: 'sg5',
      guideTitle: STUDY_GUIDE_TITLES.sg5,
      difficulty: diff,
      prompt: `Derivera sambandet $${a}x y(x) + (y(x))^3 = ${c}x$ implicit med avseende på $x$.`,
      kind: 'choice',
      choices,
      placeholder: '',
      hint: 'Använd produktregeln på $xy(x)$ och kedjeregeln på $(y(x))^3$!',
      answerDisplay: choices[0],
      answerLatex: `${a}y(x) + ${a}xy'(x) + 3(y(x))^2 y'(x) = ${c}`,
      expectedValue: choices[0],
      steps: [
        {
          title: 'Derivera led för led m.a.p. x',
          explanation: `Produktregeln ger $(${a}xy)' = ${a}y + ${a}xy'$ och kedjeregeln ger $(y^3)' = 3y^2 y'$.`,
          latex: `${a}y(x) + ${a}xy'(x) + 3(y(x))^2 \\cdot y'(x) = ${c}`,
        },
      ],
    };
  }

  // Utmaning: Medelvärdessatsen på f(x) = x^3 på [0, b]
  const b = pick([3, 6]);
  // f'(c) = 3c^2 = (b^3 - 0)/(b - 0) = b^2 => c = b / sqrt(3)
  const exprAns = `${b}/sqrt(3)`;
  return {
    id: nextExerciseId('sg5'),
    guideId: 'sg5',
    guideTitle: STUDY_GUIDE_TITLES.sg5,
    difficulty: diff,
    prompt: `Bestäm punkten $c \\in ]0, ${b}[$ som ges av medelvärdessatsen för $f(x) = x^3$ på intervallet $[0, ${b}]$.`,
    kind: 'expr',
    placeholder: 'Skriv exakt uttryck, t.ex. a/sqrt(3)',
    hint: 'Medelvärdessatsen säger att $f\'(c) = \\frac{f(b) - f(0)}{b - 0}$.',
    answerDisplay: exprAns,
    answerLatex: `\\frac{${b}}{\\sqrt{3}}`,
    expectedValue: exprAns,
    samplePoints: [],
    steps: [
      {
        title: 'Beräkna sekantens lutning',
        explanation: 'Beräkna genomsnittliga ändringskvoten på $[0, ' + b + ']$.',
        latex: `\\frac{f(${b}) - f(0)}{${b} - 0} = \\frac{${b}^3}{${b}} = ${b * b}`,
      },
      {
        title: 'Sätt f\'(c) lika med lutningen',
        explanation: `Eftersom $f'(x) = 3x^2$ och $c > 0$ får vi:`,
        latex: `3c^2 = ${b * b} \\implies c = \\frac{${b}}{\\sqrt{3}}`,
      },
    ],
  };
}

// ============================================================================
// SG 6: Högre derivator, asymptoter, grafritning & optimering
// ============================================================================

function genSg6(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    const a = randInt(1, 4);
    // f(x) = x^3 - 3a^2 x => stationära x = +-a, f''(x) = 6x => lokalt min vid x = a, värde -2a^3
    const minVal = -2 * a * a * a;
    return {
      id: nextExerciseId('sg6'),
      guideId: 'sg6',
      guideTitle: STUDY_GUIDE_TITLES.sg6,
      difficulty: diff,
      prompt: `Bestäm det lokala minimivärdet (funktionsvärdet!) för $f(x) = x^3 - ${3 * a * a}x$.`,
      kind: 'scalar',
      placeholder: 'Ange tal',
      hint: 'Hitta $f\'(x) = 0$ och avgör med $f\'\'(x)$ eller teckentabell vilken punkt som är lokalt minimum.',
      answerDisplay: `${minVal}`,
      answerLatex: `${minVal}`,
      expectedValue: minVal,
      steps: [
        {
          title: 'Hitta stationära punkter',
          explanation: 'Derivera och sätt lika med noll.',
          latex: `f'(x) = 3x^2 - ${3 * a * a} = 0 \\iff x = \\pm ${a}`,
        },
        {
          title: 'Testa med andraderivatan f\'\'(x) = 6x',
          explanation: `Vid $x = ${a}$ är $f''(${a}) = ${6 * a} > 0$, vilket ger ett lokalt minimum.`,
          latex: `f(${a}) = ${a}^3 - ${3 * a * a}\\cdot ${a} = ${minVal}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    if (Math.random() < 0.5) {
      // Sned asymptot via polynomdivision
      const k = randInt(1, 3);
      const c = randInt(1, 4);
      const r = randNonZeroInt(-3, 3);
      // f(x) = (k*x^2 - k*c*x + r) / (x - c) => asymptot y = k*x, vänta: gör så m != 0:
      // (k*x + m)(x - c) + r = k*x^2 + (m - k*c)*x + (r - m*c)
      const m = randNonZeroInt(-4, 4);
      const bCoeff = m - k * c;
      const constTerm = r - m * c;
      return {
        id: nextExerciseId('sg6'),
        guideId: 'sg6',
        guideTitle: STUDY_GUIDE_TITLES.sg6,
        difficulty: diff,
        prompt: `Funktionen nedan har en sned asymptot $y = kx + m$ då $x \\to \\pm\\infty$. Bestäm konstanttermen $m$.`,
        promptLatex: `f(x) = \\frac{${k === 1 ? '' : k}x^2 ${
          bCoeff === 0 ? '' : bCoeff > 0 ? `+ ${bCoeff}x` : `- ${-bCoeff}x`
        } ${constTerm >= 0 ? `+ ${constTerm}` : `- ${-constTerm}`}}{x - ${c}}`,
        kind: 'scalar',
        placeholder: 'Ange värdet på m',
        hint: 'Utför polynomdivision eller beräkna $k = \\lim_{x\\to\\infty}\\frac{f(x)}{x}$ och $m = \\lim_{x\\to\\infty}(f(x) - kx)$.',
        answerDisplay: `${m}`,
        answerLatex: `${m}`,
        expectedValue: m,
        steps: [
          {
            title: 'Bestäm lutningen k',
            explanation: `Vi får $k = \\lim_{x\\to\\infty}\\frac{f(x)}{x} = ${k}$.`,
          },
          {
            title: 'Polynomdivision / gränsvärde för m',
            explanation: `Polynomdivision ger $f(x) = ${k === 1 ? '' : k}x ${m >= 0 ? `+ ${m}` : `- ${-m}`} + \\frac{${r}}{x - ${c}}$, så asymptoten är $y = ${k === 1 ? '' : k}x ${m >= 0 ? `+ ${m}` : `- ${-m}`}$.`,
            latex: `m = ${m}`,
          },
        ],
      };
    }

    // Optimering: rektangel under parabel y = h - x^2 (area A(x) = 2x(h - x^2))
    const a = pick([1, 2, 3]);
    const h = 3 * a * a; // max vid 3x^2 = h => x = a, A(a) = 2a * 2a^2 = 4a^3
    const maxArea = 4 * a * a * a;
    return {
      id: nextExerciseId('sg6'),
      guideId: 'sg6',
      guideTitle: STUDY_GUIDE_TITLES.sg6,
      difficulty: diff,
      prompt: `En rektangel har sin bas längs $x$-axeln och de övre hörnen på parabeln $y = ${h} - x^2$. Bestäm rektangelns maximala area.`,
      kind: 'scalar',
      placeholder: 'Ange maximal area',
      hint: `Om högra hörnet ligger vid $x > 0$ är basen $2x$ och höjden ${h} - x^2$. Maximera $A(x) = 2x(${h} - x^2)$.`,
      answerDisplay: `${maxArea}`,
      answerLatex: `${maxArea}`,
      expectedValue: maxArea,
      steps: [
        {
          title: 'Ställ upp målfunktionen A(x)',
          explanation: `För $x \\in [0, \\sqrt{${h}}]$ är bredden $2x$ och höjden $${h} - x^2$.`,
          latex: `A(x) = 2x(${h} - x^2) = ${2 * h}x - 2x^3`,
        },
        {
          title: 'Derivera och finn maximum',
          explanation: 'Sätt $A\'(x) = 0$.',
          latex: `A'(x) = ${2 * h} - 6x^2 = 0 \\implies x = ${a} \\implies A_{\\max} = 2\\cdot${a}(${h} - ${a * a}) = ${maxArea}`,
        },
      ],
    };
  }

  // Utmaning: globalt max på [0, 3] för f(x) = x * e^(-x/a) eller relaterade hastigheter
  const L = 5;
  const x = 3; // y = 4
  const vx = 4; // dx/dt = 4 => x*vx + y*vy = 0 => vy = -3*4/4 = -3
  return {
    id: nextExerciseId('sg6'),
    guideId: 'sg6',
    guideTitle: STUDY_GUIDE_TITLES.sg6,
    difficulty: diff,
    prompt: `En ${L} m lång stege lutar mot en vertikal vägg. Nedre änden glider ut längs golvet med hastigheten ${vx} m/s. Med vilken fart (positivt tal, i m/s) sjunker övre änden när nedre änden är ${x} m från väggen?`,
    kind: 'scalar',
    placeholder: 'Ange fart i m/s',
    hint: 'Använd Pythagoras sats $x(t)^2 + y(t)^2 = 25$ och derivera implicit m.a.p. tiden $t$.',
    answerDisplay: '3',
    answerLatex: '3',
    expectedValue: 3,
    steps: [
      {
        title: 'Pythagoras sats och implicit derivering',
        explanation: 'Vi deriverar $x^2 + y^2 = 25$ med avseende på $t$.',
        latex: `2x\\frac{dx}{dt} + 2y\\frac{dy}{dt} = 0 \\implies \\frac{dy}{dt} = -\\frac{x}{y}\\frac{dx}{dt}`,
      },
      {
        title: 'Sätt in x = 3 och y = √(25 - 9) = 4',
        explanation: `Då får vi $\\frac{dy}{dt} = -\\frac{3}{4}\\cdot ${vx} = -3$ m/s, dvs. övre änden sjunker med farten $3$ m/s.`,
        latex: `\\left|\\frac{dy}{dt}\\right| = 3\\text{ m/s}`,
      },
    ],
  };
}

// ============================================================================
// SG 7: Maclaurinutveckling, Taylor, gränsvärden, serier & binomialsatsen
// ============================================================================

function genSg7(diff: Difficulty): Exercise {
  if (diff === 'grund') {
    if (Math.random() < 0.5) {
      const a0 = randInt(2, 6);
      const den = pick([2, 3, 4]);
      const sign = pick([1, -1]);
      const r = new Fraction(sign, den);
      const sum = new Fraction(a0).div(new Fraction(1).sub(r));
      return {
        id: nextExerciseId('sg7'),
        guideId: 'sg7',
        guideTitle: STUDY_GUIDE_TITLES.sg7,
        difficulty: diff,
        prompt: 'Beräkna summan av den oändliga geometriska serien:',
        promptLatex: `\\sum_{k=0}^{\\infty} ${a0}\\left(${r.toLatex()}\\right)^k`,
        kind: 'scalar',
        placeholder: 'Ange summa som tal eller bråk',
        hint: 'En geometrisk serie $\\sum_{k=0}^{\\infty} a_0 r^k$ med $|r| < 1$ har summan $\\frac{a_0}{1 - r}$.',
        answerDisplay: sum.toString(),
        answerLatex: sum.toLatex(),
        expectedValue: sum.toNumber(),
        steps: [
          {
            title: 'Använd formeln för geometrisk serie',
            explanation: `Här är $a_0 = ${a0}$ och $|r| = \\frac{1}{${den}} < 1$.`,
            latex: `S = \\frac{${a0}}{1 - (${r.toLatex()})} = ${sum.toLatex()}`,
          },
        ],
      };
    }

    const a = pick([2, 3]);
    // Koefficient framför x^3 i e^(ax) är a^3 / 6
    const coeff = new Fraction(a * a * a, 6);
    return {
      id: nextExerciseId('sg7'),
      guideId: 'sg7',
      guideTitle: STUDY_GUIDE_TITLES.sg7,
      difficulty: diff,
      prompt: `Vad är koefficienten framför $x^3$ i Maclaurinutvecklingen av $f(x) = e^{${a}x}$?`,
      kind: 'scalar',
      placeholder: 'Ange tal eller bråk, t.ex. 4/3',
      hint: 'Utnyttja standardutvecklingen $e^t = 1 + t + \\frac{t^2}{2!} + \\frac{t^3}{3!} + \\dots$ med $t = ' + a + 'x$.',
      answerDisplay: coeff.toString(),
      answerLatex: coeff.toLatex(),
      expectedValue: coeff.toNumber(),
      steps: [
        {
          title: 'Substituera t = ax i standardutvecklingen',
          explanation: `Termen med $t^3$ är $\\frac{(${a}x)^3}{3!} = \\frac{${a * a * a}}{6}x^3$.`,
          latex: `\\text{Koefficient} = ${coeff.toLatex()}`,
        },
      ],
    };
  }

  if (diff === 'medel') {
    if (Math.random() < 0.5) {
      // Gränsvärde med Maclaurin: (sin(ax) - ax) / x^3 = -a^3 / 6
      const a = pick([1, 2, 3]);
      const ans = new Fraction(-a * a * a, 6);
      return {
        id: nextExerciseId('sg7'),
        guideId: 'sg7',
        guideTitle: STUDY_GUIDE_TITLES.sg7,
        difficulty: diff,
        prompt: 'Beräkna gränsvärdet med hjälp av Maclaurinutveckling (utan L’Hôpital!):',
        promptLatex: `\\lim_{x\\to 0} \\frac{\\sin(${a === 1 ? '' : a}x) - ${a === 1 ? '' : a}x}{x^3}`,
        kind: 'scalar',
        placeholder: 'Ange tal eller bråk, t.ex. -1/6',
        hint: 'Utveckla $\\sin(t) = t - \\frac{t^3}{6} + O(t^5)$ med $t = ' + (a === 1 ? 'x' : `${a}x`) + '$.',
        answerDisplay: ans.toString(),
        answerLatex: ans.toLatex(),
        expectedValue: ans.toNumber(),
        steps: [
          {
            title: 'Maclaurinutveckla sin(ax) till ordning 3',
            explanation: `Vi sätter in $\\sin(${a === 1 ? '' : a}x) = ${a === 1 ? '' : a}x - \\frac{${a * a * a}}{6}x^3 + O(x^5)$.`,
            latex: `\\frac{${a === 1 ? '' : a}x - \\frac{${a * a * a}}{6}x^3 + O(x^5) - ${a === 1 ? '' : a}x}{x^3} = ${ans.toLatex()} + O(x^2)`,
          },
          {
            title: 'Låt x → 0',
            explanation: 'Resttermen $O(x^2) \\to 0$ då $x \\to 0$.',
            latex: `${ans.toLatex()}`,
          },
        ],
      };
    }

    // Binomialsatsen: koefficient framför x^2 i (1 + kx)^n
    const n = randInt(4, 6);
    const k = pick([2, 3, -2]);
    const binom = (n * (n - 1)) / 2;
    const coeff = binom * k * k;
    return {
      id: nextExerciseId('sg7'),
      guideId: 'sg7',
      guideTitle: STUDY_GUIDE_TITLES.sg7,
      difficulty: diff,
      prompt: `Använd Newtons binomialsats för att bestämma koefficienten framför $x^2$ i $(1 ${k > 0 ? `+ ${k}` : `- ${-k}`}x)^{${n}}$.`,
      kind: 'scalar',
      placeholder: 'Ange heltal',
      hint: `Termen för $j = 2$ är $\\binom{${n}}{2} (${k}x)^2$.`,
      answerDisplay: `${coeff}`,
      answerLatex: `${coeff}`,
      expectedValue: coeff,
      steps: [
        {
          title: 'Plocka ut j = 2 i binomialsatsen',
          explanation: `Vi beräknar $\\binom{${n}}{2} = \\frac{${n}\\cdot${n - 1}}{2} = ${binom}$.`,
          latex: `\\binom{${n}}{2} (${k}x)^2 = ${binom} \\cdot ${k * k}x^2 = ${coeff}x^2`,
        },
      ],
    };
  }

  // Utmaning: exakt tenta-typ Maclaurin gränsvärde (från MA1499 Tenta 260828 3c!)
  // lim_{x->0} (ln(1+x^2) - x*arctan(x)) / ((1 - cos x)(e^x - 1 - x))
  // Täljare: (x^2 - x^4/2) - x(x - x^3/3) + O(x^6) = (-1/2 + 1/3)x^4 + O(x^6) = -1/6 x^4
  // Nämnare: (x^2/2 + O(x^4)) * (x^2/2 + O(x^3)) = 1/4 x^4 + O(x^5)
  // Kvot: (-1/6) / (1/4) = -2/3!
  if (Math.random() < 0.5) {
    return {
      id: nextExerciseId('sg7'),
      guideId: 'sg7',
      guideTitle: STUDY_GUIDE_TITLES.sg7,
      difficulty: diff,
      prompt: 'Beräkna gränsvärdet genom Maclaurinutveckling till ordning 4:',
      promptLatex:
        '\\lim_{x\\to 0} \\frac{\\ln(1 + x^2) - x\\arctan(x)}{(1 - \\cos(x))(e^x - 1 - x)}',
      kind: 'scalar',
      placeholder: 'Ange bråk, t.ex. -2/3',
      hint: 'Utveckla $\\ln(1+x^2) = x^2 - \\frac{x^4}{2} + O(x^6)$ och $\\arctan x = x - \\frac{x^3}{3} + O(x^5)$.',
      answerDisplay: '-2/3',
      answerLatex: '-\\frac{2}{3}',
      expectedValue: -2 / 3,
      steps: [
        {
          title: 'Maclaurinutveckla täljaren till ordning 4',
          explanation: 'Sätt in standardutvecklingarna för $\\ln(1+t)$ och $\\arctan(x)$.',
          latex:
            '\\left(x^2 - \\frac{x^4}{2} + O(x^6)\\right) - x\\left(x - \\frac{x^3}{3} + O(x^5)\\right) = -\\frac{1}{6}x^4 + O(x^6)',
        },
        {
          title: 'Maclaurinutveckla nämnaren till lägsta nollskilda ordning',
          explanation: 'Varje faktor bidrar med $x^2/2$.',
          latex:
            '\\left(\\frac{x^2}{2} + O(x^4)\\right)\\left(\\frac{x^2}{2} + O(x^3)\\right) = \\frac{1}{4}x^4 + O(x^5)',
        },
        {
          title: 'Förkorta med x⁴ och ta gränsvärdet',
          explanation: 'Kvoten av ledande koefficienter ger svaret.',
          latex: '\\frac{-1/6}{1/4} = -\\frac{2}{3}',
        },
      ],
    };
  }

  // Maclaurinpolynom för e^x / (1 - x) av ordning 3
  return {
    id: nextExerciseId('sg7'),
    guideId: 'sg7',
    guideTitle: STUDY_GUIDE_TITLES.sg7,
    difficulty: diff,
    prompt: 'Bestäm Maclaurinpolynomet av ordning 3 för $f(x) = \\frac{e^x}{1 - x}$.',
    kind: 'expr',
    placeholder: 'T.ex. 1 + 2x + 5/2*x^2 + 8/3*x^3',
    hint: 'Multiplicera $e^x = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + O(x^4)$ med $\\frac{1}{1-x} = 1 + x + x^2 + x^3 + O(x^4)$ och behåll termer upp till grad 3.',
    answerDisplay: '1 + 2x + (5/2)x^2 + (8/3)x^3',
    answerLatex: '1 + 2x + \\frac{5}{2}x^2 + \\frac{8}{3}x^3',
    expectedValue: '1 + 2*x + (5/2)*x^2 + (8/3)*x^3',
    samplePoints: [-0.4, 0, 0.3, 0.8],
    steps: [
      {
        title: 'Multiplicera standardutvecklingarna',
        explanation: 'Samla alla produkter av total grad $\\le 3$.',
        latex:
          '\\left(1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}\\right)(1 + x + x^2 + x^3) = 1 + 2x + \\left(1+1+\\frac{1}{2}\\right)x^2 + \\left(1+1+\\frac{1}{2}+\\frac{1}{6}\\right)x^3 + O(x^4)',
      },
      {
        title: 'Förenkla koefficienterna',
        explanation: '$1 + 1 + \\frac{1}{2} = \\frac{5}{2}$ och $1 + 1 + \\frac{1}{2} + \\frac{1}{6} = \\frac{16}{6} = \\frac{8}{3}$.',
        latex: 'P_3(x) = 1 + 2x + \\frac{5}{2}x^2 + \\frac{8}{3}x^3',
      },
    ],
  };
}

function shuffleChoiceOrder(ex: Exercise): Exercise {
  if (ex.kind !== 'choice' || !ex.choices || ex.choices.length <= 1) return ex;
  // Behåll rent stigande sifferföljder som ['0', '1', '2', '3'] i naturlig ordning
  if (ex.choices.every((c) => /^\d+$/.test(c))) return ex;
  const arr = [...ex.choices];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { ...ex, choices: arr };
}

export function generateExerciseForGuide(
  guideId: StudyGuideId,
  difficulty: Difficulty,
): Exercise {
  const build = (): Exercise => {
    switch (guideId) {
      case 'sg1':
        return genSg1(difficulty);
      case 'sg2':
        return genSg2(difficulty);
      case 'sg3':
        return genSg3(difficulty);
      case 'sg4':
        return genSg4(difficulty);
      case 'sg5':
        return genSg5(difficulty);
      case 'sg6':
        return genSg6(difficulty);
      case 'sg7':
        return genSg7(difficulty);
    }
  };
  return shuffleChoiceOrder(build());
}

export function generateExerciseSet(
  guides: readonly StudyGuideId[],
  count: number,
  difficulty: 'blandad' | Difficulty,
): Exercise[] {
  const pool = guides.length > 0 ? guides : (['sg1'] as StudyGuideId[]);
  const diffs: Difficulty[] = ['grund', 'medel', 'utmaning'];
  const result: Exercise[] = [];

  for (let i = 0; i < count; i++) {
    const gid = pool[i % pool.length];
    const d = difficulty === 'blandad' ? diffs[i % diffs.length] : difficulty;
    result.push(generateExerciseForGuide(gid, d));
  }
  return result;
}

export function validateAnswer(exercise: Exercise, rawAnswer: string): ValidationFeedback {
  const trimmed = rawAnswer.trim();

  if (!trimmed) {
    return {
      isCorrect: false,
      userParsedDisplay: '(inget svar angivet)',
      feedbackMessage: 'Skriv in eller välj ett svar innan du rättar.',
      expectedDisplay: exercise.answerDisplay,
      expectedLatex: exercise.answerLatex,
      steps: exercise.steps,
    };
  }

  if (exercise.kind === 'choice') {
    const isCorrect = trimmed === String(exercise.expectedValue);
    return {
      isCorrect,
      userParsedDisplay: trimmed,
      feedbackMessage: isCorrect
        ? 'Helt rätt! Snyggt jobbat.'
        : 'Inte riktigt — se rätt svar och lösningsstegen nedan.',
      expectedDisplay: exercise.answerDisplay,
      expectedLatex: exercise.answerLatex,
      steps: exercise.steps,
    };
  }

  if (exercise.kind === 'expr') {
    const samplePts = exercise.samplePoints ?? [];
    const expectedStr = String(exercise.expectedValue);
    const isCorrect = areExprsEquivalent(trimmed, expectedStr, samplePts, exercise.tolerance ?? 1e-4);
    return {
      isCorrect,
      userParsedDisplay: trimmed,
      feedbackMessage: isCorrect
        ? 'Helt rätt! Ditt uttryck stämmer exakt.'
        : 'Inte riktigt — kontrollera syntax (t.ex. 2*x, sqrt(3), pi/4, ln(2)) och se stegen nedan.',
      expectedDisplay: exercise.answerDisplay,
      expectedLatex: exercise.answerLatex,
      steps: exercise.steps,
    };
  }

  // scalar: stöd både bråk (3/2), komma (-1,5) och konstanta uttryck (pi/4, sqrt(2))
  const expectedNum = Number(exercise.expectedValue);
  const tol = exercise.tolerance ?? 1e-4;
  const fracVal = Fraction.tryFromInput(trimmed);
  const numericVal = fracVal ? fracVal.toNumber() : evaluateConstantExpr(trimmed);

  if (numericVal === null || !Number.isFinite(numericVal)) {
    return {
      isCorrect: false,
      userParsedDisplay: `"${trimmed}" (kunde inte tolkas som ett tal)`,
      feedbackMessage: 'Kunde inte tolka ditt svar som ett giltigt tal eller bråk (t.ex. -3/2 eller 1,5).',
      expectedDisplay: exercise.answerDisplay,
      expectedLatex: exercise.answerLatex,
      steps: exercise.steps,
    };
  }

  const isCorrect = Math.abs(numericVal - expectedNum) <= tol * Math.max(1, Math.abs(expectedNum));
  return {
    isCorrect,
    userParsedDisplay: fracVal ? fracVal.toString() : numToLatex(numericVal),
    feedbackMessage: isCorrect
      ? 'Helt rätt! Bra beräknat.'
      : 'Inte riktigt — jämför ditt värde med lösningsstegen nedan.',
    expectedDisplay: exercise.answerDisplay,
    expectedLatex: exercise.answerLatex,
    steps: exercise.steps,
  };
}
