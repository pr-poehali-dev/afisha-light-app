import type { EventItem } from '@/types';

const API = 'https://functions.poehali.dev/e1916b46-896b-4132-90a4-340801197985';
const VK_GROUP_ID = 234136199;

function toEvent(row: Record<string, unknown>): EventItem {
  return {
    id: row.id as number,
    vk_group_id: row.vk_group_id as number,
    title: row.title as string,
    type: row.type as EventItem['type'],
    tags: (row.tags as string[]) ?? [],
    description: row.description as string,
    city: row.city as string,
    address: row.address as string,
    place: row.place as string,
    place_id: row.place_id as number | undefined,
    image: row.image as string,
    age: row.age as string,
    is_free: row.is_free as boolean,
    price: row.price as number,
    price_from: (row.price_from as number) ?? 0,
    price_to: (row.price_to as number) ?? 0,
    online: row.online as boolean,
    is_past: row.is_past as boolean,
    private: row.private as EventItem['private'],
    dates: row.dates as EventItem['dates'],
    schedule_type: (row.schedule_type as EventItem['schedule_type']) ?? 'once',
    show_dates: row.show_dates !== false,
    priority: (row.priority as EventItem['priority']) ?? 0,
    link1_url: (row.link1_url as string) ?? '',
    link1_label: (row.link1_label as string) ?? 'Билеты',
    link2_url: (row.link2_url as string) ?? '',
    link2_label: (row.link2_label as string) ?? 'Подробнее',
    admin_notes: (row.admin_notes as string) ?? '',
    publish_at: (row.publish_at as string) ?? null,
  };
}

export async function fetchEvents(isPast = false, isAdmin = false): Promise<EventItem[]> {
  const res = await fetch(`${API}?vk_group_id=${VK_GROUP_ID}&past=${isPast}&is_admin=${isAdmin}`);
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
  const res = await fetch(`${API}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ev),
  });
  return toEvent(await res.json());
}

export async function deleteEvent(id: number): Promise<void> {
  await fetch(`${API}?id=${id}`, { method: 'DELETE' });
}
