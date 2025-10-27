import React, { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

// =====================================================
// Form Context and Helpers
// =====================================================

type ServiceKey = "paquete" | "vuelo" | "hotel" | "traslado" | "crucero" | "entradas" | "ferry" | "seguro" | "datos" | "visa";

type FormCtxType = {
  data: any;
  setValue: (path: string, value: any) => void;
  cotizacionId: number | null;
  setCotizacionId: (id: number | null) => void;
  isSaving: boolean;
  isLoading: boolean;
  saveData: (autoSave?: boolean) => Promise<any>;
  loadQuote: (id: number) => Promise<boolean>;
  selectedServices: Set<ServiceKey>;
  setSelectedServices: (services: Set<ServiceKey>) => void;
  toggleService: (key: ServiceKey) => void;
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
  const router = useRouter();
  const [data, setData] = useState<any>({});
  const [cotizacionId, setCotizacionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedQuote, setHasLoadedQuote] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<ServiceKey>>(new Set());

  const setValue = useCallback((path: string, value: any) => {
    setData((prev: any) => setIn(prev ?? {}, path, value));
  }, []);

  const toggleService = useCallback((key: ServiceKey) => {
    setSelectedServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const loadQuote = useCallback(async (id: number) => {
    // Show loading toast
    const loadingToastId = toast.loading('📥 Cargando cotización...', {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
    });

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ load_quote_id: id }),
      });

      const result = await response.json();
      
      if (result.ok) {
        // Transform the loaded data to match our form structure
        const loadedData = result.data;
        const formData: any = {
          cotizacion: {
            employee_id: loadedData.employee_id,
            transfers: loadedData.transfers,
            greeting_message: loadedData.greeting_message,
            goodbye_message: loadedData.goodbye_message,
            insurance: loadedData.insurance,
            data_plan: loadedData.data_plan,
            visa: loadedData.visa,
            commission: loadedData.commission,
            messages: loadedData.messages,
            finished: loadedData.finished
          }
        };

        // Load clientes and personas
        if (loadedData.clientes && loadedData.clientes.length > 0) {
          formData.clientes = loadedData.clientes.map((cliente: any) => ({
            customer_name: cliente.customer_name,
            customer_contact: cliente.customer_contact,
            customer_contact2: cliente.customer_contact2,
            personas: cliente.personas || []
          }));
        }

        // Load other services
        if (loadedData.viaje) {
          formData.viaje = loadedData.viaje;
        }
        if (loadedData.vuelo) {
          formData.vuelo = loadedData.vuelo;
        }
        if (loadedData.moneda) {
          formData.moneda = loadedData.moneda;
        }

        // Determine which services should be selected based on loaded data
        const servicesToSelect = new Set<ServiceKey>();
        
        // Check for each service type in the loaded data
        // Note: Only check for services that have corresponding database models
        if (loadedData.viaje) servicesToSelect.add('paquete');
        if (loadedData.vuelo) servicesToSelect.add('vuelo');
        // TODO: Add other services when their database models are created
        // if (loadedData.hotel) servicesToSelect.add('hotel');
        // if (loadedData.traslado) servicesToSelect.add('traslado');
        // if (loadedData.crucero) servicesToSelect.add('crucero');
        // if (loadedData.entradas) servicesToSelect.add('entradas');
        // if (loadedData.ferry) servicesToSelect.add('ferry');
        // if (loadedData.seguro) servicesToSelect.add('seguro');
        // if (loadedData.datos) servicesToSelect.add('datos');
        // if (loadedData.visa) servicesToSelect.add('visa');

        setData(formData);
        setCotizacionId(loadedData.id);
        setSelectedServices(servicesToSelect);
        setHasLoadedQuote(true);
        
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        toast.success('✅ Cotización cargada exitosamente', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        return true;
      } else {
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        toast.error(`❌ Error al cargar: ${result.error}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return false;
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      toast.error('❌ Error de conexión al cargar cotización', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return false;
    }
  }, [setData, setCotizacionId, setHasLoadedQuote, setSelectedServices]);

  // Show welcome toast when form loads
  useEffect(() => {
    toast.info('🎉 ¡Bienvenido al Cotizador de Viajes! Los datos se guardan automáticamente.', {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  // Check for URL parameters and load quote if needed
  useEffect(() => {
    // Only run if router is ready and we have a load parameter
    if (!router.isReady) return;
    
    const loadQuoteId = router.query.load;
    if (loadQuoteId && typeof loadQuoteId === 'string' && !hasLoadedQuote) {
      const id = parseInt(loadQuoteId);
      if (!isNaN(id) && id !== cotizacionId) {
        setHasLoadedQuote(true);
        setIsLoading(true);
        loadQuote(id).finally(() => {
          setIsLoading(false);
        });
      }
    }
  }, [router.isReady, router.query.load, cotizacionId, loadQuote, hasLoadedQuote]);

  const saveData = useCallback(async (autoSave = false) => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    // Show loading toast for all saves
    const loadingToastId = toast.loading(
      autoSave ? '💾 Guardando automáticamente...' : '💾 Guardando cotización...',
      {
        position: "top-right",
        autoClose: false, // Don't auto-close loading toasts
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: true,
      }
    );
    
    try {
      const submitData = {
        ...data,
        cotizacion_id: cotizacionId,
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
        // Always use the ID from the response, which should be the same for updates
        const newCotizacionId = result.data?.id;
        if (newCotizacionId) {
          setCotizacionId(newCotizacionId);
        }
        
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        if (autoSave) {
          // Only show auto-save success toast occasionally to avoid spam
          if (Math.random() < 0.3) { // 30% chance to show auto-save toast
            toast.success('💾 Datos guardados automáticamente', {
              position: "top-right",
              autoClose: 1500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        } else {
          toast.success('✅ Cotización guardada exitosamente', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return { success: true, data: result };
        }
      } else {
        const errorMessage = result.error || 'Error desconocido';
        
        // Dismiss loading toast
        toast.dismiss(loadingToastId);
        
        if (autoSave) {
          toast.error(`❌ Error al guardar: ${errorMessage}`, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else {
          toast.error(`❌ Error al guardar: ${errorMessage}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return { success: false, error: errorMessage };
        }
      }
    } catch (error) {
      const errorMessage = 'Error de conexión';
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId);
      
      if (autoSave) {
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return { success: false, error: errorMessage };
      }
    } finally {
      setIsSaving(false);
    }
  }, [data, cotizacionId, isSaving]);

      const value = useMemo(() => ({ 
        data, 
        setValue, 
        cotizacionId, 
        setCotizacionId, 
        saveData, 
        isSaving,
        isLoading,
        loadQuote,
        selectedServices,
        setSelectedServices,
        toggleService
      }), [data, setValue, cotizacionId, setCotizacionId, saveData, isSaving, isLoading, loadQuote, selectedServices, setSelectedServices, toggleService]);
  
  return <FormCtx.Provider value={value}>{children}</FormCtx.Provider>;
}

export function useFormData() {
  const ctx = useContext(FormCtx);
  if (!ctx) throw new Error("useFormData must be used within <FormProvider>");
  return ctx;
}

export { getIn, setIn };
