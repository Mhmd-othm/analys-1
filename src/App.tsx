import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { STUDY_GUIDE_IDS, isValidGuideId } from './data/studyGuides.ts';
import type { StudyGuideId } from './math/index.ts';
import { HomeView } from './components/home/HomeView.tsx';
import { Navbar, type ActivePage, type ThemeMode } from './components/layout/Navbar.tsx';

const TopicDetailView = lazy(() =>
  import('./components/study/TopicDetailView.tsx').then((m) => ({
    default: m.TopicDetailView,
  })),
);

const QuestionGeneratorView = lazy(() =>
  import('./components/exercises/QuestionGeneratorView.tsx').then((m) => ({
    default: m.QuestionGeneratorView,
  })),
);

const SpotTheErrorView = lazy(() =>
  import('./components/exercises/SpotTheErrorView.tsx').then((m) => ({
    default: m.SpotTheErrorView,
  })),
);

const FormulaSheetModal = lazy(() =>
  import('./components/common/FormulaSheetModal.tsx').then((m) => ({
    default: m.FormulaSheetModal,
  })),
);

const THEME_STORAGE_KEY = 'ma1499-theme-v1';

interface RouteState {
  page: ActivePage;
  guideId: StudyGuideId;
}

function parseHashRoute(): RouteState {
  if (typeof window === 'undefined') {
    return { page: 'home', guideId: 'sg1' };
  }
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw) {
    return { page: 'home', guideId: 'sg1' };
  }
  if (raw === 'generator') {
    return { page: 'generator', guideId: 'sg1' };
  }
  if (raw === 'spot-error') {
    return { page: 'spot-error', guideId: 'sg1' };
  }
  if (isValidGuideId(raw)) {
    return { page: 'guide', guideId: raw };
  }
  return { page: 'home', guideId: 'sg1' };
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignorera om localStorage är blockerat
  }
  return 'light';
}

export const App: React.FC = () => {
  const [route, setRoute] = useState<RouteState>(parseHashRoute);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignorera om localStorage är blockerat
    }
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateHome = useCallback(() => {
    window.location.hash = '#/';
    setRoute((prev) => ({ ...prev, page: 'home' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateGuide = useCallback((id: StudyGuideId) => {
    if (!STUDY_GUIDE_IDS.includes(id)) return;
    window.location.hash = `#/${id}`;
    setRoute({ page: 'guide', guideId: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateGenerator = useCallback(() => {
    window.location.hash = '#/generator';
    setRoute((prev) => ({ ...prev, page: 'generator' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateSpotError = useCallback(() => {
    window.location.hash = '#/spot-error';
    setRoute((prev) => ({ ...prev, page: 'spot-error' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <div className="app-shell">
      <Navbar
        activePage={route.page}
        theme={theme}
        onNavigateHome={navigateHome}
        onNavigateGenerator={navigateGenerator}
        onNavigateSpotError={navigateSpotError}
        onOpenFormulas={() => setFormulaOpen(true)}
        onToggleTheme={toggleTheme}
      />

      <main className="container main-content">
        {route.page === 'home' && (
          <HomeView
            onSelectGuide={navigateGuide}
            onOpenGenerator={navigateGenerator}
            onOpenSpotError={navigateSpotError}
          />
        )}

        {route.page === 'guide' && (
          <Suspense
            fallback={
              <div className="panel">
                <p className="muted-text">Laddar studieguide...</p>
              </div>
            }
          >
            <TopicDetailView
              key={route.guideId}
              guideId={route.guideId}
              onSelectGuide={navigateGuide}
              onBackHome={navigateHome}
            />
          </Suspense>
        )}

        {route.page === 'generator' && (
          <Suspense
            fallback={
              <div className="panel">
                <p className="muted-text">Laddar tentamensgenerator...</p>
              </div>
            }
          >
            <QuestionGeneratorView />
          </Suspense>
        )}

        {route.page === 'spot-error' && (
          <Suspense
            fallback={
              <div className="panel">
                <p className="muted-text">Laddar Hitta felet-läget...</p>
              </div>
            }
          >
            <SpotTheErrorView />
          </Suspense>
        )}
      </main>

      {formulaOpen && (
        <Suspense fallback={null}>
          <FormulaSheetModal open={formulaOpen} onClose={() => setFormulaOpen(false)} />
        </Suspense>
      )}

      <footer className="footer-note">
        <div className="container">
          Envariabelanalys 1 (MA1499) — Interaktiv studieportal för Studieguide 1–7 · Ögonvänligt färgtema
        </div>
      </footer>
    </div>
  );
};

export default App;
