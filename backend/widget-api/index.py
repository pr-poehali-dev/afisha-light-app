import os
import io
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


def upload_photo_to_vk(img_url: str, token: str) -> str | None:
    """Скачивает картинку с CDN и загружает в VK через appWidgets, возвращает cover_id."""
    try:
        # 1. Получаем сервер для загрузки — требует сервисный токен приложения
        service_token = os.environ.get('VK_SERVICE_TOKEN', '')
        resp = vk_call('appWidgets.getAppImageUploadServer', {'image_type': 'rectangle'}, service_token)
        if 'error' in resp:
            print(f"[cover] getAppImageUploadServer error: {resp['error']}")
            return None
        upload_url = resp['response']['upload_url']

        # 2. Скачиваем картинку с CDN
        with urllib.request.urlopen(img_url, timeout=10) as r:
            img_data = r.read()
            content_type = r.headers.get('Content-Type', 'image/jpeg')

        # 3. Загружаем на сервер VK (multipart/form-data вручную)
        boundary = '----VKBoundary7MA4YWxkTrZu0gW'
        filename = img_url.split('/')[-1] or 'photo.jpg'
        body = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
            f'Content-Type: {content_type}\r\n\r\n'
        ).encode() + img_data + f'\r\n--{boundary}--\r\n'.encode()

        req = urllib.request.Request(upload_url, data=body, method='POST')
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        with urllib.request.urlopen(req, timeout=20) as r:
            upload_resp = json.loads(r.read())

        print(f"[cover] upload resp: {upload_resp}")

        # 4. Сохраняем изображение и получаем id — тоже сервисный токен
        save_resp = vk_call('appWidgets.saveAppImage', {'hash': upload_resp.get('hash', '')}, service_token)
        print(f"[cover] saveAppImage resp: {save_resp}")
        if 'error' in save_resp:
            return None
        return save_resp['response'].get('id')
    except Exception as ex:
        print(f"[cover] upload_photo_to_vk error: {ex}")
        return None


def build_widget(events: list, widget_type: str, title: str,
                 btn1_text: str, btn2_text: str, group_id: int, show_rows: int = 3, token: str = '') -> dict:
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
        img = e.get('image', '')

        if widget_type == 'tiles':
            row = {
                'title': e.get('title', ''),
                'link': app_url,
                'text': date_label,
                'button': btn1_text,
                'button_url': app_url,
            }
            if img:
                row['images'] = [{'url': img, 'width': 200, 'height': 200}]
        elif widget_type == 'cover_list':
            row = {
                'title': e.get('title', ''),
                'title_url': app_url,
                'button': btn1_text,
                'button_url': app_url,
                'text': date_label,
            }
            if img and token:
                cover_id = upload_photo_to_vk(img, token)
                if cover_id:
                    row['cover_id'] = cover_id
                else:
                    row['images'] = [{'url': img, 'width': 510, 'height': 128}]
            elif img:
                row['images'] = [{'url': img, 'width': 510, 'height': 128}]
        else:
            row = {
                'title': e.get('title', ''),
                'title_url': app_url,
                'button': btn1_text,
                'button_url': app_url,
                'text': date_label,
            }
            if img:
                row['images'] = [{'url': img, 'width': 510, 'height': 128}]

        rows.append(row)

    rows_key = 'tiles' if widget_type == 'tiles' else 'rows'

    widget = {
        'title': title,
        'title_url': app_url,
        'more': btn2_text,
        'more_url': app_url,
        rows_key: rows,
    }

    # Для table VK ожидает поле body вместо rows
    if widget_type == 'table':
        body_rows = []
        for r in rows:
            body_rows.append([
                {'text': r['title'], 'url': r.get('title_url', app_url)},
                {'text': r.get('text', '')},
                {'text': r.get('button', ''), 'url': r.get('button_url', app_url)},
            ])
        widget.pop('rows', None)
        widget['body'] = body_rows

    VALID_VK_TYPES = ('compact_list', 'list', 'cover_list', 'tiles', 'table')
    return widget, widget_type if widget_type in VALID_VK_TYPES else 'compact_list'


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
            visibility = body.get('visibility', 'all')
            if visibility not in ('all', 'members', 'admin'):
                visibility = 'all'

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
                events_data, widget_type, title, btn1_text, btn2_text, vk_group_id, show_rows, token
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

            # Сохраняем настройки виджета (включая visibility) в БД
            cur.execute(
                f"""INSERT INTO {SCHEMA}.widget_settings (vk_group_id, visibility)
                    VALUES (%s, %s)
                    ON CONFLICT (vk_group_id) DO UPDATE SET visibility = EXCLUDED.visibility, updated_at = NOW()""",
                (abs(vk_group_id), visibility)
            )
            conn.commit()

            return ok({'success': True, 'widget_type': vk_type, 'events_count': len(events_data)})

        # POST ?action=remove — убрать виджет из группы
        if method == 'POST' and action == 'remove':
            token = body.get('group_token', '')
            if not token:
                return err('Токен сообщества не передан')

            resp = vk_call('appWidgets.update', {
                'type': 'text',
                'code': 'return {"title":"·","text":"·"};',
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