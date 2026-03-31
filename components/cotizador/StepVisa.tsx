import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepVisa() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('visa')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label={t('destination_country')} name="visa.pais" placeholder="Ej: Estados Unidos, Canadá" />
        <SmartField label={t('cost')} name="visa.costo" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label={t('processing_time')} name="visa.tiempo" placeholder="Ej: 15 días hábiles" />
      </div>
      <PersonasWidget fieldPath="visa.num_personas" />
    </Card>
  );
}
