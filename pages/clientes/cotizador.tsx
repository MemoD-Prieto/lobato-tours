import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  AiOutlineTags,
  AiOutlineWifi,
} from "react-icons/ai";
import { TbSpeedboat } from "react-icons/tb";
import { MdOutlineDirectionsBoat } from "react-icons/md";

// =====================================================
// 1) Tiny form store (context) + helpers (get/set by path)
// =====================================================

type FormCtxType = {
  data: any;
  setValue: (path: string, value: any) => void;
};

const FormCtx = React.createContext<FormCtxType | null>(null);

function normalizePath(path: string): string[] {
  // Converts paths like "hotel.habitaciones[0].precio" -> ["hotel","habitaciones","0","precio"]
  return path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
}

function getIn(obj: any, path: string, fallback?: any) {
  const parts = normalizePath(path);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return fallback;
    cur = cur[p];
  }
  return cur === undefined ? fallback : cur;
}

function setIn(obj: any, path: string, value: any) {
  const parts = normalizePath(path);
  const next = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur: any = next;
  parts.forEach((key, idx) => {
    const isLast = idx === parts.length - 1;
    const nextKeyIsIndex = !isNaN(Number(parts[idx + 1]));

    if (isLast) {
      cur[key] = value;
      return;
    }
    if (cur[key] == null) {
      // create object or array depending on next token
      cur[key] = nextKeyIsIndex ? [] : {};
    } else {
      // clone to avoid mutating nested references
      cur[key] = Array.isArray(cur[key]) ? [...cur[key]] : { ...cur[key] };
    }
    cur = cur[key];
  });
  return next;
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>({});

  const setValue = useCallback((path: string, value: any) => {
    setData((prev: any) => setIn(prev ?? {}, path, value));
  }, []);

  const value = useMemo(() => ({ data, setValue }), [data, setValue]);
  return <FormCtx.Provider value={value}>{children}</FormCtx.Provider>;
}

export function useFormData() {
  const ctx = useContext(FormCtx);
  if (!ctx) throw new Error("useFormData must be used within <FormProvider>");
  return ctx;
}

// =====================================================
// 2) SmartField — one component for label + input + saving
// =====================================================

type Option = { label: string; value: string | number };

type SmartFieldProps = {
  label: string;
  name: string; // dot/bracket path — e.g. "cliente.nombre" or "hotel.habitaciones[0].precio"
  type?: "text" | "number" | "date" | "textarea" | "select" | "currency";
  options?: Option[]; // only for select
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number | string;
  validate?: (value: any) => string | "";
  autoComplete?: string;
  disabled?: boolean;
};

