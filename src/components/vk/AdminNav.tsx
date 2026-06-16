import type { Page } from '@/types';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'main', label: 'Афиша' },
  { page: 'manager', label: 'Заказы' },
  { page: 'places', label: 'Места' },
  { page: 'mailings', label: 'Рассылки' },
  { page: 'site', label: 'Сайт' },
  { page: 'settings', label: 'Настройки' },
];

const AdminNav = ({ page, onNavigate }: Props) => {
  const isActive = (p: Page) =>
    p === 'main' ? page === 'main' || page === 'past' : page === p;

  return (
    <div className="nav-pills-vk">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.page}
          onClick={() => onNavigate(item.page)}
          className={`nav-link ${isActive(item.page) ? 'active' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default AdminNav;