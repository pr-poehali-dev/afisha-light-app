import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from '@/types';

interface Props {
  orders: Order[];
  onChangeState: (id: number, state: Order['state']) => void;
}

const STATE: Record<number, { label: string; bg: string; color: string }> = {
  0:   { label: 'Забронирован', bg: '#E8F5E9', color: '#2E7D32' },
  '-1':{ label: 'Под запрос',   bg: '#FFF8E1', color: '#F57F17' },
  '-2':{ label: 'Отклонён',     bg: '#F5F5F5', color: '#757575' },
  '-4':{ label: 'Просрочен',    bg: '#F5F5F5', color: '#757575' },
  '-7':{ label: 'Аннулирован',  bg: '#FFEBEE', color: '#C62828' },
  '-8':{ label: 'Аннулирован',  bg: '#FFEBEE', color: '#C62828' },
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
    <div style={{ background: '#fff' }}>

      {/* Статистика */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DCDFE6' }}>
        {[
          { n: orders.length, l: 'заказов' },
          { n: totalTickets, l: 'билетов' },
          { n: active, l: 'активных' },
        ].map((s) => (
          <div key={s.l} style={{
            flex: 1, textAlign: 'center', padding: '10px 0',
            borderRight: '1px solid #DCDFE6',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: '#8A8A8A' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Поиск */}
      <div style={{ position: 'relative', padding: '6px 10px', borderBottom: '1px solid #DCDFE6' }}>
        <Icon name="Search" size={14} style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по заказам..."
          className="vk-input"
          style={{ paddingLeft: 32 }}
        />
      </div>

      {/* Список заказов */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#8A8A8A' }}>
          <Icon name="ClipboardList" size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13 }}>Заявок нет</p>
        </div>
      ) : filtered.map((order) => {
        const st = STATE[order.state] ?? STATE[0];
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} style={{ borderBottom: '1px solid #DCDFE6' }}>
            {/* Строка */}
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              {/* Номер */}
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 32 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>
                  {parseInt(order.nom)}
                </div>
                <div style={{ fontSize: 10, color: '#8A8A8A' }}>{fmtDate(order.event_date)}</div>
              </div>

              {/* Инфо */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  {order.paid && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', background: '#E8F5E9', color: '#2E7D32' }}>
                      Оплачено
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.event_title}
                </div>
                <div style={{ fontSize: 12, color: '#8A8A8A' }}>
                  {order.last_name} {order.first_name} · {order.total_count} бил. · {order.total_price.toLocaleString('ru-RU')} {order.currency}
                </div>
              </div>

              <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} style={{ color: '#8A8A8A', flexShrink: 0, marginTop: 2 }} />
            </button>

            {/* Детали */}
            {isOpen && (
              <div style={{ background: '#F7F8FA', borderTop: '1px solid #DCDFE6', padding: '10px 12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12 }}>
                  {[
                    ['Сеанс', `${fmtDate(order.event_date)} · ${order.event_time}`],
                    ['Телефон', order.phone || '—'],
                    ['E-mail', order.email || '—'],
                    ['Создан', order.created_at],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: 10, color: '#8A8A8A', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 13, color: '#1A1A1A', wordBreak: 'break-word' }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Действия */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {order.state === 0 && (
                    <button onClick={() => onChangeState(order.id, -1)}
                      style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', border: '1px solid #F9A825', color: '#F57F17', background: 'none', cursor: 'pointer' }}>
                      Под запрос
                    </button>
                  )}
                  {(order.state === -1 || order.state === -2) && (
                    <button onClick={() => onChangeState(order.id, 0)}
                      style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', border: '1px solid #43A047', color: '#2E7D32', background: 'none', cursor: 'pointer' }}>
                      Подтвердить
                    </button>
                  )}
                  {order.state >= -2 && (
                    <button onClick={() => onChangeState(order.id, -7)}
                      style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', border: '1px solid #E53935', color: '#C62828', background: 'none', cursor: 'pointer' }}>
                      Аннулировать
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PageManager;
