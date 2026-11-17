import { describe, expect, it } from 'vitest';
import { SPOT_THE_ERROR_PROBLEMS } from '../../data/spotTheErrorData.ts';

describe('Matematisk precision för nya interaktiva verktyg', () => {
  it('Newtons metod beräknar korrekta iterationer för √2 med x² − 2', () => {
    const f = (x: number) => x * x - 2;
    const df = (x: number) => 2 * x;

    const x0 = 2.0;
    const x1 = x0 - f(x0) / df(x0); // 2 - (4-2)/4 = 1.5
    expect(x1).toBeCloseTo(1.5, 6);

    const x2 = x1 - f(x1) / df(x1); // 1.5 - (2.25-2)/3 = 1.5 - 0.25/3 = 1.41666667
    expect(x2).toBeCloseTo(1.41666667, 6);

    const x3 = x2 - f(x2) / df(x2);
    expect(x3).toBeCloseTo(Math.SQRT2, 5); // 5 korrekta decimaler vid steg 3

    const x4 = x3 - f(x3) / df(x3);
    expect(x4).toBeCloseTo(Math.SQRT2, 11); // Fler än 11 korrekta decimaler vid steg 4!
  });

  it('ε-δ toleransgränser beräknas korrekt för linjära och kvadratiska presets', () => {
    // f(x) = 2x - 1 vid x -> 3 (L = 5)
    const eps = 0.6;
    const deltaLinear = eps / 2; // 0.3
    // Kontrollera att om |x - 3| < delta så är |(2x-1) - 5| < eps
    const xTest1 = 3 + deltaLinear * 0.99;
    expect(Math.abs((2 * xTest1 - 1) - 5)).toBeLessThan(eps);

    const xLeak1 = 3 + deltaLinear * 1.05;
    expect(Math.abs((2 * xLeak1 - 1) - 5)).toBeGreaterThan(eps);

    // f(x) = x² vid x -> 2 (L = 4)
    // (2 + d)^2 - 4 = eps => d = sqrt(4 + eps) - 2
    const dRight = Math.sqrt(4 + eps) - 2;
    const xTest2 = 2 + dRight * 0.99;
    expect(Math.abs(xTest2 * xTest2 - 4)).toBeLessThan(eps);

    const xLeak2 = 2 + dRight * 1.02;
    expect(Math.abs(xLeak2 * xLeak2 - 4)).toBeGreaterThan(eps);
  });

  it('Enhetscirkeln och Arcus-inverser hanterar principgrenar korrekt', () => {
    // Vinkel 150 grader = 5pi/6
    const angleRad = (150 * Math.PI) / 180;
    const sin150 = Math.sin(angleRad);
    expect(sin150).toBeCloseTo(0.5, 6);

    // arcsin(sin(150°)) ska bli 30° = pi/6 rad
    const arcsinVal = Math.asin(sin150);
    const arcsinDeg = (arcsinVal * 180) / Math.PI;
    expect(arcsinDeg).toBeCloseTo(30, 4);
    expect(arcsinVal).toBeCloseTo(Math.PI / 6, 6);

    // arccos(cos(150°)) ska stanna på 150° eftersom 150° in [0, 180°]
    const cos150 = Math.cos(angleRad);
    const arccosVal = Math.acos(cos150);
    const arccosDeg = (arccosVal * 180) / Math.PI;
    expect(arccosDeg).toBeCloseTo(150, 4);
  });

  it('Samtliga 10 SpotTheError-problem har konsistenta matematiska steg och facit', () => {
    expect(SPOT_THE_ERROR_PROBLEMS).toHaveLength(10);

    for (const prob of SPOT_THE_ERROR_PROBLEMS) {
      expect(prob.id).toBeTruthy();
      expect(prob.steps.length).toBeGreaterThanOrEqual(1);
      expect(prob.correctStepIndex).toBeGreaterThanOrEqual(0);
      expect(prob.correctStepIndex).toBeLessThan(prob.steps.length);

      const errStep = prob.steps[prob.correctStepIndex];
      expect(errStep.isError).toBe(true);

      // Kontrollera att övriga steg inte är markerade som felaktiga
      prob.steps.forEach((st, idx) => {
        if (idx !== prob.correctStepIndex) {
          expect(st.isError).toBe(false);
        }
      });

      // Om det finns flervalsalternativ ska rätt alternativ finnas
      if (errStep.errorOptions && errStep.errorOptions.length > 0) {
        expect(errStep.correctOptionIndex).toBeDefined();
        expect(errStep.correctOptionIndex).toBeGreaterThanOrEqual(0);
        expect(errStep.correctOptionIndex).toBeLessThan(errStep.errorOptions.length);
      }

      // Pedagogiska fält måste vara ifyllda
      expect(prob.fullExplanation.length).toBeGreaterThan(20);
      expect(prob.examAdvice.length).toBeGreaterThan(15);
      expect(prob.correctSolutionLatex.length).toBeGreaterThan(3);
    }
  });
});
