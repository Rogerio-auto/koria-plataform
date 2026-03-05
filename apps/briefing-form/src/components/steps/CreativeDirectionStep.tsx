import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Clapperboard } from 'lucide-react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { ChipInput } from '@/components/ChipInput';
import type { BriefingFormData } from '@/schemas/briefing.schema';

const AUDIENCE_OPTIONS = ['young_couples', 'investors', 'families', 'luxury', 'first_home'] as const;
const EMOTION_OPTIONS = ['security', 'freedom', 'sophistication', 'nature', 'comfort', 'exclusivity'] as const;

export function CreativeDirectionStep() {
  const { t } = useTranslation();
  const { setValue, watch, formState: { errors } } = useFormContext<BriefingFormData>();
  const targetAudience = watch('targetAudience');
  const mainEmotion = watch('mainEmotion');
  const mandatoryElements = watch('mandatoryElements') ?? [];
  const elementsToAvoid = watch('elementsToAvoid') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Clapperboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.creative.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.creative.description')}</p>
        </div>
      </div>

      {/* Target audience */}
      <FieldWrapper label={t('briefing.creative.targetAudience')} error={errors.targetAudience?.message} required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AUDIENCE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setValue('targetAudience', opt, { shouldValidate: true })}
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                targetAudience === opt
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:bg-secondary text-foreground'
              }`}
            >
              {t(`briefing.creative.audienceOptions.${opt}`)}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {/* Main emotion */}
      <FieldWrapper label={t('briefing.creative.mainEmotion')} error={errors.mainEmotion?.message} required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EMOTION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setValue('mainEmotion', opt, { shouldValidate: true })}
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                mainEmotion === opt
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:bg-secondary text-foreground'
              }`}
            >
              {t(`briefing.creative.emotionOptions.${opt}`)}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {/* Mandatory elements */}
      <FieldWrapper label={t('briefing.creative.mandatoryElements')}>
        <ChipInput
          values={mandatoryElements}
          onChange={(vals) => setValue('mandatoryElements', vals, { shouldValidate: true })}
          placeholder={t('briefing.creative.mandatoryElementsPlaceholder')}
          hint={t('briefing.creative.mandatoryElementsHint')}
        />
      </FieldWrapper>

      {/* Elements to avoid */}
      <FieldWrapper label={t('briefing.creative.elementsToAvoid')}>
        <ChipInput
          values={elementsToAvoid}
          onChange={(vals) => setValue('elementsToAvoid', vals, { shouldValidate: true })}
          placeholder={t('briefing.creative.elementsToAvoidPlaceholder')}
          hint={t('briefing.creative.elementsToAvoidHint')}
        />
      </FieldWrapper>
    </div>
  );
}
