import React from "react";
import { useTranslation } from "react-i18next";
import { useFormData, getIn } from "./FormContext";

// =====================================================
// PersonasWidget
// Pregunta al pie de cada paso de servicio si el
// servicio aplica para todas las personas de la
// cotización. Si no, permite seleccionar cuántas.
// =====================================================

interface PersonasWidgetProps {
  /** Ruta del campo en el formulario, p.ej. "vuelo.num_personas" */
  fieldPath: string;
}

export function PersonasWidget({ fieldPath }: PersonasWidgetProps) {
  const { t } = useTranslation();
  const { data, setValue } = useFormData();

  // Total de personas definidas en el paso Cliente
  const maxPersonas: number = data?.clientes?.[0]?.personas?.length || 1;

  // Valor actual guardado en el formulario
  const currentValue: number | null | undefined = getIn(data, fieldPath);

  // Se considera "para todos" cuando el valor es nulo/indefinido o igual al máximo
  const isForAll =
    currentValue === undefined ||
    currentValue === null ||
    Number(currentValue) >= maxPersonas;

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      // Marcar para todos → guardamos null (significa "todos")
      setValue(fieldPath, null);
    } else {
      // Desmarcar → seleccionamos maxPersonas - 1 como punto de partida
      const defaultVal = maxPersonas > 1 ? maxPersonas - 1 : 1;
      setValue(fieldPath, defaultVal);
    }
  };

  const handleSelectChange = (value: number) => {
    if (value >= maxPersonas) {
      // Si eligen el máximo, equivale a "todos" → re-checkear
      setValue(fieldPath, null);
    } else {
      setValue(fieldPath, value);
    }
  };

  const selectValue = isForAll ? maxPersonas : Number(currentValue) || 1;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#1b2e4b]">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isForAll}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-[#e0e6ed]">
            {t('service_applies_all')}
          </span>
        </label>

        <select
          disabled={isForAll}
          value={selectValue}
          onChange={(e) => handleSelectChange(parseInt(e.target.value, 10))}
          className={`border rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            isForAll
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-[#253a5e] dark:text-[#5c6f8a] dark:border-[#253a5e]"
              : "bg-white text-gray-700 border-gray-300 dark:bg-[#1b2e4b] dark:text-[#e0e6ed] dark:border-[#253a5e]"
          }`}
        >
          {Array.from({ length: maxPersonas }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? t('person') : t('persons')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
