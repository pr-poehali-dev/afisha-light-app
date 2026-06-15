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

type Tab = 'actual' | 'past';

const CATEGORIES = ['Все', 'Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Фестиваль', 'Спорт'];

const PageMain = ({
  events, pastEvents, isAdmin,
  onOpenEvent, onAddEvent, onEditEvent, onDeleteEvent,
}: Props) => {
  const [tab, setTab] = useState<Tab>('actual');
  const [cat, setCat] = useState('Все');
  const [query, setQuery] = useState('');

  const source = tab === 'actual' ? events : pastEvents;
  const filtered = source.filter((e) => {
    if (cat !== 'Все' && e.type !== cat) return false;
    if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Табы */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {(['actual', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: 700,
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)',
              background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              border: 'none',
              borderRadius: tab === t ? 10 : 0,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: tab === t ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {t === 'actual' ? 'Актуальные' : 'Прошедшие'}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {isAdmin && (
          <button
            onClick={onAddEvent}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            <Icon name="Plus" size={15} />
            Добавить
          </button>
        )}
      </div>

      {/* Категории */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        padding: '10px 12px',
        gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="vk-tag"
            style={cat === c ? {
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              borderColor: 'transparent',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
              whiteSpace: 'nowrap',
            } : { whiteSpace: 'nowrap' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ position: 'relative', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Icon
          name="Search"
          size={16}
          style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск события..."
          className="vk-input"
          style={{ paddingLeft: 38, fontSize: 14 }}
        />
      </div>

      {/* Список */}
      <div style={{ padding: '12px 12px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 0', color: 'rgba(255,255,255,0.4)',
          }}>
            <Icon name="CalendarX" size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0, fontWeight: 500 }}>
              {tab === 'actual' ? 'Событий ещё нет' : 'Прошедших событий нет'}
            </p>
            {isAdmin && tab === 'actual' && (
              <button onClick={onAddEvent} className="vk-btn-primary" style={{ marginTop: 16 }}>
                Добавить первое событие
              </button>
            )}
          </div>
        ) : (
          filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              isAdmin={isAdmin}
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
