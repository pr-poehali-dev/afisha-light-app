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
  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
    {children}{required && <span style={{ color: '#E64646', marginLeft: 2 }}>*</span>}
  </div>
);

const PagePlaces = ({ places, onAdd, onEdit }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Place | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Place) => {
    setEditing(p);
    setForm({ name: p.name, city: p.city, address: p.address });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city) return;
    setSaving(true);
    try {
      if (editing) {
        await onEdit({ ...editing, ...form });
      } else {
        await onAdd(form);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof emptyForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  if (showForm) {
    return (
      <div style={{ background: '#fff', padding: '12px 14px 80px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
          {editing ? 'Редактировать место' : 'Новое место проведения'}
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label required>Название</Label>
          <input
            className="vk-input"
            placeholder="Концертный зал, театр, клуб..."
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label required>Город</Label>
          <input
            className="vk-input"
            placeholder="Москва"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <Label>Адрес</Label>
          <input
            className="vk-input"
            placeholder="ул. Примерная, д. 1"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>

        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          display: 'flex', gap: 10, padding: 10,
          borderTop: '1px solid #DCDFE6', background: '#fff',
        }}>
          <button
            onClick={() => setShowForm(false)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
              color: '#3F51B5', background: 'none', border: '1px solid #3F51B5', cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!form.name || !form.city || saving}
            style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
              color: '#fff',
              background: (form.name && form.city && !saving) ? '#3F51B5' : '#DCDFE6',
              border: 'none', cursor: (form.name && form.city && !saving) ? 'pointer' : 'default',
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid #DCDFE6' }}>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '8px',
            fontSize: 13, fontWeight: 500, color: '#3F51B5',
            background: 'none', border: '1px dashed #DCDFE6', cursor: 'pointer',
          }}
        >
          <Icon name="Plus" size={15} />
          Добавить место проведения
        </button>
      </div>

      {places.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#8A8A8A' }}>
          <Icon name="Building2" size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Места ещё не добавлены</p>
        </div>
      ) : (
        places.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderBottom: '1px solid #DCDFE6',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#EEF0FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="MapPin" size={18} style={{ color: '#3F51B5' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: '#8A8A8A' }}>{p.address}{p.address && p.city ? ' · ' : ''}{p.city}</div>
            </div>
            <button
              onClick={() => openEdit(p)}
              style={{ padding: 6, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Icon name="Pencil" size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default PagePlaces;
