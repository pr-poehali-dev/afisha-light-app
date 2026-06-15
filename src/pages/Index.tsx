import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';

interface EventItem {
  id: number;
  title: string;
  category: string;
  city: string;
  date: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  venue: string;
  price: number;
  image: string;
  age: string;
}

const EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Симфонический вечер: Чайковский',
    category: 'Концерты',
    city: 'Москва',
    date: '2026-06-20',
    day: '20',
    month: 'июн',
    weekday: 'СБ',
    time: '19:00',
    venue: 'Концертный зал им. Чайковского',
    price: 2500,
    age: '6+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/b71cd0ae-2f54-4ac2-abd9-eb4c36570fcd.jpg',
  },
  {
    id: 2,
    title: 'Спектакль «Вишнёвый сад»',
    category: 'Театр',
    city: 'Санкт-Петербург',
    date: '2026-06-22',
    day: '22',
    month: 'июн',
    weekday: 'ПН',
    time: '18:30',
    venue: 'Драматический театр',
    price: 1800,
    age: '12+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/454cd0d9-5c1d-47f3-9afd-6cddb023467e.jpg',
  },
  {
    id: 3,
    title: 'Выставка современного искусства',
    category: 'Выставки',
    city: 'Москва',
    date: '2026-06-25',
    day: '25',
    month: 'июн',
    weekday: 'ЧТ',
    time: '11:00',
    venue: 'Галерея «Артплей»',
    price: 0,
    age: '0+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/456293d6-a925-4567-8a00-de6b5e925233.jpg',
  },
  {
    id: 4,
    title: 'Джазовый квартет: вечерний сет',
    category: 'Концерты',
    city: 'Казань',
    date: '2026-07-02',
    day: '02',
    month: 'июл',
    weekday: 'ЧТ',
    time: '20:00',
    venue: 'Клуб «Сцена»',
    price: 1200,
    age: '18+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/b71cd0ae-2f54-4ac2-abd9-eb4c36570fcd.jpg',
  },
  {
    id: 5,
    title: 'Моноспектакль «Записки»',
    category: 'Театр',
    city: 'Москва',
    date: '2026-07-05',
    day: '05',
    month: 'июл',
    weekday: 'ВС',
    time: '19:30',
    venue: 'Малая сцена',
    price: 950,
    age: '16+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/454cd0d9-5c1d-47f3-9afd-6cddb023467e.jpg',
  },
  {
    id: 6,
    title: 'Лекция: история авангарда',
    category: 'Выставки',
    city: 'Санкт-Петербург',
    date: '2026-07-08',
    day: '08',
    month: 'июл',
    weekday: 'СР',
    time: '17:00',
    venue: 'Центр искусств',
    price: 600,
    age: '12+',
    image:
      'https://cdn.poehali.dev/projects/f4e93125-1477-4e01-91c4-6b099dbf6ab3/files/456293d6-a925-4567-8a00-de6b5e925233.jpg',
  },
];

const CATEGORIES = ['Все', 'Концерты', 'Театр', 'Выставки'];
const CITIES = ['Все города', 'Москва', 'Санкт-Петербург', 'Казань'];
const PRICES = [
  { label: 'Любая цена', value: 'all' },
  { label: 'Бесплатно', value: 'free' },
  { label: 'До 1000 ₽', value: 'lt1000' },
  { label: '1000–2000 ₽', value: '1000_2000' },
  { label: 'От 2000 ₽', value: 'gt2000' },
];

