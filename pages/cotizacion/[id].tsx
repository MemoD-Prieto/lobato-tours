import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { 
  FaChevronLeft,
  FaEdit,
  FaUser,
  FaCalendarAlt,
  FaDollarSign,
  FaPlane,
  FaHotel,
  FaShip,
  FaTicketAlt,
  FaShieldAlt
} from 'react-icons/fa';

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
    travel_begin: string | null;
    travel_end: string | null;
    package_name?: string;
    package_price?: number;
    package_description?: string;
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
  hotel?: any;
  crucero?: any;
  ferry?: any;
  entradas?: any;
  seguro?: any;
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

  const fetchCotizacion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/cotizacion/${id}`);
      const result = await response.json();
      
      if (result.ok) {
        setCotizacion(result.data);
      } else {
        setError(result.error || 'Error al cargar la cotización');
      }
    } catch (err) {
      setError('Error de conexión al cargar la cotización');
      console.error('Error fetching cotizacion:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCotizacion();
    }
  }, [id, fetchCotizacion]);

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    if (isNaN(numAmount)) return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(0);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = dayjs(dateString);
    if (!date.isValid()) return 'Fecha inválida';
    return date.locale('es').format('DD/MM/YYYY');
  };

  // Determine initial active tab based on available data
  const getInitialTab = useCallback(() => {
    if (cotizacion?.viaje) return 'viaje';
    if (cotizacion?.vuelo) return 'vuelo';
    if (cotizacion?.hotel) return 'hotel';
    if (cotizacion?.crucero) return 'crucero';
    if (cotizacion?.ferry) return 'ferry';
    if (cotizacion?.entradas) return 'entradas';
    if (cotizacion?.seguro) return 'seguro';
    if (cotizacion?.moneda) return 'moneda';
    return 'viaje';
  }, [cotizacion]);

  const [activeTab, setActiveTab] = useState<string>('viaje');

  // Update active tab when cotizacion loads
  useEffect(() => {
    if (cotizacion) {
      setActiveTab(getInitialTab());
    }
  }, [cotizacion, getInitialTab]);

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
                <FaChevronLeft className="mr-2" />
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
                  <FaChevronLeft className="w-6 h-6" />
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
                  <FaEdit className="mr-2" />
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
                  <FaUser className="mr-2" />
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

            {/* Travel Information with Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  Información del Viaje
                </h2>
              </div>
              
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  {cotizacion.viaje && (
                    <button
                      onClick={() => setActiveTab('viaje')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'viaje'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaCalendarAlt className="inline mr-2" />
                      Viaje
                    </button>
                  )}
                  {cotizacion.vuelo && (
                    <button
                      onClick={() => setActiveTab('vuelo')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'vuelo'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaPlane className="inline mr-2" />
                      Vuelo
                    </button>
                  )}
                  {cotizacion.hotel && (
                    <button
                      onClick={() => setActiveTab('hotel')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'hotel'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaHotel className="inline mr-2" />
                      Hotel
                    </button>
                  )}
                  {cotizacion.crucero && (
                    <button
                      onClick={() => setActiveTab('crucero')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'crucero'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaShip className="inline mr-2" />
                      Crucero
                    </button>
                  )}
                  {cotizacion.ferry && (
                    <button
                      onClick={() => setActiveTab('ferry')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'ferry'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaShip className="inline mr-2" />
                      Ferry
                    </button>
                  )}
                  {cotizacion.entradas && (
                    <button
                      onClick={() => setActiveTab('entradas')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'entradas'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaTicketAlt className="inline mr-2" />
                      Entradas
                    </button>
                  )}
                  {cotizacion.seguro && (
                    <button
                      onClick={() => setActiveTab('seguro')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'seguro'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaShieldAlt className="inline mr-2" />
                      Seguro
                    </button>
                  )}
                  {cotizacion.moneda && (
                    <button
                      onClick={() => setActiveTab('moneda')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'moneda'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FaDollarSign className="inline mr-2" />
                      Moneda
                    </button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'viaje' && cotizacion.viaje && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Destino</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.viaje.travel_destiny || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(cotizacion.viaje.travel_begin)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(cotizacion.viaje.travel_end)}</p>
                    </div>
                    {cotizacion.viaje.package_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900">{cotizacion.viaje.package_name}</p>
                      </div>
                    )}
                    {cotizacion.viaje.package_price && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Precio del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.viaje.package_price)}</p>
                      </div>
                    )}
                    {cotizacion.viaje.package_description && (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Descripción del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{cotizacion.viaje.package_description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'vuelo' && cotizacion.vuelo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aerolínea</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {cotizacion.vuelo.other_airline || cotizacion.vuelo.airline || 'N/A'}
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
                )}

                {activeTab === 'hotel' && cotizacion.hotel && (
                  <div className="space-y-4">
                    {Array.isArray(cotizacion.hotel) ? (
                      cotizacion.hotel.map((hotel: any, index: number) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <h3 className="text-md font-semibold text-gray-900 mb-3">Hotel {index + 1}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Nombre</label>
                              <p className="mt-1 text-sm text-gray-900">{hotel.name || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Noches</label>
                              <p className="mt-1 text-sm text-gray-900">{hotel.nights || 0}</p>
                            </div>
                            {hotel.distribuciones && Array.isArray(hotel.distribuciones) && hotel.distribuciones.length > 0 && (
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones</label>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Personas</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IVA</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {hotel.distribuciones.map((dist: any, distIdx: number) =>
                                        dist.habitaciones?.map((hab: any, habIdx: number) => (
                                          <tr key={`${distIdx}-${habIdx}`}>
                                            <td className="px-4 py-2 text-sm text-gray-900">{hab.type || 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{hab.number_of_people || 0}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(hab.price)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(hab.iva)}</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <p className="mt-1 text-sm text-gray-900">{cotizacion.hotel.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Noches</label>
                          <p className="mt-1 text-sm text-gray-900">{cotizacion.hotel.nights || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'crucero' && cotizacion.crucero && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Línea de Crucero</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.crucero.cruise_line || cotizacion.crucero.other_cruise_line || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre del Crucero</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.crucero.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.crucero.precio)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duración (días)</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.crucero.duracion || 0}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'ferry' && cotizacion.ferry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ruta</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.ferry.ruta || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.ferry.precio)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Horario</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.ferry.horario || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'entradas' && cotizacion.entradas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Atracción</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.entradas.atraccion || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.entradas.precio)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cantidad de Personas</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.entradas.cantidad || 0}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'seguro' && cotizacion.seguro && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Compañía de Seguros</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.seguro.insurance_company || cotizacion.seguro.other_insurance_company || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Seguro</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.seguro.tipo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Costo del Seguro</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.insurance)}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'moneda' && cotizacion.moneda && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Moneda</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {cotizacion.moneda.dollar ? 'Dólares (USD)' : 'Pesos Mexicanos (MXN)'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Cambio</label>
                      <p className="mt-1 text-sm text-gray-900">{cotizacion.moneda.exchange_rate || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {!cotizacion[activeTab as keyof Cotizacion] && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay información disponible para esta sección.</p>
                  </div>
                )}
              </div>
            </div>
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
                        (Number(cotizacion.transfers) || 0) + 
                        (Number(cotizacion.insurance) || 0) + 
                        (Number(cotizacion.data_plan) || 0) + 
                        (Number(cotizacion.visa) || 0) + 
                        (Number(cotizacion.commission) || 0)
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

