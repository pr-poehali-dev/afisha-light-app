import { useState } from 'react';
import type { AppConfig } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  config: AppConfig;
  onSave: (c: AppConfig) => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase',
    letterSpacing: 0.5, padding: '10px 14px 6px', borderBottom: '1px solid #DCDFE6',
    background: '#F7F8FA',
  }}>
    {children}
  </div>
);

const Toggle = ({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '12px 14px', borderBottom: '1px solid #DCDFE6',
      background: '#fff', cursor: 'pointer',
    }}
    onClick={() => onChange(!checked)}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: '#1A1A1A' }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#8A8A8A', marginTop: 2 }}>{desc}</div>}
    </div>
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? '#3F51B5' : '#DCDFE6',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2,
        left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: 10,
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  </div>
);

const PageSettings = ({ config, onSave }: Props) => {
  const [form, setForm] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof AppConfig>(k: K, v: AppConfig[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fieldStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderBottom: '1px solid #DCDFE6',
    background: '#fff',
  };

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100%', paddingBottom: 72 }}>

      <SectionTitle>Основное</SectionTitle>

      <div style={fieldStyle}>
        <Label>Заголовок афиши</Label>
        <input className="vk-input" value={form.widget_name} maxLength={100}
          onChange={(e) => set('widget_name', e.target.value)} placeholder="Афиша" />
      </div>

      <div style={fieldStyle}>
        <Label>Название организатора</Label>
        <input className="vk-input" value={form.org_name}
          onChange={(e) => set('org_name', e.target.value)} placeholder="ИП Иванов И.И." />
      </div>

      <div style={fieldStyle}>
        <Label>E-mail</Label>
        <input type="email" className="vk-input" value={form.email}
          onChange={(e) => set('email', e.target.value)} placeholder="info@example.com" />
      </div>

      <div style={fieldStyle}>
        <Label>Валюта</Label>
        <input className="vk-input" value={form.currency} maxLength={5}
          onChange={(e) => set('currency', e.target.value)} placeholder="₽" />
      </div>

      <SectionTitle>Настройки отображения</SectionTitle>

      <Toggle
        label="Скрыть прошедшие события"
        desc="Посетители не увидят раздел «Прошедшие»"
        checked={form.hide_past}
        onChange={(v) => set('hide_past', v)}
      />
      <Toggle
        label="Разрешить предлагать события"
        desc="Пользователи могут отправить события на модерацию"
        checked={form.allow_propose}
        onChange={(v) => set('allow_propose', v)}
      />

      <SectionTitle>Бронирование</SectionTitle>

      <Toggle
        label="Включить бронирование и регистрацию"
        checked={form.booking_enabled}
        onChange={(v) => set('booking_enabled', v)}
      />

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: 10, borderTop: '1px solid #DCDFE6', background: '#fff',
      }}>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 0',
            fontSize: 14, fontWeight: 600, color: '#fff',
            background: '#3F51B5', border: 'none', cursor: 'pointer',
          }}
        >
          {saved ? <><Icon name="Check" size={16} /> Сохранено</> : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
};

export default PageSettings;