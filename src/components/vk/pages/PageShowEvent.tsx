import Icon from '@/components/ui/icon';
import type { EventItem } from '@/types';

interface Props {
  event: EventItem;
  isAdmin: boolean;
  currency: string;
  onEdit: () => void;
  onBook: () => void;
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatDate(dateStr: string, time: string, finish?: string) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  let s = `${day} ${month} ${year} · ${time}`;
  if (finish) s += ` – ${finish}`;
  return s;
}

const PRIVACY_LABELS: Record<number, { icon: string; text: string }> = {
  0: { icon: 'Globe', text: 'Только в своей афише' },
  1: { icon: 'Link', text: 'Только по прямой ссылке' },
  2: { icon: 'Globe2', text: 'Во всех афишах' },
  3: { icon: 'Lock', text: 'Скрыто (только для админов)' },
};

const PageShowEvent = ({ event, isAdmin, currency, onEdit, onBook }: Props) => {
  const privacy = PRIVACY_LABELS[event.private] ?? PRIVACY_LABELS[0];

  return (
    <div className="flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-3 top-3 bg-accent px-2 py-1 text-[11px] font-700 uppercase tracking-wide text-accent-foreground">
          {event.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h1 className="font-display text-2xl font-700 leading-tight">{event.title}</h1>

        {/* Meta */}
        <div className="mt-4 space-y-2.5">
          {event.dates.map((d, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm">
              <Icon name="Calendar" size={16} className="mt-0.5 shrink-0 text-accent" />
              <span>{formatDate(d.date, d.start_time, d.finish_time)}</span>
            </div>
          ))}

          {!event.online && (
            <div className="flex items-start gap-2.5 text-sm">
              <Icon name="MapPin" size={16} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <div>{event.place}</div>
                <div className="text-muted-foreground">{event.address}, {event.city}</div>
              </div>
            </div>
          )}

          {event.online && (
            <div className="flex items-center gap-2.5 text-sm">
              <Icon name="Monitor" size={16} className="shrink-0 text-accent" />
              Онлайн (MSK)
            </div>
          )}

          {event.age && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Icon name="ShieldCheck" size={16} className="shrink-0" />
              Возраст: {event.age}
            </div>
          )}

          {isAdmin && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Icon name={privacy.icon} size={16} className="shrink-0" />
              {privacy.text}
            </div>
          )}
        </div>

        {/* Price + action */}
        <div className="mt-5 flex items-center justify-between rounded-sm border border-border p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Стоимость</div>
            {event.is_free ? (
              <div className="font-display text-xl font-700 text-green-600">Бесплатно</div>
            ) : (
              <div className="font-display text-xl font-700">
                {event.price.toLocaleString('ru-RU')} {currency}
              </div>
            )}
          </div>
          <button
            onClick={onBook}
            className="bg-primary px-5 py-3 font-display text-sm font-700 uppercase text-primary-foreground transition-opacity hover:opacity-90"
          >
            {event.is_free ? 'Зарегистрироваться' : 'Забронировать'}
          </button>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h2 className="font-display text-sm font-700 uppercase tracking-wide text-muted-foreground mb-2">
            Описание
          </h2>
          <p className="text-sm leading-relaxed text-foreground">{event.description}</p>
        </div>

        {/* Admin edit */}
        {isAdmin && (
          <button
            onClick={onEdit}
            className="mt-6 flex w-full items-center justify-center gap-2 border border-border py-2.5 text-sm font-500 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="Pencil" size={15} />
            Редактировать событие
          </button>
        )}
      </div>
    </div>
  );
};

export default PageShowEvent;
