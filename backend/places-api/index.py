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
    """CRUD API для мест проведения. GET ?vk_group_id=, POST, PUT ?id=, DELETE ?id="""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    place_id = None
    if params.get('id', '').isdigit():
        place_id = int(params['id'])

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET':
            vk_group_id = int(params.get('vk_group_id', 0))
            cur.execute(
                f"SELECT * FROM {SCHEMA}.places WHERE vk_group_id = %s ORDER BY name ASC",
                (vk_group_id,)
            )
            return ok(cur.fetchall())

        if method == 'POST':
            cur.execute(
                f"""INSERT INTO {SCHEMA}.places (vk_group_id, name, city, address)
                    VALUES (%s, %s, %s, %s) RETURNING *""",
                (
                    body.get('vk_group_id', 0),
                    body.get('name', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                )
            )
            conn.commit()
            return ok(cur.fetchone())

        if method == 'PUT' and place_id:
            cur.execute(
                f"""UPDATE {SCHEMA}.places SET name=%s, city=%s, address=%s
                    WHERE id=%s RETURNING *""",
                (
                    body.get('name', ''),
                    body.get('city', ''),
                    body.get('address', ''),
                    place_id,
                )
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            return ok(row)

        if method == 'DELETE' and place_id:
            cur.execute(
                f"SELECT id FROM {SCHEMA}.places WHERE id=%s",
                (place_id,)
            )
            row = cur.fetchone()
            if not row:
                return err('Not found', 404)
            cur.execute(
                f"UPDATE {SCHEMA}.events SET place_id=NULL WHERE place_id=%s",
                (place_id,)
            )
            cur.execute(f"SELECT id FROM {SCHEMA}.places WHERE id=%s", (place_id,))
            return ok({'deleted': place_id})

        return err('Method not allowed', 405)

    finally:
        cur.close()
        conn.close()
