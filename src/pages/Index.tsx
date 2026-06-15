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

import { MOCK_ORDERS, MOCK_CONFIG } from '@/data/mock';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/api/events';
import { fetchPlaces, createPlace, updatePlace } from '@/api/places';
import type { EventItem, Order, Place, Page, AppConfig } from '@/types';

const VK_PARAMS = {
  is_admin: true,
  vk_group_id: 234136199,
  vk_user_id: 1107808138,
};

const ROOT_PAGES: Page[] = ['main', 'past', 'manager', 'places', 'settings'];

const Index = () => {
  const { is_admin } = VK_PARAMS;

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
    Promise.all([fetchEvents(false), fetchEvents(true), fetchPlaces()])
      .then(([actual, past, pl]) => {
        setEvents(actual);
        setPastEvents(past);
        setPlaces(pl);
      })
      .finally(() => setLoading(false));
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

  const handleOpenEvent = (e: EventItem) => {
    setSelectedEvent(e);
    navigate('show_event');
  };

  const handleAddEvent = () => {
    setEditEvent(null);
    navigate('add_event');
  };

  const handleEditEvent = (e: EventItem) => {
    setEditEvent(e);
    navigate('edit_event');
  };

  const handleSaveEvent = async (data: Partial<EventItem>) => {
    if (data.id) {
      const updated = await updateEvent(data.id, data);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setPastEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      if (selectedEvent?.id === updated.id) setSelectedEvent(updated);
    } else {
      const created = await createEvent({ ...data, vk_group_id: VK_PARAMS.vk_group_id, is_past: false });
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
    const created = await createPlace(p);
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
    if (loading && (page === 'main' || page === 'past')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#8A8A8A', fontSize: 14 }}>
          Загрузка событий...
        </div>
      );
    }

    switch (page) {
      case 'main':
      case 'past':
        return (
          <PageMain
            events={events}
            pastEvents={pastEvents}
            isAdmin={is_admin}
            onOpenEvent={handleOpenEvent}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onNavigate={navigate}
          />
        );

      case 'show_event':
        if (!selectedEvent) return null;
        return (
          <PageShowEvent
            event={selectedEvent}
            isAdmin={is_admin}
            currency={config.currency}
            onEdit={() => handleEditEvent(selectedEvent)}
            onBook={() => navigate('add_order')}
          />
        );

      case 'add_event':
        return <PageAddEvent places={places} onSave={handleSaveEvent} onCancel={goBack} />;

      case 'edit_event':
        return (
          <PageAddEvent
            initial={editEvent ?? undefined}
            places={places}
            onSave={handleSaveEvent}
            onCancel={goBack}
          />
        );

      case 'manager':
        return <PageManager orders={orders} onChangeState={handleChangeOrderState} />;

      case 'places':
        return <PagePlaces places={places} onAdd={handleAddPlace} onEdit={handleEditPlace} />;

      case 'settings':
        return <PageSettings config={config} onSave={setConfig} />;

      case 'add_order':
        if (!selectedEvent) return null;
        return (
          <PageAddOrder
            event={selectedEvent}
            currency={config.currency}
            onSubmit={goBack}
            onCancel={goBack}
          />
        );

      default:
        return null;
    }
  };

  const showAdminNav = is_admin && ROOT_PAGES.includes(page);

  const bgStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#F5F5F7',
  };

  return (
    <div style={bgStyle}>
      <Toolbar
        page={page}
        widgetName={config.widget_name}
        isAdmin={is_admin}
        onBack={goBack}
        onHome={goHome}
      />
      {showAdminNav && <AdminNav page={page} onNavigate={navRoot} />}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  );
};

export default Index;