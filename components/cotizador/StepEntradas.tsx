import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepEntradas() {
  return (
    <Card title={<h4 className="text-base font-semibold">Entradas</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Atracción" name="entradas.atraccion" placeholder="Ej: Chichen Itzá, Xcaret" />
        <SmartField label="Precio por persona" name="entradas.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
      <div className="mt-4">
        <SmartField label="Cantidad de personas" name="entradas.cantidad" type="number" placeholder="0" min={1} />
      </div>
    </Card>
  );
}
