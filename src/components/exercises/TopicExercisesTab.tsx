import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { generateExerciseForGuide, validateAnswer } from '../../math/index.ts';
import type {
  Difficulty,
  Exercise,
  StudyGuideId,
  ValidationFeedback,
} from '../../math/index.ts';
import { readStatsProgress, recordGuideAttempt } from '../../utils/progressStorage.ts';
import { ExerciseCard } from './ExerciseCard.tsx';

interface TopicExercisesTabProps {
  guideId: StudyGuideId;
}

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: 'grund', label: 'Grund' },
  { id: 'medel', label: 'Medel' },
  { id: 'utmaning', label: 'Utmaning' },
];

export function TopicExercisesTab({ guideId }: TopicExercisesTabProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medel');
  const [exercise, setExercise] = useState<Exercise>(() =>
    generateExerciseForGuide(guideId, 'medel'),
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);
  const [stats, setStats] = useState(() => readStatsProgress()[guideId] ?? { attempted: 0, correct: 0 });

  const loadNewExercise = (nextDiff: Difficulty = difficulty) => {
    setDifficulty(nextDiff);
    setExercise(generateExerciseForGuide(guideId, nextDiff));
    setAnswer('');
    setFeedback(null);
  };

  const handleSubmit = () => {
    const res = validateAnswer(exercise, answer);
    if (feedback === null) {
      const updatedMap = recordGuideAttempt(guideId, res.isCorrect);
      setStats(updatedMap[guideId] ?? { attempted: 0, correct: 0 });
    }
    setFeedback(res);
  };

  return (
    <div className="section-stack">
      <div className="panel">
        <div className="space-between">
          <div className="row-wrap">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Svårighetsgrad:</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`seg-btn${difficulty === d.id ? ' active' : ''}`}
                onClick={() => loadNewExercise(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="row-wrap">
            {stats.attempted > 0 && (
              <span className="tag-chip">
                Lösta rätt: {stats.correct} av {stats.attempted}
              </span>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => loadNewExercise(difficulty)}
            >
              <RefreshCw size={15} /> Ny övning
            </button>
          </div>
        </div>
      </div>

      <ExerciseCard
        key={exercise.id}
        exercise={exercise}
        answer={answer}
        onAnswerChange={setAnswer}
        feedback={feedback}
        onSubmitSingle={handleSubmit}
        submitLabel="Skicka svar"
      />
    </div>
  );
}
