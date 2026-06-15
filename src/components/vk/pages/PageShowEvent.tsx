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

const MONTHS_SHORT = [
  'янв','фев','мар','апр','май','июн',
  'июл','авг','сен','окт','ноя','дек'
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

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23EDEEF0"/><text x="50%25" y="54%25" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="%23C0C0C0">🎭</text></svg>';

const PageShowEvent = ({ event, isAdmin, currency, onEdit, onBook }: Props) => {
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Шапка: круглое фото + название + мета — как в оригинале */}
      <div style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>

        {/* Круглое фото */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={imgSrc}
            alt={event.title}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
            style={{
              width: 80, height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Название + мета */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, marginBottom: 8 }}>
            {event.title}
          </div>

          {/* Строки мета */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            {event.dates.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A1A1A' }}>
                <Icon name="Clock" size={14} style={{ color: '#3F51B5', flexShrink: 0 }} />
                {formatDateFull(d.date, d.start_time)}
              </div>
            ))}

            {!event.online && event.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#3F51B5' }}>
                <Icon name="MapPin" size={14} style={{ color: '#3F51B5', flexShrink: 0, marginTop: 1 }} />
                <span>{event.address}{event.city ? ` / ${event.city}` : ''}</span>
              </div>
            )}

            {event.place && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1A1A1A' }}>
                <Icon name="Building2" size={14} style={{ color: '#3F51B5', flexShrink: 0 }} />
                {event.place}
              </div>
            )}

            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8A8A8A' }}>
                <Icon name="Globe" size={14} style={{ color: '#3F51B5', flexShrink: 0 }} />
                {event.private === 2 ? 'Глобальное, отображается во всех афишах' : 'Только в своей афише'}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={onBook}
              style={{
                padding: '7px 14px', fontSize: 13, fontWeight: 600,
                color: '#fff', background: '#3F51B5', border: 'none', cursor: 'pointer',
              }}
            >
              {event.is_free ? 'Подать заявку' : 'Купить билет'}
            </button>

            {isAdmin && (
              <button
                onClick={onEdit}
                style={{
                  padding: '7px 14px', fontSize: 13, fontWeight: 600,
                  color: '#3F51B5', background: '#fff', border: '1px solid #DCDFE6', cursor: 'pointer',
                }}
              >
                Редактировать
              </button>
            )}

            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', fontSize: 13, fontWeight: 500,
                color: '#555', background: '#fff', border: '1px solid #DCDFE6', cursor: 'pointer',
              }}
            >
              <Icon name="Share2" size={13} />
              Поделиться
            </button>
          </div>
        </div>
      </div>

      {/* Описание — синей ссылкой как в оригинале */}
      {event.description && (
        <div style={{ padding: '0 14px 14px', borderBottom: '1px solid #DCDFE6' }}>
          <p style={{ fontSize: 14, color: '#3F51B5', lineHeight: 1.6, margin: 0 }}>
            {event.description}
          </p>
        </div>
      )}

      {/* Блок расписания */}
      <div style={{ padding: '14px 14px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 12 }}>
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
                  border: '1px solid #DCDFE6',
                  padding: '14px 16px',
                  display: 'inline-block',
                  minWidth: 140,
                  maxWidth: 200,
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>
                  {day}
                </div>
                <div style={{ fontSize: 14, color: '#1A1A1A', marginTop: 2 }}>{month}</div>
                <div style={{ fontSize: 14, color: '#1A1A1A' }}>{weekday}</div>
                <div style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>{d.start_time}</div>
                <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2 }}>{diffText}</div>

                {/* Иконка видимости как в оригинале */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, color: '#8A8A8A' }}>
                  <Icon name="Eye" size={16} />
                  <Icon name="ChevronDown" size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Стоимость */}
        {!event.is_free && (
          <div style={{ marginTop: 16, fontSize: 14, color: '#8A8A8A' }}>
            Стоимость:&nbsp;
            <span style={{ fontWeight: 700, color: '#1A1A1A' }}>
              {event.price.toLocaleString('ru-RU')} {currency}
            </span>
          </div>
        )}
        {event.is_free && (
          <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: '#17A050' }}>
            Бесплатно
          </div>
        )}
      </div>
    </div>
  );
};

export default PageShowEvent;
