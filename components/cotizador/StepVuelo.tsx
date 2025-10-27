import React from "react";
import Image from "next/image";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";
import { FaPlane } from "react-icons/fa";

export function StepVuelo() {
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
        <h4 className="text-base font-semibold">Vuelo</h4>
        <div className="w-32 h-32 border rounded-lg p-2 bg-gray-50 flex items-center justify-center flex-shrink-0">
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
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              {FaPlane({ size: 32 })}
            </div>
          )}
        </div>
      </div>
    }>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aerolínea</label>
          {isOtherSelected ? (
            <div className="flex gap-2">
              <select 
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedAirline}
                onChange={(e) => setValue("vuelo.airline", e.target.value)}
              >
                <option value="">Seleccione una aerolínea</option>
                {airlines.map((airline) => (
                  <option key={airline.value} value={airline.value}>
                    {airline.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="w-1/2 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la aerolínea"
                value={data.vuelo?.other_airline || ""}
                onChange={(e) => setValue("vuelo.other_airline", e.target.value)}
              />
            </div>
          ) : (
            <select 
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedAirline}
              onChange={(e) => setValue("vuelo.airline", e.target.value)}
            >
              <option value="">Seleccione una aerolínea</option>
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
        <SmartField label="Tarifa base" name="vuelo.base_fee" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label="IVA" name="vuelo.iva" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <SmartField label="Equipaje" name="vuelo.luggage_check" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label="Derecho de uso aeropuerto" name="vuelo.airport_right_of_use" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label="Impuesto maletas" name="vuelo.suitcases_tax" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}
