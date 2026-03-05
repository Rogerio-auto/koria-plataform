import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { useBriefingForm } from '@/hooks/use-briefing-form';
import { StepIndicator } from '@/components/StepIndicator';
import {
  PropertyInfoStep,
  VisualIdentityStep,
  CreativeDirectionStep,
  CommercialInfoStep,
  ExtrasStep,
  ReviewStep,
} from '@/components/steps';

interface BriefingFormProps {
  leadId: string;
}

export function BriefingForm({ leadId }: BriefingFormProps) {
  const { t } = useTranslation();
  const {
    form,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    onSubmit,
    isSubmitting,
  } = useBriefingForm(leadId);

  const stepLabels = [
    t('briefing.steps.property'),
    t('briefing.steps.visual'),
    t('briefing.steps.creative'),
    t('briefing.steps.commercial'),
    t('briefing.steps.extras'),
    t('briefing.steps.review'),
  ];

  const isLastStep = currentStep === totalSteps - 1;

  const stepContent = [
    <PropertyInfoStep key="property" />,
    <VisualIdentityStep key="visual" leadId={leadId} />,
    <CreativeDirectionStep key="creative" />,
    <CommercialInfoStep key="commercial" />,
    <ExtrasStep key="extras" />,
    <ReviewStep key="review" onEditStep={goToStep} />,
  ];

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <StepIndicator steps={stepLabels} currentStep={currentStep} />

        {/* Root error */}
        {form.formState.errors.root && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {t(`briefing.errors.${form.formState.errors.root.message}`)}
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[24rem]">
          {stepContent[currentStep]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              currentStep === 0
                ? 'invisible'
                : 'border border-border hover:bg-secondary text-foreground'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('briefing.actions.previous')}</span>
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('briefing.actions.submitting')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('briefing.actions.submit')}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('briefing.actions.next')}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
