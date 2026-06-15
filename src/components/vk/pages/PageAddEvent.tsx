import { useState } from 'react';
import type { EventItem, EventCategory, EventScheduleType, Place } from '@/types';
import { CATEGORIES, section, block, Label } from './event-form/EventFormShared';
import EventFormCover from './event-form/EventFormCover';
import EventFormSchedule from './event-form/EventFormSchedule';
import EventFormDetails from './event-form/EventFormDetails';

interface Props {
  initial?: Partial<EventItem>;
  places?: Place[];
  onSave: (data: Partial<EventItem>) => void;
  onCancel: () => void;
}

const PageAddEvent = ({ initial = {}, places = [], onSave, onCancel }: Props) => {
  const firstDate = initial.dates?.[0];

  const [title, setTitle] = useState(initial.title ?? '');
  const [type, setType] = useState<EventCategory>(initial.type ?? 'Концерт');
  const [tagsInput, setTagsInput] = useState((initial.tags ?? []).join(', '));
  const [scheduleType, setScheduleType] = useState<EventScheduleType>(initial.schedule_type ?? 'once');
  const [schedTab, setSchedTab] = useState<'calendar' | 'list'>(
    initial.schedule_type === 'schedule' ? 'list' : 'calendar'
  );

  // once
  const [date, setDate] = useState(firstDate?.date ?? '');
  const [startTime, setStartTime] = useState(firstDate?.start_time ?? '');
  const [finishTime, setFinishTime] = useState(firstDate?.finish_time ?? '');

  // schedule: calendar mode
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calDates, setCalDates] = useState<Record<string, { start: string; finish: string }>>(() => {
    if (initial.schedule_type === 'schedule' && initial.dates) {
      return Object.fromEntries(
        initial.dates.map((d) => [d.date, { start: d.start_time, finish: d.finish_time ?? '' }])
      );
    }
    return {};
  });
  const [calModal, setCalModal] = useState<string | null>(null);
  const [calModalStart, setCalModalStart] = useState('09:00');
  const [calModalFinish, setCalModalFinish] = useState('');

  // schedule: list mode
  const [listDates, setListDates] = useState<{ date: string; start: string; finish: string }[]>(
    initial.dates?.map((d) => ({ date: d.date, start: d.start_time, finish: d.finish_time ?? '' })) ?? [{ date: '', start: '', finish: '' }]
  );

  // multiday
  const [multiStart, setMultiStart] = useState(firstDate?.date ?? '');
  const [multiEnd, setMultiEnd] = useState(initial.dates?.at(-1)?.date ?? '');
  const [multiStartTime, setMultiStartTime] = useState(firstDate?.start_time ?? '');

  const [showDates, setShowDates] = useState(initial.show_dates !== false);
  const [online, setOnline] = useState(initial.online ?? false);
  const [placeId, setPlaceId] = useState<number | ''>(initial.place_id ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [address, setAddress] = useState(initial.address ?? '');
  const [placeName, setPlaceName] = useState(initial.place ?? '');
  const [age, setAge] = useState(initial.age ?? '0+');
  const [visibility, setVisibility] = useState<0 | 1>(initial.private === 1 ? 1 : 0);
  const [priority, setPriority] = useState<0 | 1 | 2>(initial.priority ?? 0);
  const [description, setDescription] = useState(initial.description ?? '');
  const [link1Url, setLink1Url] = useState(initial.link1_url ?? '');
  const [link1Label, setLink1Label] = useState(initial.link1_label ?? 'Билеты');
  const [link2Url, setLink2Url] = useState(initial.link2_url ?? '');
  const [link2Label, setLink2Label] = useState(initial.link2_label ?? 'Подробнее');
  const [adminNotes, setAdminNotes] = useState(initial.admin_notes ?? '');
  const [isFree, setIsFree] = useState(initial.is_free ?? false);
  const [priceFrom, setPriceFrom] = useState(initial.price_from ?? 0);
  const [priceTo, setPriceTo] = useState(initial.price_to ?? 0);
  const [isScheduled, setIsScheduled] = useState(!!initial.publish_at);
  const [publishAt, setPublishAt] = useState<string>(
    initial.publish_at ? initial.publish_at.slice(0, 16) : ''
  );

  const [image, setImage] = useState<string>(initial.image ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handlePlaceSelect = (id: number | '') => {
    setPlaceId(id);
    if (id === '') { return; }
    const p = places.find((x) => x.id === id);
    if (p) { setCity(p.city); setAddress(p.address); setPlaceName(p.name); }
  };

  const buildDates = () => {
    if (scheduleType === 'once') {
      return [{ date, start_time: startTime, finish_time: finishTime || undefined }];
    }
    if (scheduleType === 'multiday') {
      const result = [];
      const cur = new Date(multiStart + 'T00:00:00');
      const end = new Date(multiEnd + 'T00:00:00');
      while (cur <= end) {
        result.push({ date: cur.toISOString().slice(0, 10), start_time: multiStartTime });
        cur.setDate(cur.getDate() + 1);
      }
      return result;
    }
    // schedule
    if (schedTab === 'calendar') {
      return Object.entries(calDates)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([d, t]) => ({ date: d, start_time: t.start, finish_time: t.finish || undefined }));
    }
    return listDates.filter((r) => r.date && r.start).map((r) => ({ date: r.date, start_time: r.start, finish_time: r.finish || undefined }));
  };

  const valid = !!title && (() => {
    if (scheduleType === 'once') return !!date && !!startTime;
    if (scheduleType === 'multiday') return !!multiStart && !!multiEnd && !!multiStartTime;
    if (schedTab === 'calendar') return Object.keys(calDates).length > 0;
    return listDates.some((r) => r.date && r.start);
  })();

  const handleSave = () => {
    if (!valid) return;
    onSave({
      ...initial,
      title, type,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      description,
      city: online ? '' : city,
      address: online ? '' : address,
      place: online ? '' : placeName,
      place_id: online ? undefined : (placeId || undefined),
      age, is_free: isFree, price: isFree ? 0 : priceFrom,
      price_from: isFree ? 0 : priceFrom,
      price_to: isFree ? 0 : priceTo,
      online,
      image: image || undefined,
      dates: buildDates(),
      schedule_type: scheduleType,
      show_dates: showDates,
      private: visibility,
      priority,
      link1_url: link1Url, link1_label: link1Label,
      link2_url: link2Url, link2_label: link2Label,
      admin_notes: adminNotes,
      publish_at: isScheduled && publishAt ? new Date(publishAt).toISOString() : null,
    });
  };

  return (
    <div style={{ minHeight: '100vh', padding: '12px 14px 80px', background: '#F5F5F7' }}>

      <EventFormCover
        image={image} uploading={uploading} uploadError={uploadError}
        onImageChange={setImage} onUploadingChange={setUploading} onUploadErrorChange={setUploadError}
      />

      {/* Название + Тип + Теги */}
      <div style={section}>
        <div style={block}>
          <Label required>Название</Label>
          <input className="vk-input" placeholder="Название вашего мероприятия" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div style={block}>
          <Label required>Тип события</Label>
          <select className="vk-input" value={type} onChange={(e) => setType(e.target.value as EventCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 0 }}>
          <Label>Теги</Label>
          <input className="vk-input" placeholder="Джаз, живая музыка, классика..." value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Через запятую</div>
        </div>
      </div>

      <EventFormSchedule
        scheduleType={scheduleType} setScheduleType={setScheduleType}
        schedTab={schedTab} setSchedTab={setSchedTab}
        date={date} setDate={setDate}
        startTime={startTime} setStartTime={setStartTime}
        finishTime={finishTime} setFinishTime={setFinishTime}
        calYear={calYear} setCalYear={setCalYear}
        calMonth={calMonth} setCalMonth={setCalMonth}
        calDates={calDates} setCalDates={setCalDates}
        calModal={calModal} setCalModal={setCalModal}
        calModalStart={calModalStart} setCalModalStart={setCalModalStart}
        calModalFinish={calModalFinish} setCalModalFinish={setCalModalFinish}
        listDates={listDates} setListDates={setListDates}
        multiStart={multiStart} setMultiStart={setMultiStart}
        multiEnd={multiEnd} setMultiEnd={setMultiEnd}
        multiStartTime={multiStartTime} setMultiStartTime={setMultiStartTime}
        showDates={showDates} setShowDates={setShowDates}
        online={online} setOnline={setOnline}
      />

      <EventFormDetails
        online={online} places={places} placeId={placeId}
        city={city} setCity={setCity}
        address={address} setAddress={setAddress}
        placeName={placeName} setPlaceName={setPlaceName}
        onPlaceSelect={handlePlaceSelect}
        age={age} setAge={setAge}
        visibility={visibility} setVisibility={setVisibility}
        priority={priority} setPriority={setPriority}
        description={description} setDescription={setDescription}
        link1Url={link1Url} setLink1Url={setLink1Url}
        link1Label={link1Label} setLink1Label={setLink1Label}
        link2Url={link2Url} setLink2Url={setLink2Url}
        link2Label={link2Label} setLink2Label={setLink2Label}
        adminNotes={adminNotes} setAdminNotes={setAdminNotes}
        isScheduled={isScheduled} setIsScheduled={setIsScheduled}
        publishAt={publishAt} setPublishAt={setPublishAt}
        isFree={isFree} setIsFree={setIsFree}
        priceFrom={priceFrom} setPriceFrom={setPriceFrom}
        priceTo={priceTo} setPriceTo={setPriceTo}
      />

      {/* Нижняя панель */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', gap: 10, padding: 10, borderTop: '1px solid #EBEBEB', background: '#fff', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
          Отмена
        </button>
        <button onClick={handleSave} disabled={!valid || uploading} style={{ flex: 1, padding: '11px 0', fontSize: 14, fontWeight: 700, color: '#fff', background: (valid && !uploading) ? '#7C3AED' : '#DDD', border: 'none', borderRadius: 12, cursor: (valid && !uploading) ? 'pointer' : 'default', boxShadow: (valid && !uploading) ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}>
          {uploading ? 'Загрузка...' : (initial.id ? 'Сохранить' : 'Добавить')}
        </button>
      </div>
    </div>
  );
};

export default PageAddEvent;
