const API = 'https://functions.poehali.dev/27dbad0f-437f-4070-baa3-06f68e1505f6';

export interface LandingSettings {
  vk_group_id?: number;
  site_title: string;
  site_desc: string;
  accent_color: string;
  bg_color: string;
  logo_url: string;
  show_past: boolean;
  show_price: boolean;
  show_vk_button: boolean;
  vk_button_text: string;
  events_count: number;
}

export const DEFAULT_SETTINGS: LandingSettings = {
  site_title: 'Афиша',
  site_desc: '',
  accent_color: '#7C3AED',
  bg_color: '#F5F5F7',
  logo_url: '',
  show_past: false,
  show_price: true,
  show_vk_button: true,
  vk_button_text: 'Открыть в VK',
  events_count: 10,
};

export async function fetchLandingSettings(groupId: number): Promise<LandingSettings> {
  const res = await fetch(`${API}?action=settings&vk_group_id=${groupId}`);
  const data = await res.json();
  return { ...DEFAULT_SETTINGS, ...data };
}

export async function saveLandingSettings(groupId: number, settings: LandingSettings): Promise<LandingSettings> {
  const res = await fetch(`${API}?action=settings&vk_group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export function getLandingUrl(groupId: number): string {
  return `${API}?group_id=${groupId}`;
}

export function getPublicLandingUrl(groupId: number): string {
  return `https://${groupId}.a-fisha.ru`;
}
