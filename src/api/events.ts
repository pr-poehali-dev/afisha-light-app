import type { EventItem } from '@/types';

const API = 'https://functions.poehali.dev/e1916b46-896b-4132-90a4-340801197985';
const VK_GROUP_ID = 234136199;

function toEvent(row: Record<string, unknown>): EventItem {
  return {
    id: row.id as number,
    vk_group_id: row.vk_group_id as number,
    title: row.title as string,
    type: row.type as EventItem['type'],
    description: row.description as string,
    city: row.city as string,
    address: row.address as string,
    place: row.place as string,
    image: row.image as string,
    age: row.age as string,
    is_free: row.is_free as boolean,
    price: row.price as number,
    online: row.online as boolean,
    is_past: row.is_past as boolean,
    private: row.private as EventItem['private'],
    dates: row.dates as EventItem['dates'],
  };
}

export async function fetchEvents(isPast = false): Promise<EventItem[]> {
  const res = await fetch(`${API}?vk_group_id=${VK_GROUP_ID}&past=${isPast}`);
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(toEvent);
}

export async function createEvent(ev: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...ev, vk_group_id: VK_GROUP_ID }),
  });
  return toEvent(await res.json());
}

export async function updateEvent(id: number, ev: Partial<EventItem>): Promise<EventItem> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ev),
  });
  return toEvent(await res.json());
}

export async function deleteEvent(id: number): Promise<void> {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
}
