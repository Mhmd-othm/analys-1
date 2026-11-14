import { useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Difficulty, Exercise, ValidationFeedback } from '../../math/index.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { MathText } from '../common/MathText.tsx';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  grund: 'Grund',
  medel: 'Medel',
  utmaning: 'Utmaning',
};

interface ExerciseCardProps {
  exercise: Exercise;
  questionNumber?: number;
  answer: string;
  onAnswerChange: (val: string) => void;
  feedback?: ValidationFeedback | null;
  onSubmitSingle?: () => void;
  submitLabel?: string;
}

export function ExerciseCard({
  exercise,
  questionNumber,
  answer,
  onAnswerChange,
  feedback = null,
  onSubmitSingle,
  submitLabel = 'Skicka svar',
}: ExerciseCardProps) {
  const [showHint, setShowHint] = useState(false);

  const computedFeedback = feedback ?? null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmitSingle) {
      e.preventDefault();
      onSubmitSingle();
    }
  };

  return (
    <div className="panel">
      <div className="space-between" style={{ marginBottom: '0.65rem' }}>
        <div className="row-wrap">
          {questionNumber !== undefined && (
            <span className="sg-badge">Fråga {questionNumber}</span>
          )}
          <span className="tag-chip">{exercise.guideTitle}</span>
        </div>
        <span className="tag-chip">Nivå: {DIFFICULTY_LABEL[exercise.difficulty]}</span>
      </div>

      <p style={{ margin: '0 0 0.65rem', fontSize: '1.02rem', fontWeight: 500 }}>
        <MathText text={exercise.prompt} />
      </p>

      {exercise.promptLatex && (
        <div className="formula-box" style={{ marginBottom: '0.85rem' }}>
          <KatexBlock latex={exercise.promptLatex} displayMode />
        </div>
      )}

      {exercise.kind === 'choice' && exercise.choices ? (
        <div className="choice-group" style={{ marginBottom: '0.85rem' }}>
          {exercise.choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`choice-pill${answer === choice ? ' selected' : ''}`}
              onClick={() => onAnswerChange(choice)}
            >
              {exercise.choicesAreLatex ? <KatexBlock latex={choice} displayMode={false} /> : choice}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: '0.85rem' }}>
          <input
            type="text"
            className="text-input"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={exercise.placeholder}
            aria-label="Ditt svar"
          />
        </div>
      )}

      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowHint((h) => !h)}
        >
          <HelpCircle size={15} />
          {showHint ? 'Dölj ledtråd' : 'Visa ledtråd'}
        </button>

        {onSubmitSingle && (
          <button type="button" className="btn btn-primary" onClick={onSubmitSingle}>
            {submitLabel}
          </button>
        )}
      </div>

      {showHint && (
        <div className="tip-box">
          <strong>Ledtråd:</strong> <MathText text={exercise.hint} />
        </div>
      )}

      {computedFeedback && (
        <div
          className={computedFeedback.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}
          style={{ marginTop: '1rem' }}
        >
          <div className="row-wrap" style={{ marginBottom: '0.45rem' }}>
            {computedFeedback.isCorrect ? (
              <CheckCircle2 size={19} color="var(--sage)" />
            ) : (
              <AlertCircle size={19} color="var(--amber)" />
            )}
            <span
              className={
                computedFeedback.isCorrect
                  ? 'feedback-badge-correct'
                  : 'feedback-badge-incorrect'
              }
            >
              {computedFeedback.feedbackMessage}
            </span>
          </div>

          <div style={{ fontSize: '0.92rem', marginBottom: '0.65rem' }}>
            <div>
              <strong>Ditt svar:</strong> {computedFeedback.userParsedDisplay}
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              <strong>Rätt svar:</strong>{' '}
              <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <KatexBlock latex={computedFeedback.expectedLatex} displayMode={false} />
              </span>
            </div>
          </div>

          <MathStepsDisplay
            steps={computedFeedback.steps}
            title="Fullständiga lösningssteg"
            collapsible
            defaultOpen={!computedFeedback.isCorrect}
          />
        </div>
      )}
    </div>
  );
}
