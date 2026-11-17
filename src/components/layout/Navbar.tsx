import { AlertTriangle, BookMarked, BookOpen, Moon, Sparkles, Sun } from 'lucide-react';

export type ActivePage = 'home' | 'guide' | 'generator' | 'spot-error';
export type ThemeMode = 'light' | 'dark';

interface NavbarProps {
  activePage: ActivePage;
  theme: ThemeMode;
  onNavigateHome: () => void;
  onNavigateGenerator: () => void;
  onNavigateSpotError: () => void;
  onOpenFormulas: () => void;
  onToggleTheme: () => void;
}

export function Navbar({
  activePage,
  theme,
  onNavigateHome,
  onNavigateGenerator,
  onNavigateSpotError,
  onOpenFormulas,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button
          type="button"
          className="brand-btn"
          onClick={onNavigateHome}
          aria-label="Gå till startsidan för Envariabelanalys 1 (MA1499)"
        >
          <span className="brand-mark" aria-hidden="true">
            A1
          </span>
          <span>
            <span className="brand-title" style={{ display: 'block' }}>
              Envariabelanalys 1 (MA1499) — Studieportal
            </span>
            <span className="brand-subtitle" style={{ display: 'block' }}>
              Interaktiva studieguider, funktionsgrafer & tentaövningar
            </span>
          </span>
        </button>

        <nav className="nav-actions" aria-label="Huvudmeny">
          <button
            type="button"
            className={`nav-pill${activePage === 'home' || activePage === 'guide' ? ' active' : ''}`}
            onClick={onNavigateHome}
          >
            <BookOpen size={16} />
            Alla studieguider
          </button>
          <button
            type="button"
            className={`nav-pill${activePage === 'generator' ? ' active' : ''}`}
            onClick={onNavigateGenerator}
          >
            <Sparkles size={16} />
            Frågegenerator
          </button>
          <button
            type="button"
            className={`nav-pill${activePage === 'spot-error' ? ' active' : ''}`}
            onClick={onNavigateSpotError}
          >
            <AlertTriangle size={16} />
            Hitta felet
          </button>
          <button type="button" className="nav-pill" onClick={onOpenFormulas}>
            <BookMarked size={16} />
            Formelsamling
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === 'light'
                ? 'Byt till mörkt läge (Kvällsstudier)'
                : 'Byt till ljust läge (Papper & Skiffer)'
            }
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === 'light' ? 'Kvällsstudier' : 'Papper & Skiffer'}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
