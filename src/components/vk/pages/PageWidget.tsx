import { useState, useEffect, useRef } from 'react';
import bridge, { getGroupTokenForWidget, getAppId } from '@/lib/vk';
import { fetchEvents } from '@/api/events';
import type { EventItem } from '@/types';
import Icon from '@/components/ui/icon';

interface Props { groupId: number; }

type WidgetType = 'compact_list' | 'list' | 'tiles' | 'table' | 'cover_list';

const WIDGET_TYPES: { key: WidgetType; label: string; desc: string; min: number; max: number }[] = [
  { key: 'compact_list', label: 'Компактный список', desc: '1–6 событий', min: 1, max: 6 },
  { key: 'list',         label: 'Список',            desc: '1–6 событий', min: 1, max: 6 },
  { key: 'tiles',        label: 'Плитка',            desc: '3–10 событий', min: 3, max: 10 },
  { key: 'table',        label: 'Таблица',           desc: '1–10 событий', min: 1, max: 10 },
  { key: 'cover_list',   label: 'Обложка',           desc: '1–3 события', min: 1, max: 3 },
];

const MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const VK_IMAGES_API = 'https://functions.poehali.dev/894c77a2-33bc-4925-8fac-38bb82c58a7d';

function fmtDate(d: string) {
  const [,m,day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m)-1]}`;
}

function fmtLabel(e: EventItem) {
  const d = e.dates?.[0];
  if (!d) return '';
  return `${fmtDate(d.date)} · ${d.start_time || ''}`.replace(/·\s*$/, '').trim();
}

interface VkImage { id: string; images: { url: string; width: number; height: number }[] }

const s: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 16,
  marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const PageWidget = ({ groupId }: Props) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetType, setWidgetType] = useState<WidgetType>('compact_list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [title, setTitle] = useState('Афиша');
  const [btn1, setBtn1] = useState('Подробнее');
  const [btn2, setBtn2] = useState('Посмотреть все');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; msg?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // cover_list: доп. cover_id если у мероприятия нет vk_cover_id
  const [vkImages, setVkImages] = useState<VkImage[]>([]);
  const [vkImagesLoading, setVkImagesLoading] = useState(false);
  const [coverIds, setCoverIds] = useState<Record<number, string>>({});
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadForRef = useRef<number | null>(null);

  const currentType = WIDGET_TYPES.find(t => t.key === widgetType)!;

  useEffect(() => {
    fetchEvents(groupId, false, true).then(data => {
      const arr = Array.isArray(data) ? data : [];
      setEvents(arr);
      // Предзаполняем coverIds из vk_cover_id мероприятий
      const ids: Record<number, string> = {};
      arr.forEach(e => { if (e.vk_cover_id) ids[e.id] = e.vk_cover_id; });
      setCoverIds(ids);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (widgetType === 'cover_list') loadVkImages();
  }, [widgetType]);

  const loadVkImages = async () => {
    setVkImagesLoading(true);
    try {
      const r = await fetch(`${VK_IMAGES_API}?action=list&image_type=510x128`);
      const data = await r.json();
      if (Array.isArray(data)) setVkImages(data);
    } catch (_e) { void _e; }
    setVkImagesLoading(false);
  };

  const requestToken = async () => {
    setTokenLoading(true);
    const t = await getGroupTokenForWidget(groupId);
    setToken(t);
    setTokenLoading(false);
    return t;
  };

  const toggle = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= currentType.max) return prev;
      return [...prev, id];
    });
    setResult(null);
  };

  const selectedEvents = selectedIds
    .map(id => events.find(e => e.id === id))
    .filter(Boolean) as EventItem[];

  const getCoverId = (e: EventItem) => coverIds[e.id] || e.vk_cover_id || '';

  const handleUploadForEvent = (eventId: number) => {
    uploadForRef.current = eventId;
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const eventId = uploadForRef.current;
    if (!file || !eventId) return;
    if (file.size > 5 * 1024 * 1024) { setResult({ msg: 'Файл слишком большой. Максимум 5 МБ' }); return; }

    setUploadingFor(eventId);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const r = await fetch(`${VK_IMAGES_API}?action=upload&image_type=510x128`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await r.json();
        if (data.id) {
          setCoverIds(prev => ({ ...prev, [eventId]: data.id }));
          await loadVkImages();
        } else {
          setResult({ msg: data.error || 'Ошибка загрузки в VK' });
        }
      } catch {
        setResult({ msg: 'Ошибка сети' });
      }
      setUploadingFor(null);
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const publish = async () => {
    const tok = token || await requestToken();
    if (!tok) { setResult({ msg: 'Не удалось получить токен сообщества' }); return; }
    if (selectedIds.length < currentType.min) {
      setResult({ msg: `Выберите минимум ${currentType.min} событий` }); return;
    }
    if (widgetType === 'cover_list') {
      const missing = selectedEvents.filter(e => !getCoverId(e));
      if (missing.length > 0) {
        setResult({ msg: `Загрузите обложку для: ${missing.map(e => e.title).join(', ')}` }); return;
      }
    }

    setPublishing(true); setResult(null);
    try {
      const appUrl = `https://vk.com/app${getAppId()}_-${groupId}`;
      const evs = selectedEvents;
      let widgetData: object;

      if (widgetType === 'cover_list') {
        widgetData = {
          title, title_url: appUrl, more: btn2, more_url: appUrl,
          rows: evs.map(e => ({
            title: e.title, button: btn1, button_url: appUrl,
            cover_id: getCoverId(e), descr: fmtLabel(e), url: appUrl,
          })),
        };
      } else if (widgetType === 'tiles') {
        widgetData = {
          title, title_url: appUrl, more: btn2, more_url: appUrl,
          tiles: evs.map(e => ({
            title: e.title, descr: fmtLabel(e),
            url: appUrl, link: btn1, link_url: appUrl,
          })),
        };
      } else if (widgetType === 'table') {
        widgetData = {
          title, title_url: appUrl, more: btn2, more_url: appUrl,
          head: [{ text: 'Событие' }, { text: 'Дата' }, { text: 'Действие' }],
          body: evs.map(e => [
            { text: e.title.slice(0, 100), url: appUrl },
            { text: fmtLabel(e) },
            { text: btn1, url: appUrl },
          ]),
        };
      } else {
        widgetData = {
          title, title_url: appUrl, more: btn2, more_url: appUrl,
          rows: evs.map(e => ({
            title: e.title.slice(0, 100), title_url: appUrl,
            button: btn1, button_url: appUrl, descr: fmtLabel(e),
          })),
        };
      }

      const code = `return ${JSON.stringify(widgetData)};`;
      await bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
        group_id: groupId, type: widgetType, code,
      });
      setResult({ ok: true });
    } catch (e: unknown) {
      const msg = (e as { error_data?: { error_reason?: string } })?.error_data?.error_reason
        ?? (e instanceof Error ? e.message : JSON.stringify(e));
      setResult({ msg });
    }
    setPublishing(false);
  };

  const removeWidget = async () => {
    const tok = token || await requestToken();
    if (!tok) { setResult({ msg: 'Не удалось получить токен' }); return; }
    setPublishing(true); setResult(null);
    try {
      await bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
        group_id: groupId, type: 'text', code: 'return {};',
      });
      setResult({ ok: true });
    } catch (e: unknown) {
      const msg = (e as { error_data?: { error_reason?: string } })?.error_data?.error_reason
        ?? (e instanceof Error ? e.message : JSON.stringify(e));
      setResult({ msg });
    }
    setPublishing(false);
  };

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', paddingBottom: 24 }}>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Тип виджета */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Тип виджета</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WIDGET_TYPES.map(t => (
            <button key={t.key} onClick={() => { setWidgetType(t.key); setSelectedIds([]); setResult(null); }} style={{
              padding: '8px 12px', border: `2px solid ${widgetType === t.key ? '#7C3AED' : '#F0F0F0'}`,
              borderRadius: 10, background: widgetType === t.key ? '#F5F3FF' : '#fff', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: widgetType === t.key ? '#7C3AED' : '#555' }}>{t.label}</div>
              <div style={{ fontSize: 10, color: '#BBB' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>

        {/* Настройки */}
        <div style={s}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Настройки</div>
          {[
            { label: 'Заголовок виджета', val: title, set: setTitle, max: 100, ph: 'Афиша' },
            { label: 'Текст кнопки', val: btn1, set: setBtn1, max: 50, ph: 'Подробнее' },
            { label: 'Текст в футере', val: btn2, set: setBtn2, max: 100, ph: 'Посмотреть все' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
              <input value={f.val} onChange={e => f.set(e.target.value)} maxLength={f.max} placeholder={f.ph}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E5E5', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        {/* Выбор мероприятий */}
        <div style={s}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>Мероприятия</div>
            <span style={{ fontSize: 12, color: selectedIds.length >= currentType.max ? '#EF4444' : '#999' }}>
              {selectedIds.length} / {currentType.max}
            </span>
          </div>
          {loading ? (
            <div style={{ color: '#BBB', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Загрузка…</div>
          ) : events.length === 0 ? (
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Нет опубликованных мероприятий</div>
          ) : events.map(e => {
            const sel = selectedIds.includes(e.id);
            const disabled = !sel && selectedIds.length >= currentType.max;
            const order = selectedIds.indexOf(e.id) + 1;
            const coverId = getCoverId(e);
            return (
              <div key={e.id} style={{ marginBottom: 8 }}>
                <div onClick={() => !disabled && toggle(e.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
                  background: sel ? '#F5F3FF' : disabled ? '#FAFAFA' : '#F9F9F9',
                  border: `1.5px solid ${sel ? '#DDD6FE' : 'transparent'}`,
                  opacity: disabled ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: sel ? '#7C3AED' : '#E5E5E5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: sel ? '#fff' : '#AAA',
                  }}>
                    {sel ? order : ''}
                  </div>
                  {e.image && <img src={e.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{fmtLabel(e)}</div>
                  </div>
                  {widgetType === 'cover_list' && sel && (
                    <div style={{ fontSize: 10, fontWeight: 700, flexShrink: 0, color: coverId ? '#059669' : '#EF4444' }}>
                      {coverId ? '✓ обложка' : '⚠ нет обложки'}
                    </div>
                  )}
                </div>

                {/* Блок обложки для cover_list */}
                {sel && widgetType === 'cover_list' && (
                  <div style={{ marginTop: 4, marginLeft: 10, padding: '10px 12px', background: '#F5F3FF', borderRadius: 10, border: '1px solid #EDE9FE' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 6 }}>
                      Обложка 510×128 для виджета
                    </div>
                    {coverId ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>✓ ID: {coverId}</div>
                        <button onClick={() => handleUploadForEvent(e.id)} style={{ fontSize: 11, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                          Заменить
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 11, color: '#92400E', marginBottom: 6 }}>
                          Фото не загружено в VK. Загрузите мероприятие с фото — оно автоматически попадёт в VK. Или загрузите вручную:
                        </div>
                        <button onClick={() => handleUploadForEvent(e.id)} disabled={uploadingFor === e.id} style={{
                          padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#7C3AED',
                          background: '#fff', border: '1.5px solid #DDD6FE', borderRadius: 8, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {uploadingFor === e.id ? <><Icon name="Loader" size={12} /> Загрузка…</> : <><Icon name="Upload" size={12} /> Загрузить обложку</>}
                        </button>
                      </div>
                    )}

                    {/* Галерея загруженных */}
                    {vkImagesLoading && <div style={{ fontSize: 11, color: '#BBB', marginTop: 6 }}>Загрузка галереи…</div>}
                    {vkImages.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8, marginBottom: 4 }}>Выбрать из загруженных:</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {vkImages.map(img => {
                            const thumb = img.images?.[0]?.url;
                            const chosen = getCoverId(e) === img.id;
                            return thumb ? (
                              <div key={img.id} onClick={() => setCoverIds(prev => ({ ...prev, [e.id]: img.id }))}
                                title={img.id}
                                style={{ cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: `2px solid ${chosen ? '#7C3AED' : '#E5E5E5'}` }}>
                                <img src={thumb} alt="" style={{ width: 80, height: 20, objectFit: 'cover', display: 'block' }} />
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Публикация */}
        <div style={s}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#555' }}>Токен сообщества</div>
            {tokenLoading ? (
              <div style={{ fontSize: 11, color: '#999' }}>Получение…</div>
            ) : token ? (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 8px', borderRadius: 6 }}>✓ Получен</div>
            ) : (
              <button onClick={requestToken} style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF9C3', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                Получить токен
              </button>
            )}
          </div>

          {result && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: result.ok ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={result.ok ? 'CheckCircle' : 'AlertCircle'} size={16} style={{ color: result.ok ? '#059669' : '#DC2626', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: result.ok ? '#065F46' : '#B91C1C' }}>
                {result.ok ? 'Виджет успешно опубликован!' : result.msg}
              </span>
            </div>
          )}

          <button onClick={publish} disabled={publishing || selectedIds.length === 0} style={{
            width: '100%', padding: 13, fontSize: 15, fontWeight: 800, color: '#fff',
            border: 'none', borderRadius: 12, cursor: publishing || selectedIds.length === 0 ? 'default' : 'pointer',
            background: publishing || selectedIds.length === 0 ? '#DDD' : 'linear-gradient(135deg, #7C3AED, #9333EA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8,
          }}>
            {publishing ? <><Icon name="Loader" size={16} /> Публикация…</> : <><Icon name="Layers" size={16} /> Опубликовать виджет</>}
          </button>

          <button onClick={removeWidget} disabled={publishing} style={{
            width: '100%', padding: 10, fontSize: 13, fontWeight: 700,
            color: publishing ? '#AAA' : '#DC2626', border: `1.5px solid ${publishing ? '#EEE' : '#FECACA'}`,
            borderRadius: 12, cursor: publishing ? 'default' : 'pointer', background: '#FFF5F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="Trash2" size={14} /> Убрать виджет из группы
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageWidget;
