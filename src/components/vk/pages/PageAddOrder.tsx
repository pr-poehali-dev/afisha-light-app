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
  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
    {children}{required && <span style={{ color: '#E64646', marginLeft: 2 }}>*</span>}
  </div>
);

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
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 24px', textAlign: 'center', background: '#fff', minHeight: '60vh',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32,
          background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon name="Check" size={32} style={{ color: '#2E7D32' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Заявка принята!</div>
        <p style={{ fontSize: 14, color: '#8A8A8A', margin: 0 }}>
          Организатор свяжется с вами по указанным контактам
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 90 }}>

      {/* Карточка события */}
      <div style={{
        display: 'flex', gap: 10, padding: '10px 14px',
        borderBottom: '1px solid #DCDFE6', background: '#F7F8FA',
      }}>
        <img src={event.image} style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0, borderRadius: '50%' }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }} className="line-clamp-2">
            {event.title}
          </div>
          <div style={{ fontSize: 12, color: '#3F51B5', marginTop: 2 }}>{dateStr}</div>
          <div style={{ fontSize: 12, color: '#8A8A8A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.place}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>

        {/* Количество билетов */}
        {!event.is_free && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid #DCDFE6', padding: '10px 12px', marginBottom: 14,
          }}>
            <span style={{ fontSize: 14 }}>Количество билетов</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                style={{
                  width: 32, height: 32, border: '1px solid #DCDFE6',
                  background: 'none', cursor: 'pointer', fontSize: 18, color: '#3F51B5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{count}</span>
              <button
                onClick={() => setCount((c) => c + 1)}
                style={{
                  width: 32, height: 32, border: '1px solid #DCDFE6',
                  background: 'none', cursor: 'pointer', fontSize: 18, color: '#3F51B5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <Label required>Имя и фамилия</Label>
          <input className="vk-input" placeholder="Иван Иванов" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label required>Телефон</Label>
          <input type="tel" className="vk-input" placeholder="+7 (999) 000-00-00" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label>E-mail</Label>
          <input type="email" className="vk-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Согласие на ПД */}
        <div
          style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 4, cursor: 'pointer' }}
          onClick={() => setAgree(!agree)}
        >
          <div style={{
            width: 18, height: 18, flexShrink: 0, marginTop: 1,
            border: `2px solid ${agree ? '#3F51B5' : '#DCDFE6'}`,
            background: agree ? '#3F51B5' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {agree && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: '#8A8A8A', lineHeight: 1.4 }}>
            Даю согласие на обработку персональных данных в соответствии с ФЗ-152
          </span>
        </div>
      </div>

      {/* Нижняя панель */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        borderTop: '1px solid #DCDFE6', background: '#fff', padding: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 2px' }}>
          <span style={{ fontSize: 13, color: '#8A8A8A' }}>Итого:</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>
            {event.is_free ? 'Бесплатно' : `${total.toLocaleString('ru-RU')} ${currency}`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600,
              color: '#3F51B5', background: 'none', border: '1px solid #3F51B5', cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!valid}
            style={{
              flex: 2, padding: '11px 0', fontSize: 14, fontWeight: 600,
              color: '#fff', background: valid ? '#3F51B5' : '#DCDFE6',
              border: 'none', cursor: valid ? 'pointer' : 'default',
            }}
          >
            {event.is_free ? 'Зарегистрироваться' : 'Оформить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageAddOrder;
