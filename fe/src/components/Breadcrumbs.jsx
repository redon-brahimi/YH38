import React from 'react';

const Breadcrumbs = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progression du formulaire" className="mb-8">
      <ol className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.id < currentStep
                    ? 'bg-success-500 text-white'
                    : step.id === currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-300 text-neutral-600'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  step.id <= currentStep ? 'text-neutral-900' : 'text-neutral-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs ${
                  step.id <= currentStep ? 'text-neutral-600' : 'text-neutral-400'
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <svg
                className={`ml-4 w-5 h-5 ${
                  step.id < currentStep ? 'text-success-500' : 'text-neutral-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;