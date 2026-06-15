import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Order } from '@/types';

interface Props {
  orders: Order[];
  onChangeState: (id: number, state: Order['state']) => void;
}

const STATE_CONFIG: Record<number, { label: string; cls: string }> = {
  0:  { label: 'Забронирован', cls: 'bg-green-100 text-green-700' },
  '-1': { label: 'Под запрос', cls: 'bg-yellow-100 text-yellow-700' },
  '-2': { label: 'Отклонён', cls: 'bg-gray-100 text-gray-500' },
  '-4': { label: 'Просрочен', cls: 'bg-gray-100 text-gray-500' },
  '-7': { label: 'Аннулирован', cls: 'bg-red-100 text-red-600' },
  '-8': { label: 'Аннулирован', cls: 'bg-red-100 text-red-600' },
};

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
function fmtDate(s: string) {
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

const PageManager = ({ orders, onChangeState }: Props) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.nom.includes(q) ||
      o.first_name.toLowerCase().includes(q) ||
      o.last_name.toLowerCase().includes(q) ||
      o.event_title.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    );
  });

  const total = orders.length;
  const totalTickets = orders.reduce((s, o) => s + o.total_count, 0);

  return (
    <div className="flex flex-col">
      {/* Stats bar */}
      <div className="flex border-b border-border">
        {[
          { n: total, l: 'заказов' },
          { n: totalTickets, l: 'билетов' },
          {
            n: orders.filter((o) => o.state === 0).length,
            l: 'активных',
          },
        ].map((s) => (
          <div key={s.l} className="flex-1 border-r border-border last:border-0 px-3 py-3 text-center">
            <div className="font-display text-xl font-700">{s.n}</div>
            <div className="text-[11px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative border-b border-border px-3 py-2">
        <Icon name="Search" size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по заказам..."
          className="w-full rounded-sm border border-input bg-secondary py-2 pl-8 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      {/* Orders */}
      <div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Icon name="ClipboardList" size={36} className="mb-2 opacity-30" />
            <p className="text-sm">Заявок нет</p>
          </div>
        ) : (
          filtered.map((order) => {
            const st = STATE_CONFIG[order.state] ?? STATE_CONFIG[0];
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="border-b border-border">
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-start gap-3 px-3 py-3 text-left"
                >
                  <div className="flex flex-col items-center gap-1 shrink-0 w-8">
                    <span className="font-display text-base font-700 leading-none">
                      {parseInt(order.nom)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(order.event_date)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-600 ${st.cls}`}>
                        {st.label}
                      </span>
                      {order.paid && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-600 text-green-700">
                          Оплачено
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-sm font-500">{order.event_title}</div>
                    <div className="text-[12px] text-muted-foreground">
                      {order.last_name} {order.first_name} · {order.total_count} билет(а) · {order.total_price.toLocaleString('ru-RU')} {order.currency}
                    </div>
                  </div>
                  <Icon
                    name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                    size={16}
                    className="shrink-0 mt-1 text-muted-foreground"
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 bg-secondary/40 px-3 py-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Сеанс</div>
                        <div>{fmtDate(order.event_date)} · {order.event_time}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Телефон</div>
                        <div>{order.phone || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">E-mail</div>
                        <div className="truncate">{order.email || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">Создан</div>
                        <div>{order.created_at}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {order.state === 0 && (
                        <button
                          onClick={() => onChangeState(order.id, -1)}
                          className="rounded border border-yellow-400 px-3 py-1.5 text-xs font-600 text-yellow-700"
                        >
                          Под запрос
                        </button>
                      )}
                      {(order.state === -1 || order.state === -2) && (
                        <button
                          onClick={() => onChangeState(order.id, 0)}
                          className="rounded border border-green-400 px-3 py-1.5 text-xs font-600 text-green-700"
                        >
                          Подтвердить
                        </button>
                      )}
                      {order.state >= -2 && (
                        <button
                          onClick={() => onChangeState(order.id, -7)}
                          className="rounded border border-destructive/40 px-3 py-1.5 text-xs font-600 text-destructive"
                        >
                          Аннулировать
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PageManager;
