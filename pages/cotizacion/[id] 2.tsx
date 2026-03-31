import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { 
  AiOutlineArrowLeft, 
  AiOutlineEdit, 
  AiOutlineUser, 
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlinePlane
} from 'react-icons/ai';

interface Cotizacion {
  id: number;
  employee_id: string;
  transfers: number;
  greeting_message: string;
  goodbye_message: string;
  insurance: number;
  data_plan: number;
  visa: number;
  commission: number;
  messages: string;
  finished: boolean;
  creation_date: string;
  clientes: Array<{
    id: number;
    customer_name: string;
    customer_contact: string;
    customer_contact2: string;
    personas: Array<{
      id: number;
      age_range: number;
    }>;
  }>;
  viaje?: {
    id: number;
    travel_destiny: string;
    travel_begin: string;
    travel_end: string;
  };
  vuelo?: {
    id: number;
    airline: string;
    other_airline: string;
    base_fee: number;
    iva: number;
    luggage_check: number;
    airport_right_of_use: number;
    suitcases_tax: number;
  };
  moneda?: {
    id: number;
    dollar: boolean;
    exchange_rate: number;
  };
}

const ageRangeLabels = {
  0: '0-2 años',
  1: '3-11 años', 
  2: '12-17 años',
  3: '18+ años'
};

export default function CotizacionProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure Day.js locale
  dayjs.locale('es');

  useEffect(() => {
    if (id) {
      fetchCotizacion();
    }
  }, [id]);

  const fetchCotizacion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cotizacion/${id}`);
      const result = await response.json();
      
      if (result.ok) {
        setCotizacion(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al cargar la cotización');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).locale('es').format('DD/MM/YYYY');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando Cotización</h2>
              <p className="text-gray-600">Por favor espera mientras cargamos los detalles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cotizacion) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Cotización no encontrada'}</p>
              <Link 
                href="/cotizaciones"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <AiOutlineArrowLeft className="mr-2" />
                Volver a Cotizaciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/cotizaciones"
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AiOutlineArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Cotización #{cotizacion.id}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Creada el {formatDate(cotizacion.creation_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cotizacion.finished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {cotizacion.finished ? 'Finalizada' : 'Borrador'}
                </span>
                <Link
                  href={`/clientes/cotizador?load=${cotizacion.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <AiOutlineEdit className="mr-2" />
                  Editar
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AiOutlineUser className="mr-2" />
                  Información del Cliente
                </h2>
              </div>
              <div className="p-6">
                {cotizacion.clientes.map((cliente, index) => (
                  <div key={cliente.id} className="mb-6 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <p className="mt-1 text-sm text-gray-900">{cliente.customer_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto Principal</label>
                        <p className="mt-1 text-sm text-gray-900">{cliente.customer_contact}</p>
                      </div>
                      {cliente.customer_contact2 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contacto Secundario</label>
                          <p className="mt-1 text-sm text-gray-900">{cliente.customer_contact2}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Personas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Personas en el viaje</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {cliente.personas.map((persona, personaIndex) => (
                          <div key={persona.id} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {personaIndex === 0 ? 'Cliente' : `Persona ${personaIndex}`}
                            </div>
                            <div className="text-xs text-gray-600">
                              {ageRangeLabels[persona.age_range as keyof typeof ageRangeLabels] || 'Sin edad'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Information */}
            {cotizacion.viaje && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AiOutlineCalendar className="mr-2" />
                    Información del Viaje
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Destino</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.viaje.travel_destiny}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(cotizacion.viaje.travel_begin)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(cotizacion.viaje.travel_end)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Information */}
            {cotizacion.vuelo && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AiOutlinePlane className="mr-2" />
                    Información del Vuelo
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aerolínea</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {cotizacion.vuelo.other_airline || cotizacion.vuelo.airline}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tarifa Base</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.vuelo.base_fee)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IVA</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.vuelo.iva)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Equipaje</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.vuelo.luggage_check)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Derecho de Uso Aeropuerto</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.vuelo.airport_right_of_use)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Impuesto Maletas</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.vuelo.suitcases_tax)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Information */}
            {cotizacion.moneda && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AiOutlineDollar className="mr-2" />
                    Información de Moneda
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Moneda</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {cotizacion.moneda.dollar ? 'Dólares (USD)' : 'Pesos Mexicanos (MXN)'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Cambio</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.moneda.exchange_rate}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Traslados</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.transfers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Seguro</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.insurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plan de Datos</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.data_plan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Visa</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.visa)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comisión</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.commission)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(
                        cotizacion.transfers + 
                        cotizacion.insurance + 
                        cotizacion.data_plan + 
                        cotizacion.visa + 
                        cotizacion.commission
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {(cotizacion.greeting_message || cotizacion.goodbye_message || cotizacion.messages) && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Mensajes</h2>
                </div>
                <div className="p-6 space-y-4">
                  {cotizacion.greeting_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mensaje de Bienvenida</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.greeting_message}</p>
                    </div>
                  )}
                  {cotizacion.goodbye_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mensaje de Despedida</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.goodbye_message}</p>
                    </div>
                  )}
                  {cotizacion.messages && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mensajes Adicionales</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.messages}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
