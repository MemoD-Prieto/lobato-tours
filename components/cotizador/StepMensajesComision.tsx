import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepMensajesComision() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('messages_step')}</h4>}>
      <div className="grid grid-cols-1 gap-4">
        <SmartField
          label={t('welcome_message')}
          name="cotizacion.greeting_message"
          type="textarea"
          placeholder="Mensaje personalizado para el cliente"
        />
        <SmartField
          label={t('goodbye_message')}
          name="cotizacion.goodbye_message"
          type="textarea"
          placeholder="Mensaje de despedida para el cliente"
        />
      </div>
      <div className="mt-4">
        <SmartField
          label={t('commission_percent')}
          name="cotizacion.commission"
          type="number"
          placeholder="0"
          min={0}
          max={100}
        />
      </div>

      {/* Internal use only — not shown on PDF */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#1b2e4b]">
        <p className="text-xs font-semibold text-gray-400 dark:text-[#5c6f8a] uppercase tracking-wide mb-3">
          {t('internal_use_only')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmartField
            label={t('valid_until_label')}
            name="cotizacion.valid_until"
            type="date"
          />
        </div>
        <div className="mt-4">
          <SmartField
            label={t('internal_notes')}
            name="cotizacion.notes"
            type="textarea"
            placeholder="Notas privadas: estado de negociación, pendientes, recordatorios…"
          />
        </div>
      </div>
    </Card>
  );
}
