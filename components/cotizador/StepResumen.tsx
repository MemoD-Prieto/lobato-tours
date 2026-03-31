import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Card } from "./Card";
import { useFormData } from "./FormContext";

export function StepResumen() {
  const { t } = useTranslation();
  const { data, setValue, cotizacionId, selectedServices } = useFormData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: true; data: any } | null>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!data.clientes?.[0]?.customer_name?.trim())             missing.push(t('client_label'));
    if (!data.clientes?.[0]?.customer_contact?.trim())          missing.push(t('contact_label'));
    // At least the first traveler (the client) must have an age range selected
    if (!data.clientes?.[0]?.personas?.[0]?.age_range)          missing.push(t('age_range'));
    if (!data.viaje?.travel_destiny?.trim())                     missing.push(t('package_destination'));
    if (!data.viaje?.travel_begin)                               missing.push(t('travel_start_date'));
    if (!data.viaje?.travel_end)                                 missing.push(t('travel_return_date'));
    if (selectedServices.size === 0)                             missing.push(t('services_step'));
    return missing;
  };

  const shakeToggle = () => {
    const el = toggleRef.current;
    if (!el) return;
    el.classList.remove('btn-shake');
    void el.offsetWidth;
    el.classList.add('btn-shake');
    setTimeout(() => el.classList.remove('btn-shake'), 550);
  };

  const handleToggle = (checked: boolean) => {
    // Turning off is always allowed
    if (!checked) {
      setValue('cotizacion.finished', false);
      return;
    }
    // Turning on: validate first
    const missing = getMissingFields();
    if (missing.length > 0) {
      shakeToggle();
      toast.error(
        <div>
          <p className="font-semibold mb-1">{t('complete_required_fields')}</p>
          <ul className="list-disc list-inside text-sm space-y-0.5">
            {missing.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>,
        { autoClose: 5000 }
      );
      return; // stays off
    }
    setValue('cotizacion.finished', true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        ...(cotizacionId && { cotizacion_id: cotizacionId }),
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.ok) {
        setSubmitResult({ success: true, data: result });
        toast.success(t('quote_created_success'));
      } else {
        toast.error(result.error || t('error_creating_quote'));
      }
    } catch {
      toast.error(t('connection_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const savedId = submitResult?.data?.data?.id ?? cotizacionId;

  return (
    <Card title={<h4 className="text-base font-semibold">{t('summary_step')}</h4>}>

      {/* Status toggle */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-[#060818] rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{t('quote_status')}</h5>
            <p className="text-xs text-gray-500 dark:text-[#888ea8] mt-0.5">
              {data.cotizacion?.finished ? t('marked_finished_required') : t('draft_minimal_data')}
            </p>
          </div>
          <label className="flex items-center cursor-pointer select-none">
            <div ref={toggleRef} className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={data.cotizacion?.finished || false}
                onChange={(e) => handleToggle(e.target.checked)}
              />
              <div className={`block w-12 h-6 rounded-full transition-colors ${data.cotizacion?.finished ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${data.cotizacion?.finished ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">{t('finished')}</span>
          </label>
        </div>
      </div>

      {submitResult?.success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
          <p className="font-semibold">✅ {t('quote_created_success')} — ID: {submitResult.data.data?.id ?? cotizacionId}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-2 rounded text-white text-sm transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : data.cotizacion?.finished
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('sending')
            : data.cotizacion?.finished
              ? t('finalize_quote')
              : t('save_draft')
          }
        </button>

        {data.cotizacion?.finished && savedId && (
          <a
            href={`/api/cotizacion/${savedId}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" stroke="currentColor" strokeWidth="1.5"/>
              <path opacity="0.5" d="M14 2L20 8H14V2Z" fill="currentColor"/>
              <path d="M8 13H16M8 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {t('view_pdf')}
          </a>
        )}
      </div>
    </Card>
  );
}
