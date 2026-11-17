import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { KatexBlock } from './KatexBlock.tsx';

interface Flashcard {
  id: string;
  category: 'Derivator' | 'Standardgränsvärden' | 'Maclaurin';
  prompt: string;
  promptLatex: string;
  answerLatex: string;
  note: string;
}

const DRILL_CARDS: Flashcard[] = [
  {
    id: 'd1',
    category: 'Derivator',
    prompt: 'Derivatan av arcsin(x):',
    promptLatex: '\\frac{d}{dx} \\arcsin(x) = \\; ?',
    answerLatex: '\\frac{1}{\\sqrt{1 - x^2}}, \\quad |x| < 1',
    note: 'Kom ihåg att arcsin har positiv derivata eftersom funktionen är strängt växande.',
  },
  {
    id: 'd2',
    category: 'Derivator',
    prompt: 'Derivatan av arccos(x):',
    promptLatex: '\\frac{d}{dx} \\arccos(x) = \\; ?',
    answerLatex: '-\\frac{1}{\\sqrt{1 - x^2}}, \\quad |x| < 1',
    note: 'arccos är strängt avtagande på [−1, 1], därav minustecknet.',
  },
  {
    id: 'd3',
    category: 'Derivator',
    prompt: 'Derivatan av arctan(x):',
    promptLatex: '\\frac{d}{dx} \\arctan(x) = \\; ?',
    answerLatex: '\\frac{1}{1 + x^2}, \\quad x \\in \\mathbb{R}',
    note: 'Definierad för alla reella x, inget rottecken.',
  },
  {
    id: 'd4',
    category: 'Derivator',
    prompt: 'Derivatan av aˣ för konstant a > 0:',
    promptLatex: '\\frac{d}{dx} a^x = \\; ?',
    answerLatex: 'a^x \\ln a',
    note: 'Härleds via aˣ = e^(x ln a) med inre derivatan ln a.',
  },
  {
    id: 'd5',
    category: 'Derivator',
    prompt: 'Derivatan av inversfunktion f⁻¹ i punkten y = f(x):',
    promptLatex: '(f^{-1})\'(y) = \\; ?',
    answerLatex: '\\frac{1}{f\'(x)} = \\frac{1}{f\'(f^{-1}(y))}',
    note: 'Följer direkt ur implicit derivering av f(f⁻¹(y)) = y.',
  },
  {
    id: 'l1',
    category: 'Standardgränsvärden',
    prompt: 'Standardgränsvärde för sinus i origo:',
    promptLatex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = \\; ?',
    answerLatex: '1',
    note: 'Gäller endast då argumentet går mot 0 i radianer!',
  },
  {
    id: 'l2',
    category: 'Standardgränsvärden',
    prompt: 'Standardgränsvärde för exponentialfunktion i origo:',
    promptLatex: '\\lim_{x \\to 0} \\frac{e^x - 1}{x} = \\; ?',
    answerLatex: '1',
    note: 'Representerar definitionen av derivatan för eˣ i x = 0.',
  },
  {
    id: 'l3',
    category: 'Standardgränsvärden',
    prompt: 'Standardgränsvärde för naturliga logaritmen i origo:',
    promptLatex: '\\lim_{x \\to 0} \\frac{\\ln(1 + x)}{x} = \\; ?',
    answerLatex: '1',
    note: 'Kan härledas via substitution x = eᵗ − 1.',
  },
  {
    id: 'l4',
    category: 'Standardgränsvärden',
    prompt: 'Standardgränsvärde för 1 − cos(x):',
    promptLatex: '\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2} = \\; ?',
    answerLatex: '\\frac{1}{2}',
    note: 'Härleds via konjugatförlängning med (1 + cos x) eller Maclaurinutveckling.',
  },
  {
    id: 'l5',
    category: 'Standardgränsvärden',
    prompt: 'Tillväxtordning: Logaritm mot potens då x → ∞ (a > 0):',
    promptLatex: '\\lim_{x \\to \\infty} \\frac{\\ln x}{x^a} = \\; ?',
    answerLatex: '0',
    note: 'Potensfunktioner växer alltid snabbare än logaritmer.',
  },
  {
    id: 'l6',
    category: 'Standardgränsvärden',
    prompt: 'Tillväxtordning: Potens mot exponentialfunktion då x → ∞ (a > 1):',
    promptLatex: '\\lim_{x \\to \\infty} \\frac{x^p}{a^x} = \\; ?',
    answerLatex: '0',
    note: 'Exponentialfunktioner växer snabbare än varje polynom/potensfunktion.',
  },
  {
    id: 'm1',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av eˣ (ordning 3):',
    promptLatex: 'e^x = \\; ?',
    answerLatex: '1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + O(x^4)',
    note: 'Alla termer är positiva med koefficienter 1/k!.',
  },
  {
    id: 'm2',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av sin(x) (ordning 5):',
    promptLatex: '\\sin x = \\; ?',
    answerLatex: 'x - \\frac{x^3}{6} + \\frac{x^5}{120} + O(x^7)',
    note: 'Udda funktion: endast udda potenser, alternerande tecken.',
  },
  {
    id: 'm3',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av cos(x) (ordning 4):',
    promptLatex: '\\cos x = \\; ?',
    answerLatex: '1 - \\frac{x^2}{2} + \\frac{x^4}{24} + O(x^6)',
    note: 'Jämn funktion: endast jämna potenser, alternerande tecken.',
  },
  {
    id: 'm4',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av ln(1 + x) (ordning 4):',
    promptLatex: '\\ln(1 + x) = \\; ?',
    answerLatex: 'x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + O(x^5)',
    note: 'Observera: INGA fakulteter i nämnaren för ln(1+x)!',
  },
  {
    id: 'm5',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av 1/(1 − x):',
    promptLatex: '\\frac{1}{1 - x} = \\; ?',
    answerLatex: '1 + x + x^2 + x^3 + \\dots + O(x^{n+1})',
    note: 'Detta är summan av en geometrisk serie med kvot x (|x| < 1).',
  },
  {
    id: 'm6',
    category: 'Maclaurin',
    prompt: 'Maclaurinutveckling av arctan(x) (ordning 5):',
    promptLatex: '\\arctan x = \\; ?',
    answerLatex: 'x - \\frac{x^3}{3} + \\frac{x^5}{5} + O(x^7)',
    note: 'Udda potenser utan fakultet, precis som integrerad 1/(1+x²).',
  },
];

