export type Page =
  | 'main'
  | 'past'
  | 'show_event'
  | 'add_event'
  | 'edit_event'
  | 'manager'
  | 'places'
  | 'settings'
  | 'add_order';

export interface VkAppParams {
  is_admin: boolean;
  vk_group_id: number;
  vk_user_id: number;
  widget_name?: string;
}

export type EventCategory = 'Концерт' | 'Театр' | 'Выставка' | 'Лекция' | 'Мастер-класс' | 'Спорт';

export interface EventDate {
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:mm
  finish_time?: string;
  hide?: boolean;
}

export interface EventItem {
  id: number;
  vk_group_id: number;
  title: string;
  type: EventCategory;
  description: string;
  address: string;
  city: string;
  place: string;
  is_free: boolean;
  price: number;
  age: string;
  image: string;
  dates: EventDate[];
  is_past: boolean;
  private: 0 | 1 | 2 | 3;
  online: boolean;
}

export interface Order {
  id: number;
  nom: string;
  event_id: number;
  event_title: string;
  event_date: string;
  event_time: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  total_price: number;
  total_count: number;
  currency: string;
  state: 0 | -1 | -2 | -4 | -7 | -8;
  paid: boolean;
  created_at: string;
}

export interface Place {
  id: number;
  name: string;
  city: string;
  address: string;
}

export interface AppConfig {
  widget_name: string;
  org_name: string;
  email: string;
  currency: string;
  hide_past: boolean;
  allow_propose: boolean;
  booking_enabled: boolean;
}
