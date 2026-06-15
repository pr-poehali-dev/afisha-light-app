import Icon from '@/components/ui/icon';
import type { Page } from '@/types';

interface Props {
  page: Page;
  widgetName: string;
  isAdmin: boolean;
  onBack: () => void;
  onHome: () => void;
}

const PAGE_TITLES: Partial<Record<Page, string>> = {
  show_event: 'Событие',
  add_event: 'Добавить событие',
  edit_event: 'Редактировать',
  manager: 'Заказы',
  places: 'Места',
  mailings: 'Рассылки',
  widget: 'Виджет',
  site: 'Сайт',
  settings: 'Настройки',
  add_order: 'Оформление',
};

const ROOT: Page[] = ['main', 'past', 'manager', 'places', 'settings'];

const Toolbar = ({ page, widgetName, isAdmin, onBack, onHome }: Props) => {
  const isRoot = ROOT.includes(page);
  const title = isRoot ? (widgetName || 'Афиша') : (PAGE_TITLES[page] ?? '');

  return (
    <div className="sticky top-0 z-50 flex items-center px-3" style={{ height: 56, background: 'linear-gradient(135deg, #7C3AED, #9333EA)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
      <div style={{ minWidth: 44 }}>
        {!isRoot && (
          <button
            onClick={onBack}
            className="flex items-center"
            style={{ color: '#fff', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Icon name="ChevronLeft" size={26} />
          </button>
        )}
      </div>

      <button
        onClick={onHome}
        className="flex-1 text-center font-bold"
        style={{ color: '#fff', fontSize: 17, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {title}
      </button>

      <div style={{ minWidth: 44 }} className="flex justify-end">
        {isAdmin && isRoot && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            color: '#fff',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '3px 8px',
            borderRadius: 6,
          }}>
            ADMIN
          </span>
        )}
      </div>
    </div>
  );
};

export default Toolbar;