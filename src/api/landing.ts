const API = 'https://functions.poehali.dev/27dbad0f-437f-4070-baa3-06f68e1505f6';

export interface LandingSettings {
  site_title: string;
  site_desc: string;
  site_domain: string;
  index_title: string;
  phone: string;
  email: string;
  address: string;
  tg_link: string;
  vk_link: string;
  wa_link: string;
  any_link: string;
  any_link_title: string;
  accent_color: string;
  bg_color: string;
  text_color: string;
  muted_text_color: string;
  header_text_color: string;
  header_text_size: number;
  date_text_color: string;
  date_text_size: number;
  button_text_color: string;
  button_bg_color: string;
  button_border_radius: number;
  button_text_size: number;
  card_border_radius: number;
  card_cards_border_radius: number;
  layout_max_width: number;
  view_default: 'list' | 'cards';
  show_buttons: boolean;
  show_price: boolean;
  show_vk_button: boolean;
  vk_button_text: string;
  logo_url: string;
  image_logo_url: string;
  image_header_url: string;
  vk_pixel_id: string;
  yandex_metrika_id: string;
  show_past: boolean;
  events_count: number;
}

export const DEFAULT_SETTINGS: LandingSettings = {
  site_title: 'Афиша', site_desc: '', site_domain: '', index_title: '',
  phone: '', email: '', address: '',
  tg_link: '', vk_link: '', wa_link: '', any_link: '', any_link_title: '',
  accent_color: '#7C3AED', bg_color: '#F5F5F7',
  text_color: '#111111', muted_text_color: '#666666',
  header_text_color: '#111111', header_text_size: 16,
  date_text_color: '#7C3AED', date_text_size: 13,
  button_text_color: '#ffffff', button_bg_color: '#7C3AED',
  button_border_radius: 10, button_text_size: 13,
  card_border_radius: 10, card_cards_border_radius: 16,
  layout_max_width: 720, view_default: 'list',
  show_buttons: true, show_price: true,
  show_vk_button: true, vk_button_text: 'Открыть в VK',
  logo_url: '', image_logo_url: '', image_header_url: '',
  vk_pixel_id: '', yandex_metrika_id: '',
  show_past: false, events_count: 10,
};

export async function fetchLandingSettings(groupId: number): Promise<LandingSettings> {
  const res = await fetch(`${API}?action=settings&vk_group_id=${groupId}`);
  const data = await res.json();
  return { ...DEFAULT_SETTINGS, ...data };
}

export async function saveLandingSettings(groupId: number, s: LandingSettings): Promise<LandingSettings> {
  const res = await fetch(`${API}?action=settings&vk_group_id=${groupId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s),
  });
  return res.json();
}

export function getLandingUrl(groupId: number): string {
  return `${API}?group_id=${groupId}`;
}

export function getPublicLandingUrl(groupId: number): string {
  return `https://${groupId}.a-fisha.ru`;
}
