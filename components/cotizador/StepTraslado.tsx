import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepTraslado() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('transfer')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label={t('transfer_cost')} name="traslado.amount" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label={t('transfer_type')} name="traslado.tipo" placeholder="Ej: Privado, Compartido" />
      </div>
      <PersonasWidget fieldPath="traslado.num_personas" />
    </Card>
  );
}
