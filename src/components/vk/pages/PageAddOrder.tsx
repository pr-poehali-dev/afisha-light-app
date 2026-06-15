import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { EventItem } from '@/types';

interface Props {
  event: EventItem;
  currency: string;
  onSubmit: (data: { name: string; phone: string; email: string; count: number }) => void;
  onCancel: () => void;
}

const inputCls =
  'border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors w-full';

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-600 uppercase tracking-wide text-muted-foreground">
      {label}{required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
    {children}
  </div>
);

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

const PageAddOrder = ({ event, currency, onSubmit, onCancel }: Props) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(1);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dateStr = (() => {
    if (!event.dates.length) return '';
    const [y, m, d] = event.dates[0].date.split('-');
    const dt = new Date(`${y}-${m}-${d}`);
    return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} · ${event.dates[0].start_time}`;
  })();

  const total = event.is_free ? 0 : event.price * count;

  const handleSubmit = () => {
    if (!name || !phone || !agree) return;
    setSubmitted(true);
    setTimeout(() => onSubmit({ name, phone, email, count }), 800);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Icon name="Check" size={32} className="text-green-600" />
        </div>
        <h2 className="font-display text-xl font-700">Заявка принята!</h2>
        <p className="text-sm text-muted-foreground">
          Организатор свяжется с вами по указанным контактам
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 pb-28">
      {/* Event summary */}
      <div className="flex gap-3 rounded-sm border border-border p-3">
        <img src={event.image} className="h-16 w-16 rounded-sm object-cover shrink-0" />
        <div className="min-w-0">
          <div className="font-display text-sm font-700 leading-snug line-clamp-2">{event.title}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">{dateStr}</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground truncate">{event.place}</div>
        </div>
      </div>

      {!event.is_free && (
        <div className="flex items-center justify-between rounded-sm border border-border px-3 py-3">
          <span className="text-sm font-500">Количество билетов</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Icon name="Minus" size={16} />
            </button>
            <span className="font-display text-lg font-700 min-w-[24px] text-center">{count}</span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Icon name="Plus" size={16} />
            </button>
          </div>
        </div>
      )}

      <Field label="Имя и фамилия" required>
        <input
          className={inputCls}
          placeholder="Иван Иванов"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Телефон" required>
        <input
          type="tel"
          className={inputCls}
          placeholder="+7 (999) 000-00-00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Field>

      <Field label="E-mail">
        <input
          type="email"
          className={inputCls}
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          id="chk_agree"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-accent"
        />
        <label htmlFor="chk_agree" className="cursor-pointer text-xs text-muted-foreground">
          Даю согласие на обработку персональных данных в соответствии с ФЗ-152
        </label>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">Итого:</span>
          <span className="font-display text-lg font-700">
            {event.is_free ? 'Бесплатно' : `${total.toLocaleString('ru-RU')} ${currency}`}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-border py-3 text-sm font-600 text-muted-foreground"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !phone || !agree}
            className="flex-1 bg-primary py-3 font-display text-sm font-700 uppercase text-primary-foreground disabled:opacity-40"
          >
            {event.is_free ? 'Зарегистрироваться' : 'Оформить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageAddOrder;
