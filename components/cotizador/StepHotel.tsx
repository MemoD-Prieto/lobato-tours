import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepHotel() {
  return (
    <Card title={<h4 className="text-base font-semibold">Hotel</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Nombre del hotel" name="hoteles[0].name" placeholder="Ej: Hotel Paradise" />
        <SmartField label="Noches" name="hoteles[0].nights" type="number" placeholder="0" min={0} />
      </div>
      
      <div className="mt-6">
        <h5 className="text-sm font-semibold mb-3">Distribución de habitaciones</h5>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-red-600 hover:text-red-900" type="button" disabled>
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
