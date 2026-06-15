import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { Place } from '@/types';

interface Props {
  places: Place[];
  onAdd: (p: Omit<Place, 'id'>) => Promise<void>;
  onEdit: (p: Place) => Promise<void>;
}

const emptyForm = { name: '', city: '', address: '' };

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
  </div>
);

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '14px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const PagePlaces = ({ places, onAdd, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Place) => { setEditing(p); setForm({ name: p.name, city: p.city, address: p.address }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.city) return;
    setSaving(true);
    try {
      if (editing) await onEdit({ ...editing, ...form });
      else await onAdd(form);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const set = (k: keyof typeof emptyForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (showForm) {
    return (
      <div style={{ background: '#F5F5F7', minHeight: '100vh', padding: '12px 12px 80px' }}>
        <div style={section}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 16 }}>
            {editing ? 'Редактировать место' : 'Новое место проведения'}
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label required>Название</Label>
            <input className="vk-input" placeholder="Концертный зал, театр, клуб..." value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label required>Город</Label>
            <input className="vk-input" placeholder="Москва" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <Label>Адрес</Label>
            <input className="vk-input" placeholder="ул. Примерная, д. 1" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', gap: 10, padding: 10, borderTop: '1px solid #EBEBEB', background: '#fff', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
          <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
            Отмена
          </button>
          <button onClick={handleSave} disabled={!form.name || !form.city || saving}
            style={{ flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 700, color: '#fff', background: (form.name && form.city && !saving) ? '#7C3AED' : '#DDD', border: 'none', borderRadius: 12, cursor: (form.name && form.city && !saving) ? 'pointer' : 'default', boxShadow: (form.name && form.city && !saving) ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh', padding: '12px 12px 24px' }}>
      <button onClick={openAdd} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '12px', marginBottom: 12,
        fontSize: 14, fontWeight: 700, color: '#7C3AED',
        background: '#fff', border: '2px dashed #DDD6FE', borderRadius: 14, cursor: 'pointer',
      }}>
        <Icon name="Plus" size={16} />
        Добавить место проведения
      </button>

      {places.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
          <Icon name="Building2" size={40} style={{ color: '#DDD', marginBottom: 10 }} />
          <p style={{ fontSize: 13, margin: 0, color: '#999' }}>Места ещё не добавлены</p>
        </div>
      ) : (
        places.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', borderRadius: 14, border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="MapPin" size={18} style={{ color: '#7C3AED' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 1 }}>{p.address}{p.address && p.city ? ' · ' : ''}{p.city}</div>
            </div>
            <button onClick={() => openEdit(p)} style={{ padding: 8, color: '#CCC', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Icon name="Pencil" size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default PagePlaces;
