import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import type { EventItem, EventCategory, EventScheduleType, Place } from '@/types';

const UPLOAD_URL = 'https://functions.poehali.dev/dec20997-ea70-4e62-9edf-60f5cf25a981';

interface Props {
  initial?: Partial<EventItem>;
  places?: Place[];
  onSave: (data: Partial<EventItem>) => void;
  onCancel: () => void;
}

const CATEGORIES: EventCategory[] = [
  'Концерт', 'Театр', 'Выставка', 'Лекция', 'Мастер-класс', 'Спорт',
  'Фестиваль', 'Кино', 'Детское', 'Экскурсия', 'Конференция', 'Форум',
  'Тренинг', 'Вебинар', 'Ярмарка', 'Выпускной', 'Корпоратив',
  'Благотворительность', 'Религиозное', 'Флешмоб', 'Встреча', 'Другое',
];

const AGES = ['0+', '3+', '6+', '10+', '12+', '14+', '16+', '18+'];

const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS_FULL = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
  </div>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <div onClick={onChange} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
    <div style={{
      width: 38, height: 22, borderRadius: 11, position: 'relative',
      background: checked ? '#7C3AED' : '#DDD', transition: 'all 0.2s', flexShrink: 0,
      boxShadow: checked ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 19 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }} />
    </div>
    <span style={{ fontSize: 14, color: '#222', fontWeight: 500 }}>{label}</span>
  </div>
);

