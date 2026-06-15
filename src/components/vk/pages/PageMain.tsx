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

const CATEGORIES = ['Все', 'Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс'];

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
    <div style={{ background: '#fff' }}>

      {/* Табы + кнопка добавить в один ряд */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderBottom: '1px solid #DCDFE6',
        padding: '0 8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {(['actual', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flexShrink: 0,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: tab === t ? '#3F51B5' : '#8A8A8A',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid #3F51B5' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t === 'actual' ? 'Актуальные' : 'Прошедшие'}
          </button>
        ))}

        {isAdmin && (
          <button
            onClick={onAddEvent}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: '#2196F3',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: 4,
            }}
          >
            <Icon name="Plus" size={13} />
            Добавить
          </button>
        )}
      </div>

      {/* Категории */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          borderBottom: '1px solid #DCDFE6',
          padding: '6px 8px',
          gap: 6,
          background: '#fff',
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="vk-tag"
            style={cat === c
              ? { background: '#3F51B5', color: '#fff', whiteSpace: 'nowrap' }
              : { whiteSpace: 'nowrap' }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ position: 'relative', padding: '6px 10px', borderBottom: '1px solid #DCDFE6', background: '#fff' }}>
        <Icon
          name="Search"
          size={14}
          style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск события..."
          className="vk-input"
          style={{ paddingLeft: 32 }}
        />
      </div>

      {/* Список */}
      <div style={{ padding: '0 10px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#8A8A8A' }}>
            <Icon name="CalendarX" size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontSize: 13, margin: 0 }}>
              {tab === 'actual' ? 'Событий ещё нет' : 'Прошедших событий нет'}
            </p>
            {isAdmin && tab === 'actual' && (
              <button
                onClick={onAddEvent}
                className="vk-btn-primary"
                style={{ marginTop: 12 }}
              >
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