import Icon from '@/components/ui/icon';
import type { Place } from '@/types';

interface Props {
  places: Place[];
  onAdd: () => void;
  onEdit: (p: Place) => void;
}

const PagePlaces = ({ places, onAdd, onEdit }: Props) => (
  <div style={{ background: '#fff', minHeight: '100vh' }}>

    <div style={{ padding: '10px 10px 6px', borderBottom: '1px solid #DCDFE6' }}>
      <button
        onClick={onAdd}
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
            <div style={{ fontSize: 12, color: '#8A8A8A' }}>{p.address} · {p.city}</div>
          </div>
          <button
            onClick={() => onEdit(p)}
            style={{ padding: 6, color: '#8A8A8A', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="Pencil" size={15} />
          </button>
        </div>
      ))
    )}
  </div>
);

export default PagePlaces;
