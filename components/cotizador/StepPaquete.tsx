import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepPaquete() {
  return (
    <Card title={<h4 className="text-base font-semibold">Paquete</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Nombre del paquete" name="viaje.package_name" placeholder="Ej: Paquete Cancún 5 días" />
        <SmartField label="Precio del paquete" name="viaje.package_price" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField 
          label="Descripción del paquete" 
          name="viaje.package_description" 
          type="textarea" 
          placeholder="Describe los servicios incluidos en el paquete"
        />
      </div>
    </Card>
  );
}
