import React from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";

export function StepMoneda() {
  return (
    <Card title={<h4 className="text-base font-semibold">Moneda</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField 
          label="Tipo de moneda" 
          name="moneda.dollar" 
          type="select"
          options={[
            { label: "Pesos Mexicanos", value: false },
            { label: "Dólares Americanos", value: true }
          ]}
        />
        <SmartField 
          label="Tipo de cambio" 
          name="moneda.exchange_rate" 
          type="currency" 
          prefix="$" 
          placeholder="0.00" 
        />
      </div>
    </Card>
  );
}
