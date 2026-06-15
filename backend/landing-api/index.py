import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from html_render import render_html

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8923173_afisha_light_app')
CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}
HTML_H = {'Content-Type':'text/html; charset=utf-8','Access-Control-Allow-Origin':'*'}

DEFAULTS = {
    'site_title':'Афиша','site_desc':'','site_domain':'','index_title':'',
    'phone':'','email':'','address':'','tg_link':'','vk_link':'','wa_link':'',
    'any_link':'','any_link_title':'','accent_color':'#7C3AED','bg_color':'#F5F5F7',
    'text_color':'#111111','muted_text_color':'#666666',
    'header_text_color':'#111111','header_text_size':16,
    'date_text_color':'#7C3AED','date_text_size':13,
    'button_text_color':'#ffffff','button_bg_color':'#7C3AED',
    'button_border_radius':10,'button_text_size':13,
    'card_border_radius':10,'card_cards_border_radius':16,'layout_max_width':720,
    'view_default':'list','show_buttons':True,'show_price':True,
    'show_vk_button':True,'vk_button_text':'Открыть в VK',
    'logo_url':'','image_logo_url':'','image_header_url':'',
    'vk_pixel_id':'','yandex_metrika_id':'','show_past':False,'events_count':10,
}
FIELDS = [f for f in DEFAULTS.keys() if f != 'vk_group_id']

def get_conn(): return psycopg2.connect(os.environ['DATABASE_URL'])
def ok(d): return {'statusCode':200,'headers':CORS,'body':json.dumps(d,default=str)}
def err(m,c=400): return {'statusCode':c,'headers':CORS,'body':json.dumps({'error':m})}

def handler(event: dict, context) -> dict:
    """Лендинг-афиша a-fisha.ru. GET /?group_id= — HTML. GET/POST /?action=settings — настройки."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode':200,'headers':CORS,'body':''}
    method = event.get('httpMethod','GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action','')
    gid = int(params.get('vk_group_id',0) or params.get('group_id',0))
    body = {}
    if event.get('body'):
        try: body = json.loads(event['body'])
        except: pass
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if method == 'GET' and action == 'settings':
            cur.execute(f"SELECT * FROM {SCHEMA}.landing_settings WHERE vk_group_id=%s",(gid,))
            row = cur.fetchone()
            return ok({**DEFAULTS,**(dict(row) if row else {})})

        if method == 'POST' and action == 'settings':
            vals_i = [gid]+[body.get(f,DEFAULTS.get(f,'')) for f in FIELDS]
            vals_u = [body.get(f,DEFAULTS.get(f,'')) for f in FIELDS]
            ph = ','.join(['%s']*(len(FIELDS)+1))
            upd = ','.join([f"{f}=%s" for f in FIELDS]+['updated_at=NOW()'])
            cur.execute(
                f"INSERT INTO {SCHEMA}.landing_settings (vk_group_id,{','.join(FIELDS)}) VALUES ({ph}) ON CONFLICT (vk_group_id) DO UPDATE SET {upd} RETURNING *",
                vals_i+vals_u)
            conn.commit()
            return ok({**DEFAULTS,**dict(cur.fetchone())})

        if method == 'GET' and gid:
            cur.execute(f"SELECT * FROM {SCHEMA}.landing_settings WHERE vk_group_id=%s",(gid,))
            row = cur.fetchone()
            cfg = {**DEFAULTS,**(dict(row) if row else {})}
            cfg['vk_group_id'] = gid
            cur.execute(
                f"""SELECT id,title,description,dates,image,city,place,tags,
                    is_free,price_from,price_to,age,type,vk_group_id,link1_url,link1_label,link2_url,link2_label
                    FROM {SCHEMA}.events WHERE vk_group_id=%s AND is_past=FALSE
                    AND (publish_at IS NULL OR publish_at<=NOW()) AND private=0
                    ORDER BY priority DESC,(dates->0->>'date') ASC NULLS LAST LIMIT %s""",
                (gid, cfg.get('events_count',10)))
            html = render_html(cur.fetchall(), cfg, gid)
            return {'statusCode':200,'headers':HTML_H,'body':html}
        return err('Укажите group_id', 400)
    finally:
        cur.close(); conn.close()
