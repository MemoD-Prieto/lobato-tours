import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepVisa() {
  return (
    <Card title={<h4 className="text-base font-semibold">Visa</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="País destino" name="visa.pais" placeholder="Ej: Estados Unidos, Canadá" />
        <SmartField label="Costo por persona" name="visa.costo" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label="Tiempo de procesamiento" name="visa.tiempo" placeholder="Ej: 15 días hábiles" />
      </div>
    </Card>
  );
}
