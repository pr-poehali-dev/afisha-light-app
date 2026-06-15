import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import {
  fetchLandingSettings, saveLandingSettings, getLandingUrl, getPublicLandingUrl,
  DEFAULT_SETTINGS, type LandingSettings,
} from '@/api/landing';

const VK_GROUP_ID = parseInt(new URLSearchParams(window.location.search).get('vk_group_id') || '234136199');
const PUBLIC_URL = getPublicLandingUrl(VK_GROUP_ID);
const PREVIEW_URL = getLandingUrl(VK_GROUP_ID);

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
    {children}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
  <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', paddingBottom: 10 }}>
    <div>
      <div style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{desc}</div>}
    </div>
    <div style={{ width: 40, height: 22, borderRadius: 11, background: checked ? '#7C3AED' : '#DDD', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  </div>
);

const ACCENT_PRESETS = ['#7C3AED', '#2563EB', '#DC2626', '#059669', '#D97706', '#DB2777', '#111111'];
const BG_PRESETS = ['#F5F5F7', '#FFFFFF', '#F0FDF4', '#FFF7ED', '#EFF6FF', '#FDF4FF', '#111827'];

type TabKey = 'settings' | 'preview' | 'connect';

const PageSite = () => {
  const [tab, setTab] = useState<TabKey>('settings');
  const [settings, setSettings] = useState<LandingSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLandingSettings(VK_GROUP_ID)
      .then((s) => setSettings(s))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof LandingSettings>(k: K, v: LandingSettings[K]) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveLandingSettings(VK_GROUP_ID, settings);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'settings', label: 'Настройки', icon: 'Settings2' },
    { key: 'preview', label: 'Превью', icon: 'Eye' },
    { key: 'connect', label: 'Подключение', icon: 'Globe' },
  ];

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>

      {/* URL сайта */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Адрес вашего сайта-афиши</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '10px 14px' }}>
          <Icon name="Globe" size={16} style={{ color: '#7C3AED', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#7C3AED', wordBreak: 'break-all' }}>{PUBLIC_URL}</span>
          <button onClick={() => handleCopy(PUBLIC_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', padding: 4, flexShrink: 0 }}>
            <Icon name={copied ? 'Check' : 'Copy'} size={16} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
          Домен нужно подключить — смотри вкладку «Подключение»
        </div>
      </div>

      {/* Внутренние табы */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '0 8px' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '12px 0', fontSize: 13, fontWeight: 700,
            color: tab === t.key ? '#7C3AED' : '#999', background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: tab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
          }}>
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 12px 80px' }}>

        {/* ===== НАСТРОЙКИ ===== */}
        {tab === 'settings' && !loading && (
          <>
            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Основное</div>
              <div style={{ marginBottom: 12 }}>
                <Label>Название сайта</Label>
                <input className="vk-input" placeholder="Афиша" value={settings.site_title} onChange={(e) => set('site_title', e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Описание</Label>
                <textarea className="vk-input" placeholder="Актуальные мероприятия нашего сообщества" value={settings.site_desc} rows={2} style={{ resize: 'none' }} onChange={(e) => set('site_desc', e.target.value)} />
              </div>
              <div>
                <Label>URL логотипа (необязательно)</Label>
                <input className="vk-input" placeholder="https://..." value={settings.logo_url} onChange={(e) => set('logo_url', e.target.value)} />
              </div>
            </div>

            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Цвета</div>
              <div style={{ marginBottom: 14 }}>
                <Label>Акцентный цвет</Label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {ACCENT_PRESETS.map((c) => (
                    <button key={c} onClick={() => set('accent_color', c)} style={{
                      width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${settings.accent_color === c ? '#111' : 'transparent'}`, cursor: 'pointer', transition: 'border 0.15s',
                    }} />
                  ))}
                  <input type="color" value={settings.accent_color} onChange={(e) => set('accent_color', e.target.value)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #DDD', cursor: 'pointer', padding: 0 }} />
                </div>
              </div>
              <div>
                <Label>Цвет фона</Label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {BG_PRESETS.map((c) => (
                    <button key={c} onClick={() => set('bg_color', c)} style={{
                      width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${settings.bg_color === c ? '#111' : '#E5E5E5'}`, cursor: 'pointer', transition: 'border 0.15s',
                    }} />
                  ))}
                  <input type="color" value={settings.bg_color} onChange={(e) => set('bg_color', e.target.value)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #DDD', cursor: 'pointer', padding: 0 }} />
                </div>
              </div>
            </div>

            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Содержимое</div>
              <Toggle label="Показывать цену" checked={settings.show_price} onChange={() => set('show_price', !settings.show_price)} />
              <Toggle label="Показывать прошедшие" desc="Включить раздел с прошедшими мероприятиями" checked={settings.show_past} onChange={() => set('show_past', !settings.show_past)} />
              <Toggle label="Кнопка «Открыть в VK»" checked={settings.show_vk_button} onChange={() => set('show_vk_button', !settings.show_vk_button)} />
              {settings.show_vk_button && (
                <div style={{ marginTop: 8 }}>
                  <Label>Текст кнопки VK</Label>
                  <input className="vk-input" value={settings.vk_button_text} onChange={(e) => set('vk_button_text', e.target.value)} />
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Label>Количество мероприятий на сайте</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min={1} max={50} value={settings.events_count} onChange={(e) => set('events_count', Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED', minWidth: 28, textAlign: 'center' }}>{settings.events_count}</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 12, background: '#fff', borderTop: '1px solid #EBEBEB', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
              <button onClick={handleSave} disabled={saving} style={{
                width: '100%', padding: '13px', fontSize: 15, fontWeight: 800, border: 'none', borderRadius: 12, cursor: saving ? 'default' : 'pointer',
                background: saving ? '#DDD' : 'linear-gradient(135deg, #7C3AED, #9333EA)', color: '#fff',
                boxShadow: saving ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Icon name={saved ? 'Check' : 'Save'} size={16} />
                {saving ? 'Сохранение…' : saved ? 'Сохранено!' : 'Сохранить настройки'}
              </button>
            </div>
          </>
        )}

        {/* ===== ПРЕВЬЮ ===== */}
        {tab === 'preview' && (
          <div style={{ ...section, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Предпросмотр лендинга</span>
              <a href={PREVIEW_URL} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ExternalLink" size={12} /> Открыть
              </a>
            </div>
            <iframe
              src={PREVIEW_URL}
              style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
              title="Превью лендинга"
            />
          </div>
        )}

        {/* ===== ПОДКЛЮЧЕНИЕ ===== */}
        {tab === 'connect' && (
          <>
            <div style={{ ...section, background: '#F5F3FF', border: '1.5px solid #DDD6FE' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="Globe" size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>Ваш адрес</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#7C3AED', wordBreak: 'break-all' }}>{PUBLIC_URL}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>После подключения домена сайт будет доступен по этому адресу</div>
                </div>
              </div>
            </div>

            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 14 }}>Как подключить домен</div>

              {[
                {
                  n: '1', icon: 'ShoppingCart', title: 'Купи домен a-fisha.ru',
                  desc: 'Если домен ещё не куплен — зарегистрируй его у любого регистратора (RU-CENTER, REG.RU, Timeweb и др.)',
                },
                {
                  n: '2', icon: 'Settings', title: 'Добавь поддомен в DNS',
                  desc: `В панели управления доменом добавь A-запись или CNAME:\nИмя: ${VK_GROUP_ID}\nТип: CNAME\nЗначение: (укажи после публикации проекта)`,
                },
                {
                  n: '3', icon: 'Upload', title: 'Опубликуй этот проект',
                  desc: 'Нажми «Опубликовать» → «Привязать свой домен» → введи a-fisha.ru. SSL подключится автоматически.',
                },
                {
                  n: '4', icon: 'Globe', title: 'Настрой маршрутизацию',
                  desc: `В коде проекта нужно направить запросы вида /${VK_GROUP_ID} на landing-api. Обратись в поддержку poehali.dev для настройки wildcard-поддоменов.`,
                },
              ].map((step) => (
                <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 14, color: '#7C3AED' }}>
                    {step.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 3 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 10 }}>Прямая ссылка на API</div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                Пока домен не подключён — сайт доступен по этой временной ссылке:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F5F5F7', borderRadius: 10, padding: '10px 12px', wordBreak: 'break-all' }}>
                <span style={{ flex: 1, fontSize: 12, color: '#555' }}>{PREVIEW_URL}</span>
                <button onClick={() => handleCopy(PREVIEW_URL)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', flexShrink: 0 }}>
                  <Icon name={copied ? 'Check' : 'Copy'} size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageSite;
