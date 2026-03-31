import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";

export function StepMoneda() {
  const { t } = useTranslation();
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
    <Card title={<h4 className="text-base font-semibold">{t('currency_step')}</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField
          label={t('currency_type')}
          name="moneda.dollar"
          type="select"
          placeholderOption={false}
          options={[
            { label: t('mexican_pesos'), value: 0 },
            { label: t('us_dollars'), value: 1 }
          ]}
        />
        <SmartField
          label={t('exchange_rate')}
          name="moneda.exchange_rate"
          type="currency"
          prefix="$"
          placeholder={isUsd ? "0.00" : "1.00"}
          disabled={!isUsd}
          validate={isUsd ? (val) => (val === "" || val == null || Number(val) <= 0) ? t('required_when_usd') : "" : undefined}
        />
      </div>
    </Card>
  );
}
