/**
 * Säker rekursiv-descent-parser och evaluator för matematiska uttryck i en variabel (x).
 * Använder aldrig eval() eller new Function().
 */

type Token =
  | { type: 'num'; value: number }
  | { type: 'ident'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  arcsin: Math.asin,
  acos: Math.acos,
  arccos: Math.acos,
  atan: Math.atan,
  arctan: Math.atan,
  artan: Math.atan,
  ln: (v) => Math.log(v),
  log: (v) => Math.log10(v),
  exp: Math.exp,
  sqrt: (v) => (v < 0 ? Number.NaN : Math.sqrt(v)),
  abs: Math.abs,
};

function tokenize(raw: string): Token[] {
  // Byt svenskt decimalkomma till punkt
  const input = raw
    .replace(/−/g, '-')
    .replace(/·|×/g, '*')
    .replace(/(\d),(\d)/g, '$1.$2')
    .trim();

  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/\d/.test(ch) || (ch === '.' && i + 1 < input.length && /\d/.test(input[i + 1]))) {
      let start = i;
      while (i < input.length && /[\d.]/.test(input[i])) i++;
      // Stöd för vetenskaplig notation t.ex. 1e-4
      if (i < input.length && (input[i] === 'e' || input[i] === 'E')) {
        const next = input[i + 1];
        if (next && (/\d/.test(next) || ((next === '+' || next === '-') && /\d/.test(input[i + 2] ?? '')))) {
          i++;
          if (input[i] === '+' || input[i] === '-') i++;
          while (i < input.length && /\d/.test(input[i])) i++;
        }
      }
      const numVal = Number(input.slice(start, i));
      if (!Number.isFinite(numVal)) {
        throw new Error(`Ogiltigt tal vid position ${start}`);
      }
      tokens.push({ type: 'num', value: numVal });
      continue;
    }
    if (/[a-zA-Zπ]/.test(ch)) {
      const start = i;
      while (i < input.length && /[a-zA-Zπ0-9_]/.test(input[i])) i++;
      tokens.push({ type: 'ident', value: input.slice(start, i).toLowerCase() });
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    if (ch === '(' || ch === '[') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }
    throw new Error(`Okänt tecken "${ch}"`);
  }

  // Infoga implicit multiplikation: 2x, 2(x+1), x(x+1), (x+1)(x-1), 3pi, 2sin(x)
  const out: Token[] = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const curr = tokens[idx];
    const prev = out[out.length - 1];
    if (prev) {
      const prevEndsValue =
        prev.type === 'num' ||
        prev.type === 'rparen' ||
        (prev.type === 'ident' && !(prev.value in FUNCTIONS));
      const currStartsValue =
        curr.type === 'num' || curr.type === 'lparen' || curr.type === 'ident';
      if (prevEndsValue && currStartsValue) {
        out.push({ type: 'op', value: '*' });
      }
    }
    out.push(curr);
  }
  return out;
}

type AstNode =
  | { kind: 'num'; value: number }
  | { kind: 'var' }
  | { kind: 'neg'; arg: AstNode }
  | { kind: 'bin'; op: '+' | '-' | '*' | '/' | '^'; left: AstNode; right: AstNode }
  | { kind: 'call'; fn: (v: number) => number; arg: AstNode };

