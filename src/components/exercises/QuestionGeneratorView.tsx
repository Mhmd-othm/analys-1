import { useEffect, useState } from 'react';
import { CheckSquare, Clock, Pause, Play, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { STUDY_GUIDES } from '../../data/studyGuides.ts';
import { generateExerciseSet, validateAnswer } from '../../math/index.ts';
import type {
  Difficulty,
  Exercise,
  StudyGuideId,
  ValidationFeedback,
} from '../../math/index.ts';
import { ExerciseCard } from './ExerciseCard.tsx';

type GeneratorDifficulty = 'blandad' | Difficulty;

const QUESTION_COUNTS = [3, 5, 8, 10];
const DIFF_OPTIONS: { id: GeneratorDifficulty; label: string }[] = [
  { id: 'blandad', label: 'Blandad' },
  { id: 'grund', label: 'Grund' },
  { id: 'medel', label: 'Medel' },
  { id: 'utmaning', label: 'Utmaning' },
];

const DUGGA_PRESETS: { label: string; guides: StudyGuideId[] }[] = [
  { label: 'Dugga 1 (SG 1–2)', guides: ['sg1', 'sg2'] },
  { label: 'Dugga 2 (SG 3–4)', guides: ['sg3', 'sg4'] },
  { label: 'Dugga 3 (SG 4–5)', guides: ['sg4', 'sg5'] },
  {
    label: 'Hela kursen / Tenta 4 (SG 1–7)',
    guides: ['sg1', 'sg2', 'sg3', 'sg4', 'sg5', 'sg6', 'sg7'],
  },
];

const DUGGA_SECONDS = 60 * 60;

function formatTimer(totalSec: number): string {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function QuestionGeneratorView() {
  const [selectedGuides, setSelectedGuides] = useState<StudyGuideId[]>(['sg1', 'sg2']);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<GeneratorDifficulty>('blandad');

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ValidationFeedback>>({});
  const [useTimer, setUseTimer] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DUGGA_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!useTimer || !timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [useTimer, timerRunning, secondsLeft]);

  const toggleGuide = (id: StudyGuideId) => {
    setSelectedGuides((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllGuides = () => {
    setSelectedGuides(STUDY_GUIDES.map((g) => g.id));
  };

  const clearGuides = () => {
    setSelectedGuides([]);
  };

  const handleGenerate = () => {
    const targetGuides =
      selectedGuides.length > 0 ? selectedGuides : STUDY_GUIDES.map((g) => g.id);
    if (selectedGuides.length === 0) {
      setSelectedGuides(targetGuides);
    }
    const generated = generateExerciseSet(targetGuides, questionCount, difficulty);
    setExercises(generated);
    setAnswers({});
    setFeedbackMap({});
    if (useTimer) {
      setSecondsLeft(DUGGA_SECONDS);
      setTimerRunning(true);
    }
  };

  const handleAnswerChange = (id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleCheckSingle = (ex: Exercise) => {
    const fb = validateAnswer(ex, answers[ex.id] ?? '');
    setFeedbackMap((prev) => ({ ...prev, [ex.id]: fb }));
  };

  const handleCheckAll = () => {
    const nextMap: Record<string, ValidationFeedback> = {};
    for (const ex of exercises) {
      nextMap[ex.id] = validateAnswer(ex, answers[ex.id] ?? '');
    }
    setFeedbackMap(nextMap);
  };

  const totalChecked = Object.keys(feedbackMap).length;
  const totalCorrect = Object.values(feedbackMap).filter((f) => f.isCorrect).length;
  const allChecked = exercises.length > 0 && totalChecked === exercises.length;

  const wrongGuideIds = Array.from(
    new Set(
      exercises
        .filter((ex) => feedbackMap[ex.id] && !feedbackMap[ex.id].isCorrect)
        .map((ex) => ex.guideId),
    ),
  );

  const handlePracticeWrong = () => {
    if (wrongGuideIds.length === 0) return;
    setSelectedGuides(wrongGuideIds);
    const generated = generateExerciseSet(wrongGuideIds, questionCount, difficulty);
    setExercises(generated);
    setAnswers({});
    setFeedbackMap({});
    if (useTimer) {
      setSecondsLeft(DUGGA_SECONDS);
      setTimerRunning(true);
    }
  };

  return (
    <div className="section-stack">
      <div className="hero-card" style={{ marginBottom: 0 }}>
        <div className="hero-eyebrow">
          <Sparkles size={15} /> Frågegenerator & Dugga-träning
        </div>
        <h1 className="hero-title">Skapa ditt eget övningsprov i MA1499</h1>
        <p className="hero-desc" style={{ marginBottom: 0 }}>
          Välj studieguider eller klicka på en dugga-genväg (t.ex. 8 frågor + 60-min timer precis som
          på Salstentamen 1–3!). Du får direkt rättning och fullständiga lösningssteg.
        </p>
      </div>

      <div className="panel no-print">
        <div className="space-between" style={{ marginBottom: '0.75rem' }}>
          <strong style={{ fontSize: '1rem' }}>
            1. Välj studieguider ({selectedGuides.length} av {STUDY_GUIDES.length} valda)
          </strong>
          <div className="row-wrap">
            {DUGGA_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="chip-btn"
                onClick={() => setSelectedGuides(preset.guides)}
              >
                {preset.label}
              </button>
            ))}
            <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllGuides}>
              Välj alla
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={clearGuides}>
              Rensa val
            </button>
          </div>
        </div>

        <div className="checkbox-grid" style={{ marginBottom: '1.25rem' }}>
          {STUDY_GUIDES.map((g) => {
            const checked = selectedGuides.includes(g.id);
            return (
              <label key={g.id} className={`guide-check-card${checked ? ' checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleGuide(g.id)}
                  style={{ accentColor: 'var(--accent)', marginTop: 3, width: 16, height: 16 }}
                />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {g.number} · {g.examTag}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>
                    {g.title}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div
          className="space-between"
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            gap: '1rem',
          }}
        >
          <div className="row-wrap" style={{ gap: '1.25rem' }}>
            <div className="row-wrap">
              <strong style={{ fontSize: '0.9rem' }}>2. Antal frågor:</strong>
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  className={`seg-btn${questionCount === cnt ? ' active' : ''}`}
                  onClick={() => setQuestionCount(cnt)}
                >
                  {cnt}
                </button>
              ))}
            </div>

            <div className="row-wrap">
              <strong style={{ fontSize: '0.9rem' }}>3. Nivå:</strong>
              {DIFF_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`seg-btn${difficulty === d.id ? ' active' : ''}`}
                  onClick={() => setDifficulty(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => {
                  setUseTimer(e.target.checked);
                  setSecondsLeft(DUGGA_SECONDS);
                  setTimerRunning(e.target.checked && exercises.length > 0);
                }}
                style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
              />
              <Clock size={15} />
              60-min Dugga-timer
            </label>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleGenerate}>
            <Play size={16} /> Generera frågor
          </button>
        </div>
      </div>

      {exercises.length > 0 && (
        <>
          <div className="panel space-between">
            <div>
              <strong style={{ fontSize: '1.02rem' }}>
                Genererat övningspass ({exercises.length} frågor)
              </strong>
              {totalChecked > 0 && (
                <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Resultat: <strong>{totalCorrect}</strong> av <strong>{exercises.length}</strong>{' '}
                  rätt ({Math.round((totalCorrect / exercises.length) * 100)} %)
                </div>
              )}
            </div>

            <div className="row-wrap">
              {useTimer && (
                <div className="row-wrap" style={{ gap: '0.4rem' }}>
                  <span
                    className="tag-chip"
                    style={{
                      fontWeight: 700,
                      color: secondsLeft === 0 ? 'var(--amber)' : 'var(--accent)',
                    }}
                  >
                    <Clock size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
                    {formatTimer(secondsLeft)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setTimerRunning((r) => !r)}
                    disabled={secondsLeft === 0}
                  >
                    {timerRunning ? <Pause size={14} /> : <Play size={14} />}
                    {timerRunning ? 'Pausa' : 'Starta'}
                  </button>
                </div>
              )}
              {wrongGuideIds.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePracticeWrong}
                  title="Generera nya frågor enbart från studieguiderna där du svarade fel"
                >
                  <RotateCcw size={15} /> Öva på felbesvarade ({wrongGuideIds.length})
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary no-print"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Skriv ut / PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary no-print"
                onClick={handleGenerate}
              >
                <RotateCcw size={15} /> Nya frågor
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCheckAll}>
                <CheckSquare size={16} />{' '}
                {allChecked ? 'Rätta alla igen' : 'Skicka in och rätta alla'}
              </button>
            </div>
          </div>

          <div className="section-stack">
            {exercises.map((ex, idx) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                questionNumber={idx + 1}
                answer={answers[ex.id] ?? ''}
                onAnswerChange={(val) => handleAnswerChange(ex.id, val)}
                feedback={feedbackMap[ex.id] ?? null}
                onSubmitSingle={() => handleCheckSingle(ex)}
                submitLabel="Rätta fråga"
              />
            ))}
          </div>

          <div className="panel space-between">
            <span className="muted-text">
              {allChecked
                ? `Sammanfattning: ${totalCorrect} av ${exercises.length} rätt. Granska lösningsstegen ovan vid behov.`
                : 'Klar med dina svar? Rätta hela provet samtidigt.'}
            </span>
            <button type="button" className="btn btn-primary" onClick={handleCheckAll}>
              <CheckSquare size={16} /> Skicka in och rätta alla
            </button>
          </div>
        </>
      )}
    </div>
  );
}
