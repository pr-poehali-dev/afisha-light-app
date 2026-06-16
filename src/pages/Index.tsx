import React, { useState, useCallback, useEffect } from 'react';
import Toolbar from '@/components/vk/Toolbar';
import AdminNav from '@/components/vk/AdminNav';
import PageMain from '@/components/vk/pages/PageMain';
import PageShowEvent from '@/components/vk/pages/PageShowEvent';
import PageAddEvent from '@/components/vk/pages/PageAddEvent';
import PageManager from '@/components/vk/pages/PageManager';
import PagePlaces from '@/components/vk/pages/PagePlaces';
import PageSettings from '@/components/vk/pages/PageSettings';
import PageAddOrder from '@/components/vk/pages/PageAddOrder';
import PageMailings from '@/components/vk/pages/PageMailings';
import PageWidget from '@/components/vk/pages/PageWidget';
import PageSite from '@/components/vk/pages/PageSite';

import { MOCK_ORDERS, MOCK_CONFIG } from '@/data/mock';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/api/events';
import { fetchPlaces, createPlace, updatePlace } from '@/api/places';
import { initVKBridge, parseVKParams } from '@/lib/vk';
import type { EventItem, Order, Place, Page, AppConfig } from '@/types';

// Инициализируем VK Bridge
initVKBridge();

// Параметры из URL — единственный источник истины
// В режиме разработки (вне VK) group_id = 0, is_admin = false
const VK_PARAMS = parseVKParams();

const ROOT_PAGES: Page[] = ['main', 'past', 'manager', 'places', 'mailings', 'widget', 'site', 'settings'];

const Index = () => {
  const { is_admin, vk_group_id } = VK_PARAMS;

  const [page, setPage] = useState<Page>('main');
  const [history, setHistory] = useState<Page[]>([]);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [config, setConfig] = useState<AppConfig>(MOCK_CONFIG);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);

  useEffect(() => {
    if (!vk_group_id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchEvents(vk_group_id, false, is_admin),
      fetchEvents(vk_group_id, true, is_admin),
      fetchPlaces(vk_group_id),
    ]).then(([actual, past, pl]) => {
      setEvents(actual);
      setPastEvents(past);
      setPlaces(pl);
    }).finally(() => setLoading(false));
  }, []);

  const navigate = useCallback((p: Page) => {
    setHistory((h) => [...h, page]);
    setPage(p);
  }, [page]);

  const goBack = useCallback(() => {
    const prev = history[history.length - 1] ?? 'main';
    setHistory((h) => h.slice(0, -1));
    setPage(prev);
  }, [history]);

  const goHome = useCallback(() => {
    setHistory([]);
    setPage('main');
    setSelectedEvent(null);
    setEditEvent(null);
  }, []);

  const navRoot = (p: Page) => {
    setHistory([]);
    setPage(p);
    setSelectedEvent(null);
    setEditEvent(null);
  };

  const handleOpenEvent = (e: EventItem) => { setSelectedEvent(e); navigate('show_event'); };
  const handleAddEvent  = () => { setEditEvent(null); navigate('add_event'); };
  const handleEditEvent = (e: EventItem) => { setEditEvent(e); navigate('edit_event'); };

  const handleSaveEvent = async (data: Partial<EventItem>) => {
    if (data.id) {
      const updated = await updateEvent(data.id, data);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setPastEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      if (selectedEvent?.id === updated.id) setSelectedEvent(updated);
    } else {
      const created = await createEvent(vk_group_id, { ...data, is_past: false });
      setEvents((prev) => [created, ...prev]);
    }
    goBack();
  };

  const handleDeleteEvent = async (id: number) => {
    await deleteEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setPastEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddPlace = async (p: Omit<Place, 'id'>) => {
    const created = await createPlace(vk_group_id, p);
    setPlaces((prev) => [...prev, created]);
  };

  const handleEditPlace = async (p: Place) => {
    const updated = await updatePlace(p.id, { name: p.name, city: p.city, address: p.address });
    setPlaces((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleChangeOrderState = (id: number, state: Order['state']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state } : o)));
  };

  const renderPage = () => {
    // Если не открыто из сообщества — показываем заглушку
    if (!vk_group_id) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 8 }}>Приложение установлено в сообществе</div>
          <div style={{ fontSize: 13 }}>Откройте приложение из страницы сообщества ВКонтакте</div>
        </div>
      );
    }

    if (loading && (page === 'main' || page === 'past')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#999', fontSize: 14 }}>
          Загрузка...
        </div>
      );
    }

    switch (page) {
      case 'main':
      case 'past':
        return (
          <PageMain
            events={events} pastEvents={pastEvents} isAdmin={is_admin}
            onOpenEvent={handleOpenEvent} onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent} onDeleteEvent={handleDeleteEvent}
            onNavigate={navigate}
          />
        );

      case 'show_event':
        if (!selectedEvent) return null;
        return (
          <PageShowEvent event={selectedEvent} isAdmin={is_admin} currency={config.currency}
            onEdit={() => handleEditEvent(selectedEvent)} onBook={() => navigate('add_order')} />
        );

      case 'add_event':
        return <PageAddEvent places={places} groupId={vk_group_id} onSave={handleSaveEvent} onCancel={goBack} />;

      case 'edit_event':
        return <PageAddEvent initial={editEvent ?? undefined} places={places} groupId={vk_group_id} onSave={handleSaveEvent} onCancel={goBack} />;

      case 'manager':
        return <PageManager orders={orders} onChangeState={handleChangeOrderState} />;

      case 'places':
        return <PagePlaces places={places} onAdd={handleAddPlace} onEdit={handleEditPlace} />;

      case 'mailings':
        return <PageMailings groupId={vk_group_id} />;

      case 'widget':
        return <PageWidget groupId={vk_group_id} />;

      case 'site':
        return <PageSite groupId={vk_group_id} />;

      case 'settings':
        return <PageSettings config={config} onSave={setConfig} />;

      case 'add_order':
        if (!selectedEvent) return null;
        return <PageAddOrder event={selectedEvent} currency={config.currency} onSubmit={goBack} onCancel={goBack} />;

      default:
        return null;
    }
  };

  const showAdminNav = is_admin && ROOT_PAGES.includes(page);

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F5F7' }}>
      <Toolbar page={page} widgetName={config.widget_name} isAdmin={is_admin} onBack={goBack} onHome={goHome} />
      {showAdminNav && <AdminNav page={page} onNavigate={navRoot} />}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default Index;