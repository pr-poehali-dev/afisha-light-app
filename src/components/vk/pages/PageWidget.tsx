import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { fetchWidgetEvents, publishWidget, type WidgetEvent } from '@/api/widget';
import bridge, { getGroupTokenForWidget, getAppId } from '@/lib/vk';

interface WidgetProps { groupId: number; }

const MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
function fmtDate(d: string) {
  const [, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]}`;
}

type WidgetType = 'compact_list' | 'list' | 'cover_list' | 'tiles' | 'table';

const WIDGET_TYPES: { key: WidgetType; label: string; icon: string; desc: string; min: number; max: number }[] = [
  { key: 'compact_list', label: 'Компактный список', icon: 'List',       desc: '1–6 событий',  min: 1, max: 6  },
  { key: 'list',         label: 'Список',            icon: 'AlignLeft',  desc: '1–6 событий',  min: 1, max: 6  },
  { key: 'cover_list',   label: 'Обложка',           icon: 'Image',      desc: '1–3 события',  min: 1, max: 3  },
  { key: 'tiles',        label: 'Плитка',            icon: 'LayoutGrid', desc: '3–10 событий', min: 3, max: 10 },
  { key: 'table',        label: 'Таблица',           icon: 'Table',      desc: '1–10 событий', min: 1, max: 10 },
];

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23EDE9FE"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="%237C3AED">🎭</text></svg>';

// ===== ПРЕВЬЮ =====

const PreviewCompactList = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
    {events.map((e) => (
      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDE9FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {e.dates[0] ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', lineHeight: 1 }}>{e.dates[0].date.split('-')[2]}</div>
              <div style={{ fontSize: 8, color: '#7C3AED', fontWeight: 600 }}>{MONTHS[parseInt(e.dates[0].date.split('-')[1]) - 1].toUpperCase()}</div>
            </>
          ) : <Icon name="Calendar" size={14} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{e.dates[0] ? e.dates[0].start_time : ''}</div>
        </div>
        <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>{btn1 || 'Подробнее'}</span>
      </div>
    ))}
    <div style={{ padding: '8px 14px', textAlign: 'center' }}>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
  </div>
);

const PreviewList = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
    {events.map((e) => (
      <div key={e.id} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: '1px solid #F5F5F5', alignItems: 'center' }}>
        <img src={e.image || FALLBACK_IMG} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
          <div style={{ fontSize: 11, color: '#7C3AED' }}>{e.dates[0] ? `${fmtDate(e.dates[0].date)} · ${e.dates[0].start_time}` : ''}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '4px 8px', borderRadius: 6 }}>{btn1 || 'Подробнее'}</span>
      </div>
    ))}
  </div>
);

const PreviewTable = ({ events, title, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <tbody>
        {events.map((e) => (
          <tr key={e.id} style={{ borderBottom: '1px solid #F5F5F5' }}>
            <td style={{ padding: '8px 14px', color: '#7C3AED', fontWeight: 700, whiteSpace: 'nowrap' }}>{e.dates[0] ? fmtDate(e.dates[0].date) : ''}</td>
            <td style={{ padding: '8px 14px', color: '#111', fontWeight: 600 }}>{e.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PreviewCoverList = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
    {events.map((e) => (
      <div key={e.id} style={{ position: 'relative', borderBottom: '1px solid #F5F5F5' }}>
        <img
          src={e.image || FALLBACK_IMG}
          style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.65))', padding: '18px 14px 10px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{e.dates[0] ? `${fmtDate(e.dates[0].date)} · ${e.dates[0].start_time}` : ''}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(124,58,237,0.8)', padding: '3px 8px', borderRadius: 6 }}>{btn1 || 'Подробнее'}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PreviewTiles = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все'}</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2 }}>
      {events.map((e) => (
        <div key={e.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          <img src={e.image || FALLBACK_IMG} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '12px 6px 5px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>{e.dates[0] ? fmtDate(e.dates[0].date) : ''}</div>
          </div>
          <div style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, fontWeight: 700, color: '#fff', background: 'rgba(124,58,237,0.85)', padding: '2px 5px', borderRadius: 4 }}>{btn1 || 'Подробнее'}</div>
        </div>
      ))}
    </div>
  </div>
);

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

const PageWidget = ({ groupId }: WidgetProps) => {
  const [events, setEvents] = useState<WidgetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetType, setWidgetType] = useState<WidgetType>('compact_list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [widgetTitle, setWidgetTitle] = useState('Афиша');
  const [btn1Text, setBtn1Text] = useState('Подробнее');
  const [btn2Text, setBtn2Text] = useState('Посмотреть все события');
  const [showRows, setShowRows] = useState(3);
  const [groupToken, setGroupToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const currentType = WIDGET_TYPES.find((t) => t.key === widgetType)!;

  useEffect(() => {
    fetchWidgetEvents(groupId)
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setEvents(arr);
        setSelectedIds(arr.slice(0, 3).map((e) => e.id));
      })
      .finally(() => setLoading(false));
    requestToken();
  }, []);

  // При смене типа — корректируем show_rows и selectedIds
  useEffect(() => {
    const t = WIDGET_TYPES.find((x) => x.key === widgetType)!;
    setShowRows((r) => Math.min(Math.max(r, t.min), t.max));
  }, [widgetType]);

  const requestToken = async () => {
    setTokenLoading(true);
    const token = await getGroupTokenForWidget(groupId);
    setGroupToken(token);
    setTokenLoading(false);
    return token;
  };

  const toggleEvent = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= currentType.max) return prev;
      return [...prev, id];
    });
  };

  const selectedEvents = selectedIds
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean) as WidgetEvent[];

  const handlePublish = async () => {
    const token = groupToken || await requestToken();
    if (!token) { alert('Не удалось получить токен'); return; }
    if (selectedIds.length === 0) { alert('Выберите хотя бы одно мероприятие'); return; }

    setPublishing(true); setPublishResult(null);

    try {
      const appUrl = `https://vk.com/app${getAppId()}_-${groupId}`;
      const evs = selectedEvents.slice(0, showRows);
      let widgetData: object;

      if (widgetType === 'cover_list') {
        widgetData = {
          title: widgetTitle, title_url: appUrl, more: btn2Text, more_url: appUrl,
          rows: evs.map((e) => {
            const d = e.dates[0];
            const descr = d ? `${fmtDate(d.date)} · ${d.start_time || ''}`.replace(/·\s*$/, '').trim() : '';
            return {
              title: e.title, button: btn1Text, button_url: appUrl,
              descr, url: appUrl,
              ...(e.vk_cover_id ? { cover_id: e.vk_cover_id } : {}),
            };
          }),
        };
      } else if (widgetType === 'tiles') {
        widgetData = {
          title: widgetTitle,
          title_url: appUrl,
          more: btn2Text,
          more_url: appUrl,
          tiles: evs.map((e) => {
            const d = e.dates[0];
            const descr = d ? `${fmtDate(d.date)} · ${d.start_time || ''}`.replace(/·\s*$/, '').trim() : '';
            return {
              title: e.title,
              descr,
              url: appUrl,
              link: btn1Text,
              link_url: appUrl,
            };
          }),
        };
      } else if (widgetType === 'table') {
        // Table: head[] + body[][]
        widgetData = {
          title: widgetTitle,
          title_url: appUrl,
          more: btn2Text,
          more_url: appUrl,
          head: [{ text: 'Событие' }, { text: 'Дата' }, { text: 'Действие' }],
          body: evs.map((e) => {
            const d = e.dates[0];
            const dateLabel = d ? `${fmtDate(d.date)} · ${d.start_time || ''}`.replace(/·\s*$/, '').trim() : '';
            return [
              { text: e.title.slice(0, 100), url: appUrl },
              { text: dateLabel },
              { text: btn1Text, url: appUrl },
            ];
          }),
        };
      } else {
        // list / compact_list: rows[] с title, title_url, button, button_url, text
        widgetData = {
          title: widgetTitle,
          title_url: appUrl,
          more: btn2Text,
          more_url: appUrl,
          rows: evs.map((e) => {
            const d = e.dates[0];
            const text = d ? `${fmtDate(d.date)} · ${d.start_time || ''}`.replace(/·\s*$/, '').trim() : '';
            return {
              title: e.title.slice(0, 100),
              title_url: appUrl,
              button: btn1Text,
              button_url: appUrl,
              text,
            };
          }),
        };
      }

      const code = `return ${JSON.stringify(widgetData)};`;
      console.log('[widget] type:', widgetType, 'code:', code);
      await bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
        group_id: groupId,
        type: widgetType,
        code,
      });
      setPublishResult({ success: true });
    } catch (e: unknown) {
      console.error('[widget] error:', e);
      const msg = e instanceof Error ? e.message
        : (e as {error_data?: {error_reason?: string}})?.error_data?.error_reason
        ?? JSON.stringify(e);
      setPublishResult({ error: msg });
    }
    setPublishing(false);
  };

  const handleRemove = async () => {
    const token = groupToken || await requestToken();
    if (!token) { alert('Не удалось получить токен'); return; }
    setRemoving(true); setPublishResult(null);
    try {
      await bridge.send('VKWebAppShowCommunityWidgetPreviewBox', {
        group_id: groupId,
        type: 'text',
        code: 'return {};',
      });
      setPublishResult({ success: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message
        : (e as {error_data?: {error_reason?: string}})?.error_data?.error_reason
        ?? JSON.stringify(e);
      setPublishResult({ error: msg });
    }
    setRemoving(false);
  };

  type PreviewProps = { events: WidgetEvent[]; title: string; btn1: string; btn2: string };
  const PreviewMap: Record<WidgetType, React.ComponentType<PreviewProps>> = {
    compact_list: PreviewCompactList,
    list:         PreviewList,
    cover_list:   PreviewCoverList,
    tiles:        PreviewTiles,
    table:        PreviewTable,
  };
  const Preview = PreviewMap[widgetType];

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', paddingBottom: 24 }}>

      {/* Тип виджета */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Тип виджета</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WIDGET_TYPES.map((t) => (
            <button key={t.key} onClick={() => setWidgetType(t.key)} style={{
              padding: '8px 12px', border: `2px solid ${widgetType === t.key ? '#7C3AED' : '#F0F0F0'}`,
              borderRadius: 10, background: widgetType === t.key ? '#F5F3FF' : '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}>
              <Icon name={t.icon} size={16} style={{ color: widgetType === t.key ? '#7C3AED' : '#CCC' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: widgetType === t.key ? '#7C3AED' : '#555' }}>{t.label}</div>
                <div style={{ fontSize: 10, color: '#BBB' }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>

        {/* Выбор мероприятий */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>Мероприятия</div>
            <span style={{ fontSize: 12, color: selectedIds.length >= currentType.max ? '#EF4444' : '#999' }}>
              {selectedIds.length} / {currentType.max}
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#CCC', fontSize: 13 }}>Загрузка…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#999', fontSize: 13 }}>Нет опубликованных мероприятий</div>
          ) : (
            events.map((e) => {
              const selected = selectedIds.includes(e.id);
              const order = selectedIds.indexOf(e.id);
              const disabled = !selected && selectedIds.length >= currentType.max;
              return (
                <div key={e.id} onClick={() => !disabled && toggleEvent(e.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  marginBottom: 6, borderRadius: 12, cursor: disabled ? 'default' : 'pointer',
                  background: selected ? '#F5F3FF' : disabled ? '#FAFAFA' : '#F9F9F9',
                  border: `1.5px solid ${selected ? '#DDD6FE' : 'transparent'}`,
                  opacity: disabled ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected ? '#7C3AED' : '#E5E5E5' }}>
                    {selected
                      ? <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{order + 1}</span>
                      : <Icon name="Plus" size={11} style={{ color: '#AAA' }} />}
                  </div>
                  <img src={e.image || FALLBACK_IMG} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: '#7C3AED' }}>{e.dates[0] ? `${fmtDate(e.dates[0].date)} · ${e.dates[0].start_time}` : ''}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Настройки */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Настройки виджета</div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Заголовок виджета</div>
            <input className="vk-input" value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="Афиша" maxLength={100} />
            <div style={{ fontSize: 10, color: '#BBB', marginTop: 3 }}>до 100 символов. Можно использовать [first_name] и [last_name]</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Кнопка у каждого события</div>
            <input className="vk-input" value={btn1Text} onChange={(e) => setBtn1Text(e.target.value)} placeholder="Подробнее" maxLength={30} />
            <div style={{ fontSize: 10, color: '#BBB', marginTop: 3 }}>до 30 символов</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Текст в футере</div>
            <input className="vk-input" value={btn2Text} onChange={(e) => setBtn2Text(e.target.value)} placeholder="Посмотреть все события" maxLength={100} />
            <div style={{ fontSize: 10, color: '#BBB', marginTop: 3 }}>до 100 символов</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>
              Количество строк / плиток
            </div>
            <input
              type="number"
              className="vk-input"
              value={showRows}
              min={currentType.min}
              max={currentType.max}
              step={1}
              onChange={(e) => {
                const v = Math.min(Math.max(parseInt(e.target.value) || currentType.min, currentType.min), currentType.max);
                setShowRows(v);
              }}
            />
            <div style={{ fontSize: 10, color: '#BBB', marginTop: 3 }}>
              {widgetType === 'compact_list' && 'Компактный список: от 1 до 6'}
              {widgetType === 'list' && 'Список: от 1 до 6'}
              {widgetType === 'tiles' && 'Плитка: минимум 3 события, максимум 10'}
              {widgetType === 'table' && 'Таблица: от 1 до 10'}
            </div>
          </div>
        </div>

        {/* Превью */}
        {selectedEvents.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>Превью</div>
            <Preview events={selectedEvents} title={widgetTitle} btn1={btn1Text} btn2={btn2Text} />
          </div>
        )}

        {/* Публикация */}
        <div style={section}>
          {publishResult && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: publishResult.success ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={publishResult.success ? 'CheckCircle' : 'AlertCircle'} size={16} style={{ color: publishResult.success ? '#059669' : '#DC2626', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: publishResult.success ? '#065F46' : '#B91C1C' }}>
                {publishResult.success ? 'Виджет успешно опубликован!' : publishResult.error}
              </span>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing || selectedIds.length === 0}
            style={{
              width: '100%', padding: '13px', fontSize: 15, fontWeight: 800,
              color: '#fff', border: 'none', borderRadius: 12,
              cursor: publishing || selectedIds.length === 0 ? 'default' : 'pointer',
              background: publishing || selectedIds.length === 0 ? '#DDD' : 'linear-gradient(135deg, #7C3AED, #9333EA)',
              boxShadow: publishing || selectedIds.length === 0 ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {publishing ? <><Icon name="Loader" size={16} /> Публикация…</> : <><Icon name="Layers" size={16} /> Опубликовать виджет</>}
          </button>

          <button
            onClick={handleRemove}
            disabled={removing}
            style={{
              width: '100%', padding: '10px', fontSize: 13, fontWeight: 700, marginTop: 8,
              color: removing ? '#AAA' : '#DC2626', border: `1.5px solid ${removing ? '#EEE' : '#FECACA'}`,
              borderRadius: 12, cursor: removing ? 'default' : 'pointer',
              background: '#FFF5F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {removing ? <><Icon name="Loader" size={14} /> Удаление…</> : <><Icon name="Trash2" size={14} /> Убрать виджет из группы</>}
          </button>

        </div>
      </div>
    </div>
  );
};

export default PageWidget;