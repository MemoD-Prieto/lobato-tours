import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepEntradas() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">Entradas</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label={t('attractions')} name="entradas.atraccion" placeholder="Ej: Chichen Itzá, Xcaret" />
        <SmartField label={t('price_per_person')} name="entradas.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label={t('quantity_people')} name="entradas.cantidad" type="number" placeholder="0" min={1} />
      </div>
      <PersonasWidget fieldPath="entradas.num_personas" />
    </Card>
  );
}
