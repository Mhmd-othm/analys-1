import type { Fraction } from './fraction.ts';

export type StudyGuideId = 'sg1' | 'sg2' | 'sg3' | 'sg4' | 'sg5' | 'sg6' | 'sg7';

export type Difficulty = 'grund' | 'medel' | 'utmaning';

export interface MathStep {
  title: string;
  explanation: string;
  latex?: string;
}

export interface CalculationResult<T> {
  value: T;
  latexResult: string;
  steps: MathStep[];
  summary: string;
  error?: string;
}

export type ExerciseKind = 'scalar' | 'choice' | 'expr';

export interface Exercise {
  id: string;
  guideId: StudyGuideId;
  guideTitle: string;
  difficulty: Difficulty;
  prompt: string;
  promptLatex?: string;
  kind: ExerciseKind;
  choices?: string[];
  /** Om angiven, renderas svarsalternativen med KaTeX */
  choicesAreLatex?: boolean;
  placeholder: string;
  hint: string;
  answerDisplay: string;
  answerLatex: string;
  /** För 'scalar': tal; för 'choice': exakt sträng; för 'expr': uttryck i x eller konstantuttryck */
  expectedValue: number | string;
  /** För 'expr': x-värden att utvärdera ekvivalens över (tom array = konstantuttryck) */
  samplePoints?: number[];
  tolerance?: number;
  steps: MathStep[];
}

export interface ValidationFeedback {
  isCorrect: boolean;
  userParsedDisplay: string;
  feedbackMessage: string;
  expectedDisplay: string;
  expectedLatex: string;
  steps: MathStep[];
}

export interface PolyDivisionValue {
  dividendCoeffs: Fraction[];
  rootA: Fraction;
  quotientCoeffs: Fraction[];
  remainder: Fraction;
  isFactor: boolean;
  quotientLatex: string;
}

export interface CircleValue {
  centerX: Fraction;
  centerY: Fraction;
  radiusSq: Fraction;
  radius: number | null;
  radiusLatex: string;
  hasRealCircle: boolean;
}

export interface TrigSolutionValue {
  solutions: number[];
  generalLatex: string;
  hasSolution: boolean;
}

export interface MaclaurinValue {
  order: number;
  center: number;
  coeffs: number[];
  polynomialLatex: string;
  remainderOrder: number;
  evaluate: (x: number) => number;
}

export interface GeometricSeriesValue {
  a0: Fraction;
  r: Fraction;
  converges: boolean;
  sum: Fraction | null;
  partialSums: { n: number; term: number; sum: number }[];
}
