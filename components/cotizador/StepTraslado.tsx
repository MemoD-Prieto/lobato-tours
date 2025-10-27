import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepTraslado() {
  return (
    <Card title={<h4 className="text-base font-semibold">Traslado</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Costo de traslado" name="cotizacion.transfers" type="currency" prefix="$" placeholder="0.00" />
        <SmartField label="Tipo de traslado" name="traslado.tipo" placeholder="Ej: Privado, Compartido" />
      </div>
    </Card>
  );
}
