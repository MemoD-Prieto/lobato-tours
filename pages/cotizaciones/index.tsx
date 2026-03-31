import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaFilter, FaSort, FaEye, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaDownload, FaCopy } from 'react-icons/fa';

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
    travel_destiny?: string;
    travel_begin?: string;
    travel_end?: string;
    package_name?: string;
    package_price?: number;
    num_personas?: number;
  };
  vuelo?: {
    airline?: string;
    base_fee?: number;
    iva?: number;
    num_personas?: number;
  };
  moneda?: {
    dollar?: boolean;
    exchange_rate?: number;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function CotizacionesList() {
  const { t } = useTranslation();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false, id: null, name: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    sortBy: 'id',
    sortOrder: 'DESC',
    limit: '10'
  });

  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        ...filters
      });

      const response = await fetch(`/api/cotizaciones?${queryParams}`);
      const result = await response.json();

      if (result.ok) {
        setCotizaciones(result.data.cotizaciones);
        setPagination(result.data.pagination);
      } else {
        toast.error(`Error al cargar cotizaciones: ${result.error}`);
      }
    } catch (error) {
      toast.error('Error de conexión al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, filters]);

  useEffect(() => {
    fetchCotizaciones();
  }, [fetchCotizaciones]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cotizacion/${deleteModal.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.ok) {
        toast.success(t('quote_deleted'));
        setDeleteModal({ open: false, id: null, name: '' });
        fetchCotizaciones();
      } else {
        toast.error(result.error || t('delete_error'));
      }
    } catch {
      toast.error(t('connection_error'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const res = await fetch(`/api/cotizacion/${id}/duplicate`, { method: 'POST' });
      const result = await res.json();
      if (result.ok) {
        toast.success(t('quote_duplicated'));
        fetchCotizaciones();
      } else {
        toast.error(result.error || t('duplicate_error'));
      }
    } catch {
      toast.error(t('connection_error'));
    }
  };

  const handleCsvExport = () => {
    const params = new URLSearchParams({ ...filters, format: 'csv' });
    window.location.href = `/api/cotizaciones/export?${params}`;
  };

  const handleMlExport = () => {
    window.location.href = '/api/cotizaciones/ml-export';
  };

  const getStatusBadge = (finished: boolean) => {
    return finished ? (
      <span className="px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
        {t('finished')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
        {t('draft')}
      </span>
    );
  };

  const getTotalPersons = (clientes: any[]) => {
    return clientes.reduce((total, cliente) => total + (cliente.personas?.length || 0), 0);
  };

  return (
    <div className="p-6">
      {/* Delete confirmation modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('confirm_delete')}</h3>
            <p className="text-sm text-gray-600 dark:text-[#888ea8] mb-6">
              {t('delete_quote_confirm', { name: deleteModal.name || `#${deleteModal.id}` })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#e0e6ed] bg-gray-100 dark:bg-[#253a5e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#344a6a] disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('quotes')}</h1>
          <p className="text-gray-600 dark:text-[#888ea8]">{t('quotes_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCsvExport}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <FaDownload className="w-3 h-3" />
            {t('export_csv')}
          </button>
          <button
            onClick={handleMlExport}
            title="Export encoded CSV for machine learning — all categorical variables converted to binary columns"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-xs font-bold">ML</span>
            {t('export_ml') || 'Export ML Data'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm border dark:border-[#1b2e4b] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">
              <FaSearch className="inline mr-2" />
              {t('search')}
            </label>
            <input
              type="text"
              placeholder={t('search') + '...'}

              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">
              <FaFilter className="inline mr-2" />
              {t('status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('all')}</option>
              <option value="finished">{t('finished')}</option>
              <option value="draft">{t('drafts')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">
              <FaSort className="inline mr-2" />
              {t('sort_by')}
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="id">ID</option>
              <option value="creation_date">{t('date')}</option>
              <option value="finished">{t('status')}</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#e0e6ed] mb-2">
              {t('order')}
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DESC">{t('descending')}</option>
              <option value="ASC">{t('ascending')}</option>
            </select>
          </div>
        </div>

        {/* Results per page */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-[#e0e6ed]">
            {t('show')}:
          </label>
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:bg-[#1b2e4b] dark:border-[#253a5e] dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-[#888ea8]">
            {t('showing_of')} {pagination.totalCount} {t('quotes').toLowerCase()}
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-[#1b2e4b] rounded-lg shadow-sm border dark:border-[#1b2e4b]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-[#888ea8]">{t('loading_quotes')}</p>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-[#888ea8]">{t('no_quotes_found')}</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-[#1b2e4b]">
                <thead className="bg-gray-50 dark:bg-[#1b2e4b]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('client')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('passengers')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('sold') || 'Sold'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888ea8] uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#1b2e4b] divide-y divide-gray-200 dark:divide-[#1b2e4b]">
                  {cotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.id} className="hover:bg-gray-50 dark:hover:bg-[#253a5e]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{cotizacion.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {cotizacion.clientes?.[0]?.customer_name || t('no_name')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#888ea8]">
                        {cotizacion.clientes?.[0]?.customer_contact || t('no_contact')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#888ea8]">
                        {getTotalPersons(cotizacion.clientes || [])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cotizacion.finished)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cotizacion.sold
                          ? <span className="px-2 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">💰 {t('sold') || 'Sold'}</span>
                          : <span className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-[#5c6f8a] bg-gray-100 dark:bg-[#253a5e] rounded-full">{t('not_sold') || 'Not sold'}</span>
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#888ea8]">
                        {formatDate(cotizacion.creation_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <div className="relative group">
                            <Link
                              href={`/cotizacion/${cotizacion.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors block"
                            >
                              <FaEye className="w-4 h-4" />
                            </Link>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {t('view_details')}
                            </span>
                          </div>
                          <div className="relative group">
                            <Link
                              href={`/clientes/cotizador?load=${cotizacion.id}`}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors block"
                            >
                              <FaEdit className="w-4 h-4" />
                            </Link>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {t('edit')}
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                              onClick={() => handleDuplicate(cotizacion.id)}
                            >
                              <FaCopy className="w-4 h-4" />
                            </button>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {t('duplicate')}
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              onClick={() => setDeleteModal({
                                open: true,
                                id: cotizacion.id,
                                name: cotizacion.clientes?.[0]?.customer_name || '',
                              })}
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              {t('delete')}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white dark:bg-[#1b2e4b] px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-[#1b2e4b] sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[#253a5e] text-sm font-medium rounded-md text-gray-700 dark:text-[#e0e6ed] bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previous')}
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-[#253a5e] text-sm font-medium rounded-md text-gray-700 dark:text-[#e0e6ed] bg-white dark:bg-[#1b2e4b] hover:bg-gray-50 dark:hover:bg-[#253a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-[#e0e6ed]">
                    {t('showing_from')}{' '}
                    <span className="font-medium">
                      {((pagination.currentPage - 1) * pagination.limit) + 1}
                    </span>{' '}
                    {t('showing_to')}{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    {t('showing_of')}{' '}
                    <span className="font-medium">{pagination.totalCount}</span>{' '}
                    {t('showing_results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-[#253a5e] bg-white dark:bg-[#1b2e4b] text-sm font-medium text-gray-500 dark:text-[#888ea8] hover:bg-gray-50 dark:hover:bg-[#253a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                      if (pageNum > pagination.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.currentPage
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-[#1b2e4b] border-gray-300 dark:border-[#253a5e] text-gray-500 dark:text-[#888ea8] hover:bg-gray-50 dark:hover:bg-[#253a5e]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-[#253a5e] bg-white dark:bg-[#1b2e4b] text-sm font-medium text-gray-500 dark:text-[#888ea8] hover:bg-gray-50 dark:hover:bg-[#253a5e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
