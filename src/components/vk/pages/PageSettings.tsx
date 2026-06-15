import { useState } from 'react';
import type { AppConfig } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  config: AppConfig;
  onSave: (c: AppConfig) => void;
}

const inputCls =
  'border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors w-full';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-4">
    <div className="border-l-2 border-accent pl-3 font-display text-sm font-700 uppercase tracking-wide text-muted-foreground">
      {title}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-600 uppercase tracking-wide text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Toggle = ({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-3">
    <div className="flex-1">
      <div className="text-sm font-500">{label}</div>
      {desc && <div className="text-[11px] text-muted-foreground">{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-secondary border border-border'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  </div>
);

const PageSettings = ({ config, onSave }: Props) => {
  const [form, setForm] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  const setF = <K extends keyof AppConfig>(k: K, v: AppConfig[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <Section title="Основное">
        <Field label="Заголовок афиши">
          <input
            className={inputCls}
            value={form.widget_name}
            onChange={(e) => setF('widget_name', e.target.value)}
            placeholder="Афиша"
            maxLength={100}
          />
        </Field>
        <Field label="Название организатора">
          <input
            className={inputCls}
            value={form.org_name}
            onChange={(e) => setF('org_name', e.target.value)}
            placeholder="ИП Иванов И.И."
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => setF('email', e.target.value)}
            placeholder="info@example.com"
          />
        </Field>
        <Field label="Валюта">
          <input
            className={inputCls}
            value={form.currency}
            onChange={(e) => setF('currency', e.target.value)}
            placeholder="₽"
            maxLength={5}
          />
        </Field>
      </Section>

      <Section title="Настройки отображения">
        <Toggle
          label="Скрыть прошедшие события"
          desc="Посетители не увидят раздел «Прошедшие»"
          checked={form.hide_past}
          onChange={(v) => setF('hide_past', v)}
        />
        <Toggle
          label="Разрешить предлагать события"
          desc="Пользователи могут отправить свои события на модерацию"
          checked={form.allow_propose}
          onChange={(v) => setF('allow_propose', v)}
        />
      </Section>

      <Section title="Бронирование">
        <Toggle
          label="Включить бронирование и регистрацию"
          desc="Показывать кнопки записи на события"
          checked={form.booking_enabled}
          onChange={(v) => setF('booking_enabled', v)}
        />
      </Section>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-3">
        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 bg-primary py-3 font-display text-sm font-700 uppercase text-primary-foreground transition-opacity hover:opacity-90"
        >
          {saved ? (
            <>
              <Icon name="Check" size={16} />
              Сохранено
            </>
          ) : (
            'Сохранить настройки'
          )}
        </button>
      </div>
    </div>
  );
};

export default PageSettings;
