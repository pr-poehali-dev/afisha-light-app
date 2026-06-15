import os
import io
import json
import psycopg2
import urllib.request
import urllib.parse
import urllib.error
from PIL import Image
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

# Точные размеры для каждого типа изображения VK
VK_IMAGE_SIZES = {
    '510x128':  (1530, 384),   # cover_list (VK умножает на 3)
    '160x160':  (480, 480),    # tiles
    'other':    (480, 480),
}

def resize_image(img_data: bytes, target_w: int, target_h: int) -> tuple[bytes, str]:
    """Ресайзит изображение под точный размер (crop по центру)."""
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    src_w, src_h = img.size
    src_ratio = src_w / src_h
    tgt_ratio = target_w / target_h
    if src_ratio > tgt_ratio:
        new_h = src_h
        new_w = int(src_h * tgt_ratio)
    else:
        new_w = src_w
        new_h = int(src_w / tgt_ratio)
    left = (src_w - new_w) // 2
    top = (src_h - new_h) // 2
    img = img.crop((left, top, left + new_w, top + new_h))
    img = img.resize((target_w, target_h), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=92)
    return buf.getvalue(), 'image/jpeg'


def upload_image_to_vk(image_url: str, token: str, group_id: int, image_type: str = 'other') -> str | None:
    """Загружает изображение в VK через appWidgets API. Возвращает id или None."""
    try:
        # 1. Получаем URL для загрузки (group_id не передаём — берётся из токена)
        upload_resp = vk_call('appWidgets.getGroupImageUploadServer', {
            'image_type': image_type,
        }, token)
        if 'error' in upload_resp:
            print(f"[widget] getGroupImageUploadServer error: {upload_resp['error']}")
            return None
        upload_url = upload_resp.get('response', {}).get('upload_url')
        if not upload_url:
            return None

        # 2. Скачиваем и ресайзим под нужный размер
        with urllib.request.urlopen(image_url, timeout=10) as r:
            img_data = r.read()
        target_w, target_h = VK_IMAGE_SIZES.get(image_type, (480, 480))
        img_data, content_type = resize_image(img_data, target_w, target_h)
        print(f"[widget] resized to {target_w}x{target_h}, size: {len(img_data)} bytes")

        # 3. Загружаем в VK через multipart/form-data (поле photo)
        boundary = '----VKWidgetBoundary'
        body = (
            f'--{boundary}\r\n'
            f'Content-Disposition: form-data; name="photo"; filename="image.jpg"\r\n'
            f'Content-Type: {content_type}\r\n\r\n'
        ).encode() + img_data + f'\r\n--{boundary}--\r\n'.encode()

        req = urllib.request.Request(upload_url, data=body, method='POST')
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
        with urllib.request.urlopen(req, timeout=15) as r:
            upload_result = json.loads(r.read())
        print(f"[widget] upload_result: {upload_result}")

        # 4. Сохраняем — новый upload API возвращает sha вместо image
        # Пробуем передать sha как image, и также через photo
        save_params = {
            'server': str(upload_result.get('server', '')),
            'hash': str(upload_result.get('hash', '')),
            'image': str(upload_result.get('sha', '')),
            'photo': json.dumps(upload_result),
        }
        print(f"[widget] saveGroupImage params: {save_params}")
        save_resp = vk_call('appWidgets.saveGroupImage', save_params, token)
        if 'error' in save_resp:
            print(f"[widget] saveGroupImage error: {save_resp['error']}")
            return None

        img_id = save_resp.get('response', {}).get('id')
        print(f"[widget] saved image id: {img_id}")
        return img_id
    except Exception as ex:
        print(f"[widget] upload_image_to_vk exception: {ex}")
        return None


def months_ru(month: int) -> str:
    return ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'][month - 1]

def format_date(date_str: str) -> str:
    parts = date_str.split('-')
    if len(parts) != 3:
        return date_str
    return f"{int(parts[2])} {months_ru(int(parts[1]))}"


def build_widget(events: list, widget_type: str, title: str,
                 btn1_text: str, btn2_text: str, group_id: int, token: str = '') -> dict:
    """Формирует объект виджета VK по типу: cover_list, tiles, compact_list."""

    app_url = f"https://vk.com/app{os.environ.get('VK_APP_ID', '0')}_-{abs(group_id)}"

    # Для cover_list и tiles нужны изображения загруженные в VK
    needs_vk_image = widget_type in ('cover_list', 'tiles')

    rows = []
    for e in events:
        dates = e.get('dates', [])
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
            if needs_vk_image and token:
                # Определяем тип изображения по widget_type
                img_type = '510x128' if widget_type == 'cover_list' else '160x160'
                vk_img_id = upload_image_to_vk(img, token, group_id, img_type)
                if vk_img_id:
                    row['cover_id'] = vk_img_id
                else:
                    # Fallback — передаём images (VK может принять для некоторых типов)
                    row['images'] = [{'url': img, 'width': 510, 'height': 128}]
            else:
                row['images'] = [{'url': img, 'width': 400, 'height': 400}]

        rows.append(row)

    widget = {
        'title': title,
        'title_url': app_url,
        'more': btn2_text,
        'more_url': app_url,
        'rows': rows,
    }

    vk_type_map = {
        'cover_list': 'cover_list',
        'tiles': 'tiles',
        'compact_list': 'compact_list',
    }

    return widget, vk_type_map.get(widget_type, 'compact_list')


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
                events_data, widget_type, title, btn1_text, btn2_text, vk_group_id, token
            )

            # Публикуем через VK API
            resp = vk_call('appWidgets.update', {
                'type': vk_type,
                'code': f"return {json.dumps(widget_data, ensure_ascii=False)};",
                'group_id': abs(vk_group_id),
            }, token)

            if 'error' in resp:
                return err(f"VK API: {resp['error'].get('error_msg', 'Неизвестная ошибка')}")

            return ok({'success': True, 'widget_type': vk_type, 'events_count': len(events_data)})

        return err('Unknown action', 405)

    finally:
        cur.close()
        conn.close()