type DrillCategory = 'Alla' | 'Derivator' | 'Standardgränsvärden' | 'Maclaurin';

export const FormulaDrill: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<DrillCategory>('Alla');
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [repeatIds, setRepeatIds] = useState<Set<string>>(new Set());

  const activeCards = DRILL_CARDS.filter(
    (c) => selectedCat === 'Alla' || c.category === selectedCat,
  );

  const card = activeCards[cardIdx] ?? activeCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCardIdx((i) => (i + 1) % activeCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCardIdx((i) => (i - 1 + activeCards.length) % activeCards.length);
  };

  const markKnown = () => {
    if (!card) return;
    setKnownIds((prev) => new Set(prev).add(card.id));
    setRepeatIds((prev) => {
      const next = new Set(prev);
      next.delete(card.id);
      return next;
    });
    handleNext();
  };

  const markRepeat = () => {
    if (!card) return;
    setRepeatIds((prev) => new Set(prev).add(card.id));
    handleNext();
  };

  const resetDrill = () => {
    setKnownIds(new Set());
    setRepeatIds(new Set());
    setCardIdx(0);
    setIsFlipped(false);
  };

  if (!card) {
    return <div className="panel">Inga kort i denna kategori.</div>;
  }

  return (
    <div className="section-stack" style={{ gap: '0.8rem' }}>
      {/* Kategorival & poängräknare */}
      <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <div className="row-wrap" style={{ gap: '0.35rem' }}>
          {(['Alla', 'Derivator', 'Standardgränsvärden', 'Maclaurin'] as DrillCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`seg-btn ${selectedCat === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCat(cat);
                setCardIdx(0);
                setIsFlipped(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="row-wrap" style={{ gap: '0.8rem', fontSize: '0.86rem' }}>
          <span style={{ color: 'var(--sage)', fontWeight: 600 }}>
            ✓ Kan: {knownIds.size}
          </span>
          <span style={{ color: 'var(--amber)', fontWeight: 600 }}>
            ↻ Behöver öva: {repeatIds.size}
          </span>
          <span className="muted-text">
            Kort {cardIdx + 1} av {activeCards.length}
          </span>
        </div>
      </div>

      {/* Flashcard-kortet */}
      <div
        className="panel"
        style={{
          minHeight: '230px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          padding: '1.75rem 1.5rem',
          backgroundColor: isFlipped ? 'var(--bg-surface)' : 'var(--bg-recessed)',
          border: isFlipped ? '2px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <div style={{ width: '100%' }}>
          <div className="space-between" style={{ marginBottom: '0.5rem', fontSize: '0.82rem' }}>
            <span className="sg-badge">{card.category}</span>
            <span className="muted-text">
              {isFlipped ? 'Svar & Tentatips' : 'Fråga (Klicka för att vända)'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', margin: '0.4rem 0 0.8rem' }}>{card.prompt}</h3>
          <div style={{ fontSize: '1.25rem', margin: '0.6rem 0' }}>
            <KatexBlock latex={card.promptLatex} displayMode />
          </div>
        </div>

        {/* Visat svar vid vändning */}
        {isFlipped ? (
          <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <div className="result-banner" style={{ margin: '0.5rem 0' }}>
              <KatexBlock latex={card.answerLatex} displayMode />
            </div>
            <p className="muted-text" style={{ fontSize: '0.86rem', margin: '0.4rem 0 0' }}>
              <strong>Tentatips:</strong> {card.note}
            </p>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem', minWidth: '160px' }}
            onClick={() => setIsFlipped(true)}
          >
            <Eye size={16} /> Vänd kort / Visa formel
          </button>
        )}

        <div style={{ width: '100%', height: '1px' }} />
      </div>

      {/* Kontroller efter vändning */}
      {isFlipped ? (
        <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={markRepeat}
            style={{ color: 'var(--amber)', borderColor: 'var(--amber-border)' }}
          >
            <XCircle size={15} /> Behöver repetera (visa igen)
          </button>
          <div className="row-wrap" style={{ gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handlePrev}
            >
              <ChevronLeft size={15} /> Föregående
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={markKnown}
              style={{ backgroundColor: 'var(--sage)', borderColor: 'var(--sage)' }}
            >
              <CheckCircle2 size={15} /> Jag kunde den! <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-between" style={{ alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handlePrev}
          >
            <ChevronLeft size={15} /> Föregående kort
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleNext}
          >
            Hoppa över <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Nollställningsknapp */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={resetDrill}
          style={{ opacity: 0.7 }}
        >
          <RotateCcw size={13} /> Börja om drillen
        </button>
      </div>
    </div>
  );
};
