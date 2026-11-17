import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  SPOT_THE_ERROR_PROBLEMS,
  type SpotTheErrorProblem,
} from '../../data/spotTheErrorData.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathText } from '../common/MathText.tsx';

const STORAGE_KEY = 'spot-the-error-solved-v1';

type FilterTag = 'alla' | 'Dugga 1' | 'Dugga 2' | 'Dugga 3' | 'Tenta 4';

export const SpotTheErrorView: React.FC = () => {
  const [filter, setFilter] = useState<FilterTag>('alla');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Användarinteraktion för nuvarande uppgift
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(null);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);

  // Sparade lösta uppgifter
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const filteredProblems = SPOT_THE_ERROR_PROBLEMS.filter(
    (p) => filter === 'alla' || p.examTag === filter,
  );

  const problem: SpotTheErrorProblem | undefined = filteredProblems[currentIndex];

  const changeIndex = (idx: number) => {
    setCurrentIndex(idx);
    setSelectedStepIdx(null);
    setSelectedOptionIdx(null);
    setShowFullSolution(false);
  };

  const changeFilter = (newFilter: FilterTag) => {
    setFilter(newFilter);
    setCurrentIndex(0);
    setSelectedStepIdx(null);
    setSelectedOptionIdx(null);
    setShowFullSolution(false);
  };

  const markSolved = (id: string) => {
    setSolvedMap((prev) => {
      const updated = { ...prev, [id]: true };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignorera
      }
      return updated;
    });
  };

  const resetAllProgress = () => {
    setSolvedMap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorera
    }
  };

  const solvedCount = SPOT_THE_ERROR_PROBLEMS.filter((p) => solvedMap[p.id]).length;

  if (!problem) {
    return <div className="panel">Inga uppgifter matchar filtret.</div>;
  }

  const isStepCorrect = selectedStepIdx === problem.correctStepIndex;
  const errorStep = problem.steps[problem.correctStepIndex];
  const isReasonCorrect =
    isStepCorrect &&
    errorStep.correctOptionIndex !== undefined &&
    selectedOptionIdx === errorStep.correctOptionIndex;

  const handleStepClick = (idx: number) => {
    setSelectedStepIdx(idx);
    setSelectedOptionIdx(null);
    if (idx === problem.correctStepIndex) {
      if (!errorStep.errorOptions || errorStep.errorOptions.length === 0) {
        markSolved(problem.id);
      }
    }
  };

  const handleOptionClick = (optIdx: number) => {
    setSelectedOptionIdx(optIdx);
    if (optIdx === errorStep.correctOptionIndex) {
      markSolved(problem.id);
    }
  };

  return (
    <div className="section-stack" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Hero header */}
      <div className="hero-card" style={{ padding: '1.5rem' }}>
        <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <div className="hero-eyebrow">
              <AlertTriangle size={15} /> Tentatränaren: Hitta felet i lösningen
            </div>
            <h2 className="hero-title" style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>
              Avslöja de klassiska tentafällorna
            </h2>
            <p className="hero-desc" style={{ marginBottom: 0 }}>
              Varje tentalösning nedan innehåller <em>ett kritiskt tankefel</em> som ofta leder till underkänt på Dugga eller Tenta 4. Hitta vilket steg som brister och förklara varför!
            </p>
          </div>

          <div
            className="panel"
            style={{
              padding: '0.75rem 1.1rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              alignSelf: 'center',
            }}
          >
            <div className="muted-text" style={{ fontSize: '0.78rem', textTransform: 'uppercase' }}>
              Framsteg
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--sage)' }}>
              {solvedCount} / {SPOT_THE_ERROR_PROBLEMS.length}
            </div>
            <div className="muted-text" style={{ fontSize: '0.78rem' }}>
              klarade fällor
            </div>
          </div>
        </div>
      </div>

      {/* Filter och framstegs-piller */}
      <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <div className="row-wrap" style={{ gap: '0.35rem' }}>
          {(['alla', 'Dugga 1', 'Dugga 2', 'Dugga 3', 'Tenta 4'] as FilterTag[]).map((tag) => (
            <button
              key={tag}
              type="button"
              className={`seg-btn ${filter === tag ? 'active' : ''}`}
              onClick={() => changeFilter(tag)}
            >
              {tag === 'alla' ? 'Alla (10)' : tag}
            </button>
          ))}
        </div>

        <div className="row-wrap" style={{ gap: '0.3rem', alignItems: 'center' }}>
          {filteredProblems.map((p, idx) => {
            const isDone = solvedMap[p.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => changeIndex(idx)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isDone ? 'var(--sage-bg)' : 'var(--bg-surface)',
                  color: isDone ? 'var(--sage)' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label={`Gå till fråga ${idx + 1}`}
              >
                {isDone ? '✓' : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Själva uppgiftskortet */}
      <div className="panel section-stack">
        <div className="space-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="row-wrap" style={{ gap: '0.4rem', marginBottom: '0.3rem' }}>
              <span className="exam-tag" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {problem.examTag}
              </span>
              <span className="muted-text" style={{ fontSize: '0.82rem' }}>
                Uppgift {currentIndex + 1} av {filteredProblems.length}
              </span>
              {solvedMap[problem.id] && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    color: 'var(--sage)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={14} /> Klarad!
                </span>
              )}
            </div>
            <h3 style={{ margin: 0 }}>{problem.title}</h3>
          </div>

          <div className="row-wrap" style={{ gap: '0.3rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentIndex === 0}
              onClick={() => changeIndex(currentIndex - 1)}
            >
              <ChevronLeft size={16} /> Föregående
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentIndex >= filteredProblems.length - 1}
              onClick={() => changeIndex(currentIndex + 1)}
            >
              Nästa <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Uppgiftsformulering */}
        <div className="result-banner" style={{ margin: '0.3rem 0' }}>
          <div style={{ fontSize: '0.92rem', marginBottom: '0.25rem' }}>{problem.statement}</div>
          {problem.statementLatex && (
            <KatexBlock latex={problem.statementLatex} displayMode />
          )}
        </div>

        <div className="muted-text" style={{ fontSize: '0.86rem' }}>
          Klicka på det beräkningssteg nedan som innehåller <strong>det första matematiska felet</strong>:
        </div>

        {/* Steg i tentalösningen */}
        <div className="section-stack" style={{ gap: '0.6rem' }}>
          {problem.steps.map((st, sIdx) => {
            const isSelected = selectedStepIdx === sIdx;
            let borderStyle = '1px solid var(--border)';
            let bgStyle = 'var(--bg-surface)';

            if (isSelected) {
              if (sIdx === problem.correctStepIndex) {
                borderStyle = '2px solid var(--sage)';
                bgStyle = 'var(--sage-bg)';
              } else {
                borderStyle = '2px solid #e11d48';
                bgStyle = '#ffe4e6';
              }
            }

            return (
              <div
                key={sIdx}
                onClick={() => handleStepClick(sIdx)}
                style={{
                  border: borderStyle,
                  backgroundColor: bgStyle,
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="space-between" style={{ marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.88rem' }}>
                    Steg {st.stepNumber}: {st.label}
                  </strong>
                  {isSelected && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {sIdx === problem.correctStepIndex ? (
                        <span style={{ color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={15} /> Här är felet!
                        </span>
                      ) : (
                        <span style={{ color: '#e11d48', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <XCircle size={15} /> Matematiskt korrekt steg
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {st.text && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {st.text}
                  </p>
                )}

                {st.latex && <KatexBlock latex={st.latex} displayMode />}
              </div>
            );
          })}
        </div>

        {/* Om användaren klickade fel steg */}
        {selectedStepIdx !== null && !isStepCorrect && (
          <div className="warn-box" style={{ borderLeft: '4px solid #e11d48' }}>
            <strong>Det steget stämmer matematiskt.</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem' }}>
              Det här steget följer matematiska lagar korrekt. Undersök ett av de andra stegen för att hitta var resonemanget bryter samman!
            </p>
          </div>
        )}

        {/* Om användaren hittade rätt felaktigt steg, välj orsak */}
        {isStepCorrect && errorStep.errorOptions && errorStep.errorOptions.length > 0 && (
          <div className="panel section-stack" style={{ backgroundColor: 'var(--bg-recessed)' }}>
            <h4 style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <HelpCircle size={16} /> Varför är Steg {errorStep.stepNumber} felaktigt?
            </h4>
            <p className="muted-text" style={{ fontSize: '0.86rem', margin: 0 }}>
              Välj den matematiskt korrekta motiveringen:
            </p>

            <div className="section-stack" style={{ gap: '0.45rem' }}>
              {errorStep.errorOptions.map((opt, oIdx) => {
                const isOptSelected = selectedOptionIdx === oIdx;
                const isCorrectOpt = oIdx === errorStep.correctOptionIndex;

                let optBg = 'var(--bg-surface)';
                let optBorder = '1px solid var(--border)';

                if (isOptSelected) {
                  if (isCorrectOpt) {
                    optBg = 'var(--sage-bg)';
                    optBorder = '2px solid var(--sage)';
                  } else {
                    optBg = '#ffe4e6';
                    optBorder = '2px solid #e11d48';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleOptionClick(oIdx)}
                    style={{
                      border: optBorder,
                      backgroundColor: optBg,
                      borderRadius: '6px',
                      padding: '0.65rem 0.9rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + oIdx)}.</span>
                    <span style={{ flex: 1 }}>{opt}</span>
                    {isOptSelected && (
                      <span>
                        {isCorrectOpt ? (
                          <CheckCircle2 size={16} color="var(--sage)" />
                        ) : (
                          <XCircle size={16} color="#e11d48" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fullständig lösning och tentatips när uppgiften är avklarad */}
        {(isReasonCorrect || showFullSolution) && (
          <div className="panel section-stack" style={{ borderLeft: '4px solid var(--sage)' }}>
            <div className="space-between">
              <strong style={{ color: 'var(--sage)', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={18} /> Fullständig förklaring & tentamensråd
              </strong>
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              <MathText text={problem.fullExplanation} />
            </div>

            <div className="result-banner">
              <div className="muted-text" style={{ fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                Korrekt svar / slutsats:
              </div>
              <KatexBlock latex={problem.correctSolutionLatex} displayMode />
            </div>

            <div className="warn-box" style={{ margin: 0 }}>
              <strong>Tentatips:</strong> {problem.examAdvice}
            </div>
          </div>
        )}

        {/* Knapp för att visa facit direkt om studenten kör fast */}
        {!isReasonCorrect && !showFullSolution && (
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowFullSolution(true)}
            >
              Kör du fast? Visa fullständigt facit
            </button>
          </div>
        )}
      </div>

      {/* Återställningsrad */}
      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={resetAllProgress}
          style={{ opacity: 0.75 }}
        >
          <RotateCcw size={14} /> Nollställ alla framsteg i Hitta felet
        </button>
      </div>
    </div>
  );
};
