import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8923173_afisha_light_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}


def handler(event: dict, context) -> dict:
    """CRUD API для событий с новыми полями: теги, приоритет, ссылки, заметки, расписание."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    event_id = None
    if params.get('id', '').isdigit():
        event_id = int(params['id'])

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET — список с сортировкой по приоритету
        if method == 'GET' and not event_id:
            is_past = params.get('past', 'false').lower() == 'true'
            vk_group_id = int(params.get('vk_group_id', 0))
            cur.execute(
                f"""SELECT * FROM {SCHEMA}.events
                    WHERE vk_group_id = %s AND is_past = %s
                    ORDER BY priority DESC, (dates->0->>'date') ASC NULLS LAST, created_at DESC""",
                (vk_group_id, is_past)
            )
            return ok(cur.fetchall())

        # POST — создать
        if method == 'POST':
            tags = body.get('tags', [])
            cur.execute(
                f"""INSERT INTO {SCHEMA}.events
                    (vk_group_id, title, type, tags, description, city, address, place, place_id,
                     image, age, is_free, price, online, is_past, private, dates,
                     schedule_type, show_dates, priority,
                     link1_url, link1_label, link2_url, link2_label, admin_notes)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING *""",
                (
                    body.get('vk_group_id', 0),
                    body.get('title', ''),
                    body.get('type', 'Концерт'),
                    tags,
                    body.get('description', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                    body.get('place', ''),
                    body.get('place_id') or None,
                    body.get('image', ''),
                    body.get('age', '0+'),
                    body.get('is_free', False),
                    body.get('price', 0),
                    body.get('online', False),
                    body.get('is_past', False),
                    body.get('private', 0),
                    json.dumps(body.get('dates', [])),
                    body.get('schedule_type', 'once'),
                    body.get('show_dates', True),
                    body.get('priority', 0),
                    body.get('link1_url', ''),
                    body.get('link1_label', 'Билеты'),
                    body.get('link2_url', ''),
                    body.get('link2_label', 'Подробнее'),
                    body.get('admin_notes', ''),
                )
            )
            conn.commit()
            return ok(cur.fetchone())

        # PUT ?id= — обновить
        if method == 'PUT' and event_id:
            tags = body.get('tags', [])
            cur.execute(
                f"""UPDATE {SCHEMA}.events SET
                    title=%s, type=%s, tags=%s, description=%s, city=%s, address=%s,
                    place=%s, place_id=%s, image=%s, age=%s, is_free=%s, price=%s,
                    online=%s, is_past=%s, private=%s, dates=%s,
                    schedule_type=%s, show_dates=%s, priority=%s,
                    link1_url=%s, link1_label=%s, link2_url=%s, link2_label=%s,
                    admin_notes=%s, updated_at=NOW()
                    WHERE id=%s RETURNING *""",
                (
                    body.get('title', ''),
                    body.get('type', 'Концерт'),
                    tags,
                    body.get('description', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                    body.get('place', ''),
                    body.get('place_id') or None,
                    body.get('image', ''),
                    body.get('age', '0+'),
                    body.get('is_free', False),
                    body.get('price', 0),
                    body.get('online', False),
                    body.get('is_past', False),
                    body.get('private', 0),
                    json.dumps(body.get('dates', [])),
                    body.get('schedule_type', 'once'),
                    body.get('show_dates', True),
                    body.get('priority', 0),
                    body.get('link1_url', ''),
                    body.get('link1_label', 'Билеты'),
                    body.get('link2_url', ''),
                    body.get('link2_label', 'Подробнее'),
                    body.get('admin_notes', ''),
                    event_id,
                )
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok(row)

        # DELETE ?id= — удалить
        if method == 'DELETE' and event_id:
            cur.execute(f"UPDATE {SCHEMA}.events SET is_past=TRUE WHERE id=%s RETURNING id", (event_id,))
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok({'deleted': event_id})

        return err('Method not allowed', 405)

    finally:
        cur.close()
        conn.close()
