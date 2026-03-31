import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { PersonasWidget } from "./PersonasWidget";

export function StepHotel() {
  const { t } = useTranslation();

  return (
    <Card title={<h4 className="text-base font-semibold">{t('hotel')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label={t('hotel_name')} name="hoteles[0].name" placeholder="Ej: Hotel Paradise" />
        <SmartField label={t('nights')} name="hoteles[0].nights" type="number" placeholder="0" min={0} />
      </div>

      <div className="mt-6">
        <h5 className="text-sm font-semibold mb-3">{t('room_distribution')}</h5>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#253a5e]">
            <thead className="bg-gray-50 dark:bg-[#060818]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">{t('room_type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">{t('people')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">{t('price')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">{t('iva')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1b2e4b] divide-y divide-gray-200 dark:divide-[#253a5e]">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SmartField
                    name="hoteles[0].distribuciones[0].habitaciones[0].type"
                    placeholder="Ej: Doble, Sencilla"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SmartField
                    name="hoteles[0].distribuciones[0].habitaciones[0].number_of_people"
                    type="number"
                    min={1}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SmartField
                    name="hoteles[0].distribuciones[0].habitaciones[0].price"
                    type="currency"
                    prefix="$"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <SmartField
                    name="hoteles[0].distribuciones[0].habitaciones[0].iva"
                    type="currency"
                    prefix="$"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#888ea8]">
                  <button className="text-red-600 hover:text-red-900" type="button" disabled>
                    {t('delete')}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <PersonasWidget fieldPath="hoteles[0].num_personas" />
    </Card>
  );
}
