import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepDatos() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('data_card')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label={t('provider_plan')} name="datos.proveedor_plan" placeholder="eSIM / Física, GB y días" />
        <SmartField label={t('start_date')} name="datos.inicio" type="date" />
        <SmartField label={t('cost')} name="datos.costo" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <PersonasWidget fieldPath="datos.num_personas" />
    </Card>
  );
}
