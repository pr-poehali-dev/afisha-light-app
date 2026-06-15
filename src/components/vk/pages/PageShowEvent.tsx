import Icon from '@/components/ui/icon';
import type { EventItem } from '@/types';

interface Props {
  event: EventItem;
  isAdmin: boolean;
  currency: string;
  onEdit: () => void;
  onBook: () => void;
}

const MONTHS_FULL = [
  'января','февраля','марта','апреля','мая','июня',
  'июля','августа','сентября','октября','ноября','декабря'
];
const WEEKDAYS = ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'];
const WEEKDAYS_SHORT = ['вс','пн','вт','ср','чт','пт','сб'];

function parseDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00');
}

function formatDateFull(dateStr: string, time: string) {
  const d = parseDate(dateStr);
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]}, ${WEEKDAYS_SHORT[d.getDay()]}, ${time}`;
}

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%236366f1" fill-opacity="0.3"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="%23a5b4fc">🎭</text></svg>';

const glass: React.CSSProperties = {
  background: '#2d2a6e',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
};

const PageShowEvent = ({ event, isAdmin, currency, onEdit }: Props) => {
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;

  return (
    <div style={{ minHeight: '100vh', padding: '16px 14px 40px', background: '#1e1b4b' }}>

      {/* Шапка: фото + название + мета */}
      <div style={{ ...glass, padding: '20px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Фото */}
          <div style={{ flexShrink: 0 }}>
            <img
              src={imgSrc}
              alt={event.title}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
              style={{
                width: 88, height: 88,
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            />
          </div>

          {/* Название + мета */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>
              {event.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
              {event.dates.slice(0, 2).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  <Icon name="Clock" size={13} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                  {formatDateFull(d.date, d.start_time)}
                </div>
              ))}
              {event.dates.length > 2 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  + ещё {event.dates.length - 2} дат
                </div>
              )}

              {!event.online && event.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: '#a5b4fc' }}>
                  <Icon name="MapPin" size={13} style={{ color: '#a5b4fc', flexShrink: 0, marginTop: 1 }} />
                  <span>{event.address}{event.city ? ` / ${event.city}` : ''}</span>
                </div>
              )}

              {event.place && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <Icon name="Building2" size={13} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                  {event.place}
                </div>
              )}

              {event.online && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <Icon name="Monitor" size={13} style={{ color: '#a5b4fc', flexShrink: 0 }} />
                  Онлайн (МСК)
                </div>
              )}

              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <Icon name="Globe" size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  {event.private === 1 ? 'Скрыто (только для админа)' : 'Показывается всем'}
                </div>
              )}
            </div>

            {/* Бейджи */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {event.is_free && <span className="badge-free">Бесплатно</span>}
              {event.online && <span className="badge-online">Онлайн</span>}
              {event.age && <span className="badge-age">{event.age}</span>}
            </div>

            {/* Кнопки */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {event.link1_url && (
                <a
                  href={event.link1_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '9px 18px', fontSize: 13, fontWeight: 700,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    textDecoration: 'none', borderRadius: 10,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.45)',
                    display: 'inline-block',
                  }}
                >
                  {event.link1_label || 'Билеты'}
                </a>
              )}

              {event.link2_url && (
                <a
                  href={event.link2_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    color: '#fff',
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    textDecoration: 'none', borderRadius: 10,
                    backdropFilter: 'blur(8px)',
                    display: 'inline-block',
                  }}
                >
                  {event.link2_label || 'Подробнее'}
                </a>
              )}

              {isAdmin && (
                <button
                  onClick={onEdit}
                  style={{
                    padding: '9px 18px', fontSize: 13, fontWeight: 600,
                    color: '#fff',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 10, cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Редактировать
                </button>
              )}

              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', fontSize: 13, fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  borderRadius: 10, cursor: 'pointer',
                }}
              >
                <Icon name="Share2" size={13} />
                Поделиться
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Описание */}
      {event.description && (
        <div style={{ ...glass, padding: '16px 18px', marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, margin: 0 }}>
            {event.description}
          </p>
        </div>
      )}

      {/* Расписание */}
      <div style={{ ...glass, padding: '18px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 14, letterSpacing: 0.2 }}>
          Расписание
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {event.dates.map((d, i) => {
            const dt = parseDate(d.date);
            const day = dt.getDate();
            const month = MONTHS_FULL[dt.getMonth()];
            const weekday = WEEKDAYS[dt.getDay()];
            const now = new Date();
            const diffMs = dt.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const diffText = diffDays > 0
              ? diffDays < 30
                ? `через ${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'}`
                : diffDays < 365
                  ? `через ${Math.round(diffDays / 30)} мес.`
                  : `через ${Math.round(diffDays / 365)} г.`
              : 'прошло';

            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {/* Число */}
                <div style={{ textAlign: 'center', minWidth: 48, flexShrink: 0 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600, marginTop: 2 }}>{month.slice(0, 3).toUpperCase()}</div>
                </div>

                <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{weekday}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{d.start_time}{d.finish_time ? ` — ${d.finish_time}` : ''}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{diffText}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Стоимость */}
        {!event.is_free && event.price > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            Стоимость:&nbsp;
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
              {event.price.toLocaleString('ru-RU')} {currency}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageShowEvent;