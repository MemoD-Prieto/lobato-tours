import React, { useEffect, useState } from "react";
import { useFormData, getIn } from "./FormContext";

// =====================================================
// SmartField Component
// =====================================================

type Option = { label: string; value: string | number };

type SmartFieldProps = {
  label?: string;
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
  validate?: (val: any) => string;
  autoComplete?: string;
  disabled?: boolean;
  /** When false, select has no empty "Seleccione una opción" option (use when you have a default) */
  placeholderOption?: boolean;
};

export function SmartField({
  label = '',
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
  placeholderOption = true,
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
      className: `mt-1 w-full border rounded p-2 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white ${type === "currency" || type === "number" ? "text-right" : ""} ${inputClassName ?? ""} ${err ? "border-red-500" : ""}`.trim(),
      autoComplete,
      disabled,
    } as const;

    if (type === "textarea") return <textarea rows={5} {...common} />;
    if (type === "select")
      return (
        <select {...common as any}>
          {placeholderOption && <option value="">Seleccione una opción</option>}
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
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{prefix}</div>}
        {field}
        {suffix && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">{suffix}</div>}
      </div>
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}
