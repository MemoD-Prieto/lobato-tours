import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AiOutlineUser,
  AiOutlineDollar,
  AiOutlineCheck,
  AiOutlineCar,
  AiOutlineRead,
  AiOutlineFileDone,
  AiOutlineSafety,
  AiOutlineCreditCard,
  AiOutlinePlusSquare,
  AiOutlineTags,
  AiOutlineWifi,
} from "react-icons/ai";
import { TbSpeedboat } from "react-icons/tb";
import { MdOutlineDirectionsBoat } from "react-icons/md";
import {
  StepCliente,
  StepViaje,
  StepMoneda,
  StepServicios,
  StepPaquete,
  StepVuelo,
  StepHotel,
  StepTraslado,
  StepCrucero,
  StepEntradas,
  StepFerry,
  StepSeguro,
  StepDatos,
  StepVisa,
  StepMensajesComision,
  StepResumen,
} from "./index";
import { useAutoSave } from "./useAutoSave";
import { useFormData } from "./FormContext";

type ServiceKey = "paquete" | "vuelo" | "hotel" | "traslado" | "crucero" | "entradas" | "ferry" | "seguro" | "datos" | "visa";

export function WizardContent() {
  const { t } = useTranslation();
  const { isSaving } = useAutoSave();
  const { saveData, isLoading, selectedServices, toggleService } = useFormData();

  const BASE_STEPS = useMemo(
    () => [
      { key: "cliente", label: t('client_step'), Icon: AiOutlineUser, content: <StepCliente /> },
      { key: "viaje", label: t('trip_info_step'), Icon: AiOutlineRead, content: <StepViaje /> },
      { key: "moneda", label: t('currency_step'), Icon: AiOutlineDollar, content: <StepMoneda /> },
      { key: "servicios", label: t('services_step'), Icon: AiOutlinePlusSquare, content: null },
    ],
    [t]
  );

  const [step, setStep] = useState(0);

  const serviceSteps = useMemo(() => {
    const order: { key: ServiceKey; label: string; Icon: any; node: React.ReactNode }[] = [];
    const add = (key: ServiceKey, label: string, Icon: any, node: React.ReactNode) => {
      if (selectedServices.has(key)) order.push({ key, label, Icon, node });
    };
    add("paquete", t('travel_package'), AiOutlineRead, <StepPaquete />);
    add("vuelo", t('flight'), AiOutlineCar, <StepVuelo />);
    add("hotel", t('hotel'), AiOutlineFileDone, <StepHotel />);
    add("traslado", t('transfer'), AiOutlineTags, <StepTraslado />);
    add("crucero", t('cruise'), MdOutlineDirectionsBoat, <StepCrucero />);
    add("entradas", "Entradas", AiOutlineTags, <StepEntradas />);
    add("ferry", t('ferry'), TbSpeedboat, <StepFerry />);
    add("seguro", t('insurance'), AiOutlineSafety, <StepSeguro />);
    add("datos", "Datos", AiOutlineWifi, <StepDatos />);
    add("visa", t('visa'), AiOutlineCreditCard, <StepVisa />);
    return order.map((o) => ({ key: o.key, label: o.label, Icon: o.Icon, content: o.node as React.ReactElement }));
  }, [selectedServices, t]);

  const tailSteps = useMemo(
    () => [
      { key: "mensajes", label: t('messages_step'), Icon: AiOutlineCheck, content: <StepMensajesComision /> },
      { key: "resumen", label: t('summary_step'), Icon: AiOutlineFileDone, content: <StepResumen /> },
    ],
    [t]
  );

  const allSteps = useMemo(() => {
    const steps = [...BASE_STEPS];

    // Add service picker step — find by key so adding new base steps never breaks this
    const serviciosIdx = steps.findIndex((s) => s.key === "servicios");
    if (serviciosIdx !== -1) {
      steps[serviciosIdx] = {
        ...steps[serviciosIdx],
        content: <StepServicios selected={selectedServices} toggle={toggleService} />,
      };
    }
    
    // Add selected service steps
    steps.push(...serviceSteps);
    
    // Add tail steps
    steps.push(...tailSteps);
    
    return steps;
  }, [BASE_STEPS, step, selectedServices, toggleService, serviceSteps, tailSteps]);

  const currentStep = allSteps[step];
  const isLastStep = step === allSteps.length - 1;
  const isFirstStep = step === 0;

  const nextStep = useCallback(async () => {
    if (!isLastStep) {
      // Save current data before moving to next step
      await saveData(true);
      setStep((s) => s + 1);
    }
  }, [isLastStep, saveData]);

  const prevStep = useCallback(async () => {
    if (!isFirstStep) {
      // Save current data before moving to previous step
      await saveData(true);
      setStep((s) => s - 1);
    }
  }, [isFirstStep, saveData]);

  // Show loading screen when loading a quote
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#060818] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('loading_quote')}</h2>
              <p className="text-gray-600 dark:text-[#888ea8]">{t('loading_quote_message')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060818] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('wizard_title')}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-[#888ea8]">
                  {t('step_of', { current: step + 1, total: allSteps.length, label: currentStep?.label })}
                </p>
              </div>
              {isSaving && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {t('saving_autosave')}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#060818]">
            <div className="w-full bg-gray-200 dark:bg-[#253a5e] rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / allSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="px-6 py-8">
            <div className="h-[600px] overflow-y-auto">
              {currentStep?.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-[#1b2e4b] bg-gray-50 dark:bg-[#060818] flex justify-between">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isFirstStep
                  ? "bg-gray-100 dark:bg-[#253a5e] text-gray-400 dark:text-[#5c6f8a] cursor-not-allowed"
                  : "bg-white dark:bg-[#1b2e4b] text-gray-700 dark:text-[#e0e6ed] border border-gray-300 dark:border-[#253a5e] hover:bg-gray-50 dark:hover:bg-[#253a5e]"
              }`}
            >
              {t('previous')}
            </button>

            <div className="flex space-x-2">
              {allSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={async () => {
                    // Save current data before jumping to step
                    await saveData(true);
                    setStep(index);
                  }}
                  className={`w-3 h-3 rounded-full ${
                    index === step
                      ? "bg-blue-600"
                      : index < step
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-[#253a5e]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              disabled={isLastStep}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isLastStep
                  ? "bg-gray-100 dark:bg-[#253a5e] text-gray-400 dark:text-[#5c6f8a] cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
