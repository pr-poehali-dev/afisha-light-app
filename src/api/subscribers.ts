const API = 'https://functions.poehali.dev/484c6b24-3e1d-42ec-a03a-57a527b1cbd1';

export interface Subscriber {
  id: number;
  vk_user_id: number;
  first_name: string;
  last_name: string;
  screen_name: string;
  photo_url: string;
  can_write: boolean;
  source: string;
  created_at: string;
}

export interface Mailing {
  id: number;
  title: string;
  message: string;
  status: string;
  sent_count: number;
  error_count: number;
  created_at: string;
  sent_at: string | null;
}

export interface Stats {
  total: number;
  can_write: number;
}

export async function fetchStats(groupId: number): Promise<{ stats: Stats; mailings: Mailing[] }> {
  const res = await fetch(`${API}?action=stats&vk_group_id=${groupId}`);
  return res.json();
}

export async function fetchSubscribers(groupId: number): Promise<Subscriber[]> {
  const res = await fetch(`${API}?action=list&vk_group_id=${groupId}`);
  return res.json();
}

export async function scanSubscribers(groupId: number, token: string): Promise<{ added: number }> {
  const res = await fetch(`${API}?action=scan&vk_group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_token: token }),
  });
  return res.json();
}

export async function importSubscribers(groupId: number, ids: string): Promise<{ added: number; total: number }> {
  const res = await fetch(`${API}?action=import&vk_group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

export async function sendMailing(groupId: number, title: string, message: string, token: string): Promise<{ sent: number; errors: number }> {
  const res = await fetch(`${API}?action=send&vk_group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message, group_token: token }),
  });
  return res.json();
}

export function exportSubscribersUrl(groupId: number): string {
  return `${API}?action=export&vk_group_id=${groupId}`;
}

export async function clearSubscribers(groupId: number): Promise<{ deleted: number }> {
  const res = await fetch(`${API}?action=clear&vk_group_id=${groupId}`, { method: 'DELETE' });
  return res.json();
}
