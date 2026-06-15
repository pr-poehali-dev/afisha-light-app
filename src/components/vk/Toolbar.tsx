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
  settings: 'Настройки',
  add_order: 'Оформление',
};

const ROOT: Page[] = ['main', 'past', 'manager', 'places', 'settings'];

const Toolbar = ({ page, widgetName, isAdmin, onBack, onHome }: Props) => {
  const isRoot = ROOT.includes(page);
  const title = isRoot ? (widgetName || 'Афиша') : (PAGE_TITLES[page] ?? '');

  return (
    <div
      style={{ height: 44 }}
      className="vk-toolbar sticky top-0 z-50 flex items-center px-2"
    >
      {/* Кнопка назад */}
      <div style={{ minWidth: 44 }}>
        {!isRoot && (
          <button
            onClick={onBack}
            className="flex items-center gap-0.5 text-sm font-medium"
            style={{ color: '#3F51B5' }}
          >
            <Icon name="ChevronLeft" size={22} />
          </button>
        )}
      </div>

      {/* Заголовок */}
      <button
        onClick={onHome}
        className="flex-1 text-center text-base font-semibold"
        style={{ color: '#1A1A1A' }}
      >
        {title}
      </button>

      {/* Правая часть */}
      <div style={{ minWidth: 44 }} className="flex justify-end">
        {isAdmin && isRoot && (
          <span
            className="text-xs px-1.5 py-0.5"
            style={{ color: '#8A8A8A', fontSize: 10 }}
          >
            admin
          </span>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
