import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";
import { FaShieldAlt } from "react-icons/fa";
import { PersonasWidget } from "./PersonasWidget";

export function StepSeguro() {
  const { t } = useTranslation();
  const { data, setValue } = useFormData();

  const insuranceCompanies = [
    { value: "euroamerican-assistance", label: "Euroamerican Assistance", image: "/assets/images/insurance/euroamerican-assistance.jpeg" },
    { value: "universal-assistance", label: "Universal Assistance", image: "/assets/images/insurance/universal-assistance.jpeg" },
    { value: "other", label: "Otro" }
  ];

  const selectedInsurance = data.seguro?.insurance_company || "";
  const isOtherSelected = selectedInsurance === "other";
  const selectedInsuranceData = insuranceCompanies.find(insurance => insurance.value === selectedInsurance);

  return (
    <Card title={
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">{t('insurance')}</h4>
        <div className="w-32 h-32 border rounded-lg p-2 bg-gray-50 dark:bg-[#253a5e] dark:border-[#253a5e] flex items-center justify-center flex-shrink-0">
          {selectedInsurance && !isOtherSelected && selectedInsuranceData?.image ? (
            <Image
              src={selectedInsuranceData.image}
              alt={selectedInsuranceData.label}
              width={112}
              height={112}
              className="object-contain w-full h-full"
            />
          ) : isOtherSelected ? (
            <div className="w-8 h-8 flex items-center justify-center text-blue-600">
              {FaShieldAlt({ size: 32 })}
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-[#5c6f8a]">
              {FaShieldAlt({ size: 32 })}
            </div>
          )}
        </div>
      </div>
    }>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-1">{t('insurance_company')}</label>
          {isOtherSelected ? (
            <div className="flex gap-2">
              <select
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                value={selectedInsurance}
                onChange={(e) => setValue("seguro.insurance_company", e.target.value)}
              >
                <option value="">{t('select_insurance')}</option>
                {insuranceCompanies.map((insurance) => (
                  <option key={insurance.value} value={insurance.value}>
                    {insurance.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
                placeholder={t('insurance_name')}
                value={data.seguro?.other_insurance_company || ""}
                onChange={(e) => setValue("seguro.other_insurance_company", e.target.value)}
              />
            </div>
          ) : (
            <select
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white"
              value={selectedInsurance}
              onChange={(e) => setValue("seguro.insurance_company", e.target.value)}
            >
              <option value="">{t('select_insurance')}</option>
              {insuranceCompanies.map((insurance) => (
                <option key={insurance.value} value={insurance.value}>
                  {insurance.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <SmartField label={t('cost')} name="seguro.costo" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label={t('insurance_type')} name="seguro.tipo" placeholder="Ej: Básico, Premium" />
      </div>
      <PersonasWidget fieldPath="seguro.num_personas" />
    </Card>
  );
}
