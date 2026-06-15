import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { EventItem } from '@/types';

interface Props {
  event: EventItem;
  currency: string;
  onSubmit: (data: { name: string; phone: string; email: string; count: number }) => void;
  onCancel: () => void;
}

const MONTHS_S = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
  </div>
);

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '14px', marginBottom: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const PageAddOrder = ({ event, currency, onSubmit, onCancel }: Props) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateStr = (() => {
    if (!event.dates.length) return '';
    const d = new Date(event.dates[0].date + 'T00:00:00');
    return `${d.getDate()} ${MONTHS_S[d.getMonth()]} · ${event.dates[0].start_time}`;
  })();

  const total = event.is_free ? 0 : event.price * count;
  const valid = !!name && !!phone && agree;

  const handleSubmit = () => {
    if (!valid) return;
    setSubmitted(true);
    setTimeout(() => onSubmit({ name, phone, email, count }), 1000);
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', background: '#F5F5F7', minHeight: '70vh' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 24px rgba(16,185,129,0.2)' }}>
          <Icon name="Check" size={34} style={{ color: '#059669' }} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Заявка принята!</div>
        <p style={{ fontSize: 14, color: '#999', margin: 0, lineHeight: 1.5 }}>Организатор свяжется с вами по указанным контактам</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', padding: '12px 12px 90px' }}>

      {/* Карточка события */}
      <div style={{ ...section, display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={event.image} style={{ width: 52, height: 52, objectFit: 'cover', flexShrink: 0, borderRadius: '50%', boxShadow: '0 4px 10px rgba(124,58,237,0.2)' }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.3 }} className="line-clamp-2">{event.title}</div>
          <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 2, fontWeight: 500 }}>{dateStr}</div>
          {event.place && <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.place}</div>}
        </div>
      </div>

      {/* Количество билетов */}
      {!event.is_free && (
        <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Количество билетов</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setCount((c) => Math.max(1, c - 1))} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontSize: 20, color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 800, minWidth: 24, textAlign: 'center', color: '#111' }}>{count}</span>
            <button onClick={() => setCount((c) => c + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid #DDD6FE', background: '#F5F3FF', cursor: 'pointer', fontSize: 20, color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
          </div>
        </div>
      )}

      {/* Форма */}
      <div style={section}>
        <div style={{ marginBottom: 12 }}>
          <Label required>Имя и фамилия</Label>
          <input className="vk-input" placeholder="Иван Иванов" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Label required>Телефон</Label>
          <input type="tel" className="vk-input" placeholder="+7 (999) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <Label>E-mail</Label>
          <input type="email" className="vk-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Согласие */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }} onClick={() => setAgree(!agree)}>
          <div style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, borderRadius: 6, border: `2px solid ${agree ? '#7C3AED' : '#DDD'}`, background: agree ? '#7C3AED' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
            {agree && <Icon name="Check" size={12} style={{ color: '#fff' }} />}
          </div>
          <span style={{ fontSize: 12, color: '#999', lineHeight: 1.5 }}>Даю согласие на обработку персональных данных в соответствии с ФЗ-152</span>
        </div>
      </div>

      {/* Нижняя панель */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #EBEBEB', background: '#fff', padding: '10px 12px', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#999' }}>Итого:</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
            {event.is_free ? <span style={{ color: '#059669' }}>Бесплатно</span> : `${total.toLocaleString('ru-RU')} ${currency}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            Отмена
          </button>
          <button onClick={handleSubmit} disabled={!valid} style={{ flex: 2, padding: '11px 0', fontSize: 14, fontWeight: 700, color: '#fff', background: valid ? '#7C3AED' : '#DDD', border: 'none', borderRadius: 12, cursor: valid ? 'pointer' : 'default', boxShadow: valid ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}>
            {event.is_free ? 'Зарегистрироваться' : 'Оформить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageAddOrder;