export function SmartField({
  label,
  name,
  type = "text",
  options,
  placeholder,
  className,
  inputClassName,
  prefix,
  suffix,
  min,
  max,
  step,
  validate,
  autoComplete,
  disabled,
}: SmartFieldProps) {
  const { data, setValue } = useFormData();
  const val = getIn(data, name, type === "number" || type === "currency" ? "" : "");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!validate) return;
    setErr(validate(val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const raw = e.target.value;
    let parsed: any = raw;

    if (type === "number" || type === "currency") {
      parsed = raw === "" ? "" : Number(raw);
      if (Number.isNaN(parsed)) parsed = "";
    }
    setValue(name, parsed);
  };

  const field = (() => {
    const common = {
      id: name,
      value: val ?? "",
      onChange,
      placeholder,
      className: `mt-1 w-full border rounded p-2 ${inputClassName ?? ""} ${err ? "border-red-500" : ""}`.trim(),
      autoComplete,
      disabled,
    } as const;

    if (type === "textarea") return <textarea rows={5} {...common} />;
    if (type === "select")
      return (
        <select {...common as any}>
          <option value="">Seleccione una opción</option>
          {options?.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );

    const inputType = type === "currency" ? "number" : type;
    return <input type={inputType} min={min} max={max} step={step} {...(common as any)} />;
  })();

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      {prefix || suffix ? (
        <div className="mt-1 flex">
          {prefix ? (
            <span className="inline-flex items-center px-3 border rounded-l bg-gray-50">{prefix}</span>
          ) : null}
          {React.cloneElement(field as any, {
            className: `w-full border ${prefix ? "rounded-none" : "rounded-l"} ${suffix ? "rounded-none" : "rounded-r"} p-2 ${err ? "border-red-500" : ""} ${inputClassName ?? ""}`.trim(),
          })}
          {suffix ? (
            <span className="inline-flex items-center px-3 border border-l-0 rounded-r bg-gray-50">{suffix}</span>
          ) : null}
        </div>
      ) : (
        <div className="mt-1">{field}</div>
      )}
      {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}

// =====================================================
// 3) Basic Card + StepIcon
// =====================================================

const Card: React.FC<{ title?: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-3 border rounded-lg bg-white">
    {title && (
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">{title}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

const StepIcon: React.FC<{
  active: boolean;
  label: string;
  Icon: any;
  onClick: () => void;
}> = ({ active, label, Icon, onClick }) => (
  <div className="flex shrink-0 w-24 flex-col items-center cursor-pointer" onClick={onClick}>
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

// =====================================================
// 4) Validation example
// =====================================================

const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]+$/;
const validateOptionalName = (v: string) => {
  if (!v) return "";
  return NAME_REGEX.test(v)
    ? ""
    : "Solo letras, espacios, apóstrofes y guiones. Sin números ni símbolos (%$#@, etc.).";
};

// =====================================================
// 5) Steps (refactored using <SmartField />)
// =====================================================

function StepCliente() {
  return (
    <Card title={<h4 className="text-base font-semibold">Cliente</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Nombre" name="cliente.nombre" placeholder="Nombre Apellido(s)" autoComplete="name" validate={validateOptionalName} />
        <SmartField label="Contacto" name="cliente.contacto1" placeholder="Correo, tel, whatsapp, etc." autoComplete="email" />
        <SmartField label="Contacto 2" name="cliente.contacto2" placeholder="Correo, tel, whatsapp, etc." />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-semibold">Personas</h5>
          <button className="text-sm text-blue-600 hover:underline" type="button" disabled>
            Agregar persona (demo)
          </button>
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
                  <SmartField
                    type="select"
                    label=""
                    name="cliente.personas[0].edadRango"
                    options={[
                      { label: "Rango de edad", value: "" },
                      { label: "0-2 años", value: "0-2" },
                      { label: "3-4 años", value: "3-4" },
                      { label: "5-12 años", value: "5-12" },
                      { label: "13 o más años", value: "13+" },
                    ]}
                    inputClassName="!p-2"
                  />
                </td>
                <td className="col-span-4 p-2 text-right">
                  <button className="px-2 py-1 text-sm border rounded" disabled>
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function StepMoneda() {
  return (
    <Card title={<h4 className="text-base font-semibold">Moneda</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField
          label="Tipo de moneda"
          name="moneda.tipo"
          type="select"
          options={[
            { label: "Seleccione moneda", value: "" },
            { label: "Moneda nacional", value: "mxn" },
            { label: "Dólar estadounidense", value: "usd" },
          ]}
        />
        <SmartField label="Tipo de cambio" name="moneda.tipoCambio" type="number" placeholder="0.00" min={0} />
      </div>
    </Card>
  );
}

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

type ServiceKey = (typeof ALL_SERVICES)[number]["key"];

function StepServicios({ selected, toggle }: { selected: Set<ServiceKey>; toggle: (k: ServiceKey) => void }) {
  return (
    <Card title={<h4 className="text-base font-semibold">Servicios</h4>}>
      <p className="text-sm text-gray-600 mb-3">Selecciona uno o varios servicios para esta cotización.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_SERVICES.map(({ key, label, Icon }: { key: ServiceKey; label: string; Icon: any}) => {
          const active = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-2 border rounded-lg p-3 transition ${
                active ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={28} className={active ? "text-blue-700" : "text-gray-500"} />
              <span className={`text-sm ${active ? "text-blue-700" : "text-gray-700"}`}>{label}</span>
              <span className="text-xs text-gray-500">{active ? "Seleccionado" : "Agregar"}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function StepPaquete() {
  return (
    <Card title={<h4 className="text-base font-semibold">Paquete</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SmartField label="Destino" name="paquete.destino" placeholder="Tijuana" />
          <SmartField label="Viaje inicia" name="paquete.inicio" type="date" className="mt-4" />
          <SmartField label="Viaje termina" name="paquete.fin" type="date" className="mt-4" />
        </div>
        <div>
          <SmartField label="Nombre del paquete" name="paquete.nombre" placeholder="Paquete ..." />
          <SmartField
            label="Precio del paquete (por persona)"
            name="paquete.precioPorPersona"
            type="currency"
            placeholder="0.00"
            prefix={"$"}
            className="mt-4"
            min={0}
          />
        </div>
        <div>
          <SmartField label="Detalle del paquete" name="paquete.detalle" type="textarea" placeholder="Paquete a un lugar..." />
        </div>
      </div>
    </Card>
  );
}

function StepVuelo() {
  const fields = [
    { name: "vuelo.tarifaBase", label: "Tarifa base" },
    { name: "vuelo.iva", label: "IVA" },
    { name: "vuelo.revisionMaletas", label: "Revisión de maletas" },
    { name: "vuelo.derechoAeropuerto", label: "Derecho uso aeropuerto" },
    { name: "vuelo.impuestoMaletas", label: "Impuesto de maletas" },
  ];
  return (
    <Card title={<h4 className="text-base font-semibold">Vuelo</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((f) => (
          <SmartField key={f.name} label={f.label} name={f.name} type="currency" placeholder="0.00" prefix="$" />
        ))}
      </div>
    </Card>
  );
}

function StepHotel() {
  return (
    <Card title={<h4 className="text-base font-semibold">Hotel</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SmartField label="Nombre" name="hotel.nombre" placeholder="Hotel..." />
        <SmartField label="Número de noches" name="hotel.noches" type="number" placeholder="0" min={0} />
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
                  <SmartField
                    label=""
                    type="select"
                    name="hotel.habitaciones[0].tipo"
                    options={[
                      { label: "Tipo de habitación", value: "" },
                      { label: "Single", value: "single" },
                      { label: "Doble", value: "doble" },
                      { label: "Triple", value: "triple" },
                      { label: "Cuádruple", value: "cuadruple" },
                      { label: "Otro", value: "otro" },
                    ]}
                    inputClassName="!p-2"
                  />
                </td>
                <td className="col-span-2 p-2">
                  <SmartField label="" name="hotel.habitaciones[0].personas" type="number" min={1} inputClassName="!p-2" />
                </td>
                <td className="col-span-2 p-2">
                  <SmartField label="" name="hotel.habitaciones[0].precio" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-2 p-2">
                  <SmartField label="" name="hotel.habitaciones[0].iva" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-1 p-2 text-right">
                  <button className="px-2 py-1 text-sm border rounded" disabled>
                    Eliminar
                  </button>
                </td>
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
                <td className="col-span-3 p-2">
                  <SmartField label="" name="hotel.comidas[0].desayuno" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-2 p-2">
                  <SmartField label="" name="hotel.comidas[0].ivaDesayuno" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-3 p-2">
                  <SmartField label="" name="hotel.comidas[0].cena" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-2 p-2">
                  <SmartField label="" name="hotel.comidas[0].ivaCena" type="currency" prefix="$" inputClassName="!p-2" />
                </td>
                <td className="col-span-1 p-2 text-right">
                  <button className="px-2 py-1 text-sm border rounded" disabled>
                    Eliminar
                  </button>
                </td>
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
        <SmartField label="Origen" name="traslado.origen" placeholder="Aeropuerto / Hotel" />
        <SmartField label="Destino" name="traslado.destino" placeholder="Hotel / Puerto / Sitio" />
        <SmartField label="Precio" name="traslado.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}

function StepCrucero() {
  return (
    <Card title={<h4 className="text-base font-semibold">Crucero</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Naviera / Barco" name="crucero.naviera" placeholder="Nombre del barco" />
        <SmartField label="Itinerario" name="crucero.itinerario" placeholder="Puertos / Rutas" />
        <SmartField label="Cabina" name="crucero.cabina" placeholder="Interior / Vista mar / Balcón" />
      </div>
    </Card>
  );
}

function StepEntradas() {
  return (
    <Card title={<h4 className="text-base font-semibold">Entradas</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Evento / Lugar" name="entradas.evento" placeholder="Parque, concierto, etc." />
        <SmartField label="Fecha" name="entradas.fecha" type="date" />
        <SmartField label="Costo por persona" name="entradas.costoPorPersona" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}

function StepFerry() {
  return (
    <Card title={<h4 className="text-base font-semibold">Ferry</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Ruta" name="ferry.ruta" placeholder="Origen - Destino" />
        <SmartField label="Fecha" name="ferry.fecha" type="date" />
        <SmartField label="Precio" name="ferry.precio" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}

function StepSeguro() {
  return (
    <Card title={<h4 className="text-base font-semibold">Seguro</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="Cobertura" name="seguro.cobertura" placeholder="Básica / Ampliada" />
        <SmartField label="Días" name="seguro.dias" type="number" placeholder="0" min={0} />
        <SmartField label="Costo total" name="seguro.costoTotal" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}

function StepDatos() {
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

function StepVisa() {
  return (
    <Card title={<h4 className="text-base font-semibold">Visa</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField label="País" name="visa.pais" placeholder="Estados Unidos, Canadá, etc." />
        <SmartField label="Tipo" name="visa.tipo" placeholder="Turismo / Negocios" />
        <SmartField label="Tarifa" name="visa.tarifa" type="currency" prefix="$" placeholder="0.00" />
      </div>
    </Card>
  );
}

function StepMensajesComision() {
  return (
    <>
      <Card title={<h4 className="text-base font-semibold">Mensajes</h4>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmartField label="Mensaje de saludo" name="mensajes.saludo" type="textarea" placeholder="Mensaje" />
          <SmartField label="Mensaje de despedida" name="mensajes.despedida" type="textarea" placeholder="Mensaje" />
        </div>
      </Card>

      <Card title={<h4 className="text-base font-semibold">Comisión</h4>}>
        <div className="max-w-xs">
          <SmartField
            label="Porcentaje de comisión"
            name="comision.porcentaje"
            type="number"
            placeholder="10"
            suffix={"%"}
            min={0}
          />
        </div>
      </Card>
    </>
  );
}

function StepResumen() {
  const { data } = useFormData();
  return (
    <Card title={<h4 className="text-base font-semibold">Resumen</h4>}>
      <p className="text-sm text-gray-600">Previsualización del objeto guardado:</p>
      <pre className="mt-3 text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(data, null, 2)}</pre>
      <div className="mt-4 flex gap-2">
        <button
          className="px-3 py-2 border rounded"
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "cotizacion.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Descargar JSON
        </button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded">Generar cotización</button>
      </div>
    </Card>
  );
}

// =====================================================
// 6) Main Wizard (unchanged flow, now the fields auto-save into one object)
// =====================================================

export default function NeutralStepperQuoteWizard_Fieldified() {
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
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }, []);

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

  const servicesPickerStepContent = <StepServicios selected={selectedServices} toggle={toggleService} />;

  const steps = useMemo(() => {
    const merged = [...BASE_STEPS, ...serviceSteps, ...tailSteps];
    const idx = merged.findIndex((s) => s.key === "servicios");
    if (idx !== -1) merged[idx] = { ...merged[idx], content: servicesPickerStepContent };
    return merged;
  }, [BASE_STEPS, serviceSteps, tailSteps, servicesPickerStepContent]);

  useEffect(() => {
    setStep((s) => Math.min(Math.max(s, 0), steps.length - 1));
  }, [steps.length]);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, steps.length - 1)), [steps.length]);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  return (
    <FormProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-1">Asistente de Cotización</h1>
          <h2 className="text-lg text-center text-gray-600 mb-4">
            Paso {step + 1} de {steps.length}
          </h2>

          {/* Stepper header */}
          <div className="mb-6 w-full">
            <div
              className={`flex items-start ${steps.length >= 10 ? "justify-start overflow-x-auto flex-nowrap" : "justify-center flex-wrap md:flex-nowrap"} w-full`}
            >
              {steps.map(({ Icon, label, key }, i) => (
                <React.Fragment key={key}>
                  <StepIcon active={i <= step} Icon={Icon} label={label} onClick={() => setStep(i)} />
                  {i < steps.length - 1 && (
                    steps.length >= 10 ? (
                      <div className={`mt-7 h-1 w-12 mx-2 rounded shrink-0 ${i < step ? "bg-blue-600" : "bg-gray-300"}`} />
                    ) : (
                      <div className={`self-start mt-7 flex-1 h-1 rounded mx-2 ${i < step ? "bg-blue-600" : "bg-gray-300"}`} />
                    )
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="h-[45vh] flex flex-col transition-all duration-300 overflow-auto pr-1">{steps[step].content}</div>

          {/* Bottom actions */}
          <div className="mt-4 flex justify-between">
            <button onClick={prev} disabled={step === 0} className="px-4 py-2 border rounded disabled:opacity-50">
              Back
            </button>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => {
                  // Example save: you could POST to an API here using the data from the context
                  const evt = new CustomEvent("wizard-save-draft");
                  window.dispatchEvent(evt);
                }}
              >
                Guardar borrador
              </button>
              {step < steps.length - 1 ? (
                <button onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded">
                  Next
                </button>
              ) : (
                <button className="px-4 py-2 bg-green-600 text-white rounded">Finalizar</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
