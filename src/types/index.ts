export type Page =
  | 'main'
  | 'past'
  | 'show_event'
  | 'add_event'
  | 'edit_event'
  | 'manager'
  | 'places'
  | 'mailings'
  | 'widget'
  | 'settings'
  | 'add_order';

export interface VkAppParams {
  is_admin: boolean;
  vk_group_id: number;
  vk_user_id: number;
  widget_name?: string;
}

export type EventCategory =
  | 'Концерт'
  | 'Театр'
  | 'Выставка'
  | 'Лекция'
  | 'Мастер-класс'
  | 'Спорт'
  | 'Фестиваль'
  | 'Кино'
  | 'Детское'
  | 'Экскурсия'
  | 'Конференция'
  | 'Форум'
  | 'Тренинг'
  | 'Вебинар'
  | 'Ярмарка'
  | 'Выпускной'
  | 'Корпоратив'
  | 'Благотворительность'
  | 'Религиозное'
  | 'Флешмоб'
  | 'Встреча'
  | 'Другое';

export type EventScheduleType = 'once' | 'schedule' | 'multiday';

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
  tags?: string[];
  description: string;
  address: string;
  city: string;
  place: string;
  place_id?: number;
  is_free: boolean;
  price: number;
  price_from?: number;
  price_to?: number;
  age: string;
  image: string;
  dates: EventDate[];
  schedule_type?: EventScheduleType;
  show_dates?: boolean;
  is_past: boolean;
  private: 0 | 1 | 2 | 3;
  online: boolean;
  priority?: 0 | 1 | 2; // 0=общий, 1=высокий, 2=высший
  link1_url?: string;
  link1_label?: string;
  link2_url?: string;
  link2_label?: string;
  admin_notes?: string;
  publish_at?: string | null; // ISO datetime, null = опубликовано сразу
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
  vk_group_id?: number;
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