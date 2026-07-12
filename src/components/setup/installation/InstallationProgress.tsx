import { CheckCircle, Circle } from 'lucide-react';

interface InstallationProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

export const InstallationProgress = ({ 
  currentStep, 
  totalSteps, 
  steps 
}: InstallationProgressProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Installation Progress</h2>
        <p className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              step.id === currentStep
                ? 'border-primary bg-primary/5'
                : step.id < currentStep
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                : 'border-muted bg-muted/30'
            }`}
          >
            <div className={`flex-shrink-0 ${
              step.id < currentStep
                ? 'text-green-600'
                : step.id === currentStep
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}>
              {step.id < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`font-medium ${
                step.id === currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};