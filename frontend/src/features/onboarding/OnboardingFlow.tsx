import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { WelcomeStep } from './steps/WelcomeStep';
import { IncomeStep } from './steps/IncomeStep';
import { PresetStep } from './steps/PresetStep';
import { GoalStep } from './steps/GoalStep';
import { completeOnboarding, type PresetRule } from './api';
import { ruleKeys } from '@/features/rules/queries';
import { ME_QUERY_KEY } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

export function OnboardingFlow() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [name, setName]         = useState('');
  const [income, setIncome]     = useState('');
  const [currency]              = useState('HUF');
  const [presetId, setPresetId] = useState('');
  const [rules, setRules]       = useState<PresetRule[]>([]);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function finish(withGoal: boolean) {
    setIsSubmitting(true);
    setError('');
    try {
      await completeOnboarding({
        displayName: name,
        monthlyIncome: parseFloat(income),
        currency,
        rules,
        savingsGoal:
          withGoal && goalName && goalTarget
            ? { name: goalName, target: parseFloat(goalTarget) }
            : null,
      });
      await qc.invalidateQueries({ queryKey: ME_QUERY_KEY });
      await qc.invalidateQueries({ queryKey: ruleKeys.all });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {step === 0 && (
        <WelcomeStep name={name} onChange={setName} onNext={() => setStep(1)} />
      )}
      {step === 1 && (
        <IncomeStep
          income={income}
          currency={currency}
          onChange={setIncome}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <PresetStep
          selectedId={presetId}
          onSelect={(id, r) => { setPresetId(id); setRules(r); }}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <GoalStep
          goalName={goalName}
          goalTarget={goalTarget}
          onChangeName={setGoalName}
          onChangeTarget={setGoalTarget}
          onSkip={() => finish(false)}
          onFinish={() => finish(true)}
          onBack={() => setStep(2)}
          isSubmitting={isSubmitting}
        />
      )}
      {error && (
        <p className="mt-4 text-sm text-danger bg-danger-light rounded-md px-3 py-2">{error}</p>
      )}
    </>
  );
}
