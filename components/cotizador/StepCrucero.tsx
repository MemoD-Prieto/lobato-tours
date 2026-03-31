import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";
import { FaShip } from "react-icons/fa";
import { PersonasWidget } from "./PersonasWidget";

export function StepCrucero() {
  const { t } = useTranslation();
  const { data, setValue } = useFormData();

  const cruiseLines = [
    { value: "royal-caribbean", label: "Royal Caribbean", image: "/assets/images/cruises/royal-caribbean.jpeg" },
    { value: "norwegian", label: "Norwegian", image: "/assets/images/cruises/norwegian.jpeg" },
    { value: "princess", label: "Princess", image: "/assets/images/cruises/princess.jpeg" },
    { value: "other", label: "Otro" }
  ];

  const selectedCruiseLine = data.crucero?.cruise_line || "";
  const isOtherSelected = selectedCruiseLine === "other";
  const selectedCruiseData = cruiseLines.find(cruise => cruise.value === selectedCruiseLine);

  return (
    <Card title={
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">{t('cruise')}</h4>
        <div className="w-32 h-32 border rounded-lg p-2 bg-gray-50 dark:bg-[#253a5e] dark:border-[#253a5e] flex items-center justify-center flex-shrink-0">
          {selectedCruiseLine && !isOtherSelected && selectedCruiseData?.image ? (
            <Image
              src={selectedCruiseData.image}
              alt={selectedCruiseData.label}
              width={112}
              height={112}
              className="object-contain w-full h-full"
            />
          ) : isOtherSelected ? (
            <div className="w-8 h-8 flex items-center justify-center text-blue-600">
              <FaShip className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-[#5c6f8a]">
              <FaShip className="w-8 h-8" />
            </div>
          )}
        </div>
      </div>
    }>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-1">{t('cruise_line')}</label>
          {isOtherSelected ? (
            <div className="flex gap-2">
              <select
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                value={selectedCruiseLine}
                onChange={(e) => setValue("crucero.cruise_line", e.target.value)}
              >
                <option value="">{t('select_cruise_line')}</option>
                {cruiseLines.map((cruise) => (
                  <option key={cruise.value} value={cruise.value}>
                    {cruise.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                placeholder={t('cruise_name')}
                value={data.crucero?.other_cruise_line || ""}
                onChange={(e) => setValue("crucero.other_cruise_line", e.target.value)}
              />
            </div>
          ) : (
            <select
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
              value={selectedCruiseLine}
              onChange={(e) => setValue("crucero.cruise_line", e.target.value)}
            >
              <option value="">{t('select_cruise_line')}</option>
              {cruiseLines.map((cruise) => (
                <option key={cruise.value} value={cruise.value}>
                  {cruise.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <SmartField label={t('cruise_name')} name="crucero.nombre" placeholder="Ej: Caribbean Princess" />
        <SmartField label={t('price_per_person')} name="crucero.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label={t('duration_days')} name="crucero.duracion" type="number" placeholder="0" min={1} />
      </div>
      <PersonasWidget fieldPath="crucero.num_personas" />
    </Card>
  );
}
