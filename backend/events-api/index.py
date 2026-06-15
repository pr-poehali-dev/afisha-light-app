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
    """CRUD API для событий афиши. GET /events, POST /events, PUT /events/{id}, DELETE /events/{id}"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]

    # /events/{id}
    event_id = None
    if len(parts) >= 2 and parts[-1].isdigit():
        event_id = int(parts[-1])

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET /events — список
        if method == 'GET' and not event_id:
            params = event.get('queryStringParameters') or {}
            is_past = params.get('past', 'false').lower() == 'true'
            vk_group_id = int(params.get('vk_group_id', 0))

            cur.execute(
                f"""SELECT * FROM {SCHEMA}.events
                    WHERE vk_group_id = %s AND is_past = %s
                    ORDER BY (dates->0->>'date') ASC NULLS LAST, created_at DESC""",
                (vk_group_id, is_past)
            )
            rows = cur.fetchall()
            return ok(rows)

        # GET /events/{id} — одно событие
        if method == 'GET' and event_id:
            cur.execute(f"SELECT * FROM {SCHEMA}.events WHERE id = %s", (event_id,))
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok(row)

        # POST /events — создать
        if method == 'POST':
            cur.execute(
                f"""INSERT INTO {SCHEMA}.events
                    (vk_group_id, title, type, description, city, address, place,
                     image, age, is_free, price, online, is_past, private, dates)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING *""",
                (
                    body.get('vk_group_id', 0),
                    body.get('title', ''),
                    body.get('type', 'Концерт'),
                    body.get('description', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                    body.get('place', ''),
                    body.get('image', ''),
                    body.get('age', '0+'),
                    body.get('is_free', False),
                    body.get('price', 0),
                    body.get('online', False),
                    body.get('is_past', False),
                    body.get('private', 0),
                    json.dumps(body.get('dates', [])),
                )
            )
            conn.commit()
            return ok(cur.fetchone())

        # PUT /events/{id} — обновить
        if method == 'PUT' and event_id:
            cur.execute(
                f"""UPDATE {SCHEMA}.events SET
                    title=%s, type=%s, description=%s, city=%s, address=%s,
                    place=%s, image=%s, age=%s, is_free=%s, price=%s,
                    online=%s, is_past=%s, private=%s, dates=%s, updated_at=NOW()
                    WHERE id=%s RETURNING *""",
                (
                    body.get('title', ''),
                    body.get('type', 'Концерт'),
                    body.get('description', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                    body.get('place', ''),
                    body.get('image', ''),
                    body.get('age', '0+'),
                    body.get('is_free', False),
                    body.get('price', 0),
                    body.get('online', False),
                    body.get('is_past', False),
                    body.get('private', 0),
                    json.dumps(body.get('dates', [])),
                    event_id,
                )
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok(row)

        # DELETE /events/{id} — удалить
        if method == 'DELETE' and event_id:
            cur.execute(f"DELETE FROM {SCHEMA}.events WHERE id=%s RETURNING id", (event_id,))
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok({'deleted': event_id})

        return err('Not found', 404)

    finally:
        cur.close()
        conn.close()
