import { useState } from 'react';
import type { EventItem, EventCategory } from '@/types';

interface Props {
  initial?: Partial<EventItem>;
  onSave: (data: Partial<EventItem>) => void;
  onCancel: () => void;
}

const CATEGORIES: EventCategory[] = ['Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Спорт'];
const AGES = ['0+', '6+', '12+', '14+', '16+', '18+'];

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
    {children}{required && <span style={{ color: '#E64646', marginLeft: 2 }}>*</span>}
  </div>
);

const inpStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #DCDFE6',
  background: '#F0F1F3',
  padding: '8px 10px',
  fontSize: 14,
  color: '#1A1A1A',
  outline: 'none',
};

const PageAddEvent = ({ initial = {}, onSave, onCancel }: Props) => {
  const [form, setForm] = useState({
    title: initial.title ?? '',
    type: (initial.type ?? 'Концерт') as EventCategory,
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

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const valid = !!form.title && !!form.date && !!form.start_time;

  const handleSave = () => {
    if (!valid) return;
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

  const block: React.CSSProperties = { marginBottom: 14 };

  return (
    <div style={{ background: '#fff', padding: '12px 14px 80px' }}>

      <div style={block}>
        <Label required>Название</Label>
        <input className="vk-input" placeholder="Название мероприятия" value={form.title}
          onChange={(e) => set('title', e.target.value)} />
      </div>

      <div style={block}>
        <Label required>Тип события</Label>
        <select className="vk-input" value={form.type} onChange={(e) => set('type', e.target.value as EventCategory)} style={inpStyle}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <Label required>Дата</Label>
          <input type="date" className="vk-input" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <Label required>Начало</Label>
          <input type="time" className="vk-input" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
        </div>
      </div>

      <div style={block}>
        <Label>Время окончания</Label>
        <input type="time" className="vk-input" value={form.finish_time} onChange={(e) => set('finish_time', e.target.value)} />
      </div>

      <div
        onClick={() => set('online', !form.online)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid #DCDFE6', padding: '10px 12px',
          marginBottom: 14, cursor: 'pointer',
          background: form.online ? '#EEF0FB' : '#fff',
        }}
      >
        <div
          style={{
            width: 18, height: 18, border: `2px solid ${form.online ? '#3F51B5' : '#DCDFE6'}`,
            background: form.online ? '#3F51B5' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {form.online && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{ fontSize: 14 }}>Онлайн событие</span>
      </div>

      {!form.online && (
        <>
          <div style={block}>
            <Label required>Город</Label>
            <input className="vk-input" placeholder="Москва" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div style={block}>
            <Label>Адрес</Label>
            <input className="vk-input" placeholder="ул. Примерная, д. 1" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div style={block}>
            <Label>Место проведения</Label>
            <input className="vk-input" placeholder="Название площадки" value={form.place} onChange={(e) => set('place', e.target.value)} />
          </div>
        </>
      )}

      <div style={block}>
        <Label>Возрастная маркировка</Label>
        <select className="vk-input" value={form.age} onChange={(e) => set('age', e.target.value)}>
          {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={block}>
        <Label required>Описание</Label>
        <textarea
          className="vk-input"
          placeholder="Описание события..."
          value={form.description}
          rows={4}
          style={{ resize: 'none' }}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div style={{ border: '1px solid #DCDFE6', padding: 12, marginBottom: 14 }}>
        <div
          onClick={() => set('is_free', !form.is_free)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: form.is_free ? 0 : 10 }}
        >
          <div
            style={{
              width: 18, height: 18, border: `2px solid ${form.is_free ? '#3F51B5' : '#DCDFE6'}`,
              background: form.is_free ? '#3F51B5' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {form.is_free && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 14 }}>Бесплатное событие</span>
        </div>
        {!form.is_free && (
          <div style={{ marginTop: 10 }}>
            <Label>Стоимость (₽)</Label>
            <input
              type="number"
              className="vk-input"
              placeholder="1000"
              value={form.price || ''}
              onChange={(e) => set('price', Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* Нижняя панель */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', gap: 10, padding: 10,
        borderTop: '1px solid #DCDFE6', background: '#fff',
      }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
            color: '#3F51B5', background: 'none', border: '1px solid #3F51B5', cursor: 'pointer',
          }}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!valid}
          style={{
            flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
            color: '#fff', background: valid ? '#3F51B5' : '#DCDFE6',
            border: 'none', cursor: valid ? 'pointer' : 'default',
          }}
        >
          {initial.id ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </div>
  );
};

export default PageAddEvent;
