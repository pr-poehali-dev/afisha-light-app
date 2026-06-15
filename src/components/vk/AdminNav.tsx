import type { Page } from '@/types';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'main', label: 'Афиша' },
  { page: 'manager', label: 'Заказы' },
  { page: 'places', label: 'Места' },
  { page: 'settings', label: 'Настройки' },
];

const AdminNav = ({ page, onNavigate }: Props) => {
  const activeRoot = (p: Page) =>
    p === 'main' ? page === 'main' || page === 'past' : page === p;

  return (
    <div className="overflow-x-auto border-b border-border bg-background">
      <div className="flex min-w-max px-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-500 transition-colors ${
              activeRoot(item.page)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
            {activeRoot(item.page) && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminNav;
