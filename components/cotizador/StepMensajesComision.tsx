import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepMensajesComision() {
  return (
    <Card title={<h4 className="text-base font-semibold">Mensajes y Comisión</h4>}>
      <div className="grid grid-cols-1 gap-4">
        <SmartField 
          label="Mensaje de bienvenida" 
          name="cotizacion.greeting_message" 
          type="textarea" 
          placeholder="Mensaje personalizado para el cliente"
        />
        <SmartField 
          label="Mensaje de despedida" 
          name="cotizacion.goodbye_message" 
          type="textarea" 
          placeholder="Mensaje de despedida para el cliente"
        />
      </div>
      <div className="mt-4">
        <SmartField 
          label="Comisión (%)" 
          name="comision.porcentaje" 
          type="number" 
          placeholder="0" 
          min={0}
          max={100}
        />
      </div>
    </Card>
  );
}
