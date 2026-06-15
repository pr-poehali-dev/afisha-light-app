import Icon from '@/components/ui/icon';
import type { Page } from '@/types';

interface Props {
  page: Page;
  widgetName: string;
  isAdmin: boolean;
  onBack: () => void;
  onHome: () => void;
}

const PAGE_BACK_LABEL: Partial<Record<Page, string>> = {
  show_event: 'Назад',
  add_event: 'Назад',
  edit_event: 'Назад',
  manager: 'Назад',
  places: 'Назад',
  settings: 'Назад',
  add_order: 'Назад',
};

const Toolbar = ({ page, widgetName, isAdmin, onBack, onHome }: Props) => {
  const isRoot = page === 'main' || page === 'past';
  const backLabel = PAGE_BACK_LABEL[page];

  return (
    <div className="vk-toolbar sticky top-0 z-50 flex h-12 items-center gap-2 border-b border-border bg-card px-3">
      {!isRoot && backLabel ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-primary font-500 min-w-[44px]"
        >
          <Icon name="ChevronLeft" size={20} />
          <span className="hidden xs:inline">Назад</span>
        </button>
      ) : (
        <div className="min-w-[44px]" />
      )}

      <button
        onClick={onHome}
        className="flex-1 text-center font-display text-base font-600 uppercase tracking-wide truncate"
      >
        {isRoot ? (widgetName || 'Афиша') : ''}
        {!isRoot && (
          <span className="font-display text-base font-600 uppercase tracking-wide">
            {page === 'show_event' && 'Событие'}
            {page === 'add_event' && 'Добавить событие'}
            {page === 'edit_event' && 'Редактировать'}
            {page === 'manager' && 'Заказы'}
            {page === 'places' && 'Места'}
            {page === 'settings' && 'Настройки'}
            {page === 'add_order' && 'Оформить заказ'}
          </span>
        )}
      </button>

      {isAdmin && isRoot && (
        <div className="min-w-[44px] text-right text-xs text-muted-foreground">
          admin
        </div>
      )}
      {(!isAdmin || !isRoot) && <div className="min-w-[44px]" />}
    </div>
  );
};

export default Toolbar;
