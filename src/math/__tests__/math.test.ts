import { describe, expect, it } from 'vitest';
import {
  BASE_FUNCTIONS,
  Fraction,
  analyzeLimitPreset,
  areExprsEquivalent,
  compileExpr,
  describeFunctionTransform,
  evaluateConstantExpr,
  frac,
  generateExerciseForGuide,
  generateExerciseSet,
  solveCircleFromGeneral,
  solveGeometricSeries,
  solveMaclaurin,
  solvePolynomialDivision,
  solveTrigEquation,
  validateAnswer,
} from '../index.ts';
import type { StudyGuideId } from '../index.ts';

describe('Fraction', () => {
  it('utför exakt bråkräkning och förkortning', () => {
    const a = frac(2, 6);
    const b = frac(3, 4);
    expect(a.toString()).toBe('1/3');
    expect(a.add(b).toString()).toBe('13/12');
    expect(a.mul(b).toString()).toBe('1/4');
    expect(b.div(a).toString()).toBe('9/4');
  });

  it('parsar bråk, negativa tal och svenskt decimalkomma', () => {
    expect(Fraction.tryFromInput('-3/4')?.toString()).toBe('-3/4');
    expect(Fraction.tryFromInput('1,25')?.toString()).toBe('5/4');
    expect(Fraction.tryFromInput('abc')).toBeNull();
    expect(Fraction.tryFromInput('1/0')).toBeNull();
  });
});

describe('exprParser', () => {
  it('evaluerar konstanter och funktioner med implicit multiplikation', () => {
    expect(evaluateConstantExpr('2pi')).toBeCloseTo(2 * Math.PI, 8);
    expect(evaluateConstantExpr('ln(e^3)')).toBeCloseTo(3, 8);
    expect(evaluateConstantExpr('arcsin(1/2)')).toBeCloseTo(Math.PI / 6, 8);
    expect(evaluateConstantExpr('1,5 + 2,5')).toBeCloseTo(4, 8);
  });

  it('jämför algebraisk ekvivalens över testpunkter', () => {
    const fn = compileExpr('2x^2 + 4x');
    expect(fn(3)).toBeCloseTo(30, 8);
    expect(areExprsEquivalent('2x(x + 2)', '2x^2 + 4x', [-2, -0.5, 1, 3])).toBe(true);
    expect(areExprsEquivalent('2x^2 + 3x', '2x^2 + 4x', [-2, -0.5, 1, 3])).toBe(false);
  });
});

