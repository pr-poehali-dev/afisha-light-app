MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек']

def fmt_date(d):
    try:
        parts = d.split('-')
        return f"{int(parts[2])} {MONTHS[int(parts[1])-1]}"
    except:
        return d

def render_html(events, cfg, gid):
    accent    = cfg.get('accent_color', '#7C3AED')
    btn_bg    = cfg.get('button_bg_color', accent)
    btn_color = cfg.get('button_text_color', '#fff')
    btn_radius= int(cfg.get('button_border_radius', 10))
    btn_size  = int(cfg.get('button_text_size', 13))
    bg        = cfg.get('bg_color', '#F5F5F7')
    text_c    = cfg.get('text_color', '#111')
    muted_c   = cfg.get('muted_text_color', '#666')
    h_color   = cfg.get('header_text_color', '#111')
    h_size    = int(cfg.get('header_text_size', 16))
    date_c    = cfg.get('date_text_color', accent)
    date_size = int(cfg.get('date_text_size', 13))
    max_w     = int(cfg.get('layout_max_width', 720))
    ccr       = int(cfg.get('card_cards_border_radius', 16))
    title     = cfg.get('site_title', 'Афиша')
    idx_title = cfg.get('index_title', '') or title
    desc      = cfg.get('site_desc', '')
    phone     = cfg.get('phone', '')
    email     = cfg.get('email', '')
    address   = cfg.get('address', '')
    tg        = cfg.get('tg_link', '')
    vk        = cfg.get('vk_link', '') or f"https://vk.com/club{abs(gid)}"
    wa        = cfg.get('wa_link', '')
    any_link  = cfg.get('any_link', '')
    any_title = cfg.get('any_link_title', '') or 'Сайт'
    logo      = cfg.get('image_logo_url', '') or cfg.get('logo_url', '')
    header_img= cfg.get('image_header_url', '')
    show_btns = cfg.get('show_buttons', True)
    show_price= cfg.get('show_price', True)
    show_vk   = cfg.get('show_vk_button', True)
    vk_btn_t  = cfg.get('vk_button_text', 'Открыть в VK')
    view      = cfg.get('view_default', 'list')
    vk_pixel  = cfg.get('vk_pixel_id', '')
    ya_metro  = cfg.get('yandex_metrika_id', '')

    socials = ''
    if tg: socials += f'<a href="{tg}" class="social-btn" target="_blank">Telegram</a>'
    if wa: socials += f'<a href="{wa}" class="social-btn" target="_blank">WhatsApp</a>'
    if any_link: socials += f'<a href="{any_link}" class="social-btn" target="_blank">{any_title}</a>'
    if show_vk and vk: socials += f'<a href="{vk}" class="social-btn" target="_blank">{vk_btn_t}</a>'

    contacts = ''
    if phone:   contacts += f'<span class="contact">📞 <a href="tel:{phone}">{phone}</a></span>'
    if email:   contacts += f'<span class="contact">✉️ <a href="mailto:{email}">{email}</a></span>'
    if address: contacts += f'<span class="contact">📍 {address}</span>'

    logo_html   = f'<img src="{logo}" class="logo" alt="{title}">' if logo else ''
    header_bg   = f'background-image:url("{header_img}");background-size:cover;background-position:center;' if header_img else ''
    grid_cols   = '1fr 1fr' if view == 'cards' else '1fr'

    pixels = ''
    if vk_pixel:
        pixels += f'<script>!function(){{var t=document.createElement("script");t.async=!0,t.src="https://vk.com/js/api/openapi.js?169",t.onload=function(){{VK.Retargeting.Init("{vk_pixel}"),VK.Retargeting.Hit()}},document.head.appendChild(t)}}();</script>'
    if ya_metro:
        pixels += f'<script>(function(m,e,t,r,i,k,a){{m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)}})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym({ya_metro},"init",{{clickmap:true,trackLinks:true,accurateTrackBounce:true}});</script>'

    cards = ''
    for e in events:
        dates = e.get('dates') or []
        d0 = dates[0] if dates and isinstance(dates[0], dict) else {}
        date_s = fmt_date(d0.get('date', ''))
        time_s = d0.get('start_time', '')
        extra  = f' +{len(dates)-1}' if len(dates) > 1 else ''
        img    = e.get('image') or ''
        img_tag = f'<div class="card-img" style="background-image:url(\'{img}\')"></div>' if img else ''
        price_html = ''
        if show_price:
            pf = int(e.get('price_from') or 0)
            pt = int(e.get('price_to') or 0)
            if e.get('is_free'):
                price_html = '<span class="badge-free">Бесплатно</span>'
            elif pf > 0:
                p_str = f"{pf:,} ₽".replace(',', '\u00a0')
                if pt > 0 and pt != pf:
                    p_str = f"{pf:,}–{pt:,} ₽".replace(',', '\u00a0')
                price_html = f'<span class="price">{p_str}</span>'
        tags = e.get('tags') or []
        tags_html = ''.join([f'<span class="tag">{t}</span>' for t in tags[:3]])
        age = e.get('age', '')
        age_html = f'<span class="badge-age">{age}</span>' if age and age not in ('0+', '') else ''
        btn_html = ''
        if show_btns:
            l1, lb1 = e.get('link1_url',''), e.get('link1_label','Подробнее')
            l2, lb2 = e.get('link2_url',''), e.get('link2_label','Билеты')
            if l1: btn_html += f'<a href="{l1}" class="ev-btn" target="_blank">{lb1}</a>'
            if l2: btn_html += f'<a href="{l2}" class="ev-btn sec" target="_blank">{lb2}</a>'
        desc_e = str(e.get('description') or '')
        desc_cut = (desc_e[:200] + '…') if len(desc_e) > 200 else desc_e
        place = e.get('place','')
        city  = e.get('city','')
        place_str = ' · '.join(filter(None,[place,city]))

        cards += f"""<div class="card">{img_tag}<div class="card-body">
<div class="card-meta"><span class="date">{date_s}{' · '+time_s if time_s else ''}{extra}</span>{age_html}</div>
<h2 class="card-title">{e.get('title','')}</h2>
{f'<div class="card-place">{place_str}</div>' if place_str else ''}
{f'<p class="card-desc">{desc_cut}</p>' if desc_cut else ''}
<div class="card-footer"><div class="tags">{tags_html}</div>{price_html}</div>
{f'<div class="card-btns">{btn_html}</div>' if btn_html else ''}
</div></div>"""

    css = f"""*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:{bg};color:{text_c};-webkit-font-smoothing:antialiased}}
a{{text-decoration:none;color:inherit}}
.header{{background:{accent};{header_bg}}}
.header-inner{{max-width:{max_w}px;margin:0 auto;padding:20px 16px 18px;display:flex;align-items:center;gap:14px}}
.logo{{width:60px;height:60px;border-radius:{ccr}px;object-fit:cover;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2)}}
.header h1{{font-size:{h_size+6}px;font-weight:800;color:{h_color};line-height:1.2}}
.header p{{font-size:14px;color:{h_color};opacity:.8;margin-top:4px}}
.socials{{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}}
.social-btn{{display:inline-flex;align-items:center;padding:7px 14px;border-radius:{btn_radius}px;font-size:{btn_size}px;font-weight:700;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.35);color:#fff}}
.social-btn:hover{{background:rgba(255,255,255,.28)}}
.contacts{{max-width:{max_w}px;margin:0 auto;padding:10px 16px;display:flex;flex-wrap:wrap;gap:14px}}
.contact{{font-size:13px;color:{muted_c}}} .contact a{{color:{accent}}}
.section-title{{max-width:{max_w}px;margin:0 auto;padding:16px 16px 0;font-size:18px;font-weight:800;color:{text_c}}}
.container{{max-width:{max_w}px;margin:0 auto;padding:16px;display:grid;gap:14px;grid-template-columns:{grid_cols}}}
.card{{background:#fff;border-radius:{ccr}px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07);display:flex;flex-direction:column}}
.card-img{{width:100%;aspect-ratio:2/1;background:#EDE9FE;background-size:cover;background-position:center}}
.card-body{{padding:14px 16px 16px;display:flex;flex-direction:column;gap:7px;flex:1}}
.card-meta{{display:flex;align-items:center;gap:8px;flex-wrap:wrap}}
.date{{font-size:{date_size}px;color:{date_c};font-weight:600}}
.card-title{{font-size:16px;font-weight:800;color:{text_c};line-height:1.3}}
.card-place{{font-size:12px;color:{muted_c}}}
.card-desc{{font-size:13px;color:{muted_c};line-height:1.55}}
.card-footer{{display:flex;align-items:center;justify-content:space-between;margin-top:4px}}
.tags{{display:flex;gap:5px;flex-wrap:wrap}}
.tag{{font-size:11px;font-weight:600;color:{accent};background:{accent}22;padding:2px 7px;border-radius:6px}}
.price{{font-size:16px;font-weight:800;color:{text_c}}}
.badge-free{{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;background:#D1FAE5;color:#065F46}}
.badge-age{{font-size:11px;font-weight:700;padding:3px 7px;border-radius:6px;background:#F3F4F6;color:#6B7280}}
.card-btns{{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}}
.ev-btn{{display:inline-flex;align-items:center;padding:8px 16px;border-radius:{btn_radius}px;font-size:{btn_size}px;font-weight:700;background:{btn_bg};color:{btn_color}}}
.ev-btn:hover{{opacity:.85}} .ev-btn.sec{{background:transparent;color:{btn_bg};border:1.5px solid {btn_bg}}}
.empty-state{{text-align:center;padding:60px 20px;color:{muted_c};font-size:15px;grid-column:1/-1}}
.footer{{text-align:center;padding:24px 16px;color:{muted_c};font-size:12px;border-top:1px solid #eee;margin-top:16px}}
@media(max-width:600px){{.container{{grid-template-columns:1fr}}}}"""

    return f"""<!DOCTYPE html><html lang="ru"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title}</title><meta name="description" content="{desc}">
{pixels}<style>{css}</style></head><body>
<header class="header"><div class="header-inner">{logo_html}<div>
<h1>{idx_title}</h1>{f'<p>{desc}</p>' if desc else ''}
{f'<div class="socials">{socials}</div>' if socials else ''}
</div></div></header>
{f'<div class="contacts">{contacts}</div>' if contacts else ''}
<div class="section-title">{idx_title}</div>
<div class="container">{cards if cards else '<div class="empty-state">Мероприятий пока нет</div>'}</div>
<footer class="footer">© {title} · <a href="https://a-fisha.ru" style="color:{accent}">a-fisha.ru</a></footer>
</body></html>"""
