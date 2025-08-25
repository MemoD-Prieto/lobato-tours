import React, { useMemo, useState, useCallback } from "react";
import {
  AiOutlineUser,
  AiOutlineDollar,
  AiOutlineCheck,
  AiOutlineCar,
  AiOutlineRead,
  AiOutlineFileDone,
  AiOutlineSafety,
  AiOutlineCreditCard,
  AiOutlinePlusSquare,
  AiOutlineMinusSquare,
  AiOutlineTags,
  AiOutlineWifi,
} from "react-icons/ai";

import { TbSpeedboat } from "react-icons/tb";
import { MdOutlineDirectionsBoat } from "react-icons/md";

// ---------------------------------------------
// Basic building blocks
// ---------------------------------------------
const StepIcon: React.FC<{
  active: boolean;
  label: string;
  Icon: any;
  onClick: () => void;
}> = ({ active, label, Icon, onClick }) => (
  <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
    <div
      className={`w-14 h-14 flex items-center justify-center rounded-full border-2 transition-colors duration-200 ${
        active ? "border-blue-600" : "border-gray-300"
      }`}
    >
      <Icon size={28} className={active ? "text-blue-600" : "text-gray-400"} />
    </div>
    <span className={`text-[11px] mt-1 ${active ? "text-blue-600" : "text-gray-400"}`}>{label}</span>
  </div>
);

