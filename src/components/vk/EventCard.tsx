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
  const extra = e.dates.length > 1 ? ` · +${e.dates.length - 1}` : '';
  return `${day} ${month} · ${time}${finish}${extra}`;
}

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%236366f1" fill-opacity="0.3"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%23a5b4fc">🎭</text></svg>';

const EventCard = ({ event, isAdmin, onClick, onEdit, onDelete }: Props) => {
  const dateStr = formatDate(event);
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;

  return (
    <div className="event-list-row" style={{ paddingLeft: 14, paddingRight: isAdmin ? 10 : 14 }}>

      <button onClick={onClick} className="shrink-0" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          className="event-list-logo"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
        />
      </button>

      <button
        onClick={onClick}
        className="flex flex-1 min-w-0 flex-col items-start text-left"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <div className="event-list-name line-clamp-2">{event.title}</div>

        <div className="event-list-date flex items-center gap-1">
          <Icon name="Clock" size={12} style={{ color: '#a5b4fc', flexShrink: 0 }} />
          {dateStr}
        </div>

        {!event.online && event.city && (
          <div className="event-list-location flex items-center gap-1">
            <Icon name="MapPin" size={12} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <span className="truncate">
              {event.place ? `${event.place} · ` : ''}{event.city}
            </span>
          </div>
        )}

        {event.online && (
          <div className="event-list-location flex items-center gap-1">
            <Icon name="Monitor" size={12} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <span>Онлайн (МСК)</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {event.is_free ? (
            <span className="badge-free">Бесплатно</span>
          ) : event.price > 0 ? (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              от {event.price.toLocaleString('ru-RU')} ₽
            </span>
          ) : null}
          {event.online && <span className="badge-online">Онлайн</span>}
          {event.age && <span className="badge-age">{event.age}</span>}
        </div>
      </button>

      {isAdmin && (
        <div className="flex flex-col shrink-0 gap-1 items-center justify-center">
          <button
            onClick={onEdit}
            style={{ padding: 6, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="Pencil" size={15} />
          </button>
          <button
            onClick={onDelete}
            style={{ padding: 6, color: 'rgba(255,100,100,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="Trash2" size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
