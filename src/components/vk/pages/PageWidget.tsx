import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { fetchWidgetEvents, publishWidget, type WidgetEvent } from '@/api/widget';
import { getGroupTokenForWidget } from '@/lib/vk';

interface WidgetProps { groupId: number; }

const MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
function fmtDate(d: string) {
  const [, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]}`;
}

type WidgetType = 'cover_list' | 'tiles' | 'compact_list';

const WIDGET_TYPES: { key: WidgetType; label: string; icon: string; desc: string }[] = [
  { key: 'cover_list', label: 'Обложка', icon: 'LayoutTemplate', desc: 'Крупные карточки с фото' },
  { key: 'tiles', label: 'Плитка', icon: 'LayoutGrid', desc: 'Сетка квадратных плиток' },
  { key: 'compact_list', label: 'Список', icon: 'List', desc: 'Компактный список строками' },
];

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

// ===== ПРЕВЬЮ КОМПОНЕНТЫ =====

const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23EDE9FE"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="%237C3AED">🎭</text></svg>';

const PreviewCoverList = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все мероприятия'}</span>
    </div>
    {events.map((e) => (
      <div key={e.id} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: '1px solid #F5F5F5', alignItems: 'center' }}>
        <img src={e.image || FALLBACK_IMG} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
          <div style={{ fontSize: 12, color: '#7C3AED' }}>{e.dates[0] ? `${fmtDate(e.dates[0].date)} · ${e.dates[0].start_time}` : ''}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>{btn1 || 'Подробнее'}</span>
      </div>
    ))}
  </div>
);

const PreviewTiles = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все мероприятия'}</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2 }}>
      {events.map((e) => (
        <div key={e.id} style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', borderRadius: 8 }}>
          <img src={e.image || FALLBACK_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>{e.dates[0] ? fmtDate(e.dates[0].date) : ''}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '8px 14px', textAlign: 'center' }}>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn1 || 'Подробнее'}</span>
    </div>
  </div>
);

const PreviewCompactList = ({ events, title, btn1, btn2 }: { events: WidgetEvent[]; title: string; btn1: string; btn2: string }) => (
  <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{title || 'Афиша'}</span>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все мероприятия'}</span>
    </div>
    {events.map((e) => (
      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: '1px solid #F5F5F5' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EDE9FE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {e.dates[0] ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#7C3AED', lineHeight: 1 }}>{e.dates[0].date.split('-')[2]}</div>
              <div style={{ fontSize: 8, color: '#7C3AED', fontWeight: 600 }}>{e.dates[0] ? MONTHS[parseInt(e.dates[0].date.split('-')[1]) - 1].toUpperCase() : ''}</div>
            </>
          ) : <Icon name="Calendar" size={14} style={{ color: '#7C3AED' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
          <div style={{ fontSize: 11, color: '#999' }}>{e.dates[0] ? e.dates[0].start_time : ''}{e.type ? ` · ${e.type}` : ''}</div>
        </div>
        <span style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600, flexShrink: 0 }}>{btn1 || 'Подробнее'}</span>
      </div>
    ))}
    <div style={{ padding: '8px 14px', textAlign: 'center', borderTop: '1px solid #F0F0F0' }}>
      <span style={{ fontSize: 12, color: '#7C3AED', fontWeight: 600 }}>{btn2 || 'Показать все мероприятия'}</span>
    </div>
  </div>
);

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====

const PageWidget = ({ groupId }: WidgetProps) => {
  const VK_GROUP_ID = groupId;
  const [events, setEvents] = useState<WidgetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetType, setWidgetType] = useState<WidgetType>('compact_list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [widgetTitle, setWidgetTitle] = useState('Афиша');
  const [btn1Text, setBtn1Text] = useState('Подробнее');
  const [btn2Text, setBtn2Text] = useState('Показать все мероприятия');
  const [groupToken, setGroupToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetchWidgetEvents(VK_GROUP_ID)
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        // По умолчанию выбираем первые 3
        setSelectedIds((Array.isArray(data) ? data : []).slice(0, 3).map((e) => e.id));
      })
      .finally(() => setLoading(false));
    requestToken();
  }, []);

  const requestToken = async () => {
    setTokenLoading(true);
    const token = await getGroupTokenForWidget(VK_GROUP_ID);
    setGroupToken(token);
    setTokenLoading(false);
    return token;
  };

  const toggleEvent = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  };

  const selectedEvents = selectedIds
    .map((id) => events.find((e) => e.id === id))
    .filter(Boolean) as WidgetEvent[];

  const handlePublish = async () => {
    if (!groupToken) { const t = await requestToken(); if (!t) { alert('Не удалось получить токен'); return; } }
    if (selectedIds.length === 0) { alert('Выберите хотя бы одно мероприятие'); return; }
    setPublishing(true); setPublishResult(null);
    const res = await publishWidget({
      groupId: VK_GROUP_ID,
      token: groupToken!,
      eventIds: selectedIds,
      widgetType,
      title: widgetTitle,
      btn1Text,
      btn2Text,
    });
    setPublishResult(res);
    setPublishing(false);
  };

  const PreviewMap = {
    cover_list: PreviewCoverList,
    tiles: PreviewTiles,
    compact_list: PreviewCompactList,
  };
  const Preview = PreviewMap[widgetType];

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', paddingBottom: 24 }}>

      {/* Тип виджета */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Тип виджета</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {WIDGET_TYPES.map((t) => (
            <button key={t.key} onClick={() => setWidgetType(t.key)} style={{
              flex: 1, padding: '10px 6px', border: `2px solid ${widgetType === t.key ? '#7C3AED' : '#F0F0F0'}`,
              borderRadius: 12, background: widgetType === t.key ? '#F5F3FF' : '#fff',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              transition: 'all 0.18s',
            }}>
              <Icon name={t.icon} size={22} style={{ color: widgetType === t.key ? '#7C3AED' : '#CCC' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: widgetType === t.key ? '#7C3AED' : '#999' }}>{t.label}</span>
              <span style={{ fontSize: 10, color: '#BBB', textAlign: 'center' }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 12px 0' }}>

        {/* Выбор мероприятий */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>Мероприятия</div>
            <span style={{ fontSize: 12, color: selectedIds.length >= 6 ? '#EF4444' : '#999' }}>
              {selectedIds.length} / 6
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
              return (
                <div key={e.id} onClick={() => toggleEvent(e.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  marginBottom: 6, borderRadius: 12, cursor: 'pointer',
                  background: selected ? '#F5F3FF' : '#F9F9F9',
                  border: `1.5px solid ${selected ? '#DDD6FE' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected ? '#7C3AED' : '#E5E5E5' }}>
                    {selected ? (
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{order + 1}</span>
                    ) : (
                      <Icon name="Plus" size={11} style={{ color: '#AAA' }} />
                    )}
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
          {selectedIds.length >= 6 && (
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>Максимум 6 мероприятий</div>
          )}
        </div>

        {/* Настройки текстов */}
        <div style={section}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Настройки виджета</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Название виджета</div>
            <input className="vk-input" value={widgetTitle} onChange={(e) => setWidgetTitle(e.target.value)} placeholder="Афиша" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Кнопка 1 (у каждого события)</div>
            <input className="vk-input" value={btn1Text} onChange={(e) => setBtn1Text(e.target.value)} placeholder="Подробнее" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 5 }}>Кнопка 2 (внизу виджета)</div>
            <input className="vk-input" value={btn2Text} onChange={(e) => setBtn2Text(e.target.value)} placeholder="Показать все мероприятия" />
          </div>
        </div>

        {/* Превью */}
        {selectedEvents.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>Превью</div>
            <Preview events={selectedEvents} title={widgetTitle} btn1={btn1Text} btn2={btn2Text} />
          </div>
        )}

        {/* Статус токена + кнопка публикации */}
        <div style={section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#555' }}>Токен сообщества</div>
            {tokenLoading ? (
              <div style={{ fontSize: 11, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Loader" size={12} /> Получение…</div>
            ) : groupToken ? (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ShieldCheck" size={12} /> Получен
              </div>
            ) : (
              <button onClick={requestToken} style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF9C3', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="RefreshCw" size={12} /> Получить
              </button>
            )}
          </div>

          {publishResult && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: publishResult.success ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name={publishResult.success ? 'CheckCircle' : 'AlertCircle'} size={16} style={{ color: publishResult.success ? '#059669' : '#DC2626', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: publishResult.success ? '#065F46' : '#B91C1C' }}>
                {publishResult.success ? 'Виджет успешно опубликован на стене сообщества!' : `Ошибка: ${publishResult.error}`}
              </span>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing || selectedIds.length === 0}
            style={{
              width: '100%', padding: '13px', fontSize: 15, fontWeight: 800,
              color: '#fff', border: 'none', borderRadius: 12, cursor: publishing || selectedIds.length === 0 ? 'default' : 'pointer',
              background: publishing || selectedIds.length === 0 ? '#DDD' : 'linear-gradient(135deg, #7C3AED, #9333EA)',
              boxShadow: publishing || selectedIds.length === 0 ? 'none' : '0 4px 16px rgba(124,58,237,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {publishing ? (
              <><Icon name="Loader" size={16} /> Публикация…</>
            ) : (
              <><Icon name="Layers" size={16} /> Опубликовать виджет</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageWidget;