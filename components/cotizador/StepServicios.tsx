import React from "react";
import { Card } from "./Card";
import { useTranslation } from "react-i18next";

type ServiceKey = "paquete" | "vuelo" | "hotel" | "traslado" | "crucero" | "entradas" | "ferry" | "seguro" | "datos" | "visa";

type StepServiciosProps = {
  selected: Set<ServiceKey>;
  toggle: (k: ServiceKey) => void;
};

export function StepServicios({ selected, toggle }: StepServiciosProps) {
  const { t } = useTranslation();

  const services: { key: ServiceKey; label: string; description: string }[] = [
    { key: "paquete",  label: t('svc_package'),   description: t('svc_package_desc') },
    { key: "vuelo",    label: t('svc_flight'),     description: t('svc_flight_desc') },
    { key: "hotel",    label: t('svc_hotel'),      description: t('svc_hotel_desc') },
    { key: "traslado", label: t('svc_transfer'),   description: t('svc_transfer_desc') },
    { key: "crucero",  label: t('svc_cruise'),     description: t('svc_cruise_desc') },
    { key: "entradas", label: t('svc_tickets'),    description: t('svc_tickets_desc') },
    { key: "ferry",    label: t('svc_ferry'),      description: t('svc_ferry_desc') },
    { key: "seguro",   label: t('svc_insurance'),  description: t('svc_insurance_desc') },
    { key: "datos",    label: t('svc_data'),       description: t('svc_data_desc') },
    { key: "visa",     label: t('svc_visa'),       description: t('svc_visa_desc') },
  ];

  return (
    <Card title={<h4 className="text-base font-semibold">{t('services_title')}</h4>}>
      <p className="text-sm text-gray-600 dark:text-[#888ea8] mb-4">{t('services_subtitle')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.key}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selected.has(service.key)
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                : "border-gray-200 dark:border-[#1b2e4b] hover:border-gray-300 dark:hover:border-[#253a5e]"
            }`}
            onClick={() => toggle(service.key)}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selected.has(service.key)}
                onChange={() => toggle(service.key)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">{service.label}</h5>
                <p className="text-xs text-gray-500 dark:text-[#888ea8]">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
