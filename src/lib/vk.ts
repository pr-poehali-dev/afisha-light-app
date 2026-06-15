import bridge from '@vkontakte/vk-bridge';

export function initVKBridge() {
  bridge.send('VKWebAppInit');
}

// Парсит параметры запуска из URL (vk_user_id, vk_group_id, vk_viewer_group_role и т.д.)
export function parseVKParams(): {
  vk_user_id: number;
  vk_group_id: number;
  is_admin: boolean;
} {
  const params = new URLSearchParams(window.location.search);

  const vk_user_id = parseInt(params.get('vk_user_id') || '0', 10);
  const vk_group_id = parseInt(params.get('vk_group_id') || '0', 10);

  // Роли: admin, editor, moder — все считаем админами
  const role = params.get('vk_viewer_group_role') || '';
  const is_admin = ['admin', 'editor', 'moder'].includes(role);

  return { vk_user_id, vk_group_id, is_admin };
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
