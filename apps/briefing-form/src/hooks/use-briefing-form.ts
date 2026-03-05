import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { briefingFormSchema, stepSchemas, type BriefingFormData } from '@/schemas/briefing.schema';
import { briefingApi } from '@/services/api';
import type { BriefingFormConfig } from '@koria/types';

const TOTAL_STEPS = 6; // 5 form steps + 1 review
const DRAFT_KEY = (id: string) => `briefing-draft-${id}`;

export function useBriefingForm(token: string) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [formConfig, setFormConfig] = useState<BriefingFormConfig | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<BriefingFormData>({
    resolver: zodResolver(briefingFormSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      propertyName: '',
      propertyAddress: '',
      propertyUnits: '',
      propertyUnitSizes: '',
      propertyDifferentials: [],
      brandColors: [],
      communicationTone: '',
      visualReferences: [],
      targetAudience: '',
      mainEmotion: '',
      mandatoryElements: [],
      elementsToAvoid: [],
      priceRange: '',
      paymentConditions: '',
      launchDate: '',
      realtorContact: '',
      voiceoverText: '',
      musicPreference: '',
      legalDisclaimers: '',
      additionalNotes: '',
    },
  });

  // Load form config from API
  useEffect(() => {
    let cancelled = false;
    setIsLoadingConfig(true);
    briefingApi.getFormConfig(token)
      .then((config) => {
        if (cancelled) return;
        setFormConfig(config);
        if (config.alreadySubmitted) {
          setConfigError('alreadySubmitted');
        }
        // Pre-fill known fields
        if (config.leadName) form.setValue('fullName', config.leadName);
        if (config.email) form.setValue('email', config.email);
      })
      .catch(() => {
        if (!cancelled) setConfigError('loadFailed');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingConfig(false);
      });
    return () => { cancelled = true; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY(token));
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BriefingFormData>;
        Object.entries(parsed).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            form.setValue(key as keyof BriefingFormData, value as never);
          }
        });
      }
    } catch { /* ignore corrupt drafts */ }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft on value changes
  useEffect(() => {
    const subscription = form.watch((values) => {
      try {
        localStorage.setItem(DRAFT_KEY(token), JSON.stringify(values));
      } catch { /* storage full — ignore */ }
    });
    return () => subscription.unsubscribe();
  }, [token, form]);

  // Step field mapping for partial validation
  const stepFieldNames: (keyof BriefingFormData)[][] = [
    ['fullName', 'email', 'phoneNumber', 'propertyName', 'propertyAddress', 'propertyUnits', 'propertyUnitSizes', 'propertyDifferentials'],
    ['brandColors', 'communicationTone', 'visualReferences'],
    ['targetAudience', 'mainEmotion', 'mandatoryElements', 'elementsToAvoid'],
    ['priceRange', 'paymentConditions', 'launchDate', 'realtorContact'],
    ['voiceoverText', 'musicPreference', 'legalDisclaimers', 'additionalNotes'],
  ];

  const nextStep = useCallback(async (): Promise<boolean> => {
    if (currentStep >= TOTAL_STEPS - 1) return false;

    // Validate only current step's fields (skip for review step)
    if (currentStep < stepFieldNames.length) {
      const fields = stepFieldNames[currentStep];
      const valid = await form.trigger(fields);
      if (!valid) return false;
    }

    setCurrentStep((s) => s + 1);
    return true;
  }, [currentStep, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) setCurrentStep(step);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!formConfig) return;

    // Full validation
    const valid = await form.trigger();
    if (!valid) return;

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      await briefingApi.submitBriefing({
        token,
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber || undefined,
        propertyName: values.propertyName,
        propertyAddress: values.propertyAddress,
        propertyUnits: values.propertyUnits || undefined,
        propertyUnitSizes: values.propertyUnitSizes || undefined,
        propertyDifferentials: values.propertyDifferentials?.length ? values.propertyDifferentials : undefined,
        brandColors: values.brandColors?.length ? values.brandColors : undefined,
        communicationTone: values.communicationTone || undefined,
        visualReferences: values.visualReferences?.length ? values.visualReferences : undefined,
        targetAudience: values.targetAudience || undefined,
        mainEmotion: values.mainEmotion || undefined,
        mandatoryElements: values.mandatoryElements?.length ? values.mandatoryElements : undefined,
        elementsToAvoid: values.elementsToAvoid?.length ? values.elementsToAvoid : undefined,
        priceRange: values.priceRange || undefined,
        paymentConditions: values.paymentConditions || undefined,
        launchDate: values.launchDate || undefined,
        realtorContact: values.realtorContact || undefined,
        voiceoverText: values.voiceoverText || undefined,
        musicPreference: values.musicPreference || undefined,
        legalDisclaimers: values.legalDisclaimers || undefined,
        additionalNotes: values.additionalNotes || undefined,
      });
      localStorage.removeItem(DRAFT_KEY(token));
      setSubmitSuccess(true);
    } catch {
      form.setError('root', { message: 'submitFailed' });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, formConfig, form]);

  return {
    form,
    currentStep,
    totalSteps: TOTAL_STEPS,
    stepSchemas,
    nextStep,
    prevStep,
    goToStep,
    onSubmit,
    isSubmitting,
    isLoadingConfig,
    configError,
    formConfig,
    submitSuccess,
  };
}
