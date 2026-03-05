import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { ChipInput } from '@/components/ChipInput';
import type { BriefingFormData } from '@/schemas/briefing.schema';

export function PropertyInfoStep() {
  const { t } = useTranslation();
  const { register, formState: { errors }, setValue, watch } = useFormContext<BriefingFormData>();
  const differentials = watch('propertyDifferentials') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.property.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.property.description')}</p>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label={t('briefing.property.fullName')} error={errors.fullName?.message} required>
          <input
            {...register('fullName')}
            placeholder={t('briefing.property.fullNamePlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>
        <FieldWrapper label={t('briefing.property.email')} error={errors.email?.message} required>
          <input
            type="email"
            {...register('email')}
            placeholder={t('briefing.property.emailPlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label={t('briefing.property.phoneNumber')} error={errors.phoneNumber?.message}>
        <input
          type="tel"
          {...register('phoneNumber')}
          placeholder={t('briefing.property.phoneNumberPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <hr className="border-border" />

      {/* Property info */}
      <FieldWrapper label={t('briefing.property.propertyName')} error={errors.propertyName?.message} required>
        <input
          {...register('propertyName')}
          placeholder={t('briefing.property.propertyNamePlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <FieldWrapper label={t('briefing.property.propertyAddress')} error={errors.propertyAddress?.message} required>
        <input
          {...register('propertyAddress')}
          placeholder={t('briefing.property.propertyAddressPlaceholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </FieldWrapper>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label={t('briefing.property.propertyUnits')} error={errors.propertyUnits?.message}>
          <input
            {...register('propertyUnits')}
            placeholder={t('briefing.property.propertyUnitsPlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>
        <FieldWrapper label={t('briefing.property.propertyUnitSizes')} error={errors.propertyUnitSizes?.message}>
          <input
            {...register('propertyUnitSizes')}
            placeholder={t('briefing.property.propertyUnitSizesPlaceholder')}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </FieldWrapper>
      </div>

      <FieldWrapper label={t('briefing.property.propertyDifferentials')}>
        <ChipInput
          values={differentials}
          onChange={(vals) => setValue('propertyDifferentials', vals, { shouldValidate: true })}
          placeholder={t('briefing.property.propertyDifferentialsPlaceholder')}
          hint={t('briefing.property.propertyDifferentialsHint')}
        />
      </FieldWrapper>
    </div>
  );
}
