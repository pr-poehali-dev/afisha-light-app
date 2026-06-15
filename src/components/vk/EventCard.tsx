import type { EventItem } from '@/types';
import Icon from '@/components/ui/icon';

interface Props {
  event: EventItem;
  isAdmin: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDate(e: EventItem) {
  if (!e.dates.length) return '';
  const d = new Date(e.dates[0].date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const time = e.dates[0].start_time;
  if (e.dates.length > 1) return `${day} ${month} · +${e.dates.length - 1} дат · ${time}`;
  return `${day} ${month} · ${time}`;
}

const EventCard = ({ event, isAdmin, onClick, onEdit, onDelete }: Props) => {
  const dateStr = formatDate(event);
  const [year, month, day] = event.dates[0]?.date.split('-') ?? [];
  const dayN = parseInt(day ?? '0');
  const monthS = MONTHS[parseInt(month ?? '1') - 1] ?? '';

  return (
    <div className="relative flex gap-3 border-b border-border py-3 pr-2 active:bg-secondary/50">
      {/* Image */}
      <button onClick={onClick} className="shrink-0">
        <div className="relative h-[72px] w-[72px] overflow-hidden rounded-sm">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center bg-primary/90 py-1">
            <span className="font-display text-sm font-700 leading-none text-primary-foreground">
              {dayN}
            </span>
            <span className="text-[9px] uppercase text-primary-foreground/70">{monthS}</span>
          </div>
        </div>
      </button>

      {/* Info */}
      <button onClick={onClick} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="mb-0.5 text-[10px] font-600 uppercase tracking-wide text-accent">
          {event.type}
        </span>
        <span className="font-display text-[15px] font-600 leading-snug line-clamp-2">
          {event.title}
        </span>
        <div className="mt-1 flex flex-col gap-0.5">
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Icon name="Clock" size={11} />
            {dateStr}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Icon name="MapPin" size={11} />
            <span className="truncate">{event.place || event.address}</span>
          </span>
        </div>
        <div className="mt-1.5">
          {event.is_free ? (
            <span className="text-[12px] font-600 text-green-600">Бесплатно</span>
          ) : (
            <span className="text-[12px] font-600">от {event.price.toLocaleString('ru-RU')} ₽</span>
          )}
          {event.age && (
            <span className="ml-2 text-[11px] text-muted-foreground">{event.age}</span>
          )}
        </div>
      </button>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Icon name="Pencil" size={14} />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
