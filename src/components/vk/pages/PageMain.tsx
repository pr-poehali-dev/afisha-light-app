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

const PageMain = ({ events, pastEvents, isAdmin, onOpenEvent, onAddEvent, onEditEvent, onDeleteEvent }: Props) => {
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
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>

      {/* Табы + кнопка */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid #EBEBEB',
        background: '#fff',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {(['actual', 'past'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flexShrink: 0, padding: '8px 16px', fontSize: 14, fontWeight: 700,
            color: tab === t ? '#7C3AED' : '#999',
            background: tab === t ? '#EDE9FE' : 'transparent',
            border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'all 0.18s',
          }}>
            {t === 'actual' ? 'Актуальные' : 'Прошедшие'}
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

      {/* Список */}
      <div style={{ padding: '12px 12px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: '#CCC' }}>
            <Icon name="CalendarX" size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: '#999' }}>
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
