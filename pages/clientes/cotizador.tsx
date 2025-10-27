import React from "react";
import { FormProvider } from "@/components/cotizador";
import { WizardContent } from "@/components/cotizador/WizardContent";

// =====================================================
// Main Wizard Component
// =====================================================

export default function NeutralStepperQuoteWizard_Fieldified() {
  return (
    <FormProvider>
      <WizardContent />
    </FormProvider>
  );
}