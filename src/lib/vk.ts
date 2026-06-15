import bridge from '@vkontakte/vk-bridge';

export function initVKBridge() {
  bridge.send('VKWebAppInit');
}

export interface VKParams {
  vk_user_id: number;
  vk_group_id: number;
  is_admin: boolean;
}

// Парсит параметры запуска из URL — единственный источник истины
export function parseVKParams(): VKParams {
  const p = new URLSearchParams(window.location.search);
  const vk_group_id = parseInt(p.get('vk_group_id') || '0', 10);
  const vk_user_id  = parseInt(p.get('vk_user_id')  || '0', 10);
  const role = p.get('vk_viewer_group_role') || '';
  const is_admin = ['admin', 'editor', 'moder'].includes(role);
  return { vk_user_id, vk_group_id, is_admin };
}

// Получить app_id из URL
export function getAppId(): number {
  return parseInt(new URLSearchParams(window.location.search).get('vk_app_id') || '0', 10);
}

// Токен сообщества для рассылки
export async function getGroupToken(groupId: number): Promise<string | null> {
  try {
    const res = await bridge.send('VKWebAppGetCommunityToken', {
      app_id: getAppId(),
      group_id: groupId,
      scope: 'messages,manage',
    });
    return res.access_token ?? null;
  } catch {
    return null;
  }
}

// Токен сообщества для виджетов
export async function getGroupTokenForWidget(groupId: number): Promise<string | null> {
  try {
    const res = await bridge.send('VKWebAppGetCommunityToken', {
      app_id: getAppId(),
      group_id: groupId,
      scope: 'app_widget',
    });
    return res.access_token ?? null;
  } catch {
    return null;
  }
}

// Поделиться через VK
export async function vkShare(message: string) {
  try { await bridge.send('VKWebAppShare', { link: window.location.href, message }); } catch (e) { void e; }
}

// Уведомления
export async function vkAllowNotifications() {
  try { return await bridge.send('VKWebAppAllowNotifications'); } catch (e) { void e; return null; }
}

export default bridge;