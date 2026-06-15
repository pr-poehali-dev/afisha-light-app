import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p8923173_afisha_light_app')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

HTML_HEADERS = {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

def fmt_date(d):
    try:
        parts = d.split('-')
        return f"{int(parts[2])} {MONTHS[int(parts[1])-1]}"
    except:
        return d

def render_html(events, cfg):
    accent = cfg.get('accent_color', '#7C3AED')
    bg = cfg.get('bg_color', '#F5F5F7')
    title = cfg.get('site_title', 'Афиша')
    desc = cfg.get('site_desc', '')
    logo = cfg.get('logo_url', '')
    show_vk = cfg.get('show_vk_button', True)
    vk_btn = cfg.get('vk_button_text', 'Открыть в VK')
    show_price = cfg.get('show_price', True)
    gid = cfg.get('vk_group_id', 0)
    vk_url = f"https://vk.com/club{abs(gid)}"

    cards = ''
    for e in events:
        dates = e.get('dates') or []
        date_str = ''
        time_str = ''
        if dates:
            d0 = dates[0] if isinstance(dates[0], dict) else {}
            date_str = fmt_date(d0.get('date', ''))
            time_str = d0.get('start_time', '')
        extra = f'+{len(dates)-1}' if len(dates) > 1 else ''
        img = e.get('image') or ''
        img_html = f'<img src="{img}" alt="" onerror="this.style.display=\'none\'">' if img else ''
        price_html = ''
        if show_price:
            pf = e.get('price_from') or 0
            pt = e.get('price_to') or 0
            if e.get('is_free'):
                price_html = f'<span class="badge free">Бесплатно</span>'
            elif pf > 0:
                price_html = f'<span class="price">{"от {:,} ₽".format(pf).replace(",", " ") if not pt or pt == pf else "{:,} — {:,} ₽".format(pf, pt).replace(",", " ")}</span>'

        age = e.get('age', '')
        age_html = f'<span class="badge age">{age}</span>' if age and age != '0+' else ''
        tags = e.get('tags') or []
        tags_html = ''.join([f'<span class="tag">{t}</span>' for t in tags[:3]])

        cards += f'''
        <div class="card">
          <div class="card-img">{img_html}</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="date">📅 {date_str}{" · " + time_str if time_str else ""}{" · " + extra if extra else ""}</span>
              {age_html}
            </div>
            <h2 class="card-title">{e.get("title","")}</h2>
            {f'<div class="card-place">📍 {e.get("place","")} · {e.get("city","")}</div>' if e.get("city") else ''}
            {f'<p class="card-desc">{e.get("description","")[:180]}{"…" if len(e.get("description","")) > 180 else ""}</p>' if e.get("description") else ''}
            <div class="card-footer">
              <div class="tags">{tags_html}</div>
              {price_html}
            </div>
          </div>
        </div>'''

    logo_html = f'<img src="{logo}" class="logo" alt="">' if logo else ''
    vk_html = f'<a href="{vk_url}" class="vk-btn" target="_blank">{vk_btn}</a>' if show_vk else ''

    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; background: {bg}; color: #111; -webkit-font-smoothing: antialiased; }}
  a {{ text-decoration: none; }}
  .header {{ background: {accent}; color: #fff; padding: 24px 20px 20px; }}
  .header-inner {{ max-width: 720px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }}
  .logo {{ width: 56px; height: 56px; border-radius: 14px; object-fit: cover; flex-shrink: 0; }}
  .header h1 {{ font-size: 22px; font-weight: 800; }}
  .header p {{ font-size: 14px; opacity: 0.8; margin-top: 4px; }}
  .vk-btn {{ display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 8px 18px; background: rgba(255,255,255,0.2); border: 1.5px solid rgba(255,255,255,0.4); border-radius: 10px; color: #fff; font-size: 13px; font-weight: 700; }}
  .vk-btn:hover {{ background: rgba(255,255,255,0.3); }}
  .container {{ max-width: 720px; margin: 0 auto; padding: 16px; display: grid; gap: 14px; }}
  .card {{ background: #fff; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); display: flex; flex-direction: column; }}
  .card-img {{ width: 100%; aspect-ratio: 2/1; overflow: hidden; background: #EDE9FE; }}
  .card-img img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
  .card-body {{ padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; }}
  .card-meta {{ display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }}
  .date {{ font-size: 13px; color: {accent}; font-weight: 600; }}
  .card-title {{ font-size: 17px; font-weight: 800; color: #111; line-height: 1.3; }}
  .card-place {{ font-size: 12px; color: #999; }}
  .card-desc {{ font-size: 13px; color: #555; line-height: 1.55; }}
  .card-footer {{ display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }}
  .tags {{ display: flex; gap: 6px; flex-wrap: wrap; }}
  .tag {{ font-size: 11px; font-weight: 600; color: {accent}; background: {accent}22; padding: 2px 8px; border-radius: 6px; }}
  .price {{ font-size: 16px; font-weight: 800; color: #111; }}
  .badge {{ font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }}
  .badge.free {{ background: #D1FAE5; color: #065F46; }}
  .badge.age {{ background: #F3F4F6; color: #6B7280; }}
  .empty {{ text-align: center; padding: 60px 20px; color: #999; font-size: 15px; }}
  .footer {{ text-align: center; padding: 24px; color: #BBB; font-size: 12px; }}
  @media (min-width: 600px) {{
    .container {{ grid-template-columns: 1fr 1fr; }}
  }}
</style>
</head>
<body>
<header class="header">
  <div class="header-inner">
    {logo_html}
    <div>
      <h1>{title}</h1>
      {f'<p>{desc}</p>' if desc else ''}
      {vk_html}
    </div>
  </div>
</header>
<div class="container">
  {cards if cards else '<div class="empty">Мероприятий пока нет</div>'}
</div>
<footer class="footer">Афиша · a-fisha.ru</footer>
</body>
</html>'''


def handler(event: dict, context) -> dict:
    """
    Лендинг-афиша для сообщества ВКонтакте.
    GET /?group_id=ИД — HTML страница афиши
    GET /?action=settings&vk_group_id=ИД — получить настройки
    POST /?action=settings&vk_group_id=ИД — сохранить настройки
    """

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    vk_group_id = int(params.get('vk_group_id', 0) or params.get('group_id', 0))

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except:
            pass

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET ?action=settings — получить настройки
        if method == 'GET' and action == 'settings':
            cur.execute(
                f"SELECT * FROM {SCHEMA}.landing_settings WHERE vk_group_id = %s",
                (vk_group_id,)
            )
            row = cur.fetchone()
            return ok(dict(row) if row else {})

        # POST ?action=settings — сохранить настройки
        if method == 'POST' and action == 'settings':
            cur.execute(
                f"""INSERT INTO {SCHEMA}.landing_settings
                    (vk_group_id, site_title, site_desc, accent_color, bg_color, logo_url,
                     show_past, show_price, show_vk_button, vk_button_text, events_count)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (vk_group_id) DO UPDATE SET
                    site_title=%s, site_desc=%s, accent_color=%s, bg_color=%s, logo_url=%s,
                    show_past=%s, show_price=%s, show_vk_button=%s, vk_button_text=%s,
                    events_count=%s, updated_at=NOW()
                    RETURNING *""",
                (
                    vk_group_id,
                    body.get('site_title', ''), body.get('site_desc', ''),
                    body.get('accent_color', '#7C3AED'), body.get('bg_color', '#F5F5F7'),
                    body.get('logo_url', ''), body.get('show_past', False),
                    body.get('show_price', True), body.get('show_vk_button', True),
                    body.get('vk_button_text', 'Открыть в VK'), body.get('events_count', 10),
                    body.get('site_title', ''), body.get('site_desc', ''),
                    body.get('accent_color', '#7C3AED'), body.get('bg_color', '#F5F5F7'),
                    body.get('logo_url', ''), body.get('show_past', False),
                    body.get('show_price', True), body.get('show_vk_button', True),
                    body.get('vk_button_text', 'Открыть в VK'), body.get('events_count', 10),
                )
            )
            conn.commit()
            return ok(dict(cur.fetchone()))

        # GET /?group_id=ИД — HTML лендинг
        if method == 'GET' and vk_group_id:
            # Настройки
            cur.execute(
                f"SELECT * FROM {SCHEMA}.landing_settings WHERE vk_group_id = %s",
                (vk_group_id,)
            )
            cfg_row = cur.fetchone()
            cfg = dict(cfg_row) if cfg_row else {}
            cfg['vk_group_id'] = vk_group_id

            show_past = cfg.get('show_past', False)
            events_count = cfg.get('events_count', 10)

            cur.execute(
                f"""SELECT id, title, description, dates, image, city, place, tags,
                           is_free, price_from, price_to, age, type, vk_group_id
                    FROM {SCHEMA}.events
                    WHERE vk_group_id = %s AND is_past = %s
                      AND (publish_at IS NULL OR publish_at <= NOW())
                      AND private = 0
                    ORDER BY priority DESC, (dates->0->>'date') ASC NULLS LAST
                    LIMIT %s""",
                (vk_group_id, show_past, events_count)
            )
            events_data = cur.fetchall()

            html = render_html(events_data, cfg)
            return {'statusCode': 200, 'headers': HTML_HEADERS, 'body': html}

        return err('Укажите group_id', 400)

    finally:
        cur.close()
        conn.close()
