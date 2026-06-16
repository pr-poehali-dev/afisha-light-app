import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import {
  fetchLandingSettings, saveLandingSettings, getLandingUrl, getPublicLandingUrl,
  DEFAULT_SETTINGS, type LandingSettings,
} from '@/api/landing';

interface SiteProps { groupId: number; }

const s: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>{children}</div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 12 }}><Label>{label}</Label>{children}</div>
);

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
  <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', paddingBottom: 12 }}>
    <div>
      <div style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{desc}</div>}
    </div>
    <div style={{ width: 40, height: 22, borderRadius: 11, background: checked ? '#7C3AED' : '#DDD', position: 'relative', transition: 'all .2s', flexShrink: 0, boxShadow: checked ? '0 2px 8px rgba(124,58,237,.3)' : 'none' }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  </div>
);

const ColorRow = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <span style={{ fontSize: 13, color: '#333' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: value, border: '1px solid #E5E5E5' }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', background: 'none', padding: 0 }} />
      <span style={{ fontSize: 12, color: '#999', fontFamily: 'monospace' }}>{value}</span>
    </div>
  </div>
);

type Tab = 'basic' | 'contacts' | 'design' | 'extra' | 'preview' | 'connect';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'basic',   label: 'Основное', icon: 'FileText' },
  { key: 'contacts',label: 'Контакты', icon: 'Phone' },
  { key: 'design',  label: 'Дизайн',   icon: 'Palette' },
  { key: 'extra',   label: 'Аналитика',icon: 'BarChart2' },
  { key: 'preview', label: 'Превью',   icon: 'Eye' },
  { key: 'connect', label: 'Домен',    icon: 'Globe' },
];

const UPLOAD_URL = 'https://functions.poehali.dev/dec20997-ea70-4e62-9edf-60f5cf25a981';

