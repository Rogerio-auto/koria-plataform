import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import { FieldWrapper } from '@/components/FieldWrapper';
import type { BriefingFormData } from '@/schemas/briefing.schema';

export function CommercialInfoStep() {
  const { t } = useTranslation();
  const { register, formState: { errors } } = useFormContext<BriefingFormData>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.commercial.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.commercial.description')}</p>
        </div>
      </div>

      <FieldWrapper label={t('briefing.commercial.priceRange')} error={errors.priceRange?.message}>
        <input
          {...register('priceRange')}
          placeholder={t('briefing.commercial.priceRangePlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <FieldWrapper label={t('briefing.commercial.paymentConditions')} error={errors.paymentConditions?.message}>
        <textarea
          {...register('paymentConditions')}
          rows={3}
          placeholder={t('briefing.commercial.paymentConditionsPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none resize-y focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label={t('briefing.commercial.launchDate')} error={errors.launchDate?.message}>
          <input
            {...register('launchDate')}
            placeholder={t('briefing.commercial.launchDatePlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>

        <FieldWrapper label={t('briefing.commercial.realtorContact')} error={errors.realtorContact?.message}>
          <input
            {...register('realtorContact')}
            placeholder={t('briefing.commercial.realtorContactPlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>
      </div>
    </div>
  );
}
