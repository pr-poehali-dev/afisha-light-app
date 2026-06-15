import { useState } from 'react';
import Icon from '@/components/ui/icon';
import EventCard from '../EventCard';
import type { EventItem, Page } from '@/types';

interface Props {
  events: EventItem[];
  pastEvents: EventItem[];
  isAdmin: boolean;
  onOpenEvent: (e: EventItem) => void;
  onAddEvent: () => void;
  onEditEvent: (e: EventItem) => void;
  onDeleteEvent: (id: number) => void;
  onNavigate: (p: Page) => void;
}

type Tab = 'actual' | 'scheduled' | 'past';

const CATEGORIES = ['Все', 'Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Фестиваль', 'Спорт'];

const PageMain = ({ events, pastEvents, isAdmin, onOpenEvent, onAddEvent, onEditEvent, onDeleteEvent }: Props) => {
  const [tab, setTab] = useState<Tab>('actual');
  const [cat, setCat] = useState('Все');
  const [query, setQuery] = useState('');

  const now = new Date();

  // Отложенные — из events (is_past=false), у которых publish_at в будущем
  const scheduledEvents = events.filter((e) =>
    e.publish_at && new Date(e.publish_at) > now
  );

  // Актуальные — опубликованные (publish_at нет или уже прошло)
  const actualEvents = events.filter((e) =>
    !e.publish_at || new Date(e.publish_at) <= now
  );

  const sourceMap: Record<Tab, EventItem[]> = {
    actual: actualEvents,
    scheduled: scheduledEvents,
    past: pastEvents,
  };

  const source = sourceMap[tab];
  const filtered = source.filter((e) => {
    if (cat !== 'Все' && e.type !== cat) return false;
    if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'actual', label: 'Актуальные' },
    ...(isAdmin ? [{ key: 'scheduled' as Tab, label: 'Отложенные', count: scheduledEvents.length }] : []),
    { key: 'past', label: 'Прошедшие' },
  ];

  const emptyText: Record<Tab, string> = {
    actual: 'Событий ещё нет',
    scheduled: 'Нет отложенных мероприятий',
    past: 'Прошедших событий нет',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>

      {/* Табы + кнопка */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid #EBEBEB',
        background: '#fff',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flexShrink: 0, padding: '8px 14px', fontSize: 14, fontWeight: 700,
            color: tab === t.key ? (t.key === 'scheduled' ? '#D97706' : '#7C3AED') : '#999',
            background: tab === t.key ? (t.key === 'scheduled' ? '#FEF9C3' : '#EDE9FE') : 'transparent',
            border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.key === 'scheduled' && <Icon name="Clock4" size={13} />}
            {t.label}
            {t.count != null && t.count > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 800, minWidth: 18, height: 18,
                borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tab === t.key ? '#D97706' : '#F59E0B', color: '#fff', padding: '0 4px',
              }}>{t.count}</span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {isAdmin && (
          <button onClick={onAddEvent} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', fontSize: 13, fontWeight: 700,
            color: '#fff', background: '#7C3AED',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)', whiteSpace: 'nowrap',
          }}>
            <Icon name="Plus" size={15} />
            Добавить
          </button>
        )}
      </div>

      {/* Категории */}
      <div style={{
        display: 'flex', overflowX: 'auto', scrollbarWidth: 'none',
        padding: '10px 12px', gap: 8,
        borderBottom: '1px solid #EBEBEB', background: '#fff',
      }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="vk-tag"
            style={cat === c ? { background: '#7C3AED', color: '#fff', borderColor: '#7C3AED', boxShadow: '0 4px 12px rgba(124,58,237,0.25)', whiteSpace: 'nowrap' } : { whiteSpace: 'nowrap' }}
          >{c}</button>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ position: 'relative', padding: '10px 12px', borderBottom: '1px solid #EBEBEB', background: '#fff' }}>
        <Icon name="Search" size={16} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск события..." className="vk-input" style={{ paddingLeft: 38 }} />
      </div>

      {/* Баннер для вкладки отложенных */}
      {tab === 'scheduled' && (
        <div style={{ margin: '12px 12px 0', padding: '10px 14px', background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="Clock4" size={16} style={{ color: '#D97706', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#92400E', fontWeight: 500 }}>
            Эти мероприятия появятся на главной в указанное время. Посетители их пока не видят.
          </span>
        </div>
      )}

      {/* Список */}
      <div style={{ padding: '12px 12px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
            <Icon name={tab === 'scheduled' ? 'Clock4' : 'CalendarX'} size={40} style={{ color: '#DDD', marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: '#999' }}>
              {emptyText[tab]}
            </p>
            {isAdmin && tab === 'actual' && (
              <button onClick={onAddEvent} className="vk-btn-primary" style={{ marginTop: 16 }}>
                Добавить первое событие
              </button>
            )}
          </div>
        ) : (
          filtered.map((e) => (
            <EventCard key={e.id} event={e} isAdmin={isAdmin}
              onClick={() => onOpenEvent(e)}
              onEdit={() => onEditEvent(e)}
              onDelete={() => onDeleteEvent(e.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PageMain;
