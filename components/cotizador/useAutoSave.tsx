import { useCallback, useEffect, useRef } from 'react';
import { useFormData } from './FormContext';

export function useAutoSave() {
  const { data, saveData, isSaving } = useFormData();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  // Count filled fields in the form data
  const countFilledFields = useCallback((formData: any): number => {
    let count = 0;
    
    // Count fields in cotizacion (only count meaningful fields)
    if (formData.cotizacion) {
      const meaningfulFields = ['transfers', 'greeting_message', 'goodbye_message', 'insurance', 'data_plan', 'visa', 'commission', 'messages'];
      meaningfulFields.forEach(field => {
        const value = formData.cotizacion[field];
        if (value !== null && value !== undefined && value !== '' && value !== 0) {
          count++;
        }
      });
    }
    
    // Count fields in clientes (only count meaningful fields)
    if (formData.clientes && Array.isArray(formData.clientes)) {
      formData.clientes.forEach((cliente: any) => {
        if (cliente) {
          // Count cliente fields
          const clienteFields = ['customer_name', 'customer_contact', 'customer_contact2'];
          clienteFields.forEach(field => {
            const value = cliente[field];
            if (value !== null && value !== undefined && value !== '') {
              count++;
            }
          });
          
          // Count personas (each persona counts as 1 field, not individual properties)
          if (cliente.personas && Array.isArray(cliente.personas)) {
            cliente.personas.forEach((persona: any) => {
              if (persona && persona.age_range !== null && persona.age_range !== undefined && persona.age_range !== '') {
                count++;
              }
            });
          }
        }
      });
    }
    
    // Count fields in other services (only count meaningful fields)
    const serviceKeys = ['viaje', 'vuelo', 'moneda'];
    serviceKeys.forEach(key => {
      if (formData[key]) {
        const serviceFields = Object.keys(formData[key]).filter(field => {
          const value = formData[key][field];
          return value !== null && value !== undefined && value !== '' && value !== 0;
        });
        count += serviceFields.length;
      }
    });
    
    return count;
  }, []);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const currentDataString = JSON.stringify(data);
      const filledFieldsCount = countFilledFields(data);
      
      // Only auto-save if there are at least 3 filled fields and data has changed
      if (currentDataString !== lastDataRef.current && !isSaving && filledFieldsCount >= 3) {
        lastDataRef.current = currentDataString;
        await saveData(true); // Auto-save mode
      }
    }, 5000); // Save 5 seconds after last change
  }, [data, saveData, isSaving, countFilledFields]);

  useEffect(() => {
    debouncedSave();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSave]);

  return { isSaving };
}
