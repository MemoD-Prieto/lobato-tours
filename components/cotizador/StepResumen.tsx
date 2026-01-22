import React, { useState } from "react";
import { Card } from "./Card";
import { useFormData } from "./FormContext";

export function StepResumen() {
  const { data, setValue, cotizacionId, loadQuote } = useFormData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [loadQuoteId, setLoadQuoteId] = useState('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);
    
    // Only validate required fields if marking as finished
    if (data.cotizacion?.finished) {
      const requiredFields = {
        customer_name: data.clientes?.[0]?.customer_name,
        customer_contact: data.clientes?.[0]?.customer_contact
      };
      
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        setSubmitResult({ 
          success: false, 
          error: `Campos requeridos para finalizar: ${missingFields.join(', ')}` 
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      // Ensure the cotizacion object has the employee_id (placeholder for now)
      // IMPORTANT: Include cotizacion_id if it exists to update instead of creating new
      const submitData = {
        ...data,
        ...(cotizacionId && { cotizacion_id: cotizacionId }),
        cotizacion: {
          ...data.cotizacion,
          employee_id: '1' // Placeholder employee ID
        }
      };
      
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      
      if (result.ok) {
        setSubmitResult({ success: true, data: result });
      } else {
        setSubmitResult({ success: false, error: result.error });
      }
    } catch (error) {
      setSubmitResult({ success: false, error: 'Error de conexión' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadQuote = async () => {
    const id = parseInt(loadQuoteId);
    if (isNaN(id)) {
      setSubmitResult({ success: false, error: 'ID de cotización inválido' });
      return;
    }
    await loadQuote(id);
  };

  return (
    <Card title={<h4 className="text-base font-semibold">Resumen</h4>}>
      {/* Load Existing Quote */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-semibold text-blue-900 mb-2">Cargar Cotización Existente</h5>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="ID de cotización"
            value={loadQuoteId}
            onChange={(e) => setLoadQuoteId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleLoadQuote}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Cargar
          </button>
        </div>
        {cotizacionId && (
          <p className="text-xs text-blue-700 mt-2">
            Cotización actual: ID {cotizacionId}
          </p>
        )}
      </div>

      {/* Finished Toggle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-semibold text-gray-900">Estado de la Cotización</h5>
            <p className="text-xs text-gray-600">
              {data.cotizacion?.finished 
                ? 'Marcada como finalizada - Se requieren nombre y contacto del cliente'
                : 'Borrador - Se puede guardar con datos mínimos'
              }
            </p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.cotizacion?.finished || false}
              onChange={(e) => setValue('cotizacion.finished', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Finalizada
            </span>
          </label>
        </div>
      </div>

      <p className="text-sm text-gray-600">Previsualización del objeto guardado:</p>
      <pre className="mt-3 text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-64">{JSON.stringify(data, null, 2)}</pre>
      
      {submitResult && (
        <div className={`mt-4 p-3 rounded ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitResult.success ? (
            <div>
              <p className="font-semibold">✅ Cotización creada exitosamente!</p>
              <p className="text-sm">ID: {submitResult.data.cotizacionId}</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">❌ Error al crear cotización</p>
              <p className="text-sm">{submitResult.error}</p>
            </div>
          )}
        </div>
      )}
      
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
        <button 
          className={`px-3 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : data.cotizacion?.finished ? 'bg-green-600' : 'bg-blue-600'}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Enviando...' 
            : data.cotizacion?.finished 
              ? 'Finalizar cotización' 
              : 'Guardar borrador'
          }
        </button>
      </div>
    </Card>
  );
}
