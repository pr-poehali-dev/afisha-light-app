const API = 'https://functions.poehali.dev/3372e164-5437-4803-9d65-4c588c60d2c4';

export interface WidgetEvent {
  id: number;
  title: string;
  dates: { date: string; start_time: string; finish_time?: string }[];
  image: string;
  type: string;
  vk_group_id: number;
}

export async function fetchWidgetEvents(groupId: number): Promise<WidgetEvent[]> {
  const res = await fetch(`${API}?action=events&vk_group_id=${groupId}`);
  return res.json();
}

export async function removeWidget(groupId: number, token: string): Promise<{ success?: boolean; error?: string }> {
  const res = await fetch(`${API}?action=remove&vk_group_id=${groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_token: token }),
  });
  return res.json();
}

export async function publishWidget(params: {
  groupId: number;
  token: string;
  eventIds: number[];
  widgetType: string;
  title: string;
  btn1Text: string;
  btn2Text: string;
  showRows: number;
  visibility: string;
}): Promise<{ success?: boolean; error?: string }> {
  const res = await fetch(`${API}?action=publish&vk_group_id=${params.groupId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      group_token: params.token,
      event_ids: params.eventIds,
      widget_type: params.widgetType,
      title: params.title,
      btn1_text: params.btn1Text,
      btn2_text: params.btn2Text,
      show_rows: params.showRows,
      visibility: params.visibility,
    }),
  });
  return res.json();
}