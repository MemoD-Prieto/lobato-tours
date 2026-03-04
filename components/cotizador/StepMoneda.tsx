import React, { useEffect } from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";

export function StepMoneda() {
  const { data, setValue } = useFormData();
  const isUsd = data.moneda?.dollar === true || data.moneda?.dollar === 1 || data.moneda?.dollar === "1";

  useEffect(() => {
    if (data.moneda?.dollar === undefined || data.moneda?.dollar === "" || data.moneda?.dollar === null) {
      setValue("moneda.dollar", 0);
    }
  }, [data.moneda?.dollar, setValue]);

  useEffect(() => {
    if (!isUsd) {
      setValue("moneda.exchange_rate", 1);
    }
  }, [isUsd, setValue]);

  return (
    <Card title={<h4 className="text-base font-semibold">Moneda</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField 
          label="Tipo de moneda" 
          name="moneda.dollar" 
          type="select"
          placeholderOption={false}
          options={[
            { label: "Pesos Mexicanos (MXN)", value: 0 },
            { label: "Dólares Americanos (USD)", value: 1 }
          ]}
        />
        <SmartField 
          label="Tipo de cambio" 
          name="moneda.exchange_rate" 
          type="currency" 
          prefix="$" 
          placeholder={isUsd ? "0.00" : "1.00"} 
          disabled={!isUsd}
          validate={isUsd ? (val) => (val === "" || val == null || Number(val) <= 0) ? "Requerido cuando la moneda es USD" : "" : undefined}
        />
      </div>
    </Card>
  );
}
