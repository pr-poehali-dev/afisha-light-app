import type { Place } from '@/types';

const API = 'https://functions.poehali.dev/fa74754a-e668-4409-8ede-54e8f751aa18';
const VK_GROUP_ID = 234136199;

function toPlace(row: Record<string, unknown>): Place {
  return {
    id: row.id as number,
    vk_group_id: row.vk_group_id as number,
    name: row.name as string,
    city: row.city as string,
    address: row.address as string,
  };
}

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch(`${API}?vk_group_id=${VK_GROUP_ID}`);
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(toPlace);
}

export async function createPlace(p: Omit<Place, 'id'>): Promise<Place> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...p, vk_group_id: VK_GROUP_ID }),
  });
  return toPlace(await res.json());
}

export async function updatePlace(id: number, p: Omit<Place, 'id'>): Promise<Place> {
  const res = await fetch(`${API}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  return toPlace(await res.json());
}
