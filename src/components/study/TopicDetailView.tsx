import React, { Suspense, lazy, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Dumbbell,
  Play,
  Printer,
  Wrench,
} from 'lucide-react';
import { STUDY_GUIDES, getStudyGuideById } from '../../data/studyGuides.ts';
import type { StudyGuideId } from '../../math/index.ts';
import { readGoalsProgress, toggleGoalCheck } from '../../utils/progressStorage.ts';
import { KatexBlock } from '../common/KatexBlock.tsx';
import { MathStepsDisplay } from '../common/MathStepsDisplay.tsx';
import { MathText } from '../common/MathText.tsx';
import { TopicExercisesTab } from '../exercises/TopicExercisesTab.tsx';

const AlgebraAndFunctionTool = lazy(() =>
  import('../visualizers/AlgebraAndFunctionTool.tsx').then((m) => ({
    default: m.AlgebraAndFunctionTool,
  })),
);
const ElementaryFunctionsTool = lazy(() =>
  import('../visualizers/ElementaryFunctionsTool.tsx').then((m) => ({
    default: m.ElementaryFunctionsTool,
  })),
);
const TrigArcusLimitInfTool = lazy(() =>
  import('../visualizers/TrigArcusLimitInfTool.tsx').then((m) => ({
    default: m.TrigArcusLimitInfTool,
  })),
);
const LimitsAndContinuityTool = lazy(() =>
  import('../visualizers/LimitsAndContinuityTool.tsx').then((m) => ({
    default: m.LimitsAndContinuityTool,
  })),
);
const DerivativeTool = lazy(() =>
  import('../visualizers/DerivativeTool.tsx').then((m) => ({
    default: m.DerivativeTool,
  })),
);
const CurveSketchAndOptTool = lazy(() =>
  import('../visualizers/CurveSketchAndOptTool.tsx').then((m) => ({
    default: m.CurveSketchAndOptTool,
  })),
);
const MaclaurinAndSeriesTool = lazy(() =>
  import('../visualizers/MaclaurinAndSeriesTool.tsx').then((m) => ({
    default: m.MaclaurinAndSeriesTool,
  })),
);

type DetailTab = 'theory' | 'tool' | 'exercises';

interface TopicDetailViewProps {
  guideId: StudyGuideId;
  onSelectGuide: (id: StudyGuideId) => void;
  onBackHome: () => void;
}

