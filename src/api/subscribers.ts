const API = 'https://functions.poehali.dev/484c6b24-3e1d-42ec-a03a-57a527b1cbd1';
const VK_GROUP_ID = 234136199;

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

export async function fetchStats(): Promise<{ stats: Stats; mailings: Mailing[] }> {
  const res = await fetch(`${API}?action=stats&vk_group_id=${VK_GROUP_ID}`);
  return res.json();
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const res = await fetch(`${API}?action=list&vk_group_id=${VK_GROUP_ID}`);
  return res.json();
}

export async function scanSubscribers(): Promise<{ added: number }> {
  const res = await fetch(`${API}?action=scan&vk_group_id=${VK_GROUP_ID}`, { method: 'POST' });
  return res.json();
}

export async function importSubscribers(ids: string): Promise<{ added: number; total: number }> {
  const res = await fetch(`${API}?action=import&vk_group_id=${VK_GROUP_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

export async function sendMailing(title: string, message: string): Promise<{ sent: number; errors: number }> {
  const res = await fetch(`${API}?action=send&vk_group_id=${VK_GROUP_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, message }),
  });
  return res.json();
}

export function exportSubscribersUrl(): string {
  return `${API}?action=export&vk_group_id=${VK_GROUP_ID}`;
}

export async function clearSubscribers(): Promise<{ deleted: number }> {
  const res = await fetch(`${API}?action=clear&vk_group_id=${VK_GROUP_ID}`, { method: 'DELETE' });
  return res.json();
}
