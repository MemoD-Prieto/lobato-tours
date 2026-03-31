import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaFileAlt, FaCheckCircle, FaEdit, FaCalendarCheck,
  FaArrowUp, FaArrowDown, FaPlus, FaChevronRight,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface DashboardData {
  totals: { all: number; finished: number; draft: number };
  thisMonth: number;
  lastMonth: number;
  last7Days: number;
  growth: number;
  expiringSoon: number;
  recentQuotes: Array<{
    id: number;
    creation_date: string;
    finished: boolean;
    valid_until: string | null;
    clientes: Array<{ customer_name: string; customer_contact: string }>;
  }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(res => { if (res.ok) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const maxTrend = data ? Math.max(...data.monthlyTrend.map(m => m.count), 1) : 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
          <p className="text-gray-500 dark:text-[#888ea8] text-sm mt-1">{t('dashboard_subtitle')}</p>
        </div>
        <Link
          href="/clientes/cotizador"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FaPlus className="w-3 h-3" />
          {t('new_quote')}
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wide">{t('total_quotes')}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{data?.totals.all ?? 0}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <FaFileAlt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Finalizadas */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wide">{t('finished')}</p>
              <p className="mt-1 text-3xl font-bold text-green-600">{data?.totals.finished ?? 0}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Borradores */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wide">{t('drafts')}</p>
              <p className="mt-1 text-3xl font-bold text-yellow-600">{data?.totals.draft ?? 0}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
              <FaEdit className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Este mes */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wide">{t('this_month')}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{data?.thisMonth ?? 0}</p>
              {data && (
                <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${data.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {data.growth >= 0 ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                  {Math.abs(data.growth)}% {t('vs_last_month')}
                </p>
              )}
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
              <FaCalendarCheck className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alert: expiring soon */}
      {data && data.expiringSoon > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-center gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-400">
            <span className="font-semibold">{data.expiringSoon}</span>{' '}
            {data.expiringSoon === 1 ? t('quote_expiring_singular') : t('quote_expiring_plural')}
          </p>
          <Link href="/cotizaciones?status=draft" className="ml-auto text-xs font-medium text-amber-700 dark:text-amber-400 underline hover:text-amber-900">
            {t('view_all')}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-[#e0e6ed] mb-4">{t('monthly_trend')}</h2>
          <div className="flex items-end gap-2 h-32">
            {data?.monthlyTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-[#888ea8] font-medium">{m.count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(4, (m.count / maxTrend) * 96)}px` }}
                />
                <span className="text-xs text-gray-400 dark:text-[#5c6f8a]">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-[#e0e6ed]">{t('quick_stats')}</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#888ea8]">{t('last_7_days')}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data?.last7Days ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#888ea8]">{t('last_month_label')}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data?.lastMonth ?? 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-[#888ea8]">{t('finish_rate')}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data && data.totals.all > 0
                  ? `${Math.round((data.totals.finished / data.totals.all) * 100)}%`
                  : '—'}
              </span>
            </div>
          </div>
          <hr className="dark:border-[#1b2e4b]" />
          <Link
            href="/cotizaciones"
            className="flex items-center justify-between text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium"
          >
            {t('view_all_quotes')}
            <FaChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent quotes */}
      <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border dark:border-[#1b2e4b] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-[#e0e6ed]">{t('recent_quotes')}</h2>
          <Link href="/cotizaciones" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800">
            {t('see_all')}
          </Link>
        </div>
        {!data || data.recentQuotes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-[#5c6f8a] text-center py-4">{t('no_quotes_yet')}</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#1b2e4b]">
            {data.recentQuotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-[#253a5e] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-[#888ea8]">
                    #{q.id}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {q.clientes?.[0]?.customer_name || t('no_name')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-[#888ea8]">{formatDate(q.creation_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${q.finished ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                    {q.finished ? t('finished') : t('draft')}
                  </span>
                  <Link
                    href={`/cotizacion/${q.id}`}
                    className="text-gray-400 dark:text-[#5c6f8a] hover:text-blue-600 transition-colors"
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
