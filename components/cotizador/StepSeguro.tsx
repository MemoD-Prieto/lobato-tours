import React from "react";
import Image from "next/image";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";
import { FaShieldAlt } from "react-icons/fa";

export function StepSeguro() {
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
        <h4 className="text-base font-semibold">Seguro</h4>
        <div className="w-32 h-32 border rounded-lg p-2 bg-gray-50 flex items-center justify-center flex-shrink-0">
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
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              {FaShieldAlt({ size: 32 })}
            </div>
          )}
        </div>
      </div>
    }>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Compañía de seguros</label>
          {isOtherSelected ? (
            <div className="flex gap-2">
              <select 
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedInsurance}
                onChange={(e) => setValue("seguro.insurance_company", e.target.value)}
              >
                <option value="">Seleccione una compañía de seguros</option>
                {insuranceCompanies.map((insurance) => (
                  <option key={insurance.value} value={insurance.value}>
                    {insurance.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la compañía de seguros"
                value={data.seguro?.other_insurance_company || ""}
                onChange={(e) => setValue("seguro.other_insurance_company", e.target.value)}
              />
            </div>
          ) : (
            <select 
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedInsurance}
              onChange={(e) => setValue("seguro.insurance_company", e.target.value)}
            >
              <option value="">Seleccione una compañía de seguros</option>
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
        <SmartField label="Costo del seguro" name="cotizacion.insurance" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label="Tipo de seguro" name="seguro.tipo" placeholder="Ej: Básico, Premium" />
      </div>
    </Card>
  );
}
