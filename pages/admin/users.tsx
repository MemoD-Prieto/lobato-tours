import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ROLE_LABELS, ROLE_COLORS, ROLES, type Role } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

interface User {
  id:            number;
  user_name:     string;
  real_name:     string;
  email:         string;
  phone_number:  string | null;
  role:          Role;
  active:        boolean;
  creation_date: string;
}

interface FormState {
  user_name:    string;
  real_name:    string;
  email:        string;
  password:     string;
  phone_number: string;
  role:         Role;
  active:       boolean;
}

const emptyForm = (): FormState => ({
  user_name:    '',
  real_name:    '',
  email:        '',
  password:     '',
  phone_number: '',
  role:         ROLES.USER,
  active:       true,
});

// roleOptions is built inside the component so it can use t()
const getRoleOptions = (t: (key: string) => string): { value: Role; label: string; description: string }[] => [
  { value: ROLES.ADMIN,   label: t('role_admin'),    description: t('role_admin_desc') },
  { value: ROLES.MANAGER, label: t('role_manager'),  description: t('role_manager_desc') },
  { value: ROLES.USER,    label: t('role_user'),     description: t('role_user_desc') },
];

export default function AdminUsers() {
  const router = useRouter();
  const { t } = useTranslation();
  const roleOptions = getRoleOptions(t);

  const [currentUser, setCurrentUser] = useState<{ role: Role; id: number } | null>(null);
  const [users,        setUsers]       = useState<User[]>([]);
  const [loading,      setLoading]     = useState(true);

  // Modal state
  const [modal, setModal] = useState<{ open: boolean; editing: User | null }>({ open: false, editing: null });
  const [form,  setForm]  = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleting,    setDeleting]    = useState(false);

  // Load current session user and check admin access
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((me) => {
        if (me.role !== ROLES.ADMIN) {
          toast.error(t('access_denied'));
          router.replace('/');
          return;
        }
        setCurrentUser(me);
        loadUsers();
      })
      .catch(() => router.replace('/login'));
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      toast.error(t('error_loading_users'));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ open: true, editing: null });
  };

  const openEdit = (u: User) => {
    setForm({
      user_name:    u.user_name,
      real_name:    u.real_name,
      email:        u.email,
      password:     '',
      phone_number: u.phone_number ?? '',
      role:         u.role,
      active:       u.active,
    });
    setModal({ open: true, editing: u });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const editing = modal.editing;
      const url     = editing ? `/api/users/${editing.id}` : '/api/users';
      const method  = editing ? 'PUT' : 'POST';
      const body: Record<string, any> = { ...form };
      // Don't send empty password on edit
      if (editing && !body.password) delete body.password;
      if (!editing) delete body.active; // always true on create

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('error_saving'));
      } else {
        toast.success(editing ? t('user_updated') : t('user_created'));
        setModal({ open: false, editing: null });
        loadUsers();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/users/${deleteModal.user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t('user_delete_error'));
      } else {
        toast.success(t('user_deleted'));
        setDeleteModal({ open: false, user: null });
        loadUsers();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    const res  = await fetch(`/api/users/${u.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !u.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? 'Error');
    } else {
      toast.success(u.active ? t('user_deactivated') : t('user_activated'));
      loadUsers();
    }
  };

  const f = (field: keyof FormState, val: any) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('user_management')}</h1>
          <p className="text-sm text-gray-500 dark:text-[#888ea8] mt-1">{t('admin_panel_subtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('new_user')}
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roleOptions.map((r) => (
          <div key={r.value} className="bg-white dark:bg-[#1b2e4b] rounded-xl border border-gray-100 dark:border-[#1b2e4b] shadow-sm p-4 flex items-start gap-3">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[r.value]} shrink-0 mt-0.5`}>
              {r.label}
            </span>
            <p className="text-xs text-gray-500 dark:text-[#888ea8]">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-[#1b2e4b] rounded-xl border border-gray-200 dark:border-[#1b2e4b] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 dark:text-[#5c6f8a] text-sm">{t('loading_users')}</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400 dark:text-[#5c6f8a] text-sm">{t('no_users_registered')}</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100 dark:divide-[#253a5e]">
            <thead className="bg-gray-50 dark:bg-[#060818]">
              <tr>
                {[t('user_name'), t('full_name'), t('email'), t('phone'), t('role'), t('status'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-[#888ea8] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#253a5e]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#253a5e] transition">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-800 dark:text-white">{u.user_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#e0e6ed]">{u.real_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888ea8]">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#888ea8]">{u.phone_number ?? '–'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={currentUser?.id === u.id}
                      title={currentUser?.id === u.id ? t('cannot_deactivate_own') : ''}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full transition ${
                        u.active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-[#253a5e] dark:text-[#888ea8] dark:hover:bg-[#1b2e4b]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {u.active ? t('account_active') : t('account_inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition font-medium"
                      >
                        {t('edit')}
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => setDeleteModal({ open: true, user: u })}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg transition font-medium"
                        >
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-[#253a5e]">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {modal.editing ? t('edit_user') : t('new_user')}
              </h2>
              <button onClick={() => setModal({ open: false, editing: null })} className="text-gray-400 hover:text-gray-600 dark:text-[#888ea8] dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-1">{t('username_required')}</label>
                  <input
                    required
                    disabled={!!modal.editing}
                    value={form.user_name}
                    onChange={(e) => f('user_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white dark:disabled:bg-[#1b2e4b] dark:disabled:text-[#5c6f8a]"
                    placeholder="jperez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-1">{t('full_name_required')}</label>
                  <input
                    required
                    value={form.real_name}
                    onChange={(e) => f('real_name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-1">{t('email_required')}</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => f('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                  placeholder="juan@lobatotours.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-1">
                    {t('password')} {modal.editing && <span className="text-gray-400 dark:text-[#5c6f8a]">({t('password_keep_blank')})</span>}
                    {!modal.editing && ' *'}
                  </label>
                  <input
                    required={!modal.editing}
                    type="password"
                    value={form.password}
                    onChange={(e) => f('password', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-1">{t('phone_optional')}</label>
                  <input
                    value={form.phone_number}
                    onChange={(e) => f('phone_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-[#253a5e] dark:border-[#253a5e] dark:text-white"
                    placeholder="+52 55 0000 0000"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-[#888ea8] mb-2">{t('role_required')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => f('role', r.value)}
                      className={`rounded-lg border-2 p-3 text-left transition ${
                        form.role === r.value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300 dark:border-[#253a5e] dark:hover:border-[#5c6f8a]'
                      }`}
                    >
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[r.value]}`}>
                        {r.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-[#888ea8] mt-1.5 leading-snug">{r.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active toggle on edit */}
              {modal.editing && (
                <div className="flex items-center gap-3">
                  <input
                    id="active-toggle"
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => f('active', e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <label htmlFor="active-toggle" className="text-sm text-gray-700 dark:text-[#e0e6ed]">{t('account_active_label')}</label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal({ open: false, editing: null })}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-[#e0e6ed] dark:border-[#253a5e] dark:hover:bg-[#253a5e]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-60"
                >
                  {saving ? t('saving') : modal.editing ? t('save_changes') : t('create_user_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-[#1b2e4b] rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{t('delete_user_title')}</h3>
                <p className="text-sm text-gray-500 dark:text-[#888ea8]">{t('cannot_undo_action')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-[#e0e6ed] mb-6">
              {t('delete_user_question', { name: deleteModal.user.real_name, username: deleteModal.user.user_name })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition dark:text-[#e0e6ed] dark:border-[#253a5e] dark:hover:bg-[#253a5e]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
