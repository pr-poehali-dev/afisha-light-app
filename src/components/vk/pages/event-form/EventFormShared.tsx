import React from 'react';
import type { EventCategory } from '@/types';

export const UPLOAD_URL = 'https://functions.poehali.dev/dec20997-ea70-4e62-9edf-60f5cf25a981';

export const CATEGORIES: EventCategory[] = [
  'Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Спорт',
  'Фестиваль', 'Кино', 'Детское', 'Экскурсия', 'Конференция', 'Форум',
  'Тренинг', 'Вебинар', 'Ярмарка', 'Выпускной', 'Корпоратив',
  'Благотворительность', 'Религиозное', 'Флешмоб', 'Встреча', 'Другое',
];

export const AGES = ['0+', '3+', '6+', '10+', '12+', '14+', '16+', '18+'];

export const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export const MONTHS_FULL = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const section: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #F0F0F0',
  borderRadius: 16,
  padding: '14px',
  marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

export const block: React.CSSProperties = { marginBottom: 14 };

export const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
  </div>
);

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
    <div style={{
      width: 38, height: 22, borderRadius: 11, position: 'relative',
      background: checked ? '#7C3AED' : '#DDD', transition: 'all 0.2s', flexShrink: 0,
      boxShadow: checked ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 19 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </div>
    <span style={{ fontSize: 14, color: '#222', fontWeight: 500 }}>{label}</span>
  </div>
);

export const Divider = () => <div style={{ borderTop: '1px solid #EBEBEB', margin: '16px 0' }} />;

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function pad(n: number) { return String(n).padStart(2, '0'); }
