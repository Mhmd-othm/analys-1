import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MathStep } from '../../math/index.ts';
import { KatexBlock } from './KatexBlock.tsx';
import { MathText } from './MathText.tsx';

interface MathStepsDisplayProps {
  steps: MathStep[];
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  activeStepIndex?: number;
}

export function MathStepsDisplay({
  steps,
  title = 'Steg-för-steg-lösning',
  collapsible = false,
  defaultOpen = true,
  activeStepIndex,
}: MathStepsDisplayProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="space-between" style={{ marginBottom: isOpen ? '0.4rem' : 0 }}>
        <strong style={{ fontSize: '0.96rem' }}>{title}</strong>
        {collapsible && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <>
                Dölj lösningssteg <ChevronUp size={15} />
              </>
            ) : (
              <>
                Visa lösningssteg ({steps.length}) <ChevronDown size={15} />
              </>
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="steps-list">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`step-item${activeStepIndex === idx ? ' active-step' : ''}`}
            >
              <div className="step-header">
                <span className="step-num">{idx + 1}</span>
                <span className="step-title"><MathText text={step.title} /></span>
              </div>
              <p className="step-explanation">
                <MathText text={step.explanation} />
              </p>
              {step.latex && (
                <div className="formula-box">
                  <KatexBlock latex={step.latex} displayMode />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