const Divider = () => <div style={{ borderTop: '1px solid #EBEBEB', margin: '16px 0' }} />;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) { return String(n).padStart(2, '0'); }

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

  const [image, setImage] = useState<string>(initial.image ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Файл слишком большой. Максимум 5 МБ'); return; }
    setUploading(true); setUploadError('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setImage(base64);
      try {
        const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64 }) });
        const data = await res.json();
        if (data.url) setImage(data.url); else setUploadError('Ошибка загрузки');
      } catch { setUploadError('Ошибка сети'); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

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
      age, is_free: isFree, price: isFree ? 0 : 0,
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
    });
  };

  // Calendar rendering
  const renderCalendar = () => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysCount = getDaysInMonth(calYear, calMonth);
    const cells: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= daysCount; i++) cells.push(i);

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#3F51B5' }}>
            <Icon name="ChevronLeft" size={18} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{MONTHS_FULL[calMonth]} {calYear}</span>
          <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#3F51B5' }}>
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
          {WEEKDAYS_SHORT.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, color: '#8A8A8A', padding: '2px 0' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const key = `${calYear}-${pad(calMonth + 1)}-${pad(day)}`;
            const selected = !!calDates[key];
            const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            return (
              <div
                key={i}
                onClick={() => {
                  if (selected) {
                    const next = { ...calDates };
                    delete next[key];
                    setCalDates(next);
                  } else {
                    setCalModal(key);
                    setCalModalStart('09:00');
                    setCalModalFinish('');
                  }
                }}
                style={{
                  textAlign: 'center', padding: '5px 2px', fontSize: 12, cursor: 'pointer',
                  borderRadius: 4,
                  background: selected ? '#3F51B5' : isToday ? '#EEF0FB' : 'transparent',
                  color: selected ? '#fff' : '#1A1A1A',
                  fontWeight: selected || isToday ? 600 : 400,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
        {Object.keys(calDates).length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#3F51B5' }}>
            Выбрано дат: {Object.keys(calDates).length}
          </div>
        )}

        {/* Модальное окно времени */}
        {calModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', padding: 20, width: '100%', maxWidth: 320 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Время для {calModal}</div>
              <div style={{ marginBottom: 10 }}>
                <Label required>Начало</Label>
                <input type="time" className="vk-input" value={calModalStart} onChange={(e) => setCalModalStart(e.target.value)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Label>Окончание</Label>
                <input type="time" className="vk-input" value={calModalFinish} onChange={(e) => setCalModalFinish(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setCalModal(null)}
                  style={{ flex: 1, padding: '8px 0', fontSize: 13, color: '#3F51B5', background: 'none', border: '1px solid #3F51B5', cursor: 'pointer' }}>
                  Отмена
                </button>
                <button
                  disabled={!calModalStart}
                  onClick={() => {
                    if (calModalStart && calModal) {
                      setCalDates((prev) => ({ ...prev, [calModal]: { start: calModalStart, finish: calModalFinish } }));
                      setCalModal(null);
                    }
                  }}
                  style={{ flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#fff', background: calModalStart ? '#3F51B5' : '#DCDFE6', border: 'none', cursor: 'pointer' }}>
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const block: React.CSSProperties = { marginBottom: 14 };

  const section: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #F0F0F0',
    borderRadius: 16,
    padding: '14px',
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '12px 14px 80px', background: '#F5F5F7' }}>

      {/* Обложка */}
      <div style={section}>
        <Label>Обложка мероприятия</Label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
        {image ? (
          <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
            <img src={image} alt="Обложка" style={{ width: '100%', aspectRatio: '2/1', objectFit: 'cover', display: 'block' }} />
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#fff', fontSize: 13 }}>Загрузка...</div>
              </div>
            )}
            {!uploading && (
              <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
                <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                  <Icon name="Pencil" size={12} /> Заменить
                </button>
                <button onClick={() => { setImage(''); if (fileRef.current) fileRef.current.value = ''; }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(220,0,0,0.6)', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
                  <Icon name="Trash2" size={12} /> Удалить
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, width: '50%', aspectRatio: '2/1', border: '2px dashed #DDD6FE', background: '#F5F3FF', cursor: 'pointer', borderRadius: 10 }}>
            <Icon name="ImagePlus" size={18} style={{ color: '#A78BFA' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED' }}>Загрузить фото</span>
            <span style={{ fontSize: 9, color: '#AAA' }}>JPG, PNG, WEBP · до 5 МБ</span>
            <span style={{ fontSize: 9, color: '#AAA' }}>Рекомендуем: 1200 × 600 px</span>
          </button>
        )}
        {uploadError && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{uploadError}</div>}
      </div>

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

      {/* Расписание */}
      <div style={section}>
        <div style={block}>
          <Label required>Событие проходит</Label>
          <select className="vk-input" value={scheduleType} onChange={(e) => setScheduleType(e.target.value as EventScheduleType)}>
            <option value="once">Однажды</option>
            <option value="schedule">По расписанию</option>
            <option value="multiday">Несколько дней</option>
          </select>
        </div>

        {scheduleType === 'once' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div><Label required>Дата</Label><input type="date" className="vk-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label required>Начало</Label><input type="time" className="vk-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
            </div>
            <div><Label>Время окончания</Label><input type="time" className="vk-input" value={finishTime} onChange={(e) => setFinishTime(e.target.value)} /></div>
          </>
        )}

        {scheduleType === 'schedule' && (
          <div>
            <div style={{ display: 'flex', borderBottom: '2px solid #EBEBEB', marginBottom: 12 }}>
              {(['calendar', 'list'] as const).map((tab) => (
                <button key={tab} onClick={() => setSchedTab(tab)} style={{
                  flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                  color: schedTab === tab ? '#7C3AED' : '#999',
                  borderBottom: schedTab === tab ? '2px solid #7C3AED' : '2px solid transparent', marginBottom: -2,
                }}>
                  {tab === 'calendar' ? 'Календарь' : 'Список'}
                </button>
              ))}
            </div>
            {schedTab === 'calendar' && renderCalendar()}
            {schedTab === 'list' && (
              <div>
                {listDates.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 32px', gap: 6, marginBottom: 8, alignItems: 'end' }}>
                    <div>{i === 0 && <Label required>Дата</Label>}<input type="date" className="vk-input" value={row.date} onChange={(e) => { const n = [...listDates]; n[i] = { ...n[i], date: e.target.value }; setListDates(n); }} /></div>
                    <div>{i === 0 && <Label required>Начало</Label>}<input type="time" className="vk-input" value={row.start} onChange={(e) => { const n = [...listDates]; n[i] = { ...n[i], start: e.target.value }; setListDates(n); }} /></div>
                    <div>{i === 0 && <Label>Конец</Label>}<input type="time" className="vk-input" value={row.finish} onChange={(e) => { const n = [...listDates]; n[i] = { ...n[i], finish: e.target.value }; setListDates(n); }} /></div>
                    <button onClick={() => setListDates((prev) => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '8px 0' }}><Icon name="X" size={16} /></button>
                  </div>
                ))}
                <button onClick={() => setListDates((prev) => [...prev, { date: '', start: '', finish: '' }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7C3AED', background: '#F5F3FF', border: '1px dashed #DDD6FE', padding: '6px 12px', cursor: 'pointer', width: '100%', justifyContent: 'center', borderRadius: 8 }}>
                  <Icon name="Plus" size={14} /> Добавить дату
                </button>
              </div>
            )}
          </div>
        )}

        {scheduleType === 'multiday' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div><Label required>Дата начала</Label><input type="date" className="vk-input" value={multiStart} onChange={(e) => setMultiStart(e.target.value)} /></div>
              <div><Label required>Дата окончания</Label><input type="date" className="vk-input" value={multiEnd} onChange={(e) => setMultiEnd(e.target.value)} /></div>
            </div>
            <div><Label required>Время начала</Label><input type="time" className="vk-input" value={multiStartTime} onChange={(e) => setMultiStartTime(e.target.value)} /></div>
          </>
        )}
      </div>

      {/* Переключатели */}
      <div style={section}>
        <Toggle checked={showDates} onChange={() => setShowDates((v) => !v)} label="Показывать даты проведения" />
        <Toggle checked={online} onChange={() => setOnline((v) => !v)} label="Онлайн событие (часовой пояс МСК)" />
      </div>

      {/* Место */}
      {!online && (
        <div style={section}>
          <div style={block}>
            <Label>Место проведения</Label>
            <select className="vk-input" value={placeId} onChange={(e) => handlePlaceSelect(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">— Выбрать из сохранённых —</option>
              {places.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.city}</option>)}
            </select>
          </div>
          <div style={block}>
            <Label required>Город</Label>
            <input className="vk-input" placeholder="Москва" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div style={block}>
            <Label>Адрес</Label>
            <input className="vk-input" placeholder="ул. Примерная, д. 1" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label>Площадка</Label>
            <input className="vk-input" placeholder="Название площадки" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
          </div>
        </div>
      )}

      {/* Настройки отображения */}
      <div style={section}>
        <div style={block}>
          <Label>Возрастная маркировка</Label>
          <select className="vk-input" value={age} onChange={(e) => setAge(e.target.value)}>
            {AGES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={block}>
          <Label>Отображение мероприятия</Label>
          <select className="vk-input" value={visibility} onChange={(e) => setVisibility(Number(e.target.value) as 0 | 1)}>
            <option value={0}>Показывать всем</option>
            <option value={1}>Скрыть (доступно только администратору)</option>
          </select>
        </div>
        <div>
          <Label>Приоритет</Label>
          <select className="vk-input" value={priority} onChange={(e) => setPriority(Number(e.target.value) as 0 | 1 | 2)}>
            <option value={0}>Общий — сортировка по дате</option>
            <option value={1}>Высокий — первая половина списка</option>
            <option value={2}>Высший — первый в списке</option>
          </select>
        </div>
      </div>

      {/* Описание */}
      <div style={section}>
        <Label>Описание мероприятия</Label>
        <textarea className="vk-input" placeholder="Расскажите о мероприятии..." value={description} rows={4} style={{ resize: 'none' }} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Ссылки */}
      <div style={section}>
        <div style={block}>
          <Label>Ссылка на внешний сайт №1</Label>
          <input className="vk-input" placeholder="https://..." value={link1Url} onChange={(e) => setLink1Url(e.target.value)} style={{ marginBottom: 6 }} />
          <Label>Название кнопки</Label>
          <input className="vk-input" placeholder="Билеты" value={link1Label} onChange={(e) => setLink1Label(e.target.value)} />
        </div>
        <div>
          <Label>Ссылка на внешний сайт №2</Label>
          <input className="vk-input" placeholder="https://..." value={link2Url} onChange={(e) => setLink2Url(e.target.value)} style={{ marginBottom: 6 }} />
          <Label>Название кнопки</Label>
          <input className="vk-input" placeholder="Подробнее" value={link2Label} onChange={(e) => setLink2Label(e.target.value)} />
        </div>
      </div>

      {/* Служебные заметки */}
      <div style={section}>
        <Label>Служебные заметки <span style={{ fontSize: 10, color: '#BBB', textTransform: 'none', fontWeight: 400 }}>(видит только администратор)</span></Label>
        <textarea className="vk-input" placeholder="Внутренние пометки..." value={adminNotes} rows={3} style={{ resize: 'none' }} onChange={(e) => setAdminNotes(e.target.value)} />
      </div>

      {/* Бесплатное */}
      <div style={{ ...section, marginBottom: 0 }}>
        <Toggle checked={isFree} onChange={() => setIsFree((v) => !v)} label="Бесплатное мероприятие" />
      </div>

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