describe('calculusCore solvers', () => {
  it('löser polynomdivision och detekterar faktor', () => {
    // x^3 - 2x^2 - 5x + 6 = (x - 3)(x^2 + x - 2)
    const res = solvePolynomialDivision([frac(1), frac(-2), frac(-5), frac(6)], frac(3));
    expect(res.value.isFactor).toBe(true);
    expect(res.value.remainder.isZero()).toBe(true);
    expect(res.value.quotientCoeffs.map((c) => c.toString())).toEqual(['1', '1', '-2']);
  });

  it('kvadratkompletterar cirkelns ekvation korrekt', () => {
    // x^2 - 6x + y^2 + 4y = 3 => (x-3)^2 + (y+2)^2 = 16
    const res = solveCircleFromGeneral(frac(-6), frac(4), frac(3));
    expect(res.value.hasRealCircle).toBe(true);
    expect(res.value.centerX.toString()).toBe('3');
    expect(res.value.centerY.toString()).toBe('-2');
    expect(res.value.radius).toBeCloseTo(4, 8);

    const empty = solveCircleFromGeneral(frac(2), frac(2), frac(-10));
    expect(empty.value.hasRealCircle).toBe(false);
  });

  it('beskriver basfunktioner och graftransformationer', () => {
    expect(BASE_FUNCTIONS.sqrt.fn(9)).toBe(3);
    expect(Number.isNaN(BASE_FUNCTIONS.sqrt.fn(-1))).toBe(true);
    const tr = describeFunctionTransform('x2', 2, 1, 3, -4);
    expect(tr.formulaLatex).toContain('f(x - 3)');
  });

  it('löser trigonometriska ekvationer på [0, 2π]', () => {
    const res = solveTrigEquation('sin', 2, 1, 1, 0, 2 * Math.PI);
    expect(res.value.hasSolution).toBe(true);
    expect(res.value.solutions).toHaveLength(2);
    expect(res.value.solutions[0]).toBeCloseTo(Math.PI / 6, 4);
    expect(res.value.solutions[1]).toBeCloseTo((5 * Math.PI) / 6, 4);

    const impossible = solveTrigEquation('cos', 1, 1, 3, 0, 2 * Math.PI);
    expect(impossible.value.hasSolution).toBe(false);
  });

  it('analyserar standardgränsvärden och oändlighetsgränsvärden', () => {
    expect(analyzeLimitPreset('sin_kx_over_x', 5).limitNumeric).toBeCloseTo(5, 8);
    expect(analyzeLimitPreset('exp_kx_minus_1', 3).limitNumeric).toBeCloseTo(3, 8);
    expect(analyzeLimitPreset('ln_1_plus_kx', 4).limitNumeric).toBeCloseTo(4, 8);
    expect(analyzeLimitPreset('one_minus_cos_kx', 4).limitNumeric).toBeCloseTo(8, 8);
    expect(analyzeLimitPreset('sqrt_conjugate_inf', 6).limitNumeric).toBeCloseTo(3, 8);
  });

  it('genererar Maclaurinpolynom och summerar geometrisk serie', () => {
    const mac = solveMaclaurin('exp', 4);
    expect(mac.evaluate(1)).toBeCloseTo(1 + 1 + 0.5 + 1 / 6 + 1 / 24, 8);

    const conv = solveGeometricSeries(frac(3), frac(1, 2));
    expect(conv.value.converges).toBe(true);
    expect(conv.value.sum?.toString()).toBe('6');

    const div = solveGeometricSeries(frac(2), frac(3, 2));
    expect(div.value.converges).toBe(false);
    expect(div.value.sum).toBeNull();
  });
});

describe('exercises & validation', () => {
  const allGuides: StudyGuideId[] = ['sg1', 'sg2', 'sg3', 'sg4', 'sg5', 'sg6', 'sg7'];

  it('genererar giltiga övningar för alla 7 studieguider och validerar rätt svar', () => {
    for (const guideId of allGuides) {
      const ex = generateExerciseForGuide(guideId, 'medel');
      expect(ex.guideId).toBe(guideId);
      expect(ex.steps.length).toBeGreaterThan(0);

      const okFeedback = validateAnswer(ex, String(ex.expectedValue));
      expect(okFeedback.isCorrect).toBe(true);
    }
  });

  it('avvisar uttryck med variabeln x i konstanta sammanhang och undviker \\pin', () => {
    expect(evaluateConstantExpr('x + 5')).toBeNull();
    expect(evaluateConstantExpr('x')).toBeNull();
    expect(areExprsEquivalent('x + 5', '5', [])).toBe(false);

    const trigRes = solveTrigEquation('cos', 1, 2, 0.8, 0, 2 * Math.PI);
    expect(trigRes.latexResult).not.toMatch(/\\pi[a-zA-Z]/);
  });

  it('genererar unika frågeset och fångar felaktiga svar över många iterationer', () => {
    const set = generateExerciseSet(allGuides, 7, 'medel');
    expect(set).toHaveLength(7);

    const sg4Ex = generateExerciseForGuide('sg4', 'grund');
    const bad = validateAnswer(sg4Ex, '999999');
    expect(bad.isCorrect).toBe(false);

    for (const gid of allGuides) {
      for (const diff of ['grund', 'medel', 'utmaning'] as const) {
        for (let i = 0; i < 40; i++) {
          const ex = generateExerciseForGuide(gid, diff);
          expect(ex.hint).not.toContain('${');
          expect(ex.prompt).not.toContain('${');
          expect(validateAnswer(ex, String(ex.expectedValue)).isCorrect).toBe(true);
          if (ex.kind === 'choice' && ex.choices) {
            expect(new Set(ex.choices).size).toBe(ex.choices.length);
            expect(ex.choices).toContain(String(ex.expectedValue));
          }
        }
      }
    }
  });
});
