import { MouseEventHandler } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

interface Step {
  label: string;
  subtitle?: string;
}

interface VerticalStepperProps {
  steps: Step[];
  current: number;
  allowed: boolean[];          // same shape as steps: which ones may be clicked
  onStepClick: (idx: number) => void;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  steps,
  current,
  allowed,
  onStepClick,
}) => {
  return (
    <div className="relative pl-8">
      {/* vertical line */}
      <div className="absolute top-3 left-3 h-full border-l-2 border-neutral-200" />

      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        const enabled = allowed[idx];

        const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
          e.preventDefault();
          if (enabled) onStepClick(idx);
        };

        return (
          <button
            key={step.label}
            onClick={handleClick}
            disabled={!enabled}
            className={`
              flex items-start space-x-3 mb-8
              ${enabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
            `}
          >
            {/* circle with number or check */}
            <div
              className={`
                relative flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${done
                  ? "bg-primary border-primary text-white"
                  : active
                  ? "bg-white border-primary text-primary"
                  : "bg-white border-neutral-400 text-neutral-400"
                }
              `}
            >
              {done ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <span className="text-xs font-medium">{idx + 1}</span>
              )}
            </div>

            {/* labels */}
            <div className="text-left">
              <div
                className={`
                  text-sm font-medium
                  ${active ? "text-primary" : "text-neutral-700"}
                `}
              >
                {step.label}
              </div>
              {step.subtitle && (
                <div className="text-xs text-neutral-400">{step.subtitle}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default VerticalStepper;
