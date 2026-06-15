import type { EventItem } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  event: EventItem;
  isAdmin: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDate(e: EventItem) {
  if (!e.dates.length) return '';
  const d = new Date(e.dates[0].date + 'T00:00:00');
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const time = e.dates[0].start_time;
  const finish = e.dates[0].finish_time ? ` — ${e.dates[0].finish_time}` : '';
  const extra = e.dates.length > 1 ? ` · +${e.dates.length - 1} дат` : '';
  return `${day} ${month} · ${time}${finish}${extra}`;
}

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23EDEEF0"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%23C0C0C0">🎭</text></svg>';

const EventCard = ({ event, isAdmin, onClick, onEdit, onDelete }: Props) => {
  const dateStr = formatDate(event);
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;

  return (
    <div
      className="event-list-row"
      style={{ paddingLeft: 0, paddingRight: isAdmin ? 4 : 0 }}
    >
      <button onClick={onClick} className="shrink-0" style={{ paddingTop: 2 }}>
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          className="event-list-logo"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
        />
      </button>

      {/* Информация */}
      <button
        onClick={onClick}
        className="flex flex-1 min-w-0 flex-col items-start text-left"
        style={{ paddingRight: 4 }}
      >
        <div className="event-list-name line-clamp-2">{event.title}</div>

        <div className="event-list-date flex items-center gap-1">
          {dateStr}
        </div>

        {!event.online && (
          <div className="event-list-location flex items-center gap-1">
            <Icon name="MapPin" size={13} style={{ color: '#8A8A8A', flexShrink: 0 }} />
            <span className="truncate">
              {event.place ? `${event.place} · ` : ''}
              {event.city}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          {event.is_free ? (
            <span style={{ fontSize: 15, fontWeight: 700, color: '#17A050' }}>
              Бесплатно
            </span>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
              от {event.price.toLocaleString('ru-RU')} ₽
            </span>
          )}
          {event.age && (
            <span style={{ fontSize: 12, color: '#8A8A8A' }}>{event.age}</span>
          )}
        </div>
      </button>

      {/* Меню админа */}
      {isAdmin && (
        <div className="flex flex-col shrink-0 gap-1 items-center justify-center">
          <button
            onClick={onEdit}
            className="flex items-center justify-center"
            style={{ padding: 6, color: '#8A8A8A' }}
          >
            <Icon name="Pencil" size={15} />
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center"
            style={{ padding: 6, color: '#8A8A8A' }}
          >
            <Icon name="Trash2" size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;