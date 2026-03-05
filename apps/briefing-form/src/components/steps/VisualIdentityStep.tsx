import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Palette, Plus, X } from 'lucide-react';
import { FieldWrapper } from '@/components/FieldWrapper';
import { LogoUpload } from '@/components/LogoUpload';
import { useFileUpload } from '@/hooks/use-file-upload';
import type { BriefingFormData } from '@/schemas/briefing.schema';

const TONE_OPTIONS = ['sophisticated', 'young', 'family', 'investor'] as const;

interface VisualIdentityStepProps {
  leadId: string;
}

export function VisualIdentityStep({ leadId }: VisualIdentityStepProps) {
  const { t } = useTranslation();
  const { setValue, watch, formState: { errors } } = useFormContext<BriefingFormData>();
  const brandColors = watch('brandColors') ?? [];
  const visualReferences = watch('visualReferences') ?? [];
  const communicationTone = watch('communicationTone');
  const { uploadFile, preview, isUploading, uploadProgress, error: uploadError, removeFile } = useFileUpload();

  const [colorInput, setColorInput] = useState('#');
  const [refInput, setRefInput] = useState('');

  function addColor() {
    const c = colorInput.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(c) && !brandColors.includes(c)) {
      setValue('brandColors', [...brandColors, c], { shouldValidate: true });
    }
    setColorInput('#');
  }

  function removeColor(i: number) {
    setValue('brandColors', brandColors.filter((_, idx) => idx !== i), { shouldValidate: true });
  }

  function addRef() {
    const url = refInput.trim();
    if (url && !visualReferences.includes(url)) {
      try {
        new URL(url);
        setValue('visualReferences', [...visualReferences, url], { shouldValidate: true });
        setRefInput('');
      } catch { /* invalid URL */ }
    }
  }

  function removeRef(i: number) {
    setValue('visualReferences', visualReferences.filter((_, idx) => idx !== i), { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('briefing.visual.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('briefing.visual.description')}</p>
        </div>
      </div>

      {/* Brand colors */}
      <FieldWrapper label={t('briefing.visual.brandColors')} error={errors.brandColors?.message}>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {brandColors.map((color, i) => (
              <span
                key={`${color}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-sm"
              >
                <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: color }} />
                {color}
                <button type="button" onClick={() => removeColor(i)} className="p-0.5 hover:bg-muted rounded-full">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              placeholder={t('briefing.visual.brandColorsPlaceholder')}
              maxLength={7}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-base font-mono outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={addColor}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('briefing.visual.brandColorsHint')}</p>
        </div>
      </FieldWrapper>

      {/* Logo upload */}
      <FieldWrapper label={t('briefing.visual.hasLogo')}>
        <LogoUpload
          preview={preview}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={uploadError}
          onDrop={(file) => uploadFile(file, leadId)}
          onRemove={removeFile}
        />
      </FieldWrapper>

      {/* Communication tone */}
      <FieldWrapper label={t('briefing.visual.communicationTone')} error={errors.communicationTone?.message}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setValue('communicationTone', tone, { shouldValidate: true })}
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                communicationTone === tone
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border hover:bg-secondary text-foreground'
              }`}
            >
              {t(`briefing.visual.toneOptions.${tone}`)}
            </button>
          ))}
        </div>
      </FieldWrapper>

      {/* Visual references */}
      <FieldWrapper label={t('briefing.visual.visualReferences')} error={errors.visualReferences?.message}>
        <div className="space-y-2">
          {visualReferences.map((url, i) => (
            <div key={`${url}-${i}`} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
              <span className="flex-1 truncate text-muted-foreground">{url}</span>
              <button type="button" onClick={() => removeRef(i)} className="p-0.5 hover:bg-muted rounded-full">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRef())}
              placeholder={t('briefing.visual.visualReferencesPlaceholder')}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={addRef}
              className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('briefing.visual.visualReferencesHint')}</p>
        </div>
      </FieldWrapper>
    </div>
  );
}
