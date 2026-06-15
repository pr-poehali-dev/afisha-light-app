import os
import json
import time
import random
import psycopg2
import urllib.request
import urllib.parse
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8923173_afisha_light_app')
VK_API = 'https://api.vk.com/method'
VK_V = '5.199'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    url = f"{VK_API}/{method}?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=10) as r:
        return json.loads(r.read())


def handler(event: dict, context) -> dict:
    """API для управления базой подписчиков VK и рассылками."""

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
        # GET ?action=stats — статистика базы
        if method == 'GET' and action == 'stats':
            cur.execute(
                f"SELECT COUNT(*) as total, SUM(CASE WHEN can_write THEN 1 ELSE 0 END) as can_write FROM {SCHEMA}.subscribers WHERE vk_group_id = %s",
                (vk_group_id,)
            )
            stats = cur.fetchone()
            cur.execute(
                f"SELECT * FROM {SCHEMA}.mailings WHERE vk_group_id = %s ORDER BY created_at DESC LIMIT 10",
                (vk_group_id,)
            )
            mailings = cur.fetchall()
            return ok({'stats': stats, 'mailings': mailings})

        # GET ?action=list — список подписчиков
        if method == 'GET' and action == 'list':
            cur.execute(
                f"SELECT * FROM {SCHEMA}.subscribers WHERE vk_group_id = %s ORDER BY created_at DESC LIMIT 500",
                (vk_group_id,)
            )
            return ok(cur.fetchall())

        # GET ?action=export — экспорт ID в txt
        if method == 'GET' and action == 'export':
            cur.execute(
                f"SELECT vk_user_id FROM {SCHEMA}.subscribers WHERE vk_group_id = %s AND can_write = TRUE",
                (vk_group_id,)
            )
            ids = [str(row['vk_user_id']) for row in cur.fetchall()]
            return {
                'statusCode': 200,
                'headers': {**CORS, 'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename="subscribers.txt"'},
                'body': '\n'.join(ids),
            }

        # POST ?action=scan — сканирование участников группы через VK API
        if method == 'POST' and action == 'scan':
            token = body.get('group_token', '')
            if not token:
                return err('Токен сообщества не передан')
            group_id = abs(vk_group_id)
            offset = 0
            count = 1000
            added = 0
            skipped = 0
            while True:
                resp = vk_call('groups.getMembers', {
                    'group_id': group_id,
                    'fields': 'first_name,last_name,screen_name,photo_50,can_write_private_message',
                    'offset': offset,
                    'count': count,
                }, token)
                if 'error' in resp:
                    print(f"[scan] VK error: {resp['error']}")
                    return err(f"VK API: {resp['error'].get('error_msg', 'unknown')}")
                items = resp.get('response', {}).get('items', [])
                if not items:
                    break
                for u in items:
                    uid = u.get('id') or u.get('user_id')
                    if not uid:
                        continue
                    can = bool(u.get('can_write_private_message', 0))
                    cur.execute(
                        f"""INSERT INTO {SCHEMA}.subscribers (vk_group_id, vk_user_id, first_name, last_name, screen_name, photo_url, can_write, source)
                            VALUES (%s,%s,%s,%s,%s,%s,%s,'scan')
                            ON CONFLICT (vk_group_id, vk_user_id) DO UPDATE SET can_write=%s, first_name=%s, last_name=%s""",
                        (vk_group_id, uid,
                         u.get('first_name',''), u.get('last_name',''),
                         u.get('screen_name',''), u.get('photo_50',''), can, can,
                         u.get('first_name',''), u.get('last_name',''))
                    )
                    added += 1
                conn.commit()
                offset += count
                if offset >= resp.get('response', {}).get('count', 0):
                    break
                time.sleep(0.34)
            return ok({'added': added, 'skipped': skipped})

        # POST ?action=import — импорт из txt (список vk_user_id)
        if method == 'POST' and action == 'import':
            raw = body.get('ids', '')
            ids = [int(x.strip()) for x in raw.replace(',', '\n').split('\n') if x.strip().lstrip('-').isdigit()]
            added = 0
            for uid in ids:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.subscribers (vk_group_id, vk_user_id, source)
                        VALUES (%s, %s, 'import')
                        ON CONFLICT (vk_group_id, vk_user_id) DO NOTHING""",
                    (vk_group_id, uid)
                )
                added += cur.rowcount
            conn.commit()
            return ok({'added': added, 'total': len(ids)})

        # POST ?action=send — отправить рассылку
        if method == 'POST' and action == 'send':
            token = body.get('group_token', '')
            if not token:
                return err('Токен сообщества не передан')
            message = body.get('message', '').strip()
            title = body.get('title', 'Рассылка')
            if not message:
                return err('Текст сообщения не может быть пустым')

            cur.execute(
                f"""INSERT INTO {SCHEMA}.mailings (vk_group_id, title, message, status)
                    VALUES (%s, %s, %s, 'sending') RETURNING id""",
                (vk_group_id, title, message)
            )
            mailing_id = cur.fetchone()['id']
            conn.commit()

            cur.execute(
                f"SELECT vk_user_id FROM {SCHEMA}.subscribers WHERE vk_group_id = %s AND can_write = TRUE",
                (vk_group_id,)
            )
            recipients = [row['vk_user_id'] for row in cur.fetchall()]

            sent = 0
            errors = 0
            for uid in recipients:
                try:
                    resp = vk_call('messages.send', {
                        'user_id': uid,
                        'message': message,
                        'random_id': random.randint(1, 2**31),
                    }, token)
                    if 'error' in resp:
                        errors += 1
                    else:
                        sent += 1
                except Exception:
                    errors += 1
                time.sleep(0.1)

            cur.execute(
                f"""UPDATE {SCHEMA}.mailings SET status='sent', sent_count=%s, error_count=%s, sent_at=NOW()
                    WHERE id=%s""",
                (sent, errors, mailing_id)
            )
            conn.commit()
            return ok({'mailing_id': mailing_id, 'sent': sent, 'errors': errors})

        # DELETE ?action=clear — очистить базу
        if method == 'DELETE' and action == 'clear':
            cur.execute(f"DELETE FROM {SCHEMA}.subscribers WHERE vk_group_id = %s", (vk_group_id,))
            deleted = cur.rowcount
            conn.commit()
            return ok({'deleted': deleted})

        return err('Unknown action', 405)

    finally:
        cur.close()
        conn.close()