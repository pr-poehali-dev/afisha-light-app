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
  events,
  pastEvents,
  isAdmin,
  onOpenEvent,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
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
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['actual', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-500 transition-colors ${
              tab === t
                ? 'border-b-2 border-accent text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {t === 'actual' ? 'Актуальные' : 'Прошедшие'}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="overflow-x-auto border-b border-border px-2 py-2">
        <div className="flex gap-1.5 min-w-max">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1 text-xs font-500 transition-colors ${
                cat === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative px-3 py-2 border-b border-border">
        <Icon
          name="Search"
          size={15}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск события..."
          className="w-full rounded-sm border border-input bg-secondary py-2 pl-8 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Admin add button */}
      {isAdmin && tab === 'actual' && (
        <div className="px-3 pt-3">
          <button
            onClick={onAddEvent}
            className="flex w-full items-center justify-center gap-2 border border-dashed border-border py-2.5 text-sm font-500 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="Plus" size={16} />
            Добавить событие
          </button>
        </div>
      )}

      {/* List */}
      <div className="px-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Icon name="CalendarX" size={40} className="mb-3 opacity-30" />
            <p className="text-sm">
              {tab === 'actual' ? 'Событий ещё нет' : 'Прошедших событий нет'}
            </p>
            {isAdmin && tab === 'actual' && (
              <button
                onClick={onAddEvent}
                className="mt-3 bg-primary px-4 py-2 text-sm font-600 text-primary-foreground"
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
