import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from '@/types';

interface Props {
  orders: Order[];
  onChangeState: (id: number, state: Order['state']) => void;
}

const STATE: Record<number, { label: string; bg: string; color: string }> = {
  0:   { label: 'Забронирован', bg: '#EDE9FE', color: '#6D28D9' },
  '-1':{ label: 'Под запрос',   bg: '#FEF9C3', color: '#A16207' },
  '-2':{ label: 'Отклонён',     bg: '#F3F4F6', color: '#6B7280' },
  '-4':{ label: 'Просрочен',    bg: '#F3F4F6', color: '#6B7280' },
  '-7':{ label: 'Аннулирован',  bg: '#FEE2E2', color: '#B91C1C' },
  '-8':{ label: 'Аннулирован',  bg: '#FEE2E2', color: '#B91C1C' },
};

const MONTHS_S = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_S[d.getMonth()]}`;
};

const PageManager = ({ orders, onChangeState }: Props) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.nom.includes(q) || o.first_name.toLowerCase().includes(q)
      || o.last_name.toLowerCase().includes(q) || o.event_title.toLowerCase().includes(q);
  });

  const active = orders.filter((o) => o.state === 0).length;
  const totalTickets = orders.reduce((s, o) => s + o.total_count, 0);

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>

      {/* Статистика */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 12px 0' }}>
        {[
          { n: orders.length, l: 'заказов', icon: 'ClipboardList' },
          { n: totalTickets, l: 'билетов', icon: 'Ticket' },
          { n: active, l: 'активных', icon: 'CheckCircle' },
        ].map((s) => (
          <div key={s.l} style={{
            flex: 1, textAlign: 'center', padding: '12px 8px',
            background: '#fff', borderRadius: 14,
            border: '1px solid #F0F0F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ position: 'relative', padding: '10px 12px' }}>
        <Icon name="Search" size={15} style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по заказам..." className="vk-input" style={{ paddingLeft: 36 }} />
      </div>

      {/* Список */}
      <div style={{ padding: '0 12px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#CCC' }}>
            <Icon name="ClipboardList" size={40} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p style={{ fontSize: 13, margin: 0, color: '#999' }}>Заявок нет</p>
          </div>
        ) : filtered.map((order) => {
          const st = STATE[order.state] ?? STATE[0];
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 10, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', padding: '12px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 36, background: '#F5F3FF', borderRadius: 10, padding: '6px 4px' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED' }}>{parseInt(order.nom)}</div>
                  <div style={{ fontSize: 10, color: '#A78BFA' }}>{fmtDate(order.event_date)}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: st.bg, color: st.color, borderRadius: 6 }}>{st.label}</span>
                    {order.paid && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: '#D1FAE5', color: '#065F46', borderRadius: 6 }}>Оплачено</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.event_title}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{order.last_name} {order.first_name} · {order.total_count} бил. · {order.total_price.toLocaleString('ru-RU')} {order.currency}</div>
                </div>
                <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} style={{ color: '#CCC', flexShrink: 0, marginTop: 2 }} />
              </button>

              {isOpen && (
                <div style={{ background: '#F9F8FF', borderTop: '1px solid #F0F0F0', padding: '12px 14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12 }}>
                    {[
                      ['Сеанс', `${fmtDate(order.event_date)} · ${order.event_time}`],
                      ['Телефон', order.phone || '—'],
                      ['E-mail', order.email || '—'],
                      ['Создан', order.created_at],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, color: '#AAA', textTransform: 'uppercase', fontWeight: 600, marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 13, color: '#333', wordBreak: 'break-word' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {order.state === 0 && (
                      <button onClick={() => onChangeState(order.id, -1)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', border: '1.5px solid #F59E0B', color: '#D97706', background: '#FEF9C3', borderRadius: 8, cursor: 'pointer' }}>Под запрос</button>
                    )}
                    {(order.state === -1 || order.state === -2) && (
                      <button onClick={() => onChangeState(order.id, 0)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', border: '1.5px solid #10B981', color: '#059669', background: '#D1FAE5', borderRadius: 8, cursor: 'pointer' }}>Подтвердить</button>
                    )}
                    {order.state >= -2 && (
                      <button onClick={() => onChangeState(order.id, -7)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', border: '1.5px solid #EF4444', color: '#DC2626', background: '#FEE2E2', borderRadius: 8, cursor: 'pointer' }}>Аннулировать</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PageManager;
