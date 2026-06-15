import Icon from '@/components/ui/icon';
import type { Place } from '@/types';

interface Props {
  places: Place[];
  onAdd: () => void;
  onEdit: (p: Place) => void;
}

const PagePlaces = ({ places, onAdd, onEdit }: Props) => (
  <div className="flex flex-col">
    <div className="px-3 pt-3">
      <button
        onClick={onAdd}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-border py-2.5 text-sm font-500 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <Icon name="Plus" size={16} />
        Добавить место
      </button>
    </div>

    {places.length === 0 ? (
      <div className="flex flex-col items-center py-16 text-muted-foreground">
        <Icon name="Building2" size={36} className="mb-2 opacity-30" />
        <p className="text-sm">Места ещё не добавлены</p>
      </div>
    ) : (
      <div className="mt-3 px-3">
        {places.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-border py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-secondary">
              <Icon name="MapPin" size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-600 leading-snug">{p.name}</div>
              <div className="text-[12px] text-muted-foreground">{p.address} · {p.city}</div>
            </div>
            <button
              onClick={() => onEdit(p)}
              className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Icon name="Pencil" size={15} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PagePlaces;
