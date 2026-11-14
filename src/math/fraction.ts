function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

export class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint | number, den: bigint | number = 1n) {
    let n = typeof num === 'number' ? BigInt(Math.round(num)) : num;
    let d = typeof den === 'number' ? BigInt(Math.round(den)) : den;
    if (d === 0n) {
      throw new Error('Division med noll i bråk.');
    }
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    if (n === 0n) {
      this.num = 0n;
      this.den = 1n;
      return;
    }
    const g = gcdBigInt(n, d);
    this.num = n / g;
    this.den = d / g;
  }

  static fromDecimalString(raw: string): Fraction {
    const s = raw.trim().replace(',', '.');
    if (/^[+-]?\d+$/.test(s)) {
      return new Fraction(BigInt(s), 1n);
    }
    const sciMatch = s.match(/^([+-]?)(\d+)(?:\.(\d+))?[eE]([+-]?\d+)$/);
    if (sciMatch) {
      const sign = sciMatch[1] === '-' ? -1n : 1n;
      const intPart = sciMatch[2];
      const fracPart = sciMatch[3] ?? '';
      const exp = parseInt(sciMatch[4], 10);
      const digits = BigInt(intPart + fracPart);
      const shift = exp - fracPart.length;
      if (shift >= 0) {
        return new Fraction(sign * digits * 10n ** BigInt(shift), 1n);
      }
      return new Fraction(sign * digits, 10n ** BigInt(-shift));
    }
    const decMatch = s.match(/^([+-]?)(\d*)\.(\d+)$/);
    if (decMatch) {
      const sign = decMatch[1] === '-' ? -1n : 1n;
      const intPart = decMatch[2] || '0';
      const fracPart = decMatch[3];
      const digits = BigInt(intPart + fracPart);
      return new Fraction(sign * digits, 10n ** BigInt(fracPart.length));
    }
    throw new Error(`Ogiltigt tal: "${raw}"`);
  }

  static fromInput(input: string | number): Fraction {
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) {
        throw new Error('Talet måste vara ändligt.');
      }
      if (Number.isInteger(input)) {
        return new Fraction(BigInt(input), 1n);
      }
      return Fraction.fromDecimalString(input.toPrecision(10));
    }
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Tom inmatning.');
    }
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length !== 2) {
        throw new Error(`Ogiltigt bråk: "${input}"`);
      }
      const a = Fraction.fromDecimalString(parts[0]);
      const b = Fraction.fromDecimalString(parts[1]);
      return a.div(b);
    }
    return Fraction.fromDecimalString(trimmed);
  }

  static tryFromInput(input: string): Fraction | null {
    try {
      return Fraction.fromInput(input);
    } catch {
      return null;
    }
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isOne(): boolean {
    return this.num === 1n && this.den === 1n;
  }

  isNegative(): boolean {
    return this.num < 0n;
  }

  neg(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  abs(): Fraction {
    return new Fraction(this.num < 0n ? -this.num : this.num, this.den);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other: Fraction): Fraction {
    if (other.num === 0n) {
      throw new Error('Division med noll.');
    }
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  pow(exp: number): Fraction {
    if (exp === 0) return new Fraction(1n, 1n);
    if (exp < 0) {
      return new Fraction(this.den, this.num).pow(-exp);
    }
    return new Fraction(this.num ** BigInt(exp), this.den ** BigInt(exp));
  }

  equals(other: Fraction): boolean {
    return this.num === other.num && this.den === other.den;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  toString(): string {
    if (this.den === 1n) return this.num.toString();
    return `${this.num.toString()}/${this.den.toString()}`;
  }

  toLatex(): string {
    if (this.den === 1n) return this.num.toString();
    if (this.num < 0n) {
      return `-\\frac{${(-this.num).toString()}}{${this.den.toString()}}`;
    }
    return `\\frac{${this.num.toString()}}{${this.den.toString()}}`;
  }
}

export const frac = (num: number | bigint, den: number | bigint = 1n): Fraction =>
  new Fraction(num, den);

export function numToLatex(x: number, decimals = 4): string {
  if (!Number.isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
  if (Math.abs(x) < 1e-10) return '0';
  const roundedInt = Math.round(x);
  if (Math.abs(x - roundedInt) < 1e-8) return roundedInt.toString();
  // Kolla enkla multiplar av pi
  const piRatio = x / Math.PI;
  for (const den of [1, 2, 3, 4, 6]) {
    const num = Math.round(piRatio * den);
    if (num !== 0 && Math.abs(piRatio - num / den) < 1e-6) {
      const sign = num < 0 ? '-' : '';
      const absNum = Math.abs(num);
      const piPart = absNum === 1 ? '\\pi' : `${absNum}\\pi`;
      return den === 1 ? `${sign}${piPart}` : `${sign}\\frac{${piPart}}{${den}}`;
    }
  }
  return Number(x.toFixed(decimals)).toString();
}
