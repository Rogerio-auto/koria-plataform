import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { FieldWrapper } from '@/components/FieldWrapper';
import type { BriefingFormData } from '@/schemas/briefing.schema';

export function ExtrasStep() {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext<BriefingFormData>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.extras.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.extras.description')}</p>
        </div>
      </div>

      <FieldWrapper label={t('briefing.extras.voiceoverText')} error={errors.voiceoverText?.message}>
        <textarea
          {...register('voiceoverText')}
          rows={5}
          placeholder={t('briefing.extras.voiceoverTextPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none resize-y focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <FieldWrapper label={t('briefing.extras.musicPreference')} error={errors.musicPreference?.message}>
        <input
          {...register('musicPreference')}
          placeholder={t('briefing.extras.musicPreferencePlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <FieldWrapper label={t('briefing.extras.legalDisclaimers')} error={errors.legalDisclaimers?.message}>
        <textarea
          {...register('legalDisclaimers')}
          rows={3}
          placeholder={t('briefing.extras.legalDisclaimersPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none resize-y focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <FieldWrapper label={t('briefing.extras.additionalNotes')} error={errors.additionalNotes?.message}>
        <textarea
          {...register('additionalNotes')}
          rows={3}
          placeholder={t('briefing.extras.additionalNotesPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none resize-y focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>
    </div>
  );
}
