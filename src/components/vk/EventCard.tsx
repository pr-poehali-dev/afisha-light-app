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

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23EDE9FE"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="%237C3AED">🎭</text></svg>';

const EventCard = ({ event, isAdmin, onClick, onEdit, onDelete }: Props) => {
  const dateStr = formatDate(event);
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '16px', marginBottom: 12,
      background: '#fff', border: '1px solid #F0F0F0',
      borderRadius: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>

      {/* Фото — увеличено в 4 раза: было 72px → 288px, скруглённый квадрат */}
      <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
          style={{
            width: 120, height: 120,
            objectFit: 'cover',
            borderRadius: 18,
            display: 'block',
            boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
          }}
        />
      </button>

      {/* Текст */}
      <button
        onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {/* Название — крупное */}
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', lineHeight: 1.25, marginBottom: 8 }} className="line-clamp-2">
          {event.title}
        </div>

        {/* Дата */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, color: '#7C3AED', fontWeight: 600, marginBottom: 4 }}>
          <Icon name="Clock" size={15} style={{ color: '#7C3AED', flexShrink: 0 }} />
          {dateStr}
        </div>

        {/* Место */}
        {!event.online && event.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#999', marginBottom: 4 }}>
            <Icon name="MapPin" size={14} style={{ color: '#CCC', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.place ? `${event.place} · ` : ''}{event.city}
            </span>
          </div>
        )}

        {event.online && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#999', marginBottom: 4 }}>
            <Icon name="Monitor" size={14} style={{ color: '#CCC', flexShrink: 0 }} />
            <span>Онлайн (МСК)</span>
          </div>
        )}

        {/* Бейджи и цена */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          {event.is_free ? (
            <span style={{ fontSize: 14, fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '3px 10px', borderRadius: 8 }}>Бесплатно</span>
          ) : (event.price_from ?? 0) > 0 ? (
            <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>
              {(event.price_to ?? 0) > 0 && event.price_to !== event.price_from
                ? `${event.price_from!.toLocaleString('ru-RU')} — ${event.price_to!.toLocaleString('ru-RU')} ₽`
                : `от ${event.price_from!.toLocaleString('ru-RU')} ₽`}
            </span>
          ) : null}
          {event.online && (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', background: '#EDE9FE', padding: '3px 10px', borderRadius: 8 }}>Онлайн</span>
          )}
          {event.age && (
            <span style={{ fontSize: 13, fontWeight: 600, color: '#999', background: '#F3F4F6', padding: '3px 8px', borderRadius: 8 }}>{event.age}</span>
          )}
        </div>
      </button>

      {/* Меню админа */}
      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ padding: 8, color: '#CCC', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="Pencil" size={18} />
          </button>
          <button onClick={onDelete} style={{ padding: 8, color: '#FCA5A5', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="Trash2" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;