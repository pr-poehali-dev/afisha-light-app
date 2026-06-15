import { useState } from 'react';
import type { AppConfig } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  config: AppConfig;
  onSave: (c: AppConfig) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 0 8px' }}>
    {children}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid #F0F0F0', cursor: 'pointer' }} onClick={() => onChange(!checked)}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{desc}</div>}
    </div>
    <div style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#7C3AED' : '#E5E5E5', position: 'relative', transition: 'background 0.2s', flexShrink: 0, boxShadow: checked ? '0 2px 8px rgba(124,58,237,0.3)' : 'none' }}>
      <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </div>
  </div>
);

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '14px 16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const PageSettings = ({ config, onSave }: Props) => {
  const [form, setForm] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof AppConfig>(k: K, v: AppConfig[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', padding: '12px 12px 80px' }}>

      <div style={section}>
        <SectionTitle>Основное</SectionTitle>
        <div style={{ marginBottom: 12 }}>
          <Label>Заголовок афиши</Label>
          <input className="vk-input" value={form.widget_name} maxLength={100} onChange={(e) => set('widget_name', e.target.value)} placeholder="Афиша" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Label>Название организатора</Label>
          <input className="vk-input" value={form.org_name} onChange={(e) => set('org_name', e.target.value)} placeholder="ИП Иванов И.И." />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Label>E-mail</Label>
          <input type="email" className="vk-input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@example.com" />
        </div>
        <div>
          <Label>Валюта</Label>
          <input className="vk-input" value={form.currency} maxLength={5} onChange={(e) => set('currency', e.target.value)} placeholder="₽" />
        </div>
      </div>

      <div style={section}>
        <SectionTitle>Отображение</SectionTitle>
        <Toggle label="Скрыть прошедшие события" desc="Посетители не увидят раздел «Прошедшие»" checked={form.hide_past} onChange={(v) => set('hide_past', v)} />
        <div style={{ paddingTop: 4 }}>
          <Toggle label="Разрешить предлагать события" desc="Пользователи могут отправить события на модерацию" checked={form.allow_propose} onChange={(v) => set('allow_propose', v)} />
        </div>
      </div>

      <div style={section}>
        <SectionTitle>Бронирование</SectionTitle>
        <Toggle label="Включить бронирование и регистрацию" checked={form.booking_enabled} onChange={(v) => set('booking_enabled', v)} />
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 10, borderTop: '1px solid #EBEBEB', background: '#fff', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 700, color: '#fff', background: '#7C3AED', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
          {saved ? <><Icon name="Check" size={16} /> Сохранено!</> : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
};

export default PageSettings;
