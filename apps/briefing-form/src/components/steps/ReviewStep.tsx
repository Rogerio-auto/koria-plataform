import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Pencil } from 'lucide-react';
import type { BriefingFormData } from '@/schemas/briefing.schema';

interface ReviewStepProps {
  onEditStep: (step: number) => void;
}

function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Pencil className="h-3 w-3" />
          {t('briefing.review.edit')}
        </button>
      </div>
      <div className="px-4 py-3 space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | string[] | null }) {
  const { t } = useTranslation();
  const display = Array.isArray(value) ? (value.length > 0 ? value.join(', ') : null) : value;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="font-medium text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className={display ? 'text-foreground' : 'text-muted-foreground italic'}>
        {display || t('briefing.review.notProvided')}
      </span>
    </div>
  );
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { t } = useTranslation();
  const { getValues } = useFormContext<BriefingFormData>();
  const v = getValues();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.review.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.review.description')}</p>
        </div>
      </div>

      {/* Property */}
      <Section title={t('briefing.review.sectionProperty')} onEdit={() => onEditStep(0)}>
        <Row label={t('briefing.property.fullName')} value={v.fullName} />
        <Row label={t('briefing.property.email')} value={v.email} />
        <Row label={t('briefing.property.phoneNumber')} value={v.phoneNumber} />
        <Row label={t('briefing.property.propertyName')} value={v.propertyName} />
        <Row label={t('briefing.property.propertyAddress')} value={v.propertyAddress} />
        <Row label={t('briefing.property.propertyUnits')} value={v.propertyUnits} />
        <Row label={t('briefing.property.propertyUnitSizes')} value={v.propertyUnitSizes} />
        <Row label={t('briefing.property.propertyDifferentials')} value={v.propertyDifferentials} />
      </Section>

      {/* Visual Identity */}
      <Section title={t('briefing.review.sectionVisual')} onEdit={() => onEditStep(1)}>
        <div className="flex flex-col sm:flex-row sm:gap-2">
          <span className="font-medium text-muted-foreground sm:w-40 shrink-0">{t('briefing.review.colors')}</span>
          <div className="flex flex-wrap gap-1.5">
            {v.brandColors && v.brandColors.length > 0 ? (
              v.brandColors.map((c, i) => (
                <span key={`${c}-${i}`} className="inline-flex items-center gap-1 text-xs rounded-full border border-border px-2 py-0.5">
                  <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c }} />
                  {c}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground italic">{t('briefing.review.notProvided')}</span>
            )}
          </div>
        </div>
        <Row
          label={t('briefing.review.tone')}
          value={v.communicationTone ? t(`briefing.visual.toneOptions.${v.communicationTone}`) : undefined}
        />
        <Row label={t('briefing.review.references')} value={v.visualReferences} />
      </Section>

      {/* Creative Direction */}
      <Section title={t('briefing.review.sectionCreative')} onEdit={() => onEditStep(2)}>
        <Row
          label={t('briefing.review.audience')}
          value={v.targetAudience ? t(`briefing.creative.audienceOptions.${v.targetAudience}`) : undefined}
        />
        <Row
          label={t('briefing.review.emotion')}
          value={v.mainEmotion ? t(`briefing.creative.emotionOptions.${v.mainEmotion}`) : undefined}
        />
        <Row label={t('briefing.review.mandatory')} value={v.mandatoryElements} />
        <Row label={t('briefing.review.avoid')} value={v.elementsToAvoid} />
      </Section>

      {/* Commercial */}
      <Section title={t('briefing.review.sectionCommercial')} onEdit={() => onEditStep(3)}>
        <Row label={t('briefing.commercial.priceRange')} value={v.priceRange} />
        <Row label={t('briefing.commercial.paymentConditions')} value={v.paymentConditions} />
        <Row label={t('briefing.commercial.launchDate')} value={v.launchDate} />
        <Row label={t('briefing.commercial.realtorContact')} value={v.realtorContact} />
      </Section>

      {/* Extras */}
      <Section title={t('briefing.review.sectionExtras')} onEdit={() => onEditStep(4)}>
        <Row label={t('briefing.extras.voiceoverText')} value={v.voiceoverText} />
        <Row label={t('briefing.extras.musicPreference')} value={v.musicPreference} />
        <Row label={t('briefing.extras.legalDisclaimers')} value={v.legalDisclaimers} />
        <Row label={t('briefing.extras.additionalNotes')} value={v.additionalNotes} />
      </Section>
    </div>
  );
}
