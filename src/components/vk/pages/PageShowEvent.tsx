import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { EventItem } from '@/types';
import { vkShare, vkAllowNotifications } from '@/lib/vk';

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
  background: '#fff',
  border: '1px solid #F0F0F0',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

const PageShowEvent = ({ event, isAdmin, currency, onEdit }: Props) => {
  const imgSrc = event.image && event.image.startsWith('http') ? event.image : FALLBACK;
  const [notifDone, setNotifDone] = useState(false);

  const handleShare = () => {
    vkShare(`${event.title} — ${event.dates[0]?.date ? new Date(event.dates[0].date + 'T00:00:00').toLocaleDateString('ru-RU') : ''}`);
  };

  const handleNotify = async () => {
    const res = await vkAllowNotifications();
    if (res) setNotifDone(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '12px 12px 40px', background: '#F5F5F7' }}>

      {/* Шапка */}
      <div style={{ ...glass, padding: '16px', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <img src={imgSrc} alt={event.title}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 8 }}>{event.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {event.dates.slice(0, 2).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#333' }}>
                  <Icon name="Clock" size={13} style={{ color: '#7C3AED', flexShrink: 0 }} />
                  {formatDateFull(d.date, d.start_time)}
                </div>
              ))}
              {event.dates.length > 2 && <div style={{ fontSize: 12, color: '#999' }}>+ ещё {event.dates.length - 2} дат</div>}
              {!event.online && event.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#7C3AED' }}>
                  <Icon name="MapPin" size={13} style={{ color: '#7C3AED', flexShrink: 0, marginTop: 1 }} />
                  <span>{event.address}{event.city ? ` / ${event.city}` : ''}</span>
                </div>
              )}
              {event.place && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
                  <Icon name="Building2" size={13} style={{ color: '#7C3AED', flexShrink: 0 }} />
                  {event.place}
                </div>
              )}
              {event.online && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
                  <Icon name="Monitor" size={13} style={{ color: '#7C3AED', flexShrink: 0 }} />
                  Онлайн (МСК)
                </div>
              )}
              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#AAA' }}>
                  <Icon name="Globe" size={12} style={{ color: '#CCC', flexShrink: 0 }} />
                  {event.private === 1 ? 'Скрыто (только для админа)' : 'Показывается всем'}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {event.is_free && <span className="badge-free">Бесплатно</span>}
              {event.online && <span className="badge-online">Онлайн</span>}
              {event.age && <span className="badge-age">{event.age}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {event.link1_url && (
                <a href={event.link1_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#fff', background: '#7C3AED', textDecoration: 'none', borderRadius: 10, boxShadow: '0 4px 12px rgba(124,58,237,0.3)', display: 'inline-block' }}>
                  {event.link1_label || 'Билеты'}
                </a>
              )}
              {event.link2_url && (
                <a href={event.link2_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', border: '1.5px solid #DDD6FE', textDecoration: 'none', borderRadius: 10, display: 'inline-block' }}>
                  {event.link2_label || 'Подробнее'}
                </a>
              )}
              {isAdmin && (
                <button onClick={onEdit}
                  style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#555', background: '#F5F5F7', border: '1.5px solid #E5E5E5', borderRadius: 10, cursor: 'pointer' }}>
                  Редактировать
                </button>
              )}
              <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, color: '#7C3AED', background: '#EDE9FE', border: '1.5px solid #DDD6FE', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                <Icon name="Share2" size={13} /> Поделиться
              </button>

              <button onClick={handleNotify} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 13, fontWeight: 600, color: notifDone ? '#059669' : '#555', background: notifDone ? '#D1FAE5' : '#F5F5F7', border: `1.5px solid ${notifDone ? '#A7F3D0' : '#E5E5E5'}`, borderRadius: 10, cursor: 'pointer' }}>
                <Icon name={notifDone ? 'BellRing' : 'Bell'} size={13} />
                {notifDone ? 'Уведомления включены' : 'Уведомить меня'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Описание */}
      {event.description && (
        <div style={{ ...glass, padding: '16px', marginBottom: 10 }}>
          <p style={{ fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0 }}>{event.description}</p>
        </div>
      )}

      {/* Расписание */}
      <div style={{ ...glass, padding: '16px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 12 }}>Расписание</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {event.dates.map((d, i) => {
            const dt = parseDate(d.date);
            const day = dt.getDate();
            const month = MONTHS_FULL[dt.getMonth()];
            const weekday = WEEKDAYS[dt.getDay()];
            const now = new Date();
            const diffDays = Math.ceil((dt.getTime() - now.getTime()) / 86400000);
            const diffText = diffDays > 0
              ? diffDays < 30 ? `через ${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'}`
              : diffDays < 365 ? `через ${Math.round(diffDays / 30)} мес.`
              : `через ${Math.round(diffDays / 365)} г.`
              : 'прошло';
            return (
              <div key={i} style={{ background: '#F5F5F7', border: '1px solid #EBEBEB', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, marginTop: 1 }}>{month.slice(0,3).toUpperCase()}</div>
                </div>
                <div style={{ width: 1, height: 36, background: '#E5E5E5', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#999', marginBottom: 1 }}>{weekday}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{d.start_time}{d.finish_time ? ` — ${d.finish_time}` : ''}</div>
                  <div style={{ fontSize: 11, color: '#BBB', marginTop: 1 }}>{diffText}</div>
                </div>
              </div>
            );
          })}
        </div>
        {!event.is_free && event.price > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #EBEBEB', fontSize: 13, color: '#999' }}>
            Стоимость: <span style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>{event.price.toLocaleString('ru-RU')} {currency}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageShowEvent;