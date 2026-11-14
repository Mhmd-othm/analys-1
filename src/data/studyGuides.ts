import type { StudyGuideId } from '../math/index.ts';

export interface GuideSection {
  heading: string;
  body: string;
  formulas?: string[];
  tip?: string;
  warning?: string;
}

export interface WorkedExampleStep {
  text: string;
  latex?: string;
}

export interface WorkedExample {
  title: string;
  problem: string;
  steps: WorkedExampleStep[];
  answer: string;
}

export interface StudyGuide {
  id: StudyGuideId;
  number: string;
  shortNumber: string;
  weekLabel: string;
  examTag: string;
  title: string;
  subtitle: string;
  summary: string;
  chapters: string[];
  recommendedExercises: string[];
  conceptTags: string[];
  keywords: string[];
  learningGoals: string[];
  sections: GuideSection[];
  workedExamples: WorkedExample[];
}

export const STUDY_GUIDES: StudyGuide[] = [
  {
    id: 'sg1',
    number: 'Studieguide 1',
    shortNumber: 'SG 1',
    weekLabel: 'Kursvecka 1 (v. 45)',
    examTag: 'Dugga 1',
    title: 'Algebra, polynom & funktionsgrunder',
    subtitle: 'Polynomdivision, faktorsatsen, kvadratkomplettering, cirkeln & invers',
    summary:
      'Mängder, intervall, implikation/ekvivalens, polynomdivision, faktorsatsen, rotekvationer, cirkelns ekvation samt funktionsbegreppet med definitionsmängd, sammansättning och invers.',
    chapters: ['Kap 1', 'Kap 2.1–2.3', 'Kap 3.1–3.3', 'Kap 5.4 (cirkeln)', 'Kap 7.1–7.2'],
    recommendedExercises: [
      'Kapitel 2: 8, 9, 15abcf, 20, 21, 26, 27acdef, 28, 30, 31, 34, 36, 37',
      'Kapitel 3: 1, 2, 5, 6, 7, 8abc',
      'Kapitel 5: 27, 28, 31d, 32',
      'Kapitel 7: 6a, 7, 8abe, 9bd, 10, 11, 13, 15, 20, 21, 22a, 23, 25',
    ],
    conceptTags: ['Polynomdivision', 'Kvadratkomplettering', 'Definitionsmängd & Invers'],
    keywords: [
      'sg1',
      'studieguide 1',
      'polynom',
      'polynomdivision',
      'faktorsatsen',
      'kvadratkomplettering',
      'rotekvation',
      'falsk rot',
      'cirkel',
      'funktion',
      'definitionsmängd',
      'värdemängd',
      'translation',
      'dilatation',
      'sammansättning',
      'invers',
    ],
    learningGoals: [
      'Använda intervallnotation $[a,b]$, $]a,b[$ samt implikation ($\\implies$) och ekvivalens ($\\iff$) korrekt vid ekvationslösning.',
      'Utföra polynomdivision och avgöra faktorer/nollställen med hjälp av faktorsatsen.',
      'Lösa andragradsekvationer och bestämma cirkelns medelpunkt och radie via kvadratkomplettering (utan pq-formel).',
      'Lösa rotekvationer och kontrollera för falska rötter.',
      'Bestämma maximal definitionsmängd, värdemängd, sammansättningar $g(f(x))$ och inverser $f^{-1}(x)$.',
    ],
    sections: [
      {
        heading: 'Polynomdivision, faktorsatsen & kvadratkomplettering',
        body: 'För ett polynom $p(x)$ säger **faktorsatsen** att $(x - a)$ är en faktor i $p(x)$ om och endast om $p(a) = 0$. Vid division $p(x) = (x - a)q(x) + r$ är resten $r = p(a)$. Andragradsekvationer löses alltid genom **kvadratkomplettering**.',
        formulas: [
          'x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 - \\left(\\frac{b}{2}\\right)^2 + c',
          'p(x) = (x - a)q(x) + p(a)',
        ],
        warning:
          'På tentamen i MA1499 får pq-formeln och abc-formeln INTE användas! Använd alltid kvadratkomplettering (eller faktorisering).',
      },
      {
        heading: 'Rotekvationer & cirkelns ekvation',
        body: 'När du kvadrerar båda led i en rotekvation $\\sqrt{A(x)} = B(x)$ gäller endast implikation ($\\implies$), inte ekvivalens — kontrollera alltid att $B(x) \\ge 0$ och pröva dina rötter i ursprungsekvationen! En cirkel med medelpunkt $(x_0, y_0)$ och radie $r$ ges av:',
        formulas: ['(x - x_0)^2 + (y - y_0)^2 = r^2'],
      },
      {
        heading: 'Funktioner, translation/dilatation & invers',
        body: 'En funktion $f: D_f \\to Y$ tilldelar varje $x \\in D_f$ ett unikt värde $f(x)$. Maximal definitionsmängd begränsas av nollnämnare ($\\neq 0$), jämna rötter ($\\ge 0$) och logaritmer ($> 0$). Grafen till $y = a\\,f(b(x - c)) + d$ fås genom horisontell skalning $1/b$, skift $c$ åt höger, vertikal skalning $a$ och lyft $d$.',
        formulas: ['y = f(x) \\iff x = f^{-1}(y) \\quad (\\text{om } f \\text{ är injektiv})'],
        tip: 'Inversens definitionsmängd är lika med $f$:s värdemängd ($D_{f^{-1}} = V_f$), och $V_{f^{-1}} = D_f$.',
      },
    ],
    workedExamples: [
      {
        title: 'Bestämma invers på begränsat intervall (Dugga 1-typ)',
        problem: 'Låt $f(x) = x^2 + 2x$ för $x > -1$. Bestäm $f^{-1}(3)$.',
        steps: [
          {
            text: 'Sätt $f(x) = 3$ och kvadratkomplettera vänsterledet.',
            latex: 'x^2 + 2x = 3 \\iff (x + 1)^2 - 1 = 3 \\iff (x + 1)^2 = 4',
          },
          {
            text: 'Lös ut $x$ och kontrollera villkoret $x > -1$.',
            latex: 'x + 1 = \\pm 2 \\implies x = 1 \\text{ eller } x = -3',
          },
        ],
        answer: 'Eftersom $x > -1$ är $f^{-1}(3) = 1$.',
      },
    ],
  },
  {
    id: 'sg2',
    number: 'Studieguide 2',
    shortNumber: 'SG 2',
    weekLabel: 'Kursvecka 2 (v. 46)',
    examTag: 'Dugga 1',
    title: 'Funktionsegenskaper & elementära funktioner',
    subtitle: 'Injektivitet, paritet, polynom-, potens-, exponential-, logaritm- & trigfunktioner',
    summary:
      'Injektiv/surjektiv/bijektiv, monoton, begränsad, jämn och udda funktion samt de elementära funktionerna: polynom, exponential-, logaritmfunktioner och grundläggande trigonometri i enhetscirkeln.',
    chapters: ['Kap 7.3', 'Kap 8.1–8.3', 'Kap 8.4 (del 1)'],
    recommendedExercises: [
      'Kapitel 7: 28, 29',
      'Kapitel 8: 2, 5abc, 6, 8ab, 12, 13af, 14abcd, 15, 24, 25, 26, 27, 28, 40, 41, 44',
    ],
    conceptTags: ['Jämn/udda & Injektiv', 'Exponential & Logaritm', 'Enhetscirkeln'],
    keywords: [
      'sg2',
      'studieguide 2',
      'injektiv',
      'surjektiv',
      'bijektiv',
      'monoton',
      'begränsad',
      'jämn',
      'udda',
      'exponentialfunktion',
      'logaritm',
      'enhetscirkeln',
      'sin',
      'cos',
      'tan',
    ],
    learningGoals: [
      'Avgöra om en funktion är injektiv, strängt växande/avtagande, begränsad, jämn ($f(-x)=f(x)$) eller udda ($f(-x)=-f(x)$).',
      'Räkna säkert med potens- och logaritmlagar för baserna $e$ och $10$ samt lösa exponential- och logaritmekvationer.',
      'Avläsa exakta värden för $\\sin$, $\\cos$ och $\\tan$ vid standardvinklar i enhetscirkeln.',
    ],
    sections: [
      {
        heading: 'Funktionsegenskaper: paritet, begränsning & injektivitet',
        body: 'En funktion är **jämn** om $f(-x) = f(x)$ och **udda** om $f(-x) = -f(x)$ för alla $x \\in D_f$ (kräver symmetrisk definitionsmängd). Den är **begränsad** om det finns $M$ så att $|f(x)| \\le M$ för alla $x \\in D_f$, och **injektiv** om $f(x_1) = f(x_2) \\implies x_1 = x_2$.',
        formulas: [
          '\\text{Jämn: } f(-x) = f(x), \\qquad \\text{Udda: } f(-x) = -f(x)',
          '\\text{Strängt monoton } \\implies \\text{injektiv } \\implies \\text{invers existerar}',
        ],
      },
      {
        heading: 'Potens-, exponential- och logaritmfunktioner',
        body: 'Exponentialfunktionen $e^x$ och naturliga logaritmen $\\ln x$ är varandras inverser: $\\ln(e^x) = x$ för alla $x \\in \\mathbb{R}$ och $e^{\\ln x} = x$ för $x > 0$. För allmän bas $a > 0$ gäller $a^x = e^{x\\ln a}$.',
        formulas: [
          '\\ln(ab) = \\ln a + \\ln b, \\qquad \\ln\\left(\\frac{a}{b}\\right) = \\ln a - \\ln b, \\qquad \\ln(a^p) = p\\ln a',
        ],
        tip: 'Basbyte för logaritmer i bas $b \\neq e, 10$ är bara för kännedom i MA1499 — på tentamen används $\\ln$ och $\\lg$ (bas $e$ och $10$).',
      },
      {
        heading: 'Enhetscirkeln och grundläggande trigonometri',
        body: 'För en vinkel $v$ i radianer motsvarar $(\\cos v, \\sin v)$ en punkt på enhetscirkeln $x^2 + y^2 = 1$, och $\\tan v = \\frac{\\sin v}{\\cos v}$.',
        formulas: [
          '\\sin^2 v + \\cos^2 v = 1, \\qquad \\sin(v + 2\\pi) = \\sin v, \\qquad \\tan(v + \\pi) = \\tan v',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Exponentialekvation via substitution (Dugga 2-typ)',
        problem: 'Lös ekvationen $4^x + 2\\cdot 2^x - 48 = 0$.',
        steps: [
          {
            text: 'Skriv $4^x = (2^x)^2$ och substituera $t = 2^x > 0$.',
            latex: 't^2 + 2t - 48 = 0 \\iff (t + 1)^2 = 49',
          },
          {
            text: 'Lös ut $t$ med kvadratkomplettering och förkasta negativ rot.',
            latex: 't + 1 = \\pm 7 \\implies t = 6 \\;(\\text{eftersom } t > 0)',
          },
          {
            text: 'Logaritmera båda led i $2^x = 6$.',
            latex: 'x\\ln 2 = \\ln 6 \\implies x = \\frac{\\ln 6}{\\ln 2}',
          },
        ],
        answer: '$x = \\frac{\\ln 6}{\\ln 2}$.',
      },
    ],
  },
  {
    id: 'sg3',
    number: 'Studieguide 3',
    shortNumber: 'SG 3',
    weekLabel: 'Kursvecka 3 (v. 47)',
    examTag: 'Dugga 2',
    title: 'Trigonometriska ekvationer, arcusfunktioner & gränsvärden mot ±∞',
    subtitle: 'Trigonometriska formler, arcsin/arccos/arctan samt dominerande termer',
    summary:
      'Lösning av trigonometriska ekvationer med periodicitet, additions- och dubbla vinkeln-formler, arcusfunktionernas definitions- och värdemängder samt gränsvärden då x → ±∞.',
    chapters: ['Kap 8.4 (forts.)', 'Kap 8.5 (arcusfunktioner)', 'Kap 9.1'],
    recommendedExercises: [
      'Kapitel 8: 45–48, 52, 56, 57, 59, 61, 67, 68, 69, 70b, 71b, 72b, 73, 74 (endast arctan), 77',
      'Kapitel 9: 1, 3, 4, 5, 6, 8, 10, 11b, 33',
    ],
    conceptTags: ['Trig-ekvationer', 'Arcusfunktioner', 'lim x → ±∞'],
    keywords: [
      'sg3',
      'studieguide 3',
      'trigonometrisk ekvation',
      'dubbla vinkeln',
      'arcsin',
      'arccos',
      'arctan',
      'artan',
      'gränsvärde',
      'oändligheten',
      'konjugat',
    ],
    learningGoals: [
      'Lösa trigonometriska ekvationer exakt med fullständiga lösningsmängder ($+ 2\\pi n$ eller $+ \\pi n$) samt på givna intervall.',
      'Redogöra för definitions- och värdemängd för $\\arcsin x$, $\\arccos x$ och $\\arctan x$ och undvika fällor som $\\arcsin(\\sin(3\\pi/4))$.',
      'Beräkna gränsvärden då $x \\to \\pm\\infty$ med utbrytning av dominerande term och konjugatförlängning.',
    ],
    sections: [
      {
        heading: 'Trigonometriska identiteter och ekvationer',
        body: 'För att lösa trigonometriska ekvationer faktoriserar man ofta (t.ex. $2\\sin x\\cos x = \\cos x \\iff \\cos x(2\\sin x - 1) = 0$) eller använder dubbla vinkeln/additionssatserna.',
        formulas: [
          '\\sin(2x) = 2\\sin x\\cos x, \\qquad \\cos(2x) = \\cos^2 x - \\sin^2 x = 1 - 2\\sin^2 x = 2\\cos^2 x - 1',
          '\\sin x = \\sin\\alpha \\iff x = \\alpha + 2\\pi n \\text{ eller } x = \\pi - \\alpha + 2\\pi n',
        ],
      },
      {
        heading: 'Arcusfunktionerna: arcsin, arccos och arctan',
        body: 'Eftersom $\\sin, \\cos, \\tan$ är periodiska måste definitionsmängden inskränkas för att bilda inverser. Det avgör arcusfunktionernas **värdemängder**!',
        formulas: [
          '\\arcsin: [-1, 1] \\to \\left[-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right], \\qquad \\arccos: [-1, 1] \\to [0, \\pi]',
          '\\arctan: \\mathbb{R} \\to \\left]-\\frac{\\pi}{2}, \\frac{\\pi}{2}\\right[',
        ],
        tip: 'Kom ihåg att $\\arctan(x)$ är strängt växande och begränsad av de vågräta asymptoterna $y = \\pm \\frac{\\pi}{2}$.',
      },
      {
        heading: 'Gränsvärden då x → ±∞',
        body: 'Bryt ut den snabbast växande termen ($e^x \\gg x^p \\gg \\ln x$ då $x \\to \\infty$). Vid uttryck av formen $\\infty - \\infty$ med kvadratrötter förlänger man med konjugatet.',
        formulas: [
          '\\sqrt{x^2} = |x| = \\begin{cases} x, & x > 0 \\\\ -x, & x < 0 \\end{cases}',
        ],
        warning:
          'Var extremt noga med tecknet då $x \\to -\\infty$: $\\sqrt{x^2} = -x$ när $x$ är negativt!',
      },
    ],
    workedExamples: [
      {
        title: 'Gränsvärde med konjugatförlängning (Dugga 2-typ)',
        problem: 'Beräkna $\\lim_{x\\to\\infty} (\\sqrt{x^2 - 3x} - x)$.',
        steps: [
          {
            text: 'Förläng med konjugatet $\\sqrt{x^2 - 3x} + x$.',
            latex: '\\frac{(\\sqrt{x^2 - 3x} - x)(\\sqrt{x^2 - 3x} + x)}{\\sqrt{x^2 - 3x} + x} = \\frac{-3x}{\\sqrt{x^2 - 3x} + x}',
          },
          {
            text: 'Bryt ut $x > 0$ ur roten och förkorta.',
            latex: '\\frac{-3x}{x\\left(\\sqrt{1 - \\frac{3}{x}} + 1\\right)} = \\frac{-3}{\\sqrt{1 - \\frac{3}{x}} + 1} \\xrightarrow{x\\to\\infty} -\\frac{3}{2}',
          },
        ],
        answer: '$-\\frac{3}{2}$.',
      },
    ],
  },
  {
    id: 'sg4',
    number: 'Studieguide 4',
    shortNumber: 'SG 4',
    weekLabel: 'Kursvecka 4 (v. 48)',
    examTag: 'Dugga 2 & 3',
    title: 'Gränsvärden då x → a, kontinuitet & standardgränsvärden',
    subtitle: 'Ensidiga gränsvärden, standardgränsvärden & satsen om mellanliggande värden',
    summary:
      'Gränsvärden då x → a (inkl. höger- och vänstergränsvärden), faktorisering av 0/0-uttryck, standardgränsvärden för sin(x)/x, (eˣ-1)/x, ln(1+x)/x samt kontinuitet och Bolzanos sats.',
    chapters: ['Kap 9.2', 'Kap 9.3', 'Kap 9.4'],
    recommendedExercises: [
      'Kapitel 9: 13, 14, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 35, 39, 43, 45',
    ],
    conceptTags: ['lim x → a', 'Standardgränsvärden', 'Kontinuitet'],
    keywords: [
      'sg4',
      'studieguide 4',
      'gränsvärde',
      'vänstergränsvärde',
      'högergränsvärde',
      'standardgränsvärde',
      'sin(x)/x',
      'kontinuitet',
      'kontinuerlig',
      'mellanliggande värden',
      'instängningssatsen',
    ],
    learningGoals: [
      'Beräkna gränsvärden då $x \\to a$, inklusive ensidiga gränsvärden $x \\to a^+$ och $x \\to a^-$.',
      'Tillämpa standardgränsvärdena $\\frac{\\sin x}{x}$, $\\frac{e^x-1}{x}$, $\\frac{\\ln(1+x)}{x}$ och $\\frac{1-\\cos x}{x^2}$ utan L’Hôspitals regel.',
      'Avgöra om en styckvis definierad funktion är kontinuerlig i en punkt och använda satsen om mellanliggande värden för att visa existens av rötter.',
    ],
    sections: [
      {
        heading: 'Gränsvärden då x → a och ensidiga gränsvärden',
        body: 'Gränsvärdet $\\lim_{x\\to a} f(x) = L$ existerar om och endast om både vänster- och högergränsvärdet existerar och är lika med $L$. Vid $0/0$-uttryck faktoriserar eller konjugatförlänger man.',
        formulas: [
          '\\lim_{x\\to a} f(x) = L \\iff \\lim_{x\\to a^-} f(x) = \\lim_{x\\to a^+} f(x) = L',
        ],
        warning:
          'L’Hôspitals regel ingår INTE i kursen och får INTE användas på tentamen i MA1499. Använd faktorisering, standardgränsvärden eller Maclaurinutveckling!',
      },
      {
        heading: 'Standardgränsvärden (x → 0)',
        body: 'Följande fyra standardgränsvärden ska sitta i ryggmärgen och kombineras med variabelsubstitution ($t = kx$) eller algebraisk omskrivning:',
        formulas: [
          '\\lim_{t\\to 0} \\frac{\\sin t}{t} = 1, \\qquad \\lim_{t\\to 0} \\frac{1 - \\cos t}{t^2} = \\frac{1}{2}',
          '\\lim_{t\\to 0} \\frac{e^t - 1}{t} = 1, \\qquad \\lim_{t\\to 0} \\frac{\\ln(1+t)}{t} = 1',
        ],
      },
      {
        heading: 'Kontinuitet & Satsen om mellanliggande värden',
        body: 'En funktion $f$ är **kontinuerlig i punkten $a$** om $\\lim_{x\\to a} f(x) = f(a)$. Om $f$ är kontinuerlig på $[a, b]$ och $f(a)$ och $f(b)$ har olika tecken så finns minst ett $c \\in ]a, b[$ med $f(c) = 0$.',
        formulas: ['\\lim_{x\\to a} f(x) = f(a)'],
      },
    ],
    workedExamples: [
      {
        title: 'Bestäm parameter för kontinuitet (Dugga 3-typ)',
        problem:
          'För vilket värde på $k$ är $f(x) = \\frac{\\ln(1 + 5x)}{x}$ ($x \\neq 0$), $f(0) = 0 - k$ kontinuerlig i $x = 0$?',
        steps: [
          {
            text: 'Beräkna $\\lim_{x\\to 0} f(x)$ med standardgränsvärde.',
            latex: '\\lim_{x\\to 0} \\frac{\\ln(1 + 5x)}{x} = \\lim_{x\\to 0} 5\\cdot\\frac{\\ln(1 + 5x)}{5x} = 5\\cdot 1 = 5',
          },
          {
            text: 'Sätt gränsvärdet lika med funktionsvärdet $f(0) = -k$.',
            latex: '-k = 5 \\iff k = -5',
          },
        ],
        answer: '$k = -5$.',
      },
    ],
  },
  {
    id: 'sg5',
    number: 'Studieguide 5',
    shortNumber: 'SG 5',
    weekLabel: 'Kursvecka 5 (v. 49)',
    examTag: 'Dugga 3',
    title: 'Derivata, deriveringsregler & medelvärdessatsen',
    subtitle: 'Derivatans definition, produkt-, kvot- & kedjeregel, implicit derivering & MVT',
    summary:
      'Derivatans definition via ändringskvot, vänster- och högerderivata, standardderivator (inkl. arcusfunktioner), kedje-, produkt- och kvotregeln, implicit derivering, lokala extrempunkter samt medelvärdessatsen.',
    chapters: ['Kap 10.1–10.6'],
    recommendedExercises: [
      'Kapitel 10: 4, 6–13, 16–20, 24, 25, 54',
      'Blandade problem: 57, 59, 69, 73, 78, 80',
    ],
    conceptTags: ['Derivatans definition', 'Deriveringsregler & Implicit', 'Medelvärdessatsen'],
    keywords: [
      'sg5',
      'studieguide 5',
      'derivata',
      'derivatans definition',
      'kedjeregeln',
      'produktregeln',
      'kvotregeln',
      'implicit derivering',
      'inversens derivata',
      'stationär punkt',
      'extrempunkt',
      'medelvärdessatsen',
    ],
    learningGoals: [
      'Beräkna derivata med derivatans definition och kontrollera deriverbarhet via vänster- och högerderivata.',
      'Derivera sammansatta funktioner med produkt-, kvot- och kedjeregeln samt använda implicit derivering.',
      'Känna till sambandet deriverbar $\\implies$ kontinuerlig (men att $|x|$ visar att omvändningen ej gäller).',
      'Tillämpa medelvärdessatsen (MVT) för att koppla ändringskvot till $f\'(c)$ och bevisa monotoni.',
    ],
    sections: [
      {
        heading: 'Derivatans definition & deriverbarhet',
        body: 'Derivatan i punkten $x$ definieras som gränsvärdet av ändringskvoten. Om $f$ är deriverbar i $a$ är $f$ automatiskt kontinuerlig i $a$, men t.ex. $f(x) = |x|$ är kontinuerlig i $x = 0$ utan att vara deriverbar där.',
        formulas: [
          "f'(x) = \\lim_{h\\to 0} \\frac{f(x+h) - f(x)}{h} = \\lim_{t\\to x} \\frac{f(t) - f(x)}{t - x}",
        ],
      },
      {
        heading: 'Räkneregler, standardderivator & implicit derivering',
        body: 'Med kedjeregeln deriveras sammansatta funktioner utifrån och in. Vid implicit derivering av $F(x, y(x)) = C$ deriveras varje term med avseende på $x$, där $y(x)$ behandlas som inre funktion.',
        formulas: [
          "(f\\cdot g)' = f'g + fg', \\qquad \\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}, \\qquad (f(g(x)))' = f'(g(x))\\cdot g'(x)",
          "(\\arcsin x)' = \\frac{1}{\\sqrt{1-x^2}}, \\qquad (\\arccos x)' = -\\frac{1}{\\sqrt{1-x^2}}, \\qquad (\\arctan x)' = \\frac{1}{1+x^2}",
        ],
      },
      {
        heading: 'Stationära punkter & Medelvärdessatsen (MVT)',
        body: 'En **stationär punkt** uppfyller $f\'(x) = 0$. Lokala extrempunkter finns bland stationära punkter, randpunkter och punkter där $f\'$ saknas. **Medelvärdessatsen**: Om $f$ är kontinuerlig på $[a, b]$ och deriverbar på $]a, b[$, finns $c \\in ]a, b[$ så att:',
        formulas: ["f'(c) = \\frac{f(b) - f(a)}{b - a}"],
      },
    ],
    workedExamples: [
      {
        title: 'Implicit derivering (Dugga 3-typ)',
        problem: 'Derivera $2xy(x) + (y(x))^3 = 6x$ implicit med avseende på $x$.',
        steps: [
          {
            text: 'Använd produktregeln på $2xy(x)$ och kedjeregeln på $(y(x))^3$.',
            latex: "\\frac{d}{dx}(2xy(x)) = 2y(x) + 2xy'(x), \\qquad \\frac{d}{dx}((y(x))^3) = 3(y(x))^2 \\cdot y'(x)",
          },
          {
            text: 'Derivera högerledet $6x$ till $6$.',
            latex: "2y(x) + 2xy'(x) + 3(y(x))^2 \\cdot y'(x) = 6",
          },
        ],
        answer: "$2y(x) + 2xy'(x) + 3(y(x))^2 y'(x) = 6$.",
      },
    ],
  },
  {
    id: 'sg6',
    number: 'Studieguide 6',
    shortNumber: 'SG 6',
    weekLabel: 'Kursvecka 6 (v. 50)',
    examTag: 'Tenta 4',
    title: 'Högre derivator, grafritning, asymptoter & optimering',
    subtitle: 'Teckentabeller, extremvärden, sneda asymptoter, optimering & relaterade hastigheter',
    summary:
      'Andraderivatan, fullständiga teckentabeller för att hitta lokala och globala extremvärden, lodräta/vågräta/sneda asymptoter, tillämpad optimering, relaterade hastigheter samt olikheter och rötter med derivata.',
    chapters: ['Kap 10.8', 'Kap 10.9'],
    recommendedExercises: [
      'Kapitel 10: 22, 23, 32, 33, 34, 37, 38, 40, 41, 42, 45, 49, 50',
      'Blandade problem: 56, 60, 67',
    ],
    conceptTags: ['Teckentabell & Extrema', 'Asymptoter', 'Optimering & Hastigheter'],
    keywords: [
      'sg6',
      'studieguide 6',
      'andraderivata',
      'teckentabell',
      'grafritning',
      'asymptot',
      'sned asymptot',
      'optimering',
      'största värde',
      'minsta värde',
      'relaterade hastigheter',
      'olikhet',
    ],
    learningGoals: [
      'Upprätta en fullständig teckentabell för $f\'(x)$ och avgöra lokala samt globala största och minsta värden.',
      'Bestämma lodräta, vågräta och sneda asymptoter ($y = kx + m$) till funktioner.',
      'Lösa tillämpade optimeringsproblem och problem med relaterade hastigheter.',
      'Visa olikheter och avgöra antalet reella lösningar till ekvationer med hjälp av derivata.',
    ],
    sections: [
      {
        heading: 'Teckentabell, största & minsta värde',
        body: 'För att säkert klassificera extrempunkter gör man en **teckentabell** över $f\'(x)$ (och anger även punkter utanför definitionsmängden eller där $f\'$ saknas). På ett slutet begränsat intervall $[a,b]$ antas alltid globalt max och min av en kontinuerlig funktion — bland stationära punkter, singulära punkter och randpunkter $a, b$.',
        formulas: [
          "f'(x) > 0 \\implies f \\text{ strängt växande}, \\qquad f'(x) < 0 \\implies f \\text{ strängt avtagande}",
          "f'(a) = 0 \\text{ och } f''(a) > 0 \\implies \\text{lokalt min}, \\qquad f''(a) < 0 \\implies \\text{lokalt max}",
        ],
      },
      {
        heading: 'Asymptoter (lodräta, vågräta & sneda)',
        body: 'En **lodrät asymptot** $x = a$ uppstår när $\\lim_{x\\to a^+} f(x) = \\pm\\infty$ eller $\\lim_{x\\to a^-} f(x) = \\pm\\infty$. En **sned asymptot** $y = kx + m$ då $x \\to \\infty$ (eller $-\\infty$) bestäms via:',
        formulas: [
          'k = \\lim_{x\\to\\infty} \\frac{f(x)}{x}, \\qquad m = \\lim_{x\\to\\infty} (f(x) - kx)',
        ],
        tip: 'För rationella funktioner där täljarens grad är exakt 1 högre än nämnarens grad får du den sneda asymptoten direkt som kvoten vid polynomdivision!',
      },
      {
        heading: 'Optimering & relaterade hastigheter',
        body: 'Vid optimering: inför en variabel $x$, skriv upp målfunktionen $A(x)$ med dess giltiga intervall, derivera och kontrollera ändpunkter. Vid relaterade hastigheter: formulera geometriskt samband (t.ex. likformiga trianglar eller Pythagoras) och derivera implicit m.a.p. tiden $t$.',
        warning:
          'Kapitel 10.7 (Differentialer och L’Hôspitals regel) utgår i MA1499! Använd aldrig L’Hôspitals regel.',
      },
    ],
    workedExamples: [
      {
        title: 'Fullständig analys av extremvärden (Tenta 4-typ)',
        problem:
          'Bestäm maximal definitionsmängd och eventuella extrempunkter för $f(x) = 1 + \\arcsin(x) + 2\\sqrt{1 - x^2}$.',
        steps: [
          {
            text: 'Definitionsmängden kräver $|x| \\le 1$ och $1 - x^2 \\ge 0$, dvs. $D_f = [-1, 1]$.',
          },
          {
            text: 'Derivera på det inre intervallet $]-1, 1[$:',
            latex: "f'(x) = \\frac{1}{\\sqrt{1-x^2}} - \\frac{2x}{\\sqrt{1-x^2}} = \\frac{1 - 2x}{\\sqrt{1-x^2}}",
          },
          {
            text: 'Sätt $f\'(x) = 0 \\implies x = \\frac{1}{2}$. För $x < 1/2$ är $f\'(x) > 0$ och för $x > 1/2$ är $f\'(x) < 0$.',
            latex: `f\\left(\\frac{1}{2}\\right) = 1 + \\frac{\\pi}{6} + \\sqrt{3}, \\quad f(-1) = 1 - \\frac{\\pi}{2}, \\quad f(1) = 1 + \\frac{\\pi}{2}`,
          },
        ],
        answer:
          'Största värdet är $1 + \\frac{\\pi}{6} + \\sqrt{3}$ (vid $x = 1/2$) och minsta värdet är $1 - \\frac{\\pi}{2}$ (vid $x = -1$).',
      },
    ],
  },
  {
    id: 'sg7',
    number: 'Studieguide 7',
    shortNumber: 'SG 7',
    weekLabel: 'Kursvecka 7 (v. 51)',
    examTag: 'Tenta 4',
    title: 'Maclaurin- & Taylorutvecklingar, serier & binomialsatsen',
    subtitle: 'Standardutvecklingar, ordo-restterm, gränsvärden, geometrisk serie & binomialsatsen',
    summary:
      'Maclaurinpolynom och Taylorutveckling kring x = a med ordo-restterm O(xⁿ), standardutvecklingar för eˣ, sin x, cos x, ln(1+x), arctan x och 1/(1-x), gränsvärden, summasymbol, geometrisk serie och Newtons binomialsats.',
    chapters: ['Kap 11.1–11.4', 'Kap 4.1–4.2', 'Kap 9.5'],
    recommendedExercises: [
      'Kapitel 4: 1, 2, 7a, 13, 15ac',
      'Kapitel 9: 30, 31, 32',
      'Kapitel 11: 1, 2, 4–8, 11, 12, 14, 15abc, 16, 18, 20, 21, 30–33, 36, 39, 40, 42, 43',
    ],
    conceptTags: ['Maclaurinutveckling', 'Gränsvärden med Ordo', 'Geometrisk serie & Binomial'],
    keywords: [
      'sg7',
      'studieguide 7',
      'maclaurin',
      'taylor',
      'restterm',
      'ordo',
      'standardutveckling',
      'serie',
      'geometrisk serie',
      'summa',
      'binomialsatsen',
      'newtons binomialsats',
    ],
    learningGoals: [
      'Ställa upp Maclaurinpolynom $P_n(x)$ och Taylorpolynom kring $x = a$ med korrekt ordo-restterm.',
      'Kunna standardutvecklingarna för $e^x, \\sin x, \\cos x, \\ln(1+x), \\arctan x, \\frac{1}{1-x}$ och $(1+x)^\\alpha$ samt multiplicera/substituera dessa.',
      'Beräkna avancerade $0/0$-gränsvärden med hjälp av Maclaurinutveckling.',
      'Avgöra konvergens och beräkna summan av geometriska serier samt använda Newtons binomialsats.',
    ],
    sections: [
      {
        heading: 'Standardutvecklingar kring x = 0 (Maclaurin)',
        body: 'Med Maclaurins formel approximeras en funktion nära $x = 0$ av ett polynom $P_n(x) = \\sum_{k=0}^n \\frac{f^{(k)}(0)}{k!}x^k$ plus en restterm $O(x^{n+1})$:',
        formulas: [
          'e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\dots + \\frac{x^n}{n!} + O(x^{n+1})',
          '\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\dots, \\qquad \\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\dots',
          '\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\dots, \\qquad \\arctan x = x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\dots',
          '\\frac{1}{1-x} = 1 + x + x^2 + x^3 + \\dots, \\qquad (1+x)^\\alpha = 1 + \\alpha x + \\frac{\\alpha(\\alpha-1)}{2!}x^2 + \\dots',
        ],
        tip: 'För Taylorutveckling kring $x = a$, substituera $t = x - a$ så att du kan återanvända standardutvecklingarna kring $t = 0$!',
      },
      {
        heading: 'Gränsvärden med Maclaurinutveckling',
        body: 'Vid svåra $0/0$-gränsvärden utvecklar man täljare och nämnare var för sig till den lägsta potens som inte tar ut varandra, behåller ordo-termen $O(x^m)$ och förkortar.',
        formulas: [
          '\\lim_{x\\to 0}\\frac{c\\,x^k + O(x^{k+1})}{d\\,x^k + O(x^{k+1})} = \\frac{c}{d} \\quad (d \\neq 0)',
        ],
      },
      {
        heading: 'Geometrisk serie & Newtons binomialsats',
        body: 'En oändlig geometrisk serie konvergerar om och endast om $|r| < 1$. Newtons binomialsats ger utvecklingen av $(a + b)^n$ för heltal $n \\ge 0$.',
        formulas: [
          '\\sum_{k=0}^{\\infty} a_0 r^k = \\frac{a_0}{1 - r} \\quad (|r| < 1)',
          '(a + b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k, \\qquad \\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
        ],
      },
    ],
    workedExamples: [
      {
        title: 'Gränsvärde via Maclaurinutveckling av ordning 4 (Tenta 4 260828)',
        problem:
          'Beräkna $\\lim_{x\\to 0} \\frac{\\ln(1 + x^2) - x\\arctan(x)}{(1 - \\cos(x))(e^x - 1 - x)}$.',
        steps: [
          {
            text: 'Utveckla täljarens två termer till ordning 4.',
            latex:
              '\\ln(1+x^2) = x^2 - \\frac{x^4}{2} + O(x^6), \\qquad x\\arctan(x) = x\\left(x - \\frac{x^3}{3} + O(x^5)\\right) = x^2 - \\frac{x^4}{3} + O(x^6)',
          },
          {
            text: 'Subtrahera i täljaren och utveckla nämnarens faktorer.',
            latex:
              '\\text{Täljare} = -\\frac{1}{6}x^4 + O(x^6), \\qquad \\text{Nämnare} = \\left(\\frac{x^2}{2} + O(x^4)\\right)\\left(\\frac{x^2}{2} + O(x^3)\\right) = \\frac{1}{4}x^4 + O(x^5)',
          },
          {
            text: 'Förkorta med $x^4$ och låt $x \\to 0$.',
            latex: '\\lim_{x\\to 0}\\frac{-\\frac{1}{6} + O(x^2)}{\\frac{1}{4} + O(x)} = -\\frac{2}{3}',
          },
        ],
        answer: '$-\\frac{2}{3}$.',
      },
    ],
  },
];

export const STUDY_GUIDE_IDS: StudyGuideId[] = ['sg1', 'sg2', 'sg3', 'sg4', 'sg5', 'sg6', 'sg7'];

export function isValidGuideId(val: string): val is StudyGuideId {
  return (STUDY_GUIDE_IDS as string[]).includes(val);
}

export function getStudyGuideById(id: StudyGuideId): StudyGuide {
  return STUDY_GUIDES.find((g) => g.id === id) ?? STUDY_GUIDES[0];
}
