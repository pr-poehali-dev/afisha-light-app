import bridge from '@vkontakte/vk-bridge';

export function initVKBridge() {
  bridge.send('VKWebAppInit');
}

export interface VKParams {
  vk_user_id: number;
  vk_group_id: number;
  is_admin: boolean;
}

export function parseVKParams(): VKParams {
  const p = new URLSearchParams(window.location.search);
  const vk_group_id = parseInt(p.get('vk_group_id') || '0', 10);
  const vk_user_id  = parseInt(p.get('vk_user_id')  || '0', 10);
  const role = p.get('vk_viewer_group_role') || '';
  const is_admin = ['admin', 'editor', 'moder'].includes(role);
  return { vk_user_id, vk_group_id, is_admin };
}

export function getAppId(): number {
  return parseInt(new URLSearchParams(window.location.search).get('vk_app_id') || '0', 10);
}

// Единый токен сообщества со всеми правами — запрашивается при старте
export async function getGroupToken(groupId: number): Promise<string | null> {
  try {
    const res = await bridge.send('VKWebAppGetCommunityToken', {
      app_id: getAppId(),
      group_id: groupId,
      scope: 'messages,photos,wall,docs,manage,app_widget',
    });
    return res.access_token ?? null;
  } catch {
    return null;
  }
}

// Алиасы для обратной совместимости
export const getGroupTokenForPhotos = getGroupToken;
export const getGroupTokenForWidget = getGroupToken;

export async function vkShare(message: string) {
  try { await bridge.send('VKWebAppShare', { link: window.location.href, message }); } catch (e) { void e; }
}

export async function vkAllowNotifications() {
  try { return await bridge.send('VKWebAppAllowNotifications'); } catch (e) { void e; return null; }
}

export default bridge;
