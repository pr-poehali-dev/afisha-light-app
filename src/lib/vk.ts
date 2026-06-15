import bridge from '@vkontakte/vk-bridge';

export function initVKBridge() {
  bridge.send('VKWebAppInit');
}

// Парсит параметры запуска из URL
export function parseVKParams(): {
  vk_user_id: number;
  vk_group_id: number;
  is_admin: boolean;
} {
  const params = new URLSearchParams(window.location.search);
  const vk_user_id = parseInt(params.get('vk_user_id') || '0', 10);
  const vk_group_id = parseInt(params.get('vk_group_id') || '0', 10);
  const role = params.get('vk_viewer_group_role') || '';
  const is_admin = ['admin', 'editor', 'moder'].includes(role);
  return { vk_user_id, vk_group_id, is_admin };
}

// Получить токен сообщества автоматически через VK Bridge
// Вызывать только при наличии vk_group_id (приложение открыто в сообществе)
export async function getGroupToken(groupId: number): Promise<string | null> {
  try {
    const res = await bridge.send('VKWebAppGetCommunityToken', {
      app_id: parseInt(new URLSearchParams(window.location.search).get('vk_app_id') || '0'),
      group_id: groupId,
      scope: 'messages,manage',
    });
    return res.access_token ?? null;
  } catch {
    return null;
  }
}

// Поделиться ссылкой через VK
export async function vkShare(message: string) {
  try {
    await bridge.send('VKWebAppShare', { link: window.location.href, message });
  } catch {
    // ignore
  }
}

// Разрешить уведомления
export async function vkAllowNotifications() {
  try {
    return await bridge.send('VKWebAppAllowNotifications');
  } catch {
    return null;
  }
}

export default bridge;
