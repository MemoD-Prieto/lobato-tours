import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
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
  FaShieldAlt,
  FaCopy,
  FaWhatsapp,
  FaStickyNote,
} from 'react-icons/fa';

interface Cotizacion {
  id: number;
  employee_id: string;
  greeting_message: string;
  goodbye_message: string;
  commission: number;
  finished: boolean;
  sold: boolean;
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
  hoteles?: any[];
  crucero?: any;
  traslado?: any;
  ferry?: any;
  entradas?: any;
  seguro?: any;
  datos?: any;
  visa?: any;
}

const ageRangeLabels = {
  0: '0-2 años',
  1: '3-11 años', 
  2: '12-17 años',
  3: '18+ años'
};

export default function CotizacionProfile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = router.query;
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soldLoading, setSoldLoading] = useState(false);

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
        setError(result.error || t('error_loading_quote'));
      }
    } catch (err) {
      setError(t('connection_error_loading'));
      console.error('Error fetching cotizacion:', err);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

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
    if (!date.isValid()) return t('invalid_date') || 'Fecha inválida';
    return date.locale('es').format('DD/MM/YYYY');
  };

  // Number of travelers (people) from clientes/personas
  const totalPeople = React.useMemo(() => {
    if (!cotizacion?.clientes?.length) return 0;
    return cotizacion.clientes.reduce(
      (sum, c) => sum + (Array.isArray(c.personas) ? c.personas.length : 0),
      0
    );
  }, [cotizacion]);

  // Compute extra amounts from viaje, vuelo, crucero, hotel, ferry, entradas for total
  const extraAmounts = React.useMemo(() => {
    if (!cotizacion) return { viaje: 0, vuelo: 0, crucero: 0, hotel: 0, ferry: 0, entradas: 0, total: 0 };
    const people = totalPeople || 1;
    let viaje = Number(cotizacion.viaje?.package_price) || 0;
    let vuelo = 0;
    if (cotizacion.vuelo) {
      vuelo =
        (Number(cotizacion.vuelo.base_fee) || 0) +
        (Number(cotizacion.vuelo.iva) || 0) +
        (Number(cotizacion.vuelo.luggage_check) || 0) +
        (Number(cotizacion.vuelo.airport_right_of_use) || 0) +
        (Number(cotizacion.vuelo.suitcases_tax) || 0);
    }
    const precioPorPersonaCrucero = Number(cotizacion.crucero?.precio) || 0;
    const crucero = precioPorPersonaCrucero * people;
    let hotel = 0;
    const hoteles = cotizacion.hoteles ?? (cotizacion.hotel ? (Array.isArray(cotizacion.hotel) ? cotizacion.hotel : [cotizacion.hotel]) : []);
    hoteles.forEach((h: any) => {
      (h.distribuciones || []).forEach((d: any) => {
        (d.habitaciones || []).forEach((hab: any) => {
          hotel += (Number(hab.price) || 0) + (Number(hab.iva) || 0);
        });
      });
    });
    const precioPorPersonaFerry = Number(cotizacion.ferry?.precio) || 0;
    const ferry = precioPorPersonaFerry * people;
    const entradasPrecio = Number(cotizacion.entradas?.precio) || 0;
    const entradasCantidad = Number(cotizacion.entradas?.cantidad) || 1;
    const entradas = entradasPrecio * entradasCantidad;
    return {
      viaje,
      vuelo,
      crucero,
      hotel,
      ferry,
      entradas,
      total: viaje + vuelo + crucero + hotel + ferry + entradas
    };
  }, [cotizacion, totalPeople]);

  const subtotal =
    (Number(cotizacion?.traslado?.amount) || 0) +
    (Number(cotizacion?.seguro?.costo) || 0) +
    (Number(cotizacion?.datos?.costo) || 0) +
    (Number(cotizacion?.visa?.costo) || 0) +
    extraAmounts.total;
  const commissionPercent = Number(cotizacion?.commission) || 0;
  const commissionAmount = subtotal * (commissionPercent / 100);
  const fullTotal = subtotal + commissionAmount;

  // Determine initial active tab based on available data
  const getInitialTab = useCallback(() => {
    if (cotizacion?.viaje) return 'viaje';
    if (cotizacion?.vuelo) return 'vuelo';
    if (cotizacion?.hoteles?.length) return 'hotel';
    if (cotizacion?.crucero) return 'crucero';
    if (cotizacion?.ferry) return 'ferry';
    if (cotizacion?.entradas) return 'entradas';
    if (cotizacion?.seguro) return 'seguro';
    if (cotizacion?.datos) return 'datos';
    if (cotizacion?.visa) return 'visa';
    if (cotizacion?.moneda) return 'moneda';
    return 'viaje';
  }, [cotizacion]);

  const [activeTab, setActiveTab] = useState<string>('viaje');

  // ── Sub-quote modal ──
  const [showSubModal, setShowSubModal] = useState(false);
  const [subSvc, setSubSvc] = useState<Record<string, { on: boolean; personas: number }>>({});
  const [subCommission, setSubCommission] = useState(0);
  const [subCreating, setSubCreating] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  // Update active tab when cotizacion loads
  useEffect(() => {
    if (cotizacion) {
      setActiveTab(getInitialTab());
    }
  }, [cotizacion, getInitialTab]);

  // ── Sub-quote helpers ────────────────────────────────────────────────
  const SERVICE_DEFS = [
    { key: 'viaje',    label: t('travel_package') },
    { key: 'vuelo',    label: t('flight')         },
    { key: 'crucero',  label: t('cruise')         },
    { key: 'hoteles',  label: t('hotel')          },
    { key: 'traslado', label: t('transfer')       },
    { key: 'ferry',    label: t('ferry')          },
    { key: 'entradas', label: 'Entradas'          },
    { key: 'seguro',   label: t('insurance')      },
    { key: 'datos',    label: 'Datos'             },
    { key: 'visa',     label: t('visa')           },
  ];

  const openSubModal = () => {
    if (!cotizacion) return;
    const init: Record<string, { on: boolean; personas: number }> = {};
    SERVICE_DEFS.forEach(({ key }) => {
      const svcKey = key === 'hoteles' ? 'hoteles' : key;
      const svcData = (cotizacion as any)[svcKey];
      const exists = svcKey === 'hoteles'
        ? (Array.isArray(svcData) && svcData.length > 0)
        : !!svcData;
      if (exists) {
        const storedPersonas = (cotizacion as any)[svcKey]?.num_personas;
        init[key] = {
          on: true,
          personas: storedPersonas != null ? Number(storedPersonas) : totalPeople || 1,
        };
      }
    });
    setSubSvc(init);
    setSubCommission(Number(cotizacion.commission) || 0);
    setSubError(null);
    setShowSubModal(true);
  };

  const getSubServiceCost = (key: string, personas: number): number => {
    if (!cotizacion) return 0;
    switch (key) {
      case 'viaje':    return Number(cotizacion.viaje?.package_price) || 0;
      case 'vuelo': {
        const v = cotizacion.vuelo;
        if (!v) return 0;
        return (Number(v.base_fee)||0) + (Number(v.iva)||0) + (Number(v.luggage_check)||0)
             + (Number(v.airport_right_of_use)||0) + (Number(v.suitcases_tax)||0);
      }
      case 'crucero':  return (Number(cotizacion.crucero?.precio)||0) * personas;
      case 'hoteles': {
        let total = 0;
        const hs = cotizacion.hoteles ?? (cotizacion.hotel ? [cotizacion.hotel] : []);
        (hs as any[]).forEach((h: any) => {
          (h.distribuciones||[]).forEach((d: any) => {
            (d.habitaciones||[]).forEach((hab: any) => {
              total += (Number(hab.price)||0) + (Number(hab.iva)||0);
            });
          });
        });
        return total;
      }
      case 'traslado': return Number(cotizacion.traslado?.amount) || 0;
      case 'ferry':    return (Number(cotizacion.ferry?.precio)||0) * personas;
      case 'entradas': return (Number(cotizacion.entradas?.precio)||0) * (Number(cotizacion.entradas?.cantidad)||1);
      case 'seguro':   return Number(cotizacion.seguro?.costo) || 0;
      case 'datos':    return Number(cotizacion.datos?.costo) || 0;
      case 'visa':     return Number(cotizacion.visa?.costo) || 0;
      default:         return 0;
    }
  };

  const subTotal = Object.entries(subSvc)
    .filter(([, v]) => v.on)
    .reduce((sum, [key, v]) => sum + getSubServiceCost(key, v.personas), 0);
  const subCommissionAmt = subTotal * (subCommission / 100);
  const subGrandTotal = subTotal + subCommissionAmt;

  const createSubQuote = async () => {
    if (!cotizacion) return;
    setSubCreating(true);
    setSubError(null);
    try {
      const payload: any = {
        cotizacion: {
          commission:       subCommission,
          greeting_message: cotizacion.greeting_message || '',
          goodbye_message:  cotizacion.goodbye_message  || '',
          finished:         false,
        },
        clientes: cotizacion.clientes.map(c => ({
          customer_name:     c.customer_name,
          customer_contact:  c.customer_contact,
          customer_contact2: c.customer_contact2,
          personas:          c.personas.map(p => ({ age_range: p.age_range })),
        })),
      };
      if (cotizacion.moneda) {
        payload.moneda = { dollar: cotizacion.moneda.dollar, exchange_rate: cotizacion.moneda.exchange_rate };
      }
      const pick = (key: string) => subSvc[key]?.on;
      const np   = (key: string) => subSvc[key]?.personas ?? null;
      if (pick('viaje')    && cotizacion.viaje)    payload.viaje    = { ...cotizacion.viaje,    num_personas: np('viaje')    };
      if (pick('vuelo')    && cotizacion.vuelo)    payload.vuelo    = { ...cotizacion.vuelo,    num_personas: np('vuelo')    };
      if (pick('crucero')  && cotizacion.crucero)  payload.crucero  = { ...cotizacion.crucero,  num_personas: np('crucero')  };
      if (pick('hoteles')  && cotizacion.hoteles)  payload.hoteles  = cotizacion.hoteles.map((h: any) => ({ ...h, num_personas: np('hoteles') }));
      if (pick('traslado') && cotizacion.traslado) payload.traslado = { ...cotizacion.traslado, num_personas: np('traslado') };
      if (pick('ferry')    && cotizacion.ferry)    payload.ferry    = { ...cotizacion.ferry,    num_personas: np('ferry')    };
      if (pick('entradas') && cotizacion.entradas) payload.entradas = { ...cotizacion.entradas, num_personas: np('entradas') };
      if (pick('seguro')   && cotizacion.seguro)   payload.seguro   = { ...cotizacion.seguro,   num_personas: np('seguro')   };
      if (pick('datos')    && cotizacion.datos)    payload.datos    = { ...cotizacion.datos,    num_personas: np('datos')    };
      if (pick('visa')     && cotizacion.visa)     payload.visa     = { ...cotizacion.visa,     num_personas: np('visa')     };

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.ok) {
        setShowSubModal(false);
        router.push(`/cotizacion/${result.data.id}`);
      } else {
        setSubError(result.error || t('error_creating_sub_quote'));
      }
    } catch (e) {
      setSubError(t('connection_error'));
    } finally {
      setSubCreating(false);
    }
  };

  const handleToggleSold = async () => {
    if (!cotizacion) return;
    setSoldLoading(true);
    try {
      const newVal = !cotizacion.sold;
      const res = await fetch(`/api/cotizacion/${cotizacion.id}/sold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sold: newVal }),
      });
      const result = await res.json();
      if (result.ok) {
        setCotizacion(prev => prev ? { ...prev, sold: newVal } : prev);
        toast.success(newVal ? t('marked_as_sold') : t('marked_as_not_sold'));
      } else {
        toast.error(result.error || t('error_updating_sold'));
      }
    } catch {
      toast.error(t('connection_error'));
    } finally {
      setSoldLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!cotizacion) return;
    try {
      const res = await fetch(`/api/cotizacion/${cotizacion.id}/duplicate`, { method: 'POST' });
      const result = await res.json();
      if (result.ok) {
        toast.success(t('quote_duplicated'));
        router.push(`/cotizacion/${result.data.id}`);
      } else {
        toast.error(result.error || t('duplicate_error'));
      }
    } catch {
      toast.error(t('connection_error'));
    }
  };

  const handleWhatsApp = () => {
    if (!cotizacion) return;
    const nombre = cotizacion.clientes?.[0]?.customer_name || '';
    const destino = (cotizacion as any).viaje?.travel_destiny || '';
    const contact = cotizacion.clientes?.[0]?.customer_contact || '';
    const pdfUrl = `${window.location.origin}/api/cotizacion/${cotizacion.id}/pdf`;
    const lines = [
      `${t('hello')}${nombre ? ` ${nombre}` : ''}! 👋`,
      `${t('here_quote')} ${destino ? `${t('for_destination')} *${destino}*` : `#${cotizacion.id}`}.`,
      '',
      `📄 ${t('view_pdf')}: ${pdfUrl}`,
      '',
      t('any_questions'),
    ];
    const phone = contact.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#060818] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('loading_quote')}</h2>
              <p className="text-gray-600 dark:text-[#888ea8]">{t('loading_quote_message')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cotizacion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#060818] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
            <div className="p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('error_title')}</h2>
              <p className="text-gray-600 dark:text-[#888ea8] mb-4">{error || t('quote_not_found')}</p>
              <Link
                href="/cotizaciones"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaChevronLeft className="mr-2" />
                {t('back_to_quotes_link')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060818] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/cotizaciones"
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:text-[#888ea8] dark:hover:text-white transition-colors"
                >
                  <FaChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('quote_number_display', { id: cotizacion.id })}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-[#888ea8]">
                    {t('quote_created_on')} {formatDate(cotizacion.creation_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cotizacion.finished
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {cotizacion.finished ? t('finished_status') : t('draft_status')}
                </span>
                {/* Sold toggle */}
                <button
                  onClick={handleToggleSold}
                  disabled={soldLoading}
                  title={cotizacion.sold ? t('mark_as_not_sold') : t('mark_as_sold')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                    cotizacion.sold
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-200 text-gray-600 dark:bg-[#253a5e] dark:text-[#888ea8] hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {soldLoading
                    ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    : <span>{cotizacion.sold ? '💰' : '○'}</span>
                  }
                  {cotizacion.sold ? t('sold') : t('not_sold')}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  title={t('duplicate')}
                >
                  <FaCopy className="w-4 h-4" />
                  {t('duplicate')}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1ebe5d] transition-colors"
                  title={t('share_whatsapp')}
                >
                  <FaWhatsapp className="w-4 h-4" />
                  WhatsApp
                </button>
                <a
                  href={`/api/cotizacion/${cotizacion.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  PDF
                </a>
                <Link
                  href={`/clientes/cotizador?load=${cotizacion.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  {t('edit')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FaUser className="mr-2" />
                  Información del Cliente
                </h2>
              </div>
              <div className="p-6">
                {cotizacion.clientes.map((cliente, index) => (
                  <div key={cliente.id} className="mb-6 last:mb-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Nombre</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cliente.customer_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Contacto Principal</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cliente.customer_contact}</p>
                      </div>
                      {cliente.customer_contact2 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Contacto Secundario</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{cliente.customer_contact2}</p>
                        </div>
                      )}
                    </div>

                    {/* Personas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">Personas en el viaje</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {cliente.personas.map((persona, personaIndex) => (
                          <div key={persona.id} className="bg-gray-50 dark:bg-[#253a5e] rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {personaIndex === 0 ? 'Cliente' : `Persona ${personaIndex}`}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-[#888ea8]">
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

            {/* Trip Info — destination & dates, always visible */}
            {(cotizacion.viaje?.travel_destiny || cotizacion.viaje?.travel_begin || cotizacion.viaje?.travel_end) && (
              <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    {t('trip_info_step')}
                  </h2>
                </div>
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#888ea8] mb-1">{t('package_destination')}</label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{cotizacion.viaje?.travel_destiny || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#888ea8] mb-1">{t('travel_start_date')}</label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{formatDate(cotizacion.viaje?.travel_begin) || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-[#888ea8] mb-1">{t('travel_return_date')}</label>
                    <p className="text-base font-medium text-gray-900 dark:text-white">{formatDate(cotizacion.viaje?.travel_end) || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Services — tabbed view */}
            <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {t('services_step')}
                </h2>
              </div>

              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-[#1b2e4b]">
                <nav className="flex -mb-px overflow-x-auto">
                  {cotizacion.viaje && (cotizacion.viaje.package_name || cotizacion.viaje.package_price || cotizacion.viaje.package_description) && (
                    <button
                      onClick={() => setActiveTab('viaje')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'viaje'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
                      }`}
                    >
                      <FaCalendarAlt className="inline mr-2" />
                      {t('travel_package')}
                    </button>
                  )}
                  {cotizacion.vuelo && (
                    <button
                      onClick={() => setActiveTab('vuelo')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'vuelo'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
                      }`}
                    >
                      <FaShieldAlt className="inline mr-2" />
                      Seguro
                    </button>
                  )}
                  {cotizacion.traslado && (
                    <button
                      onClick={() => setActiveTab('traslado')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'traslado'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
                      }`}
                    >
                      Traslado
                    </button>
                  )}
                  {cotizacion.datos && (
                    <button
                      onClick={() => setActiveTab('datos')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'datos'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
                      }`}
                    >
                      Plan de Datos
                    </button>
                  )}
                  {cotizacion.visa && (
                    <button
                      onClick={() => setActiveTab('visa')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'visa'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
                      }`}
                    >
                      Visa
                    </button>
                  )}
                  {cotizacion.moneda && (
                    <button
                      onClick={() => setActiveTab('moneda')}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === 'moneda'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#888ea8] dark:hover:text-[#e0e6ed] dark:hover:border-[#253a5e]'
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
                    {cotizacion.viaje.package_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Nombre del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.viaje.package_name}</p>
                      </div>
                    )}
                    {cotizacion.viaje.package_price && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Precio del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.viaje.package_price)}</p>
                      </div>
                    )}
                    {cotizacion.viaje.package_description && (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Descripción del Paquete</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">{cotizacion.viaje.package_description}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'vuelo' && cotizacion.vuelo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Aerolínea</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {cotizacion.vuelo.other_airline || cotizacion.vuelo.airline || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Tarifa Base</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.vuelo.base_fee)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">IVA</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.vuelo.iva)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Equipaje</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.vuelo.luggage_check)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Derecho de Uso Aeropuerto</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.vuelo.airport_right_of_use)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Impuesto Maletas</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.vuelo.suitcases_tax)}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'hotel' && cotizacion.hotel && (
                  <div className="space-y-4">
                    {Array.isArray(cotizacion.hotel) ? (
                      cotizacion.hotel.map((hotel: any, index: number) => (
                        <div key={index} className="border-b border-gray-200 dark:border-[#253a5e] pb-4 last:border-b-0 last:pb-0">
                          <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Hotel {index + 1}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Nombre</label>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{hotel.name || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Noches</label>
                              <p className="mt-1 text-sm text-gray-900 dark:text-white">{hotel.nights || 0}</p>
                            </div>
                            {hotel.distribuciones && Array.isArray(hotel.distribuciones) && hotel.distribuciones.length > 0 && (
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">Habitaciones</label>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 dark:divide-[#253a5e]">
                                    <thead className="bg-gray-50 dark:bg-[#060818]">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase">Tipo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase">Personas</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase">Precio</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase">IVA</th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#1b2e4b] divide-y divide-gray-200 dark:divide-[#253a5e]">
                                      {hotel.distribuciones.map((dist: any, distIdx: number) =>
                                        dist.habitaciones?.map((hab: any, habIdx: number) => (
                                          <tr key={`${distIdx}-${habIdx}`}>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{hab.type || 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{hab.number_of_people || 0}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{formatCurrency(hab.price)}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{formatCurrency(hab.iva)}</td>
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Nombre</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.hotel.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Noches</label>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.hotel.nights || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'crucero' && cotizacion.crucero && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Línea de Crucero</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.crucero.cruise_line || cotizacion.crucero.other_cruise_line || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Nombre del Crucero</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.crucero.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.crucero.precio)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Duración (días)</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.crucero.duracion || 0}</p>
                    </div>
                    {(cotizacion.crucero.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.crucero.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ferry' && cotizacion.ferry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Ruta</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.ferry.ruta || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.ferry.precio)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Horario</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.ferry.horario || 'N/A'}</p>
                    </div>
                    {(cotizacion.ferry.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.ferry.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'entradas' && cotizacion.entradas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Atracción</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.entradas.atraccion || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Precio por Persona</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.entradas.precio)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Cantidad de Personas</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.entradas.cantidad || 0}</p>
                    </div>
                    {(cotizacion.entradas.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.entradas.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'seguro' && cotizacion.seguro && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Compañía de Seguros</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.seguro.insurance_company || cotizacion.seguro.other_insurance_company || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Tipo de Seguro</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.seguro.tipo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Costo del Seguro</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatCurrency(cotizacion.seguro?.costo)}</p>
                    </div>
                    {(cotizacion.seguro.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.seguro.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'datos' && cotizacion.datos && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Costo del Plan de Datos</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cotizacion.datos?.costo)}
                      </p>
                    </div>
                    {cotizacion.datos && cotizacion.datos.proveedor && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Proveedor</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.datos.proveedor}</p>
                      </div>
                    )}
                    {(cotizacion.datos.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.datos.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'visa' && cotizacion.visa && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Costo de Visa</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatCurrency(cotizacion.visa?.costo)}
                      </p>
                    </div>
                    {cotizacion.visa?.tipo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Tipo</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.visa.tipo}</p>
                      </div>
                    )}
                    {(cotizacion.visa.num_personas != null) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Personas incluidas</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.visa.num_personas}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'traslado' && cotizacion.traslado && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Costo de Traslado</label>
                      <p className="mt-1 text-sm text-gray-900">{formatCurrency(cotizacion.traslado.amount)}</p>
                    </div>
                    {cotizacion.traslado.tipo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Traslado</label>
                        <p className="mt-1 text-sm text-gray-900">{cotizacion.traslado.tipo}</p>
                      </div>
                    )}
                    {cotizacion.traslado.num_personas && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Número de Personas</label>
                        <p className="mt-1 text-sm text-gray-900">{cotizacion.traslado.num_personas}</p>
                      </div>
                    )}
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

                {activeTab !== 'datos' && activeTab !== 'visa' && activeTab !== 'traslado' && !cotizacion[activeTab as keyof Cotizacion] && (
                  <div className="text-center py-8 text-gray-500 dark:text-[#888ea8]">
                    <p>No hay información disponible para esta sección.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resumen</h2>
                {totalPeople > 1 && (
                  <button
                    onClick={openSubModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {t('sub_quote')}
                  </button>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#888ea8]">Traslados</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.traslado?.amount)}</span>
                </div>
                {extraAmounts.viaje > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Paquete</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.viaje)}</span>
                  </div>
                )}
                {extraAmounts.vuelo > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Vuelo</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.vuelo)}</span>
                  </div>
                )}
                {extraAmounts.crucero > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Crucero</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.crucero)}</span>
                  </div>
                )}
                {extraAmounts.hotel > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Hotel</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.hotel)}</span>
                  </div>
                )}
                {extraAmounts.ferry > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Ferry</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.ferry)}</span>
                  </div>
                )}
                {extraAmounts.entradas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-[#888ea8]">Entradas</span>
                    <span className="text-sm font-medium">{formatCurrency(extraAmounts.entradas)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#888ea8]">Seguro</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.seguro?.costo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#888ea8]">Plan de Datos</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.datos?.costo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#888ea8]">Visa</span>
                  <span className="text-sm font-medium">{formatCurrency(cotizacion.visa?.costo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-[#888ea8]">Comisión{commissionPercent > 0 ? ` (${commissionPercent}%)` : ''}</span>
                  <span className="text-sm font-medium">{formatCurrency(commissionAmount)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-[#253a5e] pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      Total{cotizacion.moneda ? ` (${cotizacion.moneda.dollar ? 'USD' : 'MXN'})` : ''}
                    </span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(fullTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {(cotizacion.greeting_message || cotizacion.goodbye_message) && (
              <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1b2e4b]">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mensajes</h2>
                </div>
                <div className="p-6 space-y-4">
                  {cotizacion.greeting_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Mensaje de Bienvenida</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.greeting_message}</p>
                    </div>
                  )}
                  {cotizacion.goodbye_message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">Mensaje de Despedida</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{cotizacion.goodbye_message}</p>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Internal notes */}
            {((cotizacion as any).notes || (cotizacion as any).valid_until) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm dark:bg-amber-900/20 dark:border-amber-700/50">
                <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-700/50 flex items-center gap-2">
                  <FaStickyNote className="text-amber-500 w-4 h-4" />
                  <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wide">{t('internal_notes')}</h2>
                </div>
                <div className="p-6 space-y-4">
                  {(cotizacion as any).valid_until && (
                    <div>
                      <label className="block text-xs font-medium text-amber-700 dark:text-amber-500 uppercase tracking-wide">{t('valid_until')}</label>
                      <p className="mt-1 text-sm text-amber-900 dark:text-amber-300 font-medium">
                        {formatDate((cotizacion as any).valid_until)}
                      </p>
                    </div>
                  )}
                  {(cotizacion as any).notes && (
                    <div>
                      <label className="block text-xs font-medium text-amber-700 dark:text-amber-500 uppercase tracking-wide">{t('notes')}</label>
                      <p className="mt-2 text-sm text-amber-900 dark:text-amber-300 whitespace-pre-line">{(cotizacion as any).notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Sub-quote Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#253a5e]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('sub_quote')}</h2>
                <p className="text-xs text-gray-500 dark:text-[#888ea8] mt-0.5">Basada en Cotización #{cotizacion?.id}</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-gray-400 dark:text-[#888ea8] dark:hover:text-white hover:text-gray-600 text-xl font-bold leading-none">&times;</button>
            </div>

            {/* Service list */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
              <p className="text-xs text-gray-500 dark:text-[#888ea8] mb-3">Selecciona los servicios y ajusta el número de personas para cada uno.</p>
              {SERVICE_DEFS.filter(({ key }) => !!subSvc[key]).map(({ key, label }) => {
                const row = subSvc[key];
                const cost = row.on ? getSubServiceCost(key, row.personas) : 0;
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    row.on ? 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' : 'border-gray-200 bg-gray-50 dark:border-[#253a5e] dark:bg-[#060818]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={row.on}
                      onChange={e => setSubSvc(prev => ({ ...prev, [key]: { ...prev[key], on: e.target.checked } }))}
                      className="w-4 h-4 accent-blue-600 shrink-0"
                    />
                    <span className={`text-sm font-medium w-32 shrink-0 ${row.on ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-[#5c6f8a]'}`}>{label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 dark:text-[#5c6f8a]">Personas:</span>
                      <input
                        type="number"
                        min={1}
                        max={totalPeople || 99}
                        disabled={!row.on}
                        value={row.personas}
                        onChange={e => {
                          const val = Math.max(1, Math.min(totalPeople || 99, parseInt(e.target.value) || 1));
                          setSubSvc(prev => ({ ...prev, [key]: { ...prev[key], personas: val } }));
                        }}
                        className={`w-14 text-center border rounded px-2 py-1 text-sm ${
                          row.on ? 'border-gray-300 bg-white dark:border-[#253a5e] dark:bg-[#253a5e] dark:text-white' : 'border-gray-200 bg-gray-100 text-gray-400 dark:border-[#1b2e4b] dark:bg-[#1b2e4b] dark:text-[#5c6f8a]'
                        }`}
                      />
                    </div>
                    <span className={`ml-auto text-sm font-medium shrink-0 ${row.on ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-[#5c6f8a]'}`}>
                      {row.on ? formatCurrency(cost) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Commission + totals */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-[#253a5e] bg-gray-50 dark:bg-[#060818] space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-[#888ea8] w-32 shrink-0">Comisión (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={subCommission}
                  onChange={e => setSubCommission(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-20 border border-gray-300 dark:border-[#253a5e] dark:bg-[#253a5e] dark:text-white rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-[#888ea8]">
                  <span>Subtotal</span><span>{formatCurrency(subTotal)}</span>
                </div>
                {subCommission > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-[#888ea8]">
                    <span>Comisión ({subCommission}%)</span><span>{formatCurrency(subCommissionAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-[#253a5e] pt-1">
                  <span>Total</span><span>{formatCurrency(subGrandTotal)}</span>
                </div>
              </div>
              {subError && <p className="text-xs text-red-600">{subError}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-[#253a5e]">
              <button
                onClick={() => setShowSubModal(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-[#e0e6ed] border border-gray-300 dark:border-[#253a5e] rounded-md hover:bg-gray-50 dark:hover:bg-[#253a5e] transition-colors"
              >Cancelar</button>
              <button
                onClick={createSubQuote}
                disabled={subCreating || Object.values(subSvc).every(v => !v.on)}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >{subCreating ? 'Creando...' : 'Crear Sub-cotización'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





