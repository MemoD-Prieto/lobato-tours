import React, { useState, useCallback } from "react";
import { Card } from "./Card";
import { SmartField } from "./SmartField";
import { useFormData } from "./FormContext";

export function StepCliente() {
  const { data, setValue } = useFormData();
  const [personas, setPersonas] = useState(() => {
    // Initialize with the client as the first person
    const existingPersonas = data?.clientes?.[0]?.personas || [];
    if (existingPersonas.length === 0) {
      return [{ id: 0, age_range: '', isClient: true }];
    }
    return existingPersonas.map((p: any, index: number) => ({
      id: index,
      age_range: p.age_range || '',
      isClient: index === 0
    }));
  });

  const addPersona = useCallback(() => {
    const newId = Math.max(...personas.map(p => p.id), -1) + 1;
    const newPersona = { id: newId, age_range: '', isClient: false };
    setPersonas(prev => [...prev, newPersona]);
    
    // Update form data
    const currentPersonas = data?.clientes?.[0]?.personas || [];
    setValue(`clientes[0].personas[${currentPersonas.length}]`, { age_range: '' });
  }, [personas, data, setValue]);

  const removePersona = useCallback((id: number) => {
    if (personas.length <= 1) return; // Don't remove the last person
    
    setPersonas(prev => {
      const newPersonas = prev.filter(p => p.id !== id);
      // Update form data to remove the persona
      const currentPersonas = data?.clientes?.[0]?.personas || [];
      const updatedPersonas = currentPersonas.filter((_: any, index: number) => {
        const persona = prev.find(p => p.id === id);
        return persona && index !== prev.indexOf(persona);
      });
      setValue('clientes[0].personas', updatedPersonas);
      return newPersonas;
    });
  }, [personas, data, setValue]);

  const updatePersonaAgeRange = useCallback((id: number, ageRange: string) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, age_range: ageRange } : p));
    setValue(`clientes[0].personas[${personas.findIndex(p => p.id === id)}].age_range`, ageRange);
  }, [personas, setValue]);

  return (
    <Card title={<h4 className="text-base font-semibold">Cliente</h4>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SmartField 
          label="Nombre *" 
          name="clientes[0].customer_name" 
          placeholder="Nombre Apellido(s)" 
          autoComplete="name" 
          validate={(val) => !val || val.trim() === '' ? 'Nombre es requerido' : ''} 
        />
        <SmartField 
          label="Contacto *" 
          name="clientes[0].customer_contact" 
          placeholder="Correo, tel, whatsapp, etc." 
          autoComplete="email" 
          validate={(val) => !val || val.trim() === '' ? 'Contacto es requerido' : ''} 
        />
        <SmartField label="Contacto 2" name="clientes[0].customer_contact2" placeholder="Correo, tel, whatsapp, etc." />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-sm font-semibold">Personas en el viaje</h5>
          <button 
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
            type="button"
            onClick={addPersona}
          >
            + Agregar persona
          </button>
        </div>

        <div className="space-y-3">
          {personas.map((persona, index) => (
            <div 
              key={persona.id}
              className={`p-4 border rounded-lg transition-all ${
                persona.isClient 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    persona.isClient 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {persona.isClient ? 'Cliente' : `Persona ${index + 1}`}
                  </span>
                  {persona.isClient && (
                    <span className="text-xs text-blue-600 font-medium">
                      (Primera persona)
                    </span>
                  )}
                </div>
                {!persona.isClient && personas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePersona(persona.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de edad
                  </label>
                  <select
                    value={persona.age_range}
                    onChange={(e) => updatePersonaAgeRange(persona.id, e.target.value)}
                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione edad</option>
                    <option value="0">0-2 años</option>
                    <option value="1">3-11 años</option>
                    <option value="2">12-17 años</option>
                    <option value="3">18+ años</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">
                    {persona.age_range ? 
                      ['0-2 años', '3-11 años', '12-17 años', '18+ años'][parseInt(persona.age_range)] 
                      : 'Seleccione una edad'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {personas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No hay personas agregadas</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={addPersona}
            >
              Agregar primera persona
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
