import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";
import { FaPlane } from "react-icons/fa";
import { PersonasWidget } from "./PersonasWidget";

export function StepVuelo() {
  const { t } = useTranslation();
  const { data, setValue } = useFormData();

  const airlines = [
    { value: "viva-aerobus", label: "Viva Aerobus", image: "/assets/images/airlines/viva-aerobus.jpeg" },
    { value: "volaris", label: "Volaris", image: "/assets/images/airlines/volaris.jpeg" },
    { value: "aeromexico", label: "Aeromexico", image: "/assets/images/airlines/aeromexico.jpeg" },
    { value: "other", label: "Otro" }
  ];

  const selectedAirline = data.vuelo?.airline || "";
  const isOtherSelected = selectedAirline === "other";
  const selectedAirlineData = airlines.find(airline => airline.value === selectedAirline);

  return (
    <Card title={
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">{t('flight')}</h4>
        <div className="w-32 h-32 border rounded-lg p-2 bg-gray-50 dark:bg-[#253a5e] dark:border-[#253a5e] flex items-center justify-center flex-shrink-0">
          {selectedAirline && !isOtherSelected && selectedAirlineData?.image ? (
            <Image
              src={selectedAirlineData.image}
              alt={selectedAirlineData.label}
              width={112}
              height={112}
              className="object-contain w-full h-full"
            />
          ) : isOtherSelected ? (
            <div className="w-8 h-8 flex items-center justify-center text-blue-600">
              {FaPlane({ size: 32 })}
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-[#5c6f8a]">
              {FaPlane({ size: 32 })}
            </div>
          )}
        </div>
      </div>
    }>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-1">{t('airline')}</label>
          {isOtherSelected ? (
            <div className="flex gap-2">
              <select
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                value={selectedAirline}
                onChange={(e) => setValue("vuelo.airline", e.target.value)}
              >
                <option value="">{t('select_airline')}</option>
                {airlines.map((airline) => (
                  <option key={airline.value} value={airline.value}>
                    {airline.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                placeholder={t('airline_name')}
                value={data.vuelo?.other_airline || ""}
                onChange={(e) => setValue("vuelo.other_airline", e.target.value)}
              />
            </div>
          ) : (
            <select
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
              value={selectedAirline}
              onChange={(e) => setValue("vuelo.airline", e.target.value)}
            >
              <option value="">{t('select_airline')}</option>
              {airlines.map((airline) => (
                <option key={airline.value} value={airline.value}>
                  {airline.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <SmartField label={t('base_fee')} name="vuelo.base_fee" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label={t('iva')} name="vuelo.iva" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <SmartField label={t('luggage')} name="vuelo.luggage_check" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label={t('airport_usage_right')} name="vuelo.airport_right_of_use" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label={t('suitcase_tax')} name="vuelo.suitcases_tax" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <PersonasWidget fieldPath="vuelo.num_personas" />
    </Card>
  );
}