const renderToolForGuide = (id: StudyGuideId) => {
  switch (id) {
    case 'sg1':
      return <AlgebraAndFunctionTool />;
    case 'sg2':
      return <ElementaryFunctionsTool />;
    case 'sg3':
      return <TrigArcusLimitInfTool />;
    case 'sg4':
      return <LimitsAndContinuityTool />;
    case 'sg5':
      return <DerivativeTool />;
    case 'sg6':
      return <CurveSketchAndOptTool />;
    case 'sg7':
      return <MaclaurinAndSeriesTool />;
  }
};

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({
  guideId,
  onSelectGuide,
  onBackHome,
}) => {
  const guide = getStudyGuideById(guideId);
  const [activeTab, setActiveTab] = useState<DetailTab>('theory');
  const [checkedGoals, setCheckedGoals] = useState<number[]>(() => readGoalsProgress()[guideId] ?? []);
  const [openExampleIdx, setOpenExampleIdx] = useState<number | null>(0);

  const handleToggleGoal = (idx: number) => {
    const updated = toggleGoalCheck(guideId, idx);
    setCheckedGoals(updated[guideId] ?? []);
  };

  return (
    <div className="section-stack">
      {/* Topbar: tillbaka + snabbyte mellan SG 1–7 */}
      <div className="detail-topbar no-print">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBackHome}>
          <ArrowLeft size={16} />
          Översikt
        </button>

        <div className="guide-switcher" aria-label="Byt studieguide">
          {STUDY_GUIDES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`sg-mini-pill ${g.id === guideId ? 'active' : ''}`}
              onClick={() => onSelectGuide(g.id)}
              title={g.title}
            >
              {g.shortNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="detail-header">
        <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.6rem' }}>
          <div className="row-wrap" style={{ gap: '0.5rem' }}>
            <span className="sg-badge">{guide.number}</span>
            <span className="tag-chip">{guide.weekLabel}</span>
            <span className="exam-badge">{guide.examTag}</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm no-print"
            onClick={() => window.print()}
          >
            <Printer size={15} />
            Skriv ut studieguide
          </button>
        </div>

        <h1 className="detail-title">{guide.title}</h1>
        <p className="muted-text" style={{ margin: '0.2rem 0 0.7rem' }}>
          {guide.subtitle} — {guide.summary}
        </p>

        <div className="row-wrap" style={{ gap: '0.45rem' }}>
          {guide.chapters.map((ch) => (
            <span key={ch} className="tag-chip">
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Flikar */}
      <div className="tabs-bar no-print" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'theory'}
          className={`tab-btn ${activeTab === 'theory' ? 'active' : ''}`}
          onClick={() => setActiveTab('theory')}
        >
          <BookOpen size={17} />
          Teori &amp; begrepp
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tool'}
          className={`tab-btn ${activeTab === 'tool' ? 'active' : ''}`}
          onClick={() => setActiveTab('tool')}
        >
          <Wrench size={17} />
          Interaktivt verktyg
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'exercises'}
          className={`tab-btn ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          <Dumbbell size={17} />
          Övningsuppgifter
        </button>
      </div>

      {/* Innehåll per flik */}
      {activeTab === 'theory' && (
        <div className="section-stack">
          {/* Teoriavsnitt */}
          {guide.sections.map((sec, sIdx) => (
            <section key={sec.heading} className="panel">
              <div className="space-between" style={{ marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
                  {sIdx + 1}. {sec.heading}
                </h2>
              </div>
              <MathText text={sec.body} />

              {sec.formulas && sec.formulas.length > 0 && (
                <div className="formula-box">
                  {sec.formulas.map((f, fIdx) => (
                    <KatexBlock key={fIdx} latex={f} displayMode />
                  ))}
                </div>
              )}

              {sec.tip && (
                <div className="tip-box">
                  <strong>Tips: </strong>
                  <MathText text={sec.tip} />
                </div>
              )}

              {sec.warning && (
                <div className="warn-box">
                  <strong>Varning / examensregel: </strong>
                  <MathText text={sec.warning} />
                </div>
              )}
            </section>
          ))}

          {/* Lösta exempel */}
          <section className="panel section-stack">
            <div className="space-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Lösta typexempel (MA1499)</h2>
              <button
                type="button"
                className="btn btn-primary btn-sm no-print"
                onClick={() => setActiveTab('tool')}
              >
                <Play size={14} />
                Öppna interaktivt verktyg
              </button>
            </div>

            {guide.workedExamples.map((ex, idx) => {
              const isOpen = openExampleIdx === idx;
              return (
                <div key={ex.title} className="example-box section-stack" style={{ gap: '0.65rem' }}>
                  <div className="space-between" style={{ gap: '0.6rem' }}>
                    <strong>
                      Exempel {idx + 1}: {ex.title}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm no-print"
                      onClick={() => setOpenExampleIdx(isOpen ? null : idx)}
                    >
                      {isOpen ? 'Dölj lösning' : 'Visa lösning'}
                    </button>
                  </div>
                  <MathText text={ex.problem} />
                  {isOpen && (
                    <>
                      <MathStepsDisplay
                        steps={ex.steps.map((s, sIdx) => ({
                          title: `Steg ${sIdx + 1}`,
                          explanation: s.text,
                          latex: s.latex,
                        }))}
                        title="Lösningsgång"
                        defaultOpen
                      />
                      <div className="result-banner">
                        <strong>Svar: </strong>
                        <MathText text={ex.answer} />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </section>

          {/* Lärandemål checklista & rekommenderade bokuppgifter */}
          <div className="tool-grid">
            <section className="panel section-stack">
              <div className="space-between">
                <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Lärandemål ({guide.shortNumber})</h2>
                <span className="muted-text" style={{ fontSize: '0.85rem' }}>
                  {checkedGoals.length}/{guide.learningGoals.length} avbockade
                </span>
              </div>
              <div className="section-stack" style={{ gap: '0.45rem' }}>
                {guide.learningGoals.map((goal, idx) => {
                  const done = checkedGoals.includes(idx);
                  return (
                    <button
                      key={goal}
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        fontWeight: 500,
                        background: done ? 'var(--sage-bg)' : undefined,
                        borderColor: done ? 'var(--sage-border)' : undefined,
                      }}
                      onClick={() => handleToggleGoal(idx)}
                    >
                      {done ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--sage)', flexShrink: 0 }} />
                      ) : (
                        <Circle size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      )}
                      <span>
                        <MathText text={goal} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="panel section-stack">
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Rekommenderade uppgifter i kursboken</h2>
              <p className="muted-text" style={{ margin: 0, fontSize: '0.9rem' }}>
                Urval från BTH MA1499:s rekommenderade uppgiftslista i <em>Analys i en variabel</em> (Månsson &amp; Nordbeck):
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.65 }}>
                {guide.recommendedExercises.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="tip-box" style={{ marginTop: '0.25rem' }}>
                <strong>Nyckelord:</strong> {guide.keywords.join(', ')}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'tool' && (
        <Suspense
          fallback={
            <div className="panel">
              <p className="muted-text">Laddar interaktivt analysverktyg...</p>
            </div>
          }
        >
          {renderToolForGuide(guideId)}
        </Suspense>
      )}

      {activeTab === 'exercises' && <TopicExercisesTab guideId={guideId} />}
    </div>
  );
};
