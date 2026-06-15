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

function formatDate(dateStr: string, time: string, finish?: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const str = `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
  return finish ? `${str} · ${time} — ${finish}` : `${str} · ${time}`;
}

const Row = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
    <Icon name={icon} size={16} style={{ color: '#3F51B5', flexShrink: 0, marginTop: 1 }} />
    <span style={{ fontSize: 13, color: '#1A1A1A', lineHeight: 1.4 }}>{children}</span>
  </div>
);

const PageShowEvent = ({ event, isAdmin, currency, onEdit, onBook }: Props) => (
  <div style={{ background: '#fff', minHeight: '100vh' }}>

    {/* Обложка */}
    {event.image && event.image.startsWith('http') && (
      <div style={{ position: 'relative', aspectRatio: '8/3', overflow: 'hidden', background: '#EDEEF0' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
        />
      </div>
    )}

    {/* Контент */}
    <div style={{ padding: '12px 14px' }}>

      {/* Тип */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#3F51B5', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
        {event.type}
      </div>

      {/* Название */}
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3, margin: '0 0 12px' }}>
        {event.title}
      </h1>

      {/* Мета */}
      <div style={{ marginBottom: 12 }}>
        {event.dates.map((d, i) => (
          <Row key={i} icon="Clock">
            {formatDate(d.date, d.start_time, d.finish_time)}
          </Row>
        ))}

        {!event.online && (
          <Row icon="MapPin">
            <span>
              {event.place && <span>{event.place}<br /></span>}
              <span style={{ color: '#8A8A8A' }}>{event.address}, {event.city}</span>
            </span>
          </Row>
        )}

        {event.online && <Row icon="Monitor">Онлайн (МСК)</Row>}

        {event.age && (
          <Row icon="ShieldCheck">
            <span style={{ color: '#8A8A8A' }}>Возраст: {event.age}</span>
          </Row>
        )}
      </div>

      {/* Цена и кнопка */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #DCDFE6',
          padding: '10px 12px',
          marginBottom: 14,
          background: '#F7F8FA',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            Стоимость
          </div>
          {event.is_free ? (
            <div style={{ fontSize: 18, fontWeight: 700, color: '#17A050' }}>Бесплатно</div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>
              {event.price.toLocaleString('ru-RU')} {currency}
            </div>
          )}
        </div>
        <button onClick={onBook} className="vk-btn-primary" style={{ fontSize: 13 }}>
          {event.is_free ? 'Зарегистрироваться' : 'Забронировать'}
        </button>
      </div>

      {/* Описание */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
          Описание
        </div>
        <p style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.6, margin: 0 }}>
          {event.description}
        </p>
      </div>

      {/* Кнопка редактирования */}
      {isAdmin && (
        <button
          onClick={onEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            padding: '10px',
            fontSize: 13,
            fontWeight: 500,
            color: '#3F51B5',
            background: 'none',
            border: '1px solid #DCDFE6',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          <Icon name="Pencil" size={14} />
          Редактировать событие
        </button>
      )}
    </div>
  </div>
);

export default PageShowEvent;