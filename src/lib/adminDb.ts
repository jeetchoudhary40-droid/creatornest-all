// Admin DB helper — uses the secure server-side API route with service_role key
// Never calls Supabase directly from admin forms

const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('access_token') || '';
};

async function adminDb(action: string, table: string, payload: object) {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': getAdminToken(),
    },
    body: JSON.stringify({ action, table, ...payload }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || 'Admin DB error');
  }
  return json;
}

export const adminInsert = (table: string, data: object) =>
  adminDb('insert', table, { data });

export const adminUpdate = (table: string, id: string, data: object) =>
  adminDb('update', table, { id, data });

export const adminDelete = (table: string, id: string) =>
  adminDb('delete', table, { id });

export const adminUpsert = (table: string, data: object) =>
  adminDb('upsert', table, { data });

export const adminUpdateWhere = (table: string, where: object, data: object) =>
  adminDb('update_where', table, { where, data });
