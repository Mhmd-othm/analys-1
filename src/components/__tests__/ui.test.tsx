import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { STUDY_GUIDE_IDS, STUDY_GUIDES } from '../../data/studyGuides.ts';
import { generateExerciseForGuide } from '../../math/index.ts';
import { MathText } from '../common/MathText.tsx';
import { FormulaSheetModal } from '../common/FormulaSheetModal.tsx';
import { ExerciseCard } from '../exercises/ExerciseCard.tsx';
import { QuestionGeneratorView } from '../exercises/QuestionGeneratorView.tsx';
import { HomeView } from '../home/HomeView.tsx';
import { Navbar } from '../layout/Navbar.tsx';
import { TopicDetailView } from '../study/TopicDetailView.tsx';
import { AlgebraAndFunctionTool } from '../visualizers/AlgebraAndFunctionTool.tsx';
import { CurveSketchAndOptTool } from '../visualizers/CurveSketchAndOptTool.tsx';
import { DerivativeTool } from '../visualizers/DerivativeTool.tsx';
import { ElementaryFunctionsTool } from '../visualizers/ElementaryFunctionsTool.tsx';
import { FunctionPlot2D } from '../visualizers/FunctionPlot2D.tsx';
import { LimitsAndContinuityTool } from '../visualizers/LimitsAndContinuityTool.tsx';
import { MaclaurinAndSeriesTool } from '../visualizers/MaclaurinAndSeriesTool.tsx';
import { TrigArcusLimitInfTool } from '../visualizers/TrigArcusLimitInfTool.tsx';

describe('UI komponenter (SSR röktest)', () => {
  it('renderar Navbar och HomeView med alla 7 studieguider', () => {
    const navHtml = renderToStaticMarkup(
      <Navbar
        activePage="home"
        theme="light"
        onNavigateHome={() => {}}
        onNavigateGenerator={() => {}}
        onOpenFormulas={() => {}}
        onToggleTheme={() => {}}
      />,
    );
    expect(navHtml).toContain('Envariabelanalys 1 (MA1499)');
    expect(navHtml).toContain('Formelsamling');

    const homeHtml = renderToStaticMarkup(
      <HomeView onSelectGuide={() => {}} onOpenGenerator={() => {}} />,
    );
    expect(homeHtml).toContain('Envariabelanalys 1');
    for (const guide of STUDY_GUIDES) {
      expect(homeHtml).toContain(guide.number);
    }
  });

  it('renderar TopicDetailView för varje studieguide sg1–sg7 utan råa $-tecken eller KaTeX-fel', () => {
    const nestedHtml = renderToStaticMarkup(
      <MathText text="En funktion $f$ är **kontinuerlig i punkten $a$** om $\\lim_{x\\to a} f(x) = f(a)$." />,
    );
    expect(nestedHtml).toContain('<strong>');
    expect(nestedHtml).not.toContain('$a$');
    expect(nestedHtml).not.toContain('katex-error');

    for (const id of STUDY_GUIDE_IDS) {
      const html = renderToStaticMarkup(
        <TopicDetailView
          guideId={id}
          onSelectGuide={() => {}}
          onBackHome={() => {}}
        />,
      );
      expect(html).toContain('Teori &amp; begrepp');
      expect(html).toContain('Interaktivt verktyg');
      expect(html).toContain('Övningsuppgifter');
      expect(html).not.toContain('katex-error');
      expect(html).not.toMatch(/\$[a-zA-Z0-9\\]+\$/);
    }
  });

  it('renderar QuestionGeneratorView, FormulaSheetModal och ExerciseCard', () => {
    const genHtml = renderToStaticMarkup(<QuestionGeneratorView />);
    expect(genHtml).toContain('Dugga');

    const modalHtml = renderToStaticMarkup(
      <FormulaSheetModal open onClose={() => {}} />,
    );
    expect(modalHtml).toContain('Formelsamling');
    expect(modalHtml).toContain('Kvadratkomplettering');

    const ex = generateExerciseForGuide('sg5', 'medel');
    const cardHtml = renderToStaticMarkup(
      <ExerciseCard
        exercise={ex}
        questionNumber={1}
        answer=""
        onAnswerChange={() => {}}
        onSubmitSingle={() => {}}
      />,
    );
    expect(cardHtml).toContain('Skicka svar');
  });

  it('renderar FunctionPlot2D och alla 7 interaktiva visualiserare', () => {
    const plotHtml = renderToStaticMarkup(
      <FunctionPlot2D
        curves={[{ fn: (x) => x * x, color: 'var(--svg-blue)', label: 'x²' }]}
        points={[{ x: 0, y: 0, color: 'var(--sage)', label: 'Origo' }]}
      />,
    );
    expect(plotHtml).toContain('<svg');

    const tools = [
      <AlgebraAndFunctionTool key="sg1" />,
      <ElementaryFunctionsTool key="sg2" />,
      <TrigArcusLimitInfTool key="sg3" />,
      <LimitsAndContinuityTool key="sg4" />,
      <DerivativeTool key="sg5" />,
      <CurveSketchAndOptTool key="sg6" />,
      <MaclaurinAndSeriesTool key="sg7" />,
    ];
    for (const tool of tools) {
      const html = renderToStaticMarkup(tool);
      expect(html).toContain('<svg');
    }
  });
});
