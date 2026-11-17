import { useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpen, RotateCcw, Search, X } from 'lucide-react';
import { STUDY_GUIDES } from '../../data/studyGuides.ts';
import type { StudyGuide } from '../../data/studyGuides.ts';
import type { StudyGuideId } from '../../math/index.ts';
import {
  clearAllProgress,
  readGoalsProgress,
  readStatsProgress,
} from '../../utils/progressStorage.ts';

interface HomeViewProps {
  onSelectGuide: (id: StudyGuideId) => void;
  onOpenGenerator: () => void;
  onOpenSpotError?: () => void;
}

const SUGGESTION_CHIPS = [
  'Polynomdivision',
  'Enhetscirkeln',
  'Standardgränsvärden',
  'Derivata',
  'Asymptoter',
  'Maclaurin',
];

function matchesQuery(guide: StudyGuide, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const terms = q.split(/\s+/).filter(Boolean);
  const haystack = [
    guide.number,
    guide.shortNumber,
    guide.weekLabel,
    guide.examTag,
    guide.title,
    guide.subtitle,
    guide.summary,
    ...guide.chapters,
    ...guide.conceptTags,
    ...guide.keywords,
    ...guide.learningGoals,
    ...guide.sections.flatMap((s) => [s.heading, s.body]),
  ]
    .join(' ')
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

export function HomeView({
  onSelectGuide,
  onOpenGenerator,
  onOpenSpotError,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [goalsMap, setGoalsMap] = useState(() => readGoalsProgress());
  const [statsMap, setStatsMap] = useState(() => readStatsProgress());

  const hasAnyProgress =
    Object.values(goalsMap).some((arr) => (arr?.length ?? 0) > 0) ||
    Object.values(statsMap).some((st) => (st?.attempted ?? 0) > 0);

  const handleResetProgress = () => {
    clearAllProgress();
    setGoalsMap({});
    setStatsMap({});
  };

  const filteredGuides = STUDY_GUIDES.filter((g) => matchesQuery(g, searchQuery));
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div>
      <section className="hero-card">
        <div className="hero-eyebrow">
          <BookOpen size={14} /> MA1499 Envariabelanalys 1 · 7 Studieguider (HT26)
        </div>
        <h1 className="hero-title">Lär dig envariabelanalys steg för steg</h1>
        <p className="hero-desc">
          Anpassad efter kursplanen i MA1499 på BTH: utforska alla sju kursveckor med teori,
          rekommenderade bokuppgifter, interaktiva funktionsgrafer och övningsuppgifter för Dugga
          1–3 samt Salstentamen 4.
        </p>

        <div className="search-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="search"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök ämne, kapitel eller dugga (t.ex. maclaurin, asymptot, arcsin, dugga 1)..."
              aria-label="Sök bland studieguider och matematiska begrepp"
            />
            {isSearching && (
              <button
                type="button"
                className="search-clear-icon"
                onClick={() => setSearchQuery('')}
                aria-label="Rensa sökning"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="row-wrap" style={{ gap: '0.45rem' }}>
            <button type="button" className="btn btn-primary" onClick={onOpenGenerator}>
              Öppna Frågegenerator
            </button>
            {onOpenSpotError && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onOpenSpotError}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <AlertTriangle size={15} color="var(--amber)" /> Hitta felet i tentan
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="search-meta-bar">
        <span>
          Visar <strong>{filteredGuides.length}</strong> av{' '}
          <strong>{STUDY_GUIDES.length}</strong> studieguider
        </span>
        <div className="row-wrap">
          {hasAnyProgress && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetProgress}
            >
              <RotateCcw size={14} /> Nollställ framsteg
            </button>
          )}
          {isSearching && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Rensa sökning
            </button>
          )}
        </div>
      </div>

      {filteredGuides.length > 0 ? (
        <div className="guides-grid">
          {filteredGuides.map((guide) => (
            <article
              key={guide.id}
              className="guide-card"
              onClick={() => onSelectGuide(guide.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectGuide(guide.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Öppna ${guide.number}: ${guide.title}`}
            >
              <div>
                <div className="space-between" style={{ gap: '0.4rem' }}>
                  <span className="sg-badge">{guide.number}</span>
                  <span className="exam-badge">{guide.examTag}</span>
                </div>
                <h2 className="guide-card-title">{guide.title}</h2>
                <p className="guide-card-subtitle">
                  {guide.weekLabel} · {guide.chapters.join(', ')}
                </p>
                <p className="guide-card-summary">{guide.summary}</p>
              </div>

              <div>
                <div className="tag-list" style={{ marginBottom: '0.85rem' }}>
                  {guide.conceptTags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
                {((goalsMap[guide.id]?.length ?? 0) > 0 ||
                  (statsMap[guide.id]?.attempted ?? 0) > 0) && (
                  <div
                    className="row-wrap"
                    style={{ marginBottom: '0.65rem', fontSize: '0.78rem', color: 'var(--sage)' }}
                  >
                    {(goalsMap[guide.id]?.length ?? 0) > 0 && (
                      <span>
                        Mål: {goalsMap[guide.id]!.length}/{guide.learningGoals.length}
                      </span>
                    )}
                    {(statsMap[guide.id]?.attempted ?? 0) > 0 && (
                      <span>
                        · Övningar: {statsMap[guide.id]!.correct}/{statsMap[guide.id]!.attempted}{' '}
                        rätt
                      </span>
                    )}
                  </div>
                )}
                <div className="guide-card-footer">
                  <span>Öppna studieguide</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.15rem' }}>
            Inga studieguider matchade ”{searchQuery}”
          </h2>
          <p className="muted-text" style={{ margin: '0 0 1rem' }}>
            Prova ett annat begrepp, till exempel något av förslagen nedan, eller visa alla
            studieguider.
          </p>
          <div className="row-wrap" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="chip-btn"
                onClick={() => setSearchQuery(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setSearchQuery('')}
          >
            Visa alla studieguider
          </button>
        </div>
      )}
    </div>
  );
}
