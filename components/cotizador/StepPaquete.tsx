import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepPaquete() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('travel_package')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label={t('package_name')} name="viaje.package_name" placeholder="Ej: Cancún Todo Incluido 7 días" />
        <SmartField label={t('package_price')} name="viaje.package_price" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField
          label={t('package_description')}
          name="viaje.package_description"
          type="textarea"
          placeholder="Describe los servicios incluidos, itinerario día a día, etc."
        />
      </div>
      <PersonasWidget fieldPath="viaje.num_personas" />
    </Card>
  );
}
