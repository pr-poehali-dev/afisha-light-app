import os
import json
import psycopg2
import urllib.request
import urllib.parse
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8923173_afisha_light_app')
VK_API = 'https://api.vk.com/method'
VK_V = '5.199'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def vk_call(method, params, token):
    params['access_token'] = token
    params['v'] = VK_V
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"{VK_API}/{method}", data=data, method='POST')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())





def months_ru(month: int) -> str:
    return ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][month - 1]

def format_date(date_str: str) -> str:
    parts = date_str.split('-')
    if len(parts) != 3:
        return date_str
    return f"{int(parts[2])} {months_ru(int(parts[1]))}"


def build_widget(events: list, widget_type: str, title: str,
                 btn1_text: str, btn2_text: str, group_id: int, show_rows: int = 3) -> dict:
    """Формирует объект виджета VK по типу: cover_list, tiles, compact_list, table, table_two_cols, calendar."""

    app_url = f"https://vk.com/app{os.environ.get('VK_APP_ID', '0')}_-{abs(group_id)}"

    # Ограничиваем количество событий
    max_rows = {
        'compact_list': min(show_rows, 6),
        'cover_list':   min(show_rows, 3),
        'tiles':        min(show_rows, 10),
        'table':        min(show_rows, 10),
        'table_two_cols': min(show_rows, 10),
    }.get(widget_type, show_rows)
    events = events[:max_rows]

    rows = []
    for e in events:
        dates = e.get('dates', [])
        if isinstance(dates, str):
            dates = json.loads(dates)
        date_str = format_date(dates[0]['date']) if dates else ''
        time_str = dates[0].get('start_time', '') if dates else ''
        date_label = f"{date_str} · {time_str}".strip(' ·')

        row = {
            'title': e.get('title', ''),
            'title_url': app_url,
            'button': btn1_text,
            'button_url': app_url,
            'text': date_label,
        }

        img = e.get('image', '')
        if img:
            row['images'] = [{'url': img, 'width': 510, 'height': 128}]

        rows.append(row)

    # tiles и table_two_cols используют другой ключ
    if widget_type == 'tiles':
        rows_key = 'tiles'
    elif widget_type == 'table_two_cols':
        rows_key = 'rows'
    else:
        rows_key = 'rows'

    widget = {
        'title': title,
        'title_url': app_url,
        'more': btn2_text,
        'more_url': app_url,
        rows_key: rows,
    }

    return widget, widget_type if widget_type in ('compact_list', 'list', 'table') else 'compact_list'


def handler(event: dict, context) -> dict:
    """API для публикации виджета ВКонтакте. POST ?action=publish — публикует виджет."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    vk_group_id = int(params.get('vk_group_id', 0))

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET ?action=events — получить список событий для выбора
        if method == 'GET' and action == 'events':
            cur.execute(
                f"""SELECT id, title, dates, image, vk_group_id, type FROM {SCHEMA}.events
                    WHERE vk_group_id = %s AND is_past = FALSE
                      AND (publish_at IS NULL OR publish_at <= NOW())
                    ORDER BY priority DESC, (dates->0->>'date') ASC NULLS LAST
                    LIMIT 20""",
                (vk_group_id,)
            )
            return ok(cur.fetchall())

        # POST ?action=publish — опубликовать виджет
        if method == 'POST' and action == 'publish':
            token = body.get('group_token', '')
            if not token:
                return err('Токен сообщества не передан')

            event_ids = body.get('event_ids', [])
            widget_type = body.get('widget_type', 'compact_list')
            title = body.get('title', 'Афиша')
            btn1_text = body.get('btn1_text', 'Подробнее')
            btn2_text = body.get('btn2_text', 'Показать все мероприятия')
            show_rows = int(body.get('show_rows', 3))

            if not event_ids:
                return err('Выберите хотя бы одно мероприятие')

            # Получаем выбранные события
            placeholders = ','.join(['%s'] * len(event_ids))
            cur.execute(
                f"SELECT * FROM {SCHEMA}.events WHERE id IN ({placeholders}) AND vk_group_id = %s",
                (*event_ids, vk_group_id)
            )
            events_data = cur.fetchall()

            # Сортируем по порядку выбора
            id_order = {eid: i for i, eid in enumerate(event_ids)}
            events_data.sort(key=lambda e: id_order.get(e['id'], 99))

            widget_data, vk_type = build_widget(
                events_data, widget_type, title, btn1_text, btn2_text, vk_group_id, show_rows
            )

            code = f"return {json.dumps(widget_data, ensure_ascii=False)};"
            print(f"[widget] publishing type={vk_type}, code={code[:200]}")

            # Публикуем через VK API
            resp = vk_call('appWidgets.update', {
                'type': vk_type,
                'code': code,
                'group_id': abs(vk_group_id),
            }, token)

            print(f"[widget] appWidgets.update resp: {resp}")

            if 'error' in resp:
                return err(f"VK API: {resp['error'].get('error_msg', 'Неизвестная ошибка')}")

            return ok({'success': True, 'widget_type': vk_type, 'events_count': len(events_data)})

        # POST ?action=remove — убрать виджет из группы
        if method == 'POST' and action == 'remove':
            token = body.get('group_token', '')
            if not token:
                return err('Токен сообщества не передан')

            resp = vk_call('appWidgets.update', {
                'type': 'text',
                'code': 'return {"title":" ","body":" "};',
                'group_id': abs(vk_group_id),
            }, token)

            print(f"[widget] remove resp: {resp}")

            if 'error' in resp:
                return err(f"VK API: {resp['error'].get('error_msg', 'Неизвестная ошибка')}")

            return ok({'success': True})

        return err('Unknown action', 405)

    finally:
        cur.close()
        conn.close()