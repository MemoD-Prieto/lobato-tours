import React from "react";
import { Card } from "./Card";

type ServiceKey = "paquete" | "vuelo" | "hotel" | "traslado" | "crucero" | "entradas" | "ferry" | "seguro" | "datos" | "visa";

type StepServiciosProps = {
  selected: Set<ServiceKey>;
  toggle: (k: ServiceKey) => void;
};

export function StepServicios({ selected, toggle }: StepServiciosProps) {
  const services: { key: ServiceKey; label: string; description: string }[] = [
    { key: "paquete", label: "Paquete", description: "Paquetes turísticos completos" },
    { key: "vuelo", label: "Vuelo", description: "Reservaciones de vuelos" },
    { key: "hotel", label: "Hotel", description: "Reservaciones de hoteles" },
    { key: "traslado", label: "Traslado", description: "Transporte terrestre" },
    { key: "crucero", label: "Crucero", description: "Cruceros y viajes marítimos" },
    { key: "entradas", label: "Entradas", description: "Entradas a atracciones" },
    { key: "ferry", label: "Ferry", description: "Transporte marítimo" },
    { key: "seguro", label: "Seguro", description: "Seguros de viaje" },
    { key: "datos", label: "Datos", description: "Planes de datos móviles" },
    { key: "visa", label: "Visa", description: "Trámites de visa" }
  ];

  return (
    <Card title={<h4 className="text-base font-semibold">Servicios</h4>}>
      <p className="text-sm text-gray-600 mb-4">Selecciona los servicios que deseas incluir en la cotización:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div
            key={service.key}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selected.has(service.key)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
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
                <h5 className="text-sm font-medium text-gray-900">{service.label}</h5>
                <p className="text-xs text-gray-500">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
