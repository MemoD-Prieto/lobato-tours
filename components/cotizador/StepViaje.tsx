import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepViaje() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('trip_info_step')}</h4>}>
      <p className="text-sm text-gray-500 dark:text-[#888ea8] mb-4">{t('trip_info_subtitle')}</p>

      <div className="mb-4">
        <SmartField
          label={t('package_destination') + ' *'}
          name="viaje.travel_destiny"
          placeholder="Ej: Cancún, Mallorca, París…"
          validate={(val) => !val || val.trim() === '' ? t('destination_required') : ''}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField
          label={t('travel_start_date') + ' *'}
          name="viaje.travel_begin"
          type="date"
          validate={(val) => !val ? t('start_date_required') : ''}
        />
        <SmartField
          label={t('travel_return_date') + ' *'}
          name="viaje.travel_end"
          type="date"
          validate={(val) => !val ? t('return_date_required') : ''}
        />
      </div>
    </Card>
  );
}
