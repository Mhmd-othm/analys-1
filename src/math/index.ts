export { Fraction, frac, numToLatex } from './fraction.ts';

export {
  areExprsEquivalent,
  compileExpr,
  evaluateConstantExpr,
  tryCompileExpr,
} from './exprParser.ts';

export {
  BASE_FUNCTIONS,
  analyzeLimitPreset,
  describeFunctionTransform,
  polyToLatex,
  solveCircleFromGeneral,
  solveGeometricSeries,
  solveMaclaurin,
  solvePolynomialDivision,
  solveTrigEquation,
} from './calculusCore.ts';
export type {
  BaseFunctionId,
  BaseFunctionMeta,
  LimitAnalysis,
  LimitPresetId,
  MaclaurinFnId,
  TrigFnKind,
} from './calculusCore.ts';

export {
  STUDY_GUIDE_TITLES,
  generateExerciseForGuide,
  generateExerciseSet,
  validateAnswer,
} from './exercises.ts';

export type {
  CalculationResult,
  CircleValue,
  Difficulty,
  Exercise,
  ExerciseKind,
  GeometricSeriesValue,
  MaclaurinValue,
  MathStep,
  PolyDivisionValue,
  StudyGuideId,
  TrigSolutionValue,
  ValidationFeedback,
} from './types.ts';
