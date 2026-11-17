import type { StudyGuideId } from '../math/index.ts';

export interface ErrorStep {
  stepNumber: number;
  label: string;
  latex?: string;
  text?: string;
  isError: boolean;
  errorExplanation?: string;
  errorOptions?: string[];
  correctOptionIndex?: number;
}

export interface SpotTheErrorProblem {
  id: string;
  examTag: 'Dugga 1' | 'Dugga 2' | 'Dugga 3' | 'Tenta 4';
  guideId: StudyGuideId;
  title: string;
  statement: string;
  statementLatex?: string;
  steps: ErrorStep[];
  correctStepIndex: number; // 0-baserat index för det felaktiga steget
  fullExplanation: string;
  correctSolutionLatex: string;
  examAdvice: string;
}

export const SPOT_THE_ERROR_PROBLEMS: SpotTheErrorProblem[] = [
  {
    id: 'err1',
    examTag: 'Dugga 1',
    guideId: 'sg1',
    title: 'Rotekvation & falska rötter',
    statement: 'Lös ekvationen för reella x:',
    statementLatex: '\\sqrt{x + 3} = x + 1',
    steps: [
      {
        stepNumber: 1,
        label: 'Kvadrera båda led',
        latex: '(\\sqrt{x + 3})^2 = (x + 1)^2 \\implies x + 3 = x^2 + 2x + 1',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Samla termer på ena sidan',
        latex: 'x^2 + x - 2 = 0',
        isError: false,
      },
      {
        stepNumber: 3,
        label: 'Faktorisera andragradsekvationen',
        latex: '(x + 2)(x - 1) = 0 \\implies x_1 = 1, \\quad x_2 = -2',
        isError: false,
      },
      {
        stepNumber: 4,
        label: 'Slutsats om rötter',
        latex: '\\text{Svar: Ekvationen har två reella rötter: } x = 1 \\text{ och } x = -2.',
        isError: true,
        errorOptions: [
          'Kvadrering är en implikation (inte ekvivalens). Rötterna måste prövas, och x = -2 ger falsk rot.',
          'Andragradaren har rötterna x = -1 och x = 2, inte x = 1 och x = -2.',
          'Man får aldrig kvadrera en ekvation med rottecken.',
        ],
        correctOptionIndex: 0,
      },
    ],
    correctStepIndex: 3,
    fullExplanation:
      'Kvadrering introducerar ofta falska rötter eftersom $A = B \\implies A^2 = B^2$, men $A^2 = B^2 \\implies A = \\pm B$. Vid prövning av $x = -2$: VL $= \\sqrt{-2+3} = \\sqrt{1} = 1$, men HL $= -2 + 1 = -1$. Eftersom $1 \\neq -1$ är $x = -2$ en falsk rot! Endast $x = 1$ är en giltig lösning.',
    correctSolutionLatex: 'x = 1 \\quad (x = -2 \\text{ är en falsk rot})',
    examAdvice: 'På Dugga 1 ger en lösning med falsk rot ofta poängavdrag på minst 50%. Skriv alltid en tydlig prövningsruta!',
  },
  {
    id: 'err2',
    examTag: 'Dugga 1',
    guideId: 'sg1',
    title: 'Inversfunktion & intervallbegränsning',
    statement: 'Bestäm inversen f⁻¹(x) till funktionen f definierad för x ≤ 2:',
    statementLatex: 'f(x) = (x - 2)^2 + 1, \\quad D_f = (-\\infty, 2]',
    steps: [
      {
        stepNumber: 1,
        label: 'Sätt y = f(x) och isolera kvadraten',
        latex: 'y = (x - 2)^2 + 1 \\implies (x - 2)^2 = y - 1',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Dra kvadratroten ur båda led',
        latex: 'x - 2 = \\sqrt{y - 1}',
        isError: true,
        errorOptions: [
          'Eftersom x ≤ 2 är (x − 2) ≤ 0, så är √( (x−2)² ) = |x − 2| = −(x − 2). Det ska vara x − 2 = −√(y − 1).',
          'Roten ur y − 1 existerar inte för reella tal.',
          'Man måste ta kvadratroten ur 1 också.',
        ],
        correctOptionIndex: 0,
      },
      {
        stepNumber: 3,
        label: 'Lös ut x och byt variabel',
        latex: 'x = 2 + \\sqrt{y - 1} \\implies f^{-1}(x) = 2 + \\sqrt{x - 1}',
        isError: false,
      },
    ],
    correctStepIndex: 1,
    fullExplanation:
      'Kvadratroten ur en kvadrat är absolutbeloppet: $\\sqrt{(x-2)^2} = |x-2|$. Eftersom definitionsmängden är $x \\le 2$, är $x - 2 \\le 0$, vilket ger $|x - 2| = -(x - 2) = 2 - x$. Därmed är $2 - x = \\sqrt{y - 1} \\implies x = 2 - \\sqrt{y - 1}$.',
    correctSolutionLatex: 'f^{-1}(x) = 2 - \\sqrt{x - 1}, \\quad x \\ge 1',
    examAdvice: 'Kontrollera alltid att $V_{f^{-1}} = D_f = (-\\infty, 2]$. Lösningen $2 + \\sqrt{x-1} \\ge 2$ hamnar i helt fel halva!',
  },
  {
    id: 'err3',
    examTag: 'Dugga 2',
    guideId: 'sg2',
    title: 'Falsk logaritmlag för summa',
    statement: 'Lös ekvationen för reella tal x > 1:',
    statementLatex: '\\ln(x + 2) + \\ln(x - 1) = \\ln(10)',
    steps: [
      {
        stepNumber: 1,
        label: 'Definiera tillåtna x-värden',
        latex: 'x + 2 > 0 \\text{ och } x - 1 > 0 \\implies x > 1',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Kombinera logaritmerna',
        latex: '\\ln(x + 2) + \\ln(x - 1) = \\ln((x + 2) + (x - 1)) = \\ln(2x + 1)',
        isError: true,
        errorOptions: [
          'Logaritmlagen är ln(A) + ln(B) = ln(A · B), inte ln(A + B).',
          'Man måste ta e upphöjt till varje term separat innan man förenklar.',
          'ln(10) kan inte kombineras med variabler.',
        ],
        correctOptionIndex: 0,
      },
      {
        stepNumber: 3,
        label: 'Likställ argumenten',
        latex: '2x + 1 = 10 \\implies 2x = 9 \\implies x = 4{,}5',
        isError: false,
      },
    ],
    correctStepIndex: 1,
    fullExplanation:
      'Det finns ingen formel som säger att $\\ln A + \\ln B = \\ln(A + B)$. Rätt logaritmlag är $\\ln A + \\ln B = \\ln(A \\cdot B)$. Rätt ekvation är därför $(x+2)(x-1) = 10 \\implies x^2 + x - 2 = 10 \\implies x^2 + x - 12 = 0 \\implies (x+4)(x-3) = 0$. Eftersom $x > 1$ är roten $x = 3$.',
    correctSolutionLatex: '(x + 2)(x - 1) = 10 \\implies x = 3',
    examAdvice: 'En av de allra vanligaste "algebraiska önsketänkande"-fällorna. Kom ihåg: logaritmer omvandlar multiplikation till addition, inte addition till addition!',
  },
  {
    id: 'err4',
    examTag: 'Dugga 2',
    guideId: 'sg3',
    title: 'Arcusfunktionens värdemängd',
    statement: 'Förenkla följande uttryck:',
    statementLatex: '\\arcsin\\left(\\sin\\frac{5\\pi}{6}\\right)',
    steps: [
      {
        stepNumber: 1,
        label: 'Åberopa inversregel',
        text: 'Eftersom arcsin är inversfunktionen till sinus gäller definitionsmässigt att arcsin(sin u) = u.',
        latex: '\\arcsin(\\sin u) = u',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Sätt in vinkeln 5π/6',
        latex: '\\arcsin\\left(\\sin\\frac{5\\pi}{6}\\right) = \\frac{5\\pi}{6}',
        isError: true,
        errorOptions: [
          'Värdemängden för arcsin är [−π/2, π/2]. Eftersom 5π/6 > π/2 är svaret istället π − 5π/6 = π/6.',
          'sin(5π/6) är negativt, så svaret borde ha varit −5π/6.',
          'arcsin existerar inte för vinklar större än π.',
        ],
        correctOptionIndex: 0,
      },
    ],
    correctStepIndex: 1,
    fullExplanation:
      'Inversregeln $\\arcsin(\\sin u) = u$ gäller endast om $u \\in [-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$. Vinkeln $\\frac{5\\pi}{6} = 150^\\circ$ ligger i andra kvadranten utanför detta intervall. Men $\\sin\\frac{5\\pi}{6} = \\frac{1}{2}$. Huvudvärdet för $\\arcsin(\\frac{1}{2})$ är $\\frac{\\pi}{6}$ (som ligger i $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$).',
    correctSolutionLatex: '\\arcsin\\left(\\sin\\frac{5\\pi}{6}\\right) = \\arcsin\\left(\\frac{1}{2}\\right) = \\frac{\\pi}{6}',
    examAdvice: 'Klassisk uppgift på Dugga 2 och Tenta 4. Tänk alltid på att arcsin(x) ALLTID svarar i [−π/2, π/2] och arccos(x) i [0, π]!',
  },
  {
    id: 'err5',
    examTag: 'Dugga 2',
    guideId: 'sg3',
    title: 'Gränsvärde mot −∞ och roturdragning',
    statement: 'Beräkna gränsvärdet då x går mot minus oändligheten:',
    statementLatex: '\\lim_{x \\to -\\infty} \\frac{\\sqrt{4x^2 + 7}}{2x - 3}',
    steps: [
      {
        stepNumber: 1,
        label: 'Bryt ut x² under rottecknet',
        latex: '\\sqrt{4x^2 + 7} = \\sqrt{x^2 \\left(4 + \\frac{7}{x^2}\\right)}',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Dra ut x utanför roten',
        latex: '\\sqrt{x^2 \\left(4 + \\frac{7}{x^2}\\right)} = x \\sqrt{4 + \\frac{7}{x^2}}',
        isError: true,
        errorOptions: [
          'Då x → −∞ är x < 0, så √(x²) = |x| = −x. Det ska vara −x framför rottecknet.',
          '7/x² går mot oändligheten, inte noll.',
          '4x² + 7 kan inte faktoriseras med x².',
        ],
        correctOptionIndex: 0,
      },
      {
        stepNumber: 3,
        label: 'Förkorta med x och gå i gräns',
        latex: '\\lim_{x \\to -\\infty} \\frac{x\\sqrt{4 + 7/x^2}}{x(2 - 3/x)} = \\frac{\\sqrt{4}}{2} = 1',
        isError: false,
      },
    ],
    correctStepIndex: 1,
    fullExplanation:
      'Per definition är $\\sqrt{x^2} = |x|$. När $x \\to -\\infty$ är $x$ negativt, vilket ger att $|x| = -x$. Täljaren blir alltså $-x\\sqrt{4 + 7/x^2}$. När vi förkortar med $x$ får vi $\\frac{-\\sqrt{4 + 7/x^2}}{2 - 3/x} \\to \\frac{-2}{2} = -1$.',
    correctSolutionLatex: '\\lim_{x \\to -\\infty} \\frac{-x\\sqrt{4 + 7/x^2}}{x(2 - 3/x)} = -1',
    examAdvice: 'En av tentatorernas favoritfällor vid gränsvärden! Skriv alltid explicit: "Eftersom x < 0 är √(x²) = −x".',
  },
  {
    id: 'err6',
    examTag: 'Dugga 3',
    guideId: 'sg4',
    title: 'Standardgränsvärde med fel gräns',
    statement: 'Beräkna gränsvärdet:',
    statementLatex: '\\lim_{x \\to \\pi} \\frac{\\sin x}{x}',
    steps: [
      {
        stepNumber: 1,
        label: 'Tillämpa standardgränsvärde',
        latex: '\\text{Eftersom } \\lim_{u \\to 0} \\frac{\\sin u}{u} = 1, \\text{ gäller direkt att } \\lim_{x \\to \\pi} \\frac{\\sin x}{x} = 1.',
        isError: true,
        errorOptions: [
          'Standardgränsvärdet gäller endast då variabeln går mot 0. Här går x → π, och uttrycket är kontinuerligt med värde 0/π = 0.',
          'sin(π) är odefinierat.',
          'Man måste använda L’Hôpitals regel här.',
        ],
        correctOptionIndex: 0,
      },
    ],
    correctStepIndex: 0,
    fullExplanation:
      'Standardgränsvärdet $\\lim_{u\\to 0} \\frac{\\sin u}{u} = 1$ är en $0/0$-obestämdhet kring $u = 0$. När $x \\to \\pi$ är nämnaren $\\pi \\neq 0$, och funktionen är helt kontinuerlig i punkten. Enkel insättning ger $\\frac{\\sin\\pi}{\\pi} = \\frac{0}{\\pi} = 0$.',
    correctSolutionLatex: '\\lim_{x \\to \\pi} \\frac{\\sin x}{x} = \\frac{\\sin\\pi}{\\pi} = 0',
    examAdvice: 'Kontrollera ALLTID om gränsvärdet faktiskt är ett obestämt uttryck (0/0, ∞/∞) innan du börjar använda satser och standardgränsvärden!',
  },
  {
    id: 'err7',
    examTag: 'Dugga 3',
    guideId: 'sg5',
    title: 'Kedjeregeln & glömd inre derivata',
    statement: 'Derivera funktionen m.a.p. x:',
    statementLatex: 'f(x) = e^{-x^2}',
    steps: [
      {
        stepNumber: 1,
        label: 'Identifiera yttre funktion',
        text: 'Yttre funktion är exp(u), vars derivata är exp(u).',
        latex: '\\frac{d}{du} e^u = e^u',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Tillämpa kedjeregeln',
        latex: 'f\'(x) = e^{-x^2}',
        isError: true,
        errorOptions: [
          'Missade inre derivatan d/dx(−x²) = −2x. Rätt derivata är −2x · e^(−x²).',
          'Derivatan av e^(−u) är alltid negativ.',
          'Man kan inte derivera negativa potenser.',
        ],
        correctOptionIndex: 0,
      },
    ],
    correctStepIndex: 1,
    fullExplanation:
      'Kedjeregeln lyder $(f(g(x)))^\' = f\'(g(x)) \\cdot g\'(x)$. Här är den inre funktionen $g(x) = -x^2$, vars derivata är $g\'(x) = -2x$. Multiplicerar vi med den inre derivatan erhålls $f\'(x) = -2x e^{-x^2}$.',
    correctSolutionLatex: 'f\'(x) = e^{-x^2} \\cdot (-2x) = -2x e^{-x^2}',
    examAdvice: 'Gör det till en reflex: varje gång du deriverar e^(något), fråga dig själv: "Vad är derivatan av exponenten?"',
  },
  {
    id: 'err8',
    examTag: 'Dugga 3',
    guideId: 'sg5',
    title: 'Kvotregeln och tecken i täljaren',
    statement: 'Derivera funktionen för x > 0:',
    statementLatex: 'f(x) = \\frac{\\ln x}{x}',
    steps: [
      {
        stepNumber: 1,
        label: 'Ställ upp kvotregeln',
        latex: 'f\'(x) = \\frac{(\\ln x)\' \\cdot x + \\ln x \\cdot (x)\'}{x^2} = \\frac{\\frac{1}{x} \\cdot x + \\ln x \\cdot 1}{x^2}',
        isError: true,
        errorOptions: [
          'Kvotregeln har minustecken i täljaren: (u/v)\' = (u\'v − uv\') / v². Det ska vara 1 − ln(x).',
          'Derivatan av ln(x) är 1/(x²).',
          'Nämnaren ska vara 2x, inte x².',
        ],
        correctOptionIndex: 0,
      },
      {
        stepNumber: 2,
        label: 'Förenkla täljaren',
        latex: 'f\'(x) = \\frac{1 + \\ln x}{x^2}',
        isError: false,
      },
    ],
    correctStepIndex: 0,
    fullExplanation:
      'Kvotregeln lyder $\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}$. Plus i täljaren tillhör produktregeln, inte kvotregeln. Rätt täljare är $\\left(\\frac{1}{x}\\right) \\cdot x - (\\ln x) \\cdot 1 = 1 - \\ln x$.',
    correctSolutionLatex: 'f\'(x) = \\frac{1 - \\ln x}{x^2}',
    examAdvice: 'Ett teckenfel i kvotregeln gör att teckentabellen för f\' blir helt inverterad och förstör hela kurvritningsuppgiften på tentan!',
  },
  {
    id: 'err9',
    examTag: 'Tenta 4',
    guideId: 'sg6',
    title: 'Stationär punkt vs Terrasspunkt',
    statement: 'Finn alla lokala extrempunkter till funktionen:',
    statementLatex: 'f(x) = x^3 - 6x^2 + 12x + 1',
    steps: [
      {
        stepNumber: 1,
        label: 'Derivera och faktorisera',
        latex: 'f\'(x) = 3x^2 - 12x + 12 = 3(x - 2)^2',
        isError: false,
      },
      {
        stepNumber: 2,
        label: 'Sök stationära punkter f\'(x) = 0',
        latex: '3(x - 2)^2 = 0 \\iff x = 2',
        isError: false,
      },
      {
        stepNumber: 3,
        label: 'Slutsats om extrempunkt',
        latex: '\\text{Eftersom } f\'(2) = 0 \\text{ och } f\'\'(2) = 0, \\text{ är } x = 2 \\text{ en lokal minimipunkt.}',
        isError: true,
        errorOptions: [
          '3(x − 2)² ≥ 0 överallt, så f\' byter inte tecken. x = 2 är en terrasspunkt (platå), inget extremvärde!',
          'x = 2 är ett lokalt maximum eftersom andra derivatan är 0.',
          'Det finns inga stationära punkter eftersom 3(x − 2)² aldrig kan bli 0.',
        ],
        correctOptionIndex: 0,
      },
    ],
    correctStepIndex: 2,
    fullExplanation:
      'Att $f\'(x_0) = 0$ är endast ett nödvändigt villkor för lokalt extremvärde i en inre punkt, inte tillräckligt! En teckentabell visar att $f\'(x) = 3(x-2)^2 > 0$ för alla $x \\neq 2$. Kurvan är strängt växande både före och efter $x = 2$. Punkten $(2, 9)$ är en terrasspunkt (inflexionspunkt med horisontell tangent). Funktionen saknar lokala extrempunkter!',
    correctSolutionLatex: '\\text{Inga lokala extrempunkter ( } x = 2 \\text{ är en terrasspunkt)}',
    examAdvice: 'Dra ALDRIG slutsatser om extremvärden utan att ha gjort en fullständig teckentabell för f\'(x)!',
  },
  {
    id: 'err10',
    examTag: 'Tenta 4',
    guideId: 'sg7',
    title: 'Maclaurinutveckling avbruten för tidigt',
    statement: 'Beräkna gränsvärdet med Maclaurinutveckling:',
    statementLatex: '\\lim_{x \\to 0} \\frac{x - \\sin x}{x^3}',
    steps: [
      {
        stepNumber: 1,
        label: 'Utveckla sin(x) till ordning 1',
        latex: '\\sin x = x + O(x^2)',
        isError: true,
        errorOptions: [
          'Eftersom x − x tar ut varandra måste sin(x) utvecklas till minst ordning 3: sin(x) = x − x³/6 + O(x⁵). Med O(x²) blir resten O(x²)/x³ = O(1/x) obestämd.',
          'sin(x) kan inte utvecklas i Maclaurinserie.',
          'Ordo-termen ska vara O(x³) redan vid första termen.',
        ],
        correctOptionIndex: 0,
      },
      {
        stepNumber: 2,
        label: 'Sätt in i gränsvärdet',
        latex: '\\lim_{x \\to 0} \\frac{x - (x + O(x^2))}{x^3} = \\lim_{x \\to 0} \\frac{O(x^2)}{x^3} = \\infty',
        isError: false,
      },
    ],
    correctStepIndex: 0,
    fullExplanation:
      'När ledande termer tar ut varandra i täljaren ($x - x = 0$) måste utvecklingen drivas till den första icke-nolltermen som matchar nämnarens gradtal. Här är nämnaren $x^3$. Vi behöver alltså $\\sin x = x - \\frac{x^3}{6} + O(x^5)$. Då blir täljaren $x - (x - x^3/6 + O(x^5)) = \\frac{x^3}{6} + O(x^5)$. Delning med $x^3$ ger $\\frac{1}{6} + O(x^2) \\to \\frac{1}{6}$.',
    correctSolutionLatex: '\\lim_{x \\to 0} \\frac{x - (x - x^3/6 + O(x^5))}{x^3} = \\lim_{x \\to 0} \\left(\\frac{1}{6} + O(x^2)\\right) = \\frac{1}{6}',
    examAdvice: 'En av de absolut vanligaste källorna till poängavdrag på Tenta 4: "Avbröt Maclaurinutvecklingen för tidigt, ordo-kalkylen fallerar". Se till att resttermen alltid är av högre grad än nämnaren!',
  },
];