function parseAst(tokens: Token[]): AstNode {
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const consume = (): Token => tokens[pos++];

  function parseExpr(): AstNode {
    let left = parseTerm();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseTerm();
        left = { kind: 'bin', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): AstNode {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (t?.type === 'op' && (t.value === '*' || t.value === '/')) {
        consume();
        const right = parseUnary();
        left = { kind: 'bin', op: t.value, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): AstNode {
    const t = peek();
    if (t?.type === 'op' && t.value === '-') {
      consume();
      return { kind: 'neg', arg: parseUnary() };
    }
    if (t?.type === 'op' && t.value === '+') {
      consume();
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower(): AstNode {
    const base = parsePrimary();
    const t = peek();
    if (t?.type === 'op' && t.value === '^') {
      consume();
      const exponent = parseUnary();
      return { kind: 'bin', op: '^', left: base, right: exponent };
    }
    return base;
  }

  function parsePrimary(): AstNode {
    const t = peek();
    if (!t) {
      throw new Error('Oväntat slut på uttrycket');
    }
    if (t.type === 'num') {
      consume();
      return { kind: 'num', value: t.value };
    }
    if (t.type === 'lparen') {
      consume();
      const inner = parseExpr();
      const close = peek();
      if (close?.type !== 'rparen') {
        throw new Error('Saknar avslutande parentes ")"');
      }
      consume();
      return inner;
    }
    if (t.type === 'ident') {
      consume();
      if (t.value === 'x') {
        return { kind: 'var' };
      }
      if (t.value in CONSTANTS) {
        return { kind: 'num', value: CONSTANTS[t.value] };
      }
      if (t.value in FUNCTIONS) {
        const next = peek();
        if (next?.type === 'lparen') {
          consume();
          const arg = parseExpr();
          const close = peek();
          if (close?.type !== 'rparen') {
            throw new Error(`Saknar ")" efter ${t.value}(...)`);
          }
          consume();
          return { kind: 'call', fn: FUNCTIONS[t.value], arg };
        }
        // Stöd t.ex. sin x eller ln x utan parentes
        const arg = parsePrimary();
        return { kind: 'call', fn: FUNCTIONS[t.value], arg };
      }
      throw new Error(`Okänd identifierare "${t.value}"`);
    }
    throw new Error('Ogiltig syntax i uttrycket');
  }

  const root = parseExpr();
  if (pos < tokens.length) {
    throw new Error('Oväntade tecken efter uttrycket');
  }
  return root;
}

function evalNode(node: AstNode, x: number): number {
  switch (node.kind) {
    case 'num':
      return node.value;
    case 'var':
      return x;
    case 'neg':
      return -evalNode(node.arg, x);
    case 'call':
      return node.fn(evalNode(node.arg, x));
    case 'bin': {
      const a = evalNode(node.left, x);
      const b = evalNode(node.right, x);
      switch (node.op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          return b === 0 ? Number.NaN : a / b;
        case '^':
          return Math.pow(a, b);
      }
    }
  }
}

function containsVar(node: AstNode): boolean {
  switch (node.kind) {
    case 'num':
      return false;
    case 'var':
      return true;
    case 'neg':
    case 'call':
      return containsVar(node.arg);
    case 'bin':
      return containsVar(node.left) || containsVar(node.right);
  }
}

export function compileExpr(expr: string): (x: number) => number {
  const tokens = tokenize(expr);
  if (tokens.length === 0) {
    throw new Error('Tomt uttryck');
  }
  const ast = parseAst(tokens);
  return (x: number) => evalNode(ast, x);
}

export function tryCompileExpr(expr: string): ((x: number) => number) | null {
  try {
    return compileExpr(expr);
  } catch {
    return null;
  }
}

export function evaluateConstantExpr(expr: string): number | null {
  try {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return null;
    const ast = parseAst(tokens);
    if (containsVar(ast)) return null;
    const val = evalNode(ast, 0);
    return Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

export function areExprsEquivalent(
  userExpr: string,
  expectedExpr: string,
  samplePoints: number[],
  tolerance = 1e-4,
): boolean {
  if (samplePoints.length === 0) {
    const uVal = evaluateConstantExpr(userExpr);
    const eVal = evaluateConstantExpr(expectedExpr);
    return uVal !== null && eVal !== null && Math.abs(uVal - eVal) <= tolerance;
  }

  const uFn = tryCompileExpr(userExpr);
  const eFn = tryCompileExpr(expectedExpr);
  if (!uFn || !eFn) return false;

  let matchedCount = 0;
  for (const x of samplePoints) {
    const uVal = uFn(x);
    const eVal = eFn(x);
    if (!Number.isFinite(uVal) || !Number.isFinite(eVal)) {
      return false;
    }
    if (Math.abs(uVal - eVal) > tolerance * Math.max(1, Math.abs(eVal))) {
      return false;
    }
    matchedCount++;
  }
  return matchedCount > 0;
}