const Index = () => {
  const [category, setCategory] = useState('Все');
  const [city, setCity] = useState('Все города');
  const [price, setPrice] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      if (category !== 'Все' && e.category !== category) return false;
      if (city !== 'Все города' && e.city !== city) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (price === 'free' && e.price !== 0) return false;
      if (price === 'lt1000' && e.price >= 1000) return false;
      if (price === '1000_2000' && (e.price < 1000 || e.price > 2000)) return false;
      if (price === 'gt2000' && e.price < 2000) return false;
      return true;
    });
  }, [category, city, price, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground font-display text-xl">
              A
            </span>
            <div className="leading-none">
              <div className="font-display text-lg font-700 uppercase tracking-wide">
                Афиша <span className="text-accent">Light</span>
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                a-fisha.ru
              </div>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-500 md:flex">
            <a href="#events" className="text-muted-foreground transition-colors hover:text-foreground">
              Афиша
            </a>
            <a href="#events" className="text-muted-foreground transition-colors hover:text-foreground">
              Концерты
            </a>
            <a href="#events" className="text-muted-foreground transition-colors hover:text-foreground">
              Театр
            </a>
            <a href="#events" className="text-muted-foreground transition-colors hover:text-foreground">
              Выставки
            </a>
          </nav>
          <button className="bg-primary px-5 py-2.5 text-sm font-600 text-primary-foreground transition-opacity hover:opacity-90">
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container grid gap-10 py-16 md:grid-cols-12 md:py-24">
          <div className="md:col-span-8">
            <div className="mb-5 inline-flex items-center gap-2 border border-primary-foreground/25 px-3 py-1 text-xs uppercase tracking-widest text-primary-foreground/70">
              <span className="h-1.5 w-1.5 bg-accent" />
              События · Билеты · Бронирование
            </div>
            <h1 className="font-display text-5xl font-700 uppercase leading-[0.95] tracking-tight md:text-7xl">
              Найдите своё
              <br />
              <span className="text-accent">событие</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/70">
              Концерты, спектакли и выставки в вашем городе. Удобный поиск, фильтры
              по датам, категориям и цене — бронируйте билеты за пару минут.
            </p>
          </div>
          <div className="flex items-end md:col-span-4">
            <div className="grid w-full grid-cols-2 gap-px border border-primary-foreground/15 bg-primary-foreground/15">
              {[
                { n: '1 200+', l: 'событий' },
                { n: '46', l: 'городов' },
                { n: '24/7', l: 'бронь' },
                { n: '0%', l: 'комиссия' },
              ].map((s) => (
                <div key={s.l} className="bg-primary p-5">
                  <div className="font-display text-3xl font-700 text-accent">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-primary-foreground/60">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="events" className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск события..."
                className="w-full border border-input bg-background py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select value={city} onChange={setCity} options={CITIES} icon="MapPin" />
              <Select
                value={PRICES.find((p) => p.value === price)?.label || ''}
                onChange={(label) =>
                  setPrice(PRICES.find((p) => p.label === label)?.value || 'all')
                }
                options={PRICES.map((p) => p.label)}
                icon="Wallet"
              />
              <Select
                value={category === 'Все' ? 'Все категории' : category}
                onChange={(v) => setCategory(v === 'Все категории' ? 'Все' : v)}
                options={['Все категории', 'Концерты', 'Театр', 'Выставки']}
                icon="LayoutGrid"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 text-sm font-500 uppercase tracking-wide transition-colors ${
                  category === c
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events grid */}
      <section className="container py-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl font-700 uppercase tracking-tight">
            Ближайшие события
          </h2>
          <span className="text-sm text-muted-foreground">
            Найдено: {filtered.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-border py-24 text-center text-muted-foreground">
            <Icon name="CalendarX" size={40} className="mx-auto mb-3 opacity-40" />
            По вашему запросу событий не найдено
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => (
              <article
                key={e.id}
                className="group flex flex-col overflow-hidden border border-border bg-card opacity-0 animate-fade-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-0 top-0 flex flex-col items-center bg-primary px-4 py-3 text-primary-foreground">
                    <span className="font-display text-2xl font-700 leading-none">
                      {e.day}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
                      {e.month}
                    </span>
                  </div>
                  <span className="absolute right-3 top-3 bg-accent px-2 py-1 text-[11px] font-600 uppercase tracking-wide text-accent-foreground">
                    {e.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-600 leading-tight">
                    {e.title}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={15} className="text-accent" />
                      {e.weekday}, {e.day} {e.month} · {e.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={15} className="text-accent" />
                      {e.venue} · {e.city}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      {e.price === 0 ? (
                        <span className="font-display text-lg font-700 text-foreground">
                          Бесплатно
                        </span>
                      ) : (
                        <span className="font-display text-lg font-700">
                          {e.price.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                      <span className="ml-2 text-xs text-muted-foreground">{e.age}</span>
                    </div>
                    <button className="bg-primary px-4 py-2.5 text-sm font-600 text-primary-foreground transition-opacity hover:opacity-90">
                      Билеты
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center bg-accent font-display text-accent-foreground">
              A
            </span>
            <span className="font-display text-lg font-700 uppercase tracking-wide">
              Афиша Light
            </span>
          </div>
          <div className="text-sm text-primary-foreground/60">
            © 2026 a-fisha.ru — поиск и бронирование билетов на события
          </div>
        </div>
      </footer>
    </div>
  );
};

interface SelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon: string;
}

const Select = ({ value, onChange, options, icon }: SelectProps) => (
  <div className="relative">
    <Icon
      name={icon}
      size={16}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none border border-input bg-background py-3 pl-9 pr-9 text-sm outline-none transition-colors focus:border-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <Icon
      name="ChevronDown"
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
  </div>
);

export default Index;
