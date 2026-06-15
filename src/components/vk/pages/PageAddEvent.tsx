import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { EventItem, EventCategory } from '@/types';

interface Props {
  initial?: Partial<EventItem>;
  onSave: (data: Partial<EventItem>) => void;
  onCancel: () => void;
}

const CATEGORIES: EventCategory[] = ['Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Спорт'];
const AGES = ['0+', '6+', '12+', '14+', '16+', '18+'];

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-600 uppercase tracking-wide text-muted-foreground">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors w-full';

const PageAddEvent = ({ initial = {}, onSave, onCancel }: Props) => {
  const [form, setForm] = useState({
    title: initial.title ?? '',
    type: initial.type ?? 'Концерт' as EventCategory,
    description: initial.description ?? '',
    city: initial.city ?? '',
    address: initial.address ?? '',
    place: initial.place ?? '',
    date: initial.dates?.[0]?.date ?? '',
    start_time: initial.dates?.[0]?.start_time ?? '',
    finish_time: initial.dates?.[0]?.finish_time ?? '',
    age: initial.age ?? '0+',
    is_free: initial.is_free ?? false,
    price: initial.price ?? 0,
    online: initial.online ?? false,
  });

  const setF = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.date || !form.start_time) return;
    onSave({
      ...initial,
      title: form.title,
      type: form.type,
      description: form.description,
      city: form.city,
      address: form.address,
      place: form.place,
      age: form.age,
      is_free: form.is_free,
      price: form.is_free ? 0 : form.price,
      online: form.online,
      dates: [{ date: form.date, start_time: form.start_time, finish_time: form.finish_time || undefined }],
    });
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-24">
      <Field label="Название" required>
        <input
          className={inputCls}
          placeholder="Название мероприятия"
          value={form.title}
          onChange={(e) => setF('title', e.target.value)}
        />
      </Field>

      <Field label="Тип события" required>
        <select
          className={inputCls}
          value={form.type}
          onChange={(e) => setF('type', e.target.value as EventCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Дата" required>
          <input
            type="date"
            className={inputCls}
            value={form.date}
            onChange={(e) => setF('date', e.target.value)}
          />
        </Field>
        <Field label="Начало" required>
          <input
            type="time"
            className={inputCls}
            value={form.start_time}
            onChange={(e) => setF('start_time', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Окончание">
        <input
          type="time"
          className={inputCls}
          value={form.finish_time}
          onChange={(e) => setF('finish_time', e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5">
        <input
          type="checkbox"
          id="chk_online"
          checked={form.online}
          onChange={(e) => setF('online', e.target.checked)}
          className="accent-accent"
        />
        <label htmlFor="chk_online" className="text-sm cursor-pointer">Онлайн событие</label>
      </div>

      {!form.online && (
        <>
          <Field label="Город" required>
            <input
              className={inputCls}
              placeholder="Москва"
              value={form.city}
              onChange={(e) => setF('city', e.target.value)}
            />
          </Field>
          <Field label="Адрес">
            <input
              className={inputCls}
              placeholder="ул. Примерная, д. 1"
              value={form.address}
              onChange={(e) => setF('address', e.target.value)}
            />
          </Field>
          <Field label="Место">
            <input
              className={inputCls}
              placeholder="Название площадки"
              value={form.place}
              onChange={(e) => setF('place', e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="Возрастная маркировка">
        <select
          className={inputCls}
          value={form.age}
          onChange={(e) => setF('age', e.target.value)}
        >
          {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>

      <Field label="Описание" required>
        <textarea
          className={`${inputCls} min-h-[100px] resize-none`}
          placeholder="Описание события..."
          value={form.description}
          onChange={(e) => setF('description', e.target.value)}
        />
      </Field>

      <div className="flex flex-col gap-3 rounded-sm border border-border p-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="chk_free"
            checked={form.is_free}
            onChange={(e) => setF('is_free', e.target.checked)}
            className="accent-accent"
          />
          <label htmlFor="chk_free" className="text-sm cursor-pointer">Бесплатное событие</label>
        </div>
        {!form.is_free && (
          <Field label="Стоимость (₽)">
            <input
              type="number"
              className={inputCls}
              placeholder="1000"
              value={form.price || ''}
              onChange={(e) => setF('price', Number(e.target.value))}
            />
          </Field>
        )}
      </div>

      {/* Footer actions */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-border bg-card p-3">
        <button
          onClick={onCancel}
          className="flex-1 border border-border py-3 text-sm font-600 text-muted-foreground"
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!form.title || !form.date || !form.start_time}
          className="flex-1 bg-primary py-3 text-sm font-700 font-display uppercase text-primary-foreground disabled:opacity-40"
        >
          {initial.id ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </div>
  );
};

export default PageAddEvent;
