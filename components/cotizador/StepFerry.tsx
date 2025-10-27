import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepFerry() {
  return (
    <Card title={<h4 className="text-base font-semibold">Ferry</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Ruta" name="ferry.ruta" placeholder="Ej: Playa del Carmen - Cozumel" />
        <SmartField label="Precio por persona" name="ferry.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label="Horario" name="ferry.horario" placeholder="Ej: 8:00 AM, 2:00 PM" />
      </div>
    </Card>
  );
}
