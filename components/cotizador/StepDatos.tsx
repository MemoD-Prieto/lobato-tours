import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepDatos() {
  return (
    <Card title={<h4 className="text-base font-semibold">Tarjeta de datos</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Proveedor / Plan" name="datos.proveedorPlan" placeholder="eSIM / Física, GB y días" />
        <SmartField label="Inicio" name="datos.inicio" type="date" />
        <SmartField label="Costo" name="datos.costo" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}