const PageSite = ({ groupId }: SiteProps) => {
  const VK_GROUP_ID = groupId;
  const PREVIEW_URL = getLandingUrl(VK_GROUP_ID);
  const PUBLIC_URL = getPublicLandingUrl(VK_GROUP_ID);
  const [tab, setTab] = useState<Tab>('basic');
  const [cfg, setCfg] = useState<LandingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLandingSettings(VK_GROUP_ID).then(setCfg).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof LandingSettings>(k: K, v: LandingSettings[K]) =>
    setCfg(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveLandingSettings(VK_GROUP_ID, cfg);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const uploadImage = async (file: File, field: 'image_logo_url' | 'image_header_url') => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const b64 = ev.target?.result as string;
      const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: b64 }) });
      const data = await res.json();
      if (data.url) set(field, data.url);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#999', fontSize: 14 }}>Загрузка…</div>;

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>

      {/* URL */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '12px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Адрес сайта-афиши</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 10, padding: '9px 12px' }}>
          <Icon name="Globe" size={15} style={{ color: '#7C3AED', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#7C3AED', wordBreak: 'break-all' }}>{PUBLIC_URL}</span>
          <button onClick={() => handleCopy(PUBLIC_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', padding: 2, flexShrink: 0 }}>
            <Icon name={copied ? 'Check' : 'Copy'} size={14} />
          </button>
        </div>
      </div>

      {/* Табы */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #EBEBEB', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '10px 12px', fontSize: 10, fontWeight: 700,
            color: tab === t.key ? '#7C3AED' : '#999', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
          }}>
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 12px 80px' }}>

        {/* ===== ОСНОВНОЕ ===== */}
        {tab === 'basic' && (
          <>
            <div style={s}>
              <SectionTitle>Настройки сайта</SectionTitle>
              <Field label="Название сайта">
                <input className="vk-input" placeholder="Афиша" maxLength={100} value={cfg.site_title} onChange={e => set('site_title', e.target.value)} />
              </Field>
              <Field label="Заголовок главной страницы">
                <input className="vk-input" placeholder="Афиша мероприятий нашего театра" maxLength={255} value={cfg.index_title} onChange={e => set('index_title', e.target.value)} />
              </Field>
              <Field label="Краткое описание (SEO)">
                <input className="vk-input" placeholder="Афиша мероприятий. Санкт-Петербург" maxLength={255} value={cfg.site_desc} onChange={e => set('site_desc', e.target.value)} />
              </Field>
            </div>

            <div style={s}>
              <SectionTitle>Изображения</SectionTitle>
              <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'image_logo_url'); }} />
              <input ref={headerRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'image_header_url'); }} />

              <div style={{ marginBottom: 14 }}>
                <Label>Логотип (квадрат, 300×300)</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {cfg.image_logo_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={cfg.image_logo_url} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                      <button onClick={() => set('image_logo_url', '')} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ) : (
                    <div onClick={() => logoRef.current?.click()} style={{ width: 64, height: 64, borderRadius: 12, background: '#EDE9FE', border: '2px dashed #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Icon name="Plus" size={20} style={{ color: '#7C3AED' }} />
                    </div>
                  )}
                  <button onClick={() => logoRef.current?.click()} className="vk-btn-outline" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10 }}>
                    {cfg.image_logo_url ? 'Заменить' : 'Загрузить логотип'}
                  </button>
                </div>
              </div>

              <div>
                <Label>Фото шапки (широкое изображение)</Label>
                {cfg.image_header_url ? (
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <img src={cfg.image_header_url} style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 10 }} />
                    <button onClick={() => set('image_header_url', '')} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer' }}>✕</button>
                  </div>
                ) : null}
                <button onClick={() => headerRef.current?.click()} className="vk-btn-outline" style={{ fontSize: 13, padding: '8px 14px', borderRadius: 10, width: '100%' }}>
                  {cfg.image_header_url ? 'Заменить фото шапки' : 'Загрузить фото шапки'}
                </button>
              </div>
            </div>

            <div style={s}>
              <SectionTitle>Содержимое</SectionTitle>
              <Field label="Вид по умолчанию">
                <select className="vk-input" value={cfg.view_default} onChange={e => set('view_default', e.target.value as 'list' | 'cards')}>
                  <option value="list">Список</option>
                  <option value="cards">Карточки</option>
                </select>
              </Field>
              <Field label="Количество мероприятий">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min={1} max={50} value={cfg.events_count} onChange={e => set('events_count', Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED', minWidth: 28, textAlign: 'center' }}>{cfg.events_count}</span>
                </div>
              </Field>
              <Toggle label="Показывать цену" checked={cfg.show_price} onChange={() => set('show_price', !cfg.show_price)} />
              <Toggle label="Показывать прошедшие" checked={cfg.show_past} onChange={() => set('show_past', !cfg.show_past)} />
              <Toggle label="Показывать кнопки переходов" desc="Кнопки из полей «Ссылка 1» и «Ссылка 2» мероприятия" checked={cfg.show_buttons} onChange={() => set('show_buttons', !cfg.show_buttons)} />
              <Toggle label="Кнопка «Открыть в VK»" checked={cfg.show_vk_button} onChange={() => set('show_vk_button', !cfg.show_vk_button)} />
              {cfg.show_vk_button && (
                <Field label="Текст кнопки VK">
                  <input className="vk-input" value={cfg.vk_button_text} onChange={e => set('vk_button_text', e.target.value)} />
                </Field>
              )}
            </div>
          </>
        )}

        {/* ===== КОНТАКТЫ ===== */}
        {tab === 'contacts' && (
          <div style={s}>
            <SectionTitle>Контактная информация</SectionTitle>
            <Field label="Телефон"><input className="vk-input" placeholder="+79999999999" maxLength={30} value={cfg.phone} onChange={e => set('phone', e.target.value)} /></Field>
            <Field label="E-mail"><input className="vk-input" placeholder="info@myclub.ru" maxLength={100} value={cfg.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Адрес"><input className="vk-input" placeholder="ул. Примерная, д. 26, г. Санкт-Петербург" maxLength={255} value={cfg.address} onChange={e => set('address', e.target.value)} /></Field>

            <div style={{ borderTop: '1px solid #F0F0F0', margin: '14px 0' }} />
            <SectionTitle>Ссылки на соцсети</SectionTitle>
            <Field label="Telegram"><input className="vk-input" placeholder="https://t.me/mychannel" maxLength={255} value={cfg.tg_link} onChange={e => set('tg_link', e.target.value)} /></Field>
            <Field label="ВКонтакте"><input className="vk-input" placeholder="https://vk.com/mycommunity" maxLength={255} value={cfg.vk_link} onChange={e => set('vk_link', e.target.value)} /></Field>
            <Field label="WhatsApp"><input className="vk-input" placeholder="https://wa.me/+79999999999" maxLength={255} value={cfg.wa_link} onChange={e => set('wa_link', e.target.value)} /></Field>
            <Field label="Ваш сайт">
              <input className="vk-input" placeholder="https://mysite.ru" maxLength={255} value={cfg.any_link} onChange={e => set('any_link', e.target.value)} style={{ marginBottom: 6 }} />
              <input className="vk-input" placeholder="Наш сайт" maxLength={20} value={cfg.any_link_title} onChange={e => set('any_link_title', e.target.value)} />
            </Field>
          </div>
        )}

        {/* ===== ДИЗАЙН ===== */}
        {tab === 'design' && (
          <>
            <div style={s}>
              <SectionTitle>Цвета</SectionTitle>
              <ColorRow label="Акцентный цвет" value={cfg.accent_color} onChange={v => set('accent_color', v)} />
              <ColorRow label="Фон страницы" value={cfg.bg_color} onChange={v => set('bg_color', v)} />
              <ColorRow label="Цвет текста" value={cfg.text_color} onChange={v => set('text_color', v)} />
              <ColorRow label="Цвет доп. текста" value={cfg.muted_text_color} onChange={v => set('muted_text_color', v)} />
              <ColorRow label="Цвет заголовка" value={cfg.header_text_color} onChange={v => set('header_text_color', v)} />
              <ColorRow label="Цвет даты" value={cfg.date_text_color} onChange={v => set('date_text_color', v)} />
              <ColorRow label="Цвет кнопки (текст)" value={cfg.button_text_color} onChange={v => set('button_text_color', v)} />
              <ColorRow label="Цвет кнопки (фон)" value={cfg.button_bg_color} onChange={v => set('button_bg_color', v)} />
            </div>

            <div style={s}>
              <SectionTitle>Размеры и скругления</SectionTitle>
              {([
                ['Размер заголовка (px)', 'header_text_size', 10, 48],
                ['Размер даты (px)', 'date_text_size', 10, 24],
                ['Размер текста кнопки (px)', 'button_text_size', 10, 24],
                ['Скругление кнопки (px)', 'button_border_radius', 0, 30],
                ['Скругление карточек список (px)', 'card_border_radius', 0, 30],
                ['Скругление карточек плитка (px)', 'card_cards_border_radius', 0, 30],
                ['Максимальная ширина сайта (px)', 'layout_max_width', 320, 1400],
              ] as [string, keyof LandingSettings, number, number][]).map(([label, key, min, max]) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#333' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{cfg[key]}</span>
                  </div>
                  <input type="range" min={min} max={max} value={cfg[key] as number} onChange={e => set(key, Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== АНАЛИТИКА ===== */}
        {tab === 'extra' && (
          <div style={s}>
            <SectionTitle>Счётчики аналитики</SectionTitle>
            <Field label="Пиксель ВКонтакте (ID счётчика)">
              <input className="vk-input" placeholder="73463455" value={cfg.vk_pixel_id} onChange={e => set('vk_pixel_id', e.target.value)} />
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>При бронировании отправляем событие: <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 4 }}>order</code></div>
            </Field>
            <Field label="Яндекс Метрика (ID счётчика)">
              <input className="vk-input" placeholder="12345678" value={cfg.yandex_metrika_id} onChange={e => set('yandex_metrika_id', e.target.value)} />
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>При бронировании отправляем цель: <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 4 }}>order</code></div>
            </Field>
          </div>
        )}

        {/* ===== ПРЕВЬЮ ===== */}
        {tab === 'preview' && (
          <div style={{ ...s, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Предпросмотр сайта</span>
              <a href={PREVIEW_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ExternalLink" size={12} /> Открыть
              </a>
            </div>
            <iframe src={PREVIEW_URL} style={{ width: '100%', height: 600, border: 'none', display: 'block' }} title="Превью сайта" />
          </div>
        )}

        {/* ===== ДОМЕН ===== */}
        {tab === 'connect' && (
          <>
            <div style={{ ...s, background: '#F5F3FF', border: '1.5px solid #DDD6FE' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="Globe" size={22} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED' }}>{PUBLIC_URL}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Будет доступен после подключения домена</div>
                </div>
              </div>
            </div>

            <div style={s}>
              <SectionTitle>Как подключить домен a-fisha.ru</SectionTitle>
              {[
                { n: '1', title: 'Укажи поддомен', desc: `На вкладке «Основное» заполни поле «Поддомен». Например: ${VK_GROUP_ID}` },
                { n: '2', title: 'Купи домен a-fisha.ru', desc: 'Зарегистрируй домен у любого регистратора (RU-CENTER, REG.RU, Timeweb)' },
                { n: '3', title: 'Добавь wildcard-поддомен в DNS', desc: 'Создай запись: Тип CNAME, Имя: *, Значение: домен этого проекта после публикации' },
                { n: '4', title: 'Опубликуй проект', desc: 'Нажми «Опубликовать» → «Привязать свой домен» → введи a-fisha.ru. SSL подключится автоматически.' },
                { n: '5', title: 'Настрой роутинг', desc: `Запросы вида /${VK_GROUP_ID} должны направляться на landing-api. Обратись в поддержку poehali.dev.` },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 13, color: '#7C3AED' }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 2 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s}>
              <SectionTitle>Временная ссылка (пока домен не подключён)</SectionTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F7', borderRadius: 10, padding: '10px 12px' }}>
                <span style={{ flex: 1, fontSize: 11, color: '#555', wordBreak: 'break-all' }}>{PREVIEW_URL}</span>
                <button onClick={() => handleCopy(PREVIEW_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', flexShrink: 0 }}>
                  <Icon name={copied ? 'Check' : 'Copy'} size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Нижняя кнопка сохранения */}
      {tab !== 'preview' && tab !== 'connect' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 12, background: '#fff', borderTop: '1px solid #EBEBEB', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)', display: 'flex', gap: 8 }}>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 1, padding: '13px', fontSize: 15, fontWeight: 800, border: 'none', borderRadius: 12,
            cursor: saving ? 'default' : 'pointer',
            background: saving ? '#DDD' : 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#fff',
            boxShadow: saving ? 'none' : '0 4px 16px rgba(124,58,237,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name={saved ? 'Check' : 'Save'} size={16} />
            {saving ? 'Сохранение…' : saved ? 'Опубликовано!' : 'Опубликовать'}
          </button>
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer" style={{
            padding: '13px 16px', fontSize: 15, fontWeight: 800, borderRadius: 12,
            border: '1.5px solid #DDD6FE', background: '#F5F3FF', color: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            textDecoration: 'none', flexShrink: 0,
          }}>
            <Icon name="ExternalLink" size={16} />
          </a>
        </div>
      )}
    </div>
  );
};

export default PageSite;