const Card: React.FC<{ title?: React.ReactNode; children: React.ReactNode }>
 = ({ title, children }) => (
  <div className="mb-3 border rounded-lg bg-white">
    {title && (
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">{title}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

// ---------------------------------------------
// Step: Cliente (kept single-source – don’t re-ask later)
// ---------------------------------------------
function StepCliente() {
  return (
    <Card title={<h4 className="text-base font-semibold">Cliente</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name-1" className="block text-sm font-medium">Nombre</label>
          <input id="name-1" className="mt-1 w-full border rounded p-2" placeholder="Nombre Apellido(s)" />
        </div>
        <div>
          <label htmlFor="contact-1" className="block text-sm font-medium">Contacto</label>
          <input id="contact-1" className="mt-1 w-full border rounded p-2" placeholder="Correo, tel, whatsapp, etc." />
        </div>
        <div>
          <label htmlFor="contact2-1" className="block text-sm font-medium">Contacto 2</label>
          <input id="contact2-1" className="mt-1 w-full border rounded p-2" placeholder="Correo, tel, whatsapp, etc." />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-semibold">Personas</h5>
          <button className="text-sm text-blue-600 hover:underline" type="button">Agregar persona</button>
        </div>
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr className="grid grid-cols-12">
                <th className="col-span-4 p-2 text-left">#</th>
                <th className="col-span-4 p-2 text-left">Edad</th>
                <th className="col-span-4 p-2" />
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-12 border-t">
                <td className="col-span-4 p-2">1</td>
                <td className="col-span-4 p-2">
                  <select className="w-full border rounded p-2">
                    <option>Rango de edad</option>
                    <option>0-2 años</option>
                    <option>3-4 años</option>
                    <option>5-12 años</option>
                    <option>13 o más años</option>
                  </select>
                </td>
                <td className="col-span-4 p-2 text-right">
                  <button className="px-2 py-1 text-sm border rounded" disabled>Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------
// Step: Moneda
// ---------------------------------------------
function StepMoneda() {
  return (
    <Card title={<h4 className="text-base font-semibold">Moneda</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="currencyType">Tipo de moneda</label>
          <select id="currencyType" className="mt-1 w-full border rounded p-2">
            <option>Seleccione moneda</option>
            <option>Moneda nacional</option>
            <option>Dólar estadounidense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="exchangeRate">Tipo de cambio</label>
          <input id="exchangeRate" type="number" className="mt-1 w-full border rounded p-2" placeholder="0.00" />
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------
// Service picker (new first step after Cliente/Moneda)
// ---------------------------------------------
const ALL_SERVICES = [
  { key: "vuelo", label: "Vuelo", Icon: AiOutlineCar },
  { key: "hotel", label: "Hotel", Icon: AiOutlineFileDone },
  { key: "traslado", label: "Traslado", Icon: AiOutlineTags },
  { key: "crucero", label: "Crucero", Icon: MdOutlineDirectionsBoat },
  { key: "paquete", label: "Paquete", Icon: AiOutlineRead },
  { key: "entradas", label: "Entradas", Icon: AiOutlineTags },
  { key: "ferry", label: "Ferry", Icon: TbSpeedboat },
  { key: "seguro", label: "Seguro", Icon: AiOutlineSafety },
  { key: "datos", label: "Tarjeta de datos", Icon: AiOutlineWifi },
  { key: "visa", label: "Visa", Icon: AiOutlineCreditCard },
] as const;

type ServiceKey = typeof ALL_SERVICES[number]["key"];

function StepServicios({ selected, toggle }: { selected: Set<ServiceKey>; toggle: (k: ServiceKey) => void }) {
  return (
    <Card title={<h4 className="text-base font-semibold">Servicios</h4>}>
      <p className="text-sm text-gray-600 mb-3">Selecciona uno o varios servicios para esta cotización.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_SERVICES.map(({ key, label, Icon }) => {
          const active = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex flex-col items-center gap-2 border rounded-lg p-3 transition ${
                active ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={28} className={active ? "text-blue-700" : "text-gray-500"} />}
              <span className={`text-sm ${active ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
              <span className="text-xs text-gray-500">{active ? "Seleccionado" : "Agregar"}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// ---------------------------------------------
// Individual service steps (kept minimal; no duplicated fields)
// ---------------------------------------------
function StepPaquete() {
  return (
    <Card title={<h4 className="text-base font-semibold">Paquete</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="travel">Destino</label>
          <input id="travel" className="mt-1 w-full border rounded p-2" placeholder="Tijuana" />
          <div className="mt-4">
            <label className="block text-sm font-medium" htmlFor="travelBegin">Viaje inicia</label>
            <input id="travelBegin" type="date" className="mt-1 w-full border rounded p-2" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium" htmlFor="travelEnds">Viaje termina</label>
            <input id="travelEnds" type="date" className="mt-1 w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="packageName">Nombre del paquete</label>
          <input id="packageName" className="mt-1 w-full border rounded p-2" placeholder="Paquete ..." />
          <div className="mt-4">
            <label className="block text-sm font-medium" htmlFor="packagePrice">Precio del paquete (por persona)</label>
            <div className="mt-1 flex">
              <input id="packagePrice" type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
              <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="packageDescription">Detalle del paquete</label>
          <textarea id="packageDescription" rows={5} className="mt-1 w-full border rounded p-2" placeholder="Paquete a un lugar..." />
        </div>
      </div>
    </Card>
  );
}

function StepVuelo() {
  return (
    <Card title={<h4 className="text-base font-semibold">Vuelo</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{id:"base-fee-1",label:"Tarifa base"},{id:"iva-fee-1",label:"IVA"},{id:"luggage-check-1",label:"Revisión de maletas"},{id:"airport-right-of-use-1",label:"Derecho uso aeropuerto"},{id:"suitcases-tax-1",label:"Impuesto de maletas"}].map((f)=> (
          <div key={f.id}>
            <label className="block text-sm font-medium" htmlFor={f.id}>{f.label}</label>
            <div className="mt-1 flex">
              <input id={f.id} type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
              <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StepHotel() {
  return (
    <Card title={<h4 className="text-base font-semibold">Hotel</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="hotel-name-1">Nombre</label>
          <input id="hotel-name-1" className="mt-1 w-full border rounded p-2" placeholder="Hotel..." />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="nights-1">Número de noches</label>
          <input id="nights-1" type="number" className="mt-1 w-full border rounded p-2" placeholder="0" />
        </div>
      </div>

      <div className="mt-6">
        <h5 className="text-sm font-semibold mb-2">Habitaciones</h5>
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr className="grid grid-cols-12">
                <th className="col-span-1 p-2 text-left">#</th>
                <th className="col-span-4 p-2 text-left">Tipo</th>
                <th className="col-span-2 p-2 text-left">Personas</th>
                <th className="col-span-2 p-2 text-left">Precio</th>
                <th className="col-span-2 p-2 text-left">IVA</th>
                <th className="col-span-1 p-2" />
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-12 border-t">
                <td className="col-span-1 p-2">1</td>
                <td className="col-span-4 p-2">
                  <select className="w-full border rounded p-2">
                    <option>Tipo de habitación</option>
                    <option>Single</option>
                    <option>Doble</option>
                    <option>Triple</option>
                    <option>Cuádruple</option>
                    <option>Otro</option>
                  </select>
                </td>
                <td className="col-span-2 p-2"><input className="w-full border rounded p-2" type="number" min={1} /></td>
                <td className="col-span-2 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-2 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-1 p-2 text-right"><button className="px-2 py-1 text-sm border rounded">Eliminar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h5 className="text-sm font-semibold mb-2">Comidas</h5>
        <div className="overflow-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr className="grid grid-cols-12">
                <th className="col-span-1 p-2 text-left">#</th>
                <th className="col-span-3 p-2 text-left">Desayuno</th>
                <th className="col-span-2 p-2 text-left">IVA desayuno</th>
                <th className="col-span-3 p-2 text-left">Cena</th>
                <th className="col-span-2 p-2 text-left">IVA cena</th>
                <th className="col-span-1 p-2" />
              </tr>
            </thead>
            <tbody>
              <tr className="grid grid-cols-12 border-t">
                <td className="col-span-1 p-2">1</td>
                <td className="col-span-3 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-2 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-3 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-2 p-2"><input className="w-full border rounded p-2" type="number" /></td>
                <td className="col-span-1 p-2 text-right"><button className="px-2 py-1 text-sm border rounded">Eliminar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function StepTraslado() {
  return (
    <Card title={<h4 className="text-base font-semibold">Traslado</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Origen</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Aeropuerto / Hotel" />
        </div>
        <div>
          <label className="block text-sm font-medium">Destino</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Hotel / Puerto / Sitio" />
        </div>
        <div>
          <label className="block text-sm font-medium">Precio</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepCrucero() {
  return (
    <Card title={<h4 className="text-base font-semibold">Crucero</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Naviera / Barco</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Nombre del barco" />
        </div>
        <div>
          <label className="block text-sm font-medium">Itinerario</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Puertos / Rutas" />
        </div>
        <div>
          <label className="block text-sm font-medium">Cabina</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Interior / Vista mar / Balcón" />
        </div>
      </div>
    </Card>
  );
}

function StepEntradas() {
  return (
    <Card title={<h4 className="text-base font-semibold">Entradas</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Evento / Lugar</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Parque, concierto, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input type="date" className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Costo por persona</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepFerry() {
  return (
    <Card title={<h4 className="text-base font-semibold">Ferry</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Ruta</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Origen - Destino" />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input type="date" className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Precio</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepSeguro() {
  return (
    <Card title={<h4 className="text-base font-semibold">Seguro</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Cobertura</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Básica / Ampliada" />
        </div>
        <div>
          <label className="block text-sm font-medium">Días</label>
          <input type="number" className="mt-1 w-full border rounded p-2" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium">Costo total</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepDatos() {
  return (
    <Card title={<h4 className="text-base font-semibold">Tarjeta de datos</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Proveedor / Plan</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="eSIM / Física, GB y días" />
        </div>
        <div>
          <label className="block text-sm font-medium">Inicio</label>
          <input type="date" className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Costo</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepVisa() {
  return (
    <Card title={<h4 className="text-base font-semibold">Visa</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">País</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Estados Unidos, Canadá, etc." />
        </div>
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <input className="mt-1 w-full border rounded p-2" placeholder="Turismo / Negocios" />
        </div>
        <div>
          <label className="block text-sm font-medium">Tarifa</label>
          <div className="mt-1 flex">
            <input type="number" className="w-full border rounded-l p-2" placeholder="0.00" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">$</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function StepMensajesComision() {
  return (
    <>
      <Card title={<h4 className="text-base font-semibold">Mensajes</h4>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium" htmlFor="greetingMessage">Mensaje de saludo</label>
            <textarea id="greetingMessage" className="mt-1 w-full border rounded p-2" rows={5} placeholder="Mensaje" />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="goodbyeMessage">Mensaje de despedida</label>
            <textarea id="goodbyeMessage" className="mt-1 w-full border rounded p-2" rows={5} placeholder="Mensaje" />
          </div>
        </div>
      </Card>

      <Card title={<h4 className="text-base font-semibold">Comisión</h4>}>
        <div className="max-w-xs">
          <label className="block text-sm font-medium" htmlFor="commissionPercentage">Porcentaje de comisión</label>
          <div className="mt-1 flex">
            <input id="commissionPercentage" type="number" className="w-full border rounded-l p-2" placeholder="10" />
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">%</span>
          </div>
        </div>
      </Card>
    </>
  );
}

function StepResumen() {
  return (
    <Card title={<h4 className="text-base font-semibold">Resumen</h4>}>
      <p className="text-sm text-gray-600">Aquí presentarías un resumen de la cotización antes de generar el documento o enviar.</p>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 border rounded">Descargar vista previa</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded">Generar cotización</button>
      </div>
    </Card>
  );
}

// ---------------------------------------------
// Main Wizard with dynamic steps based on selected services
// ---------------------------------------------
export default function NeutralStepperQuoteWizard() {
  // Base steps always present first to avoid duplication of fields later
  const BASE_STEPS = useMemo(
    () => [
      { key: "cliente", label: "Cliente", Icon: AiOutlineUser, content: <StepCliente /> },
      { key: "moneda", label: "Moneda", Icon: AiOutlineDollar, content: <StepMoneda /> },
      { key: "servicios", label: "Servicios", Icon: AiOutlinePlusSquare, content: null },
    ],
    []
  );

  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<Set<ServiceKey>>(new Set());

  const toggleService = useCallback((k: ServiceKey) => {
    setSelectedServices((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  }, []);

  // Build dynamic service steps in a fixed, sensible order
  const serviceSteps = useMemo(() => {
    const order: { key: ServiceKey; label: string; Icon: any; node: React.ReactNode }[] = [];
    const add = (key: ServiceKey, label: string, Icon: any, node: React.ReactNode) => {
      if (selectedServices.has(key)) order.push({ key, label, Icon, node });
    };
    add("paquete", "Paquete", AiOutlineRead, <StepPaquete />);
    add("vuelo", "Vuelo", AiOutlineCar, <StepVuelo />);
    add("hotel", "Hotel", AiOutlineFileDone, <StepHotel />);
    add("traslado", "Traslado", AiOutlineTags, <StepTraslado />);
    add("crucero", "Crucero", MdOutlineDirectionsBoat, <StepCrucero />);
    add("entradas", "Entradas", AiOutlineTags, <StepEntradas />);
    add("ferry", "Ferry", TbSpeedboat, <StepFerry />);
    add("seguro", "Seguro", AiOutlineSafety, <StepSeguro />);
    add("datos", "Datos", AiOutlineWifi, <StepDatos />);
    add("visa", "Visa", AiOutlineCreditCard, <StepVisa />);
    return order.map((o) => ({ key: o.key, label: o.label, Icon: o.Icon, content: o.node }));
  }, [selectedServices]);

  const tailSteps = useMemo(
    () => [
      { key: "mensajes", label: "Mensajes/Comisión", Icon: AiOutlineFileDone, content: <StepMensajesComision /> },
      { key: "resumen", label: "Resumen", Icon: AiOutlineCheck, content: <StepResumen /> },
    ],
    []
  );

  // Inject the live services picker step content
  const servicesPickerStepContent = (
    <StepServicios selected={selectedServices} toggle={toggleService} />
  );

  // Final steps array
  const steps = useMemo(() => {
    const merged = [...BASE_STEPS, ...serviceSteps, ...tailSteps];
    // attach the live content for the servicios key
    const idx = merged.findIndex((s) => s.key === "servicios");
    if (idx !== -1) merged[idx] = { ...merged[idx], content: servicesPickerStepContent };
    return merged;
  }, [BASE_STEPS, serviceSteps, tailSteps, servicesPickerStepContent]);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, steps.length - 1)), [steps.length]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-1">Asistente de Cotización</h1>
        <h2 className="text-lg text-center text-gray-600 mb-4">Paso {step + 1} de {steps.length}</h2>

        {/* Stepper header */}
        <div className="mb-6 flex items-start justify-center w-full">
          {steps.map(({ Icon, label }, i) => (
            <React.Fragment key={i}>
              <StepIcon active={i <= step} Icon={Icon} label={label} onClick={() => setStep(i)} />
              {i < steps.length - 1 && (
                <div className={`self-start mt-7 flex-1 h-1 rounded mx-2 ${i < step ? "bg-blue-600" : "bg-gray-300"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="h-[45vh] flex flex-col transition-all duration-300 overflow-auto pr-1">
          {steps[step].content}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 flex justify-between">
          <button onClick={prev} disabled={step === 0} className="px-4 py-2 border rounded disabled:opacity-50">Back</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded">Guardar borrador</button>
            {step < steps.length - 1 ? (
              <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">Next</button>
            ) : (
              <button className="px-4 py-2 bg-green-600 text-white rounded">Finalizar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}