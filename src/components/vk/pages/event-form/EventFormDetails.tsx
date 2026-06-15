import type { Place } from '@/types';
import { Label, Toggle, section, block, AGES } from './EventFormShared';

interface Props {
  // место
  online: boolean;
  places: Place[];
  placeId: number | '';
  city: string; setCity: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  placeName: string; setPlaceName: (v: string) => void;
  onPlaceSelect: (id: number | '') => void;
  // отображение
  age: string; setAge: (v: string) => void;
  visibility: 0 | 1; setVisibility: (v: 0 | 1) => void;
  priority: 0 | 1 | 2; setPriority: (v: 0 | 1 | 2) => void;
  // описание
  description: string; setDescription: (v: string) => void;
  // ссылки
  link1Url: string; setLink1Url: (v: string) => void;
  link1Label: string; setLink1Label: (v: string) => void;
  link2Url: string; setLink2Url: (v: string) => void;
  link2Label: string; setLink2Label: (v: string) => void;
  // заметки
  adminNotes: string; setAdminNotes: (v: string) => void;
  // публикация
  isScheduled: boolean;
  setIsScheduled: React.Dispatch<React.SetStateAction<boolean>>;
  publishAt: string; setPublishAt: (v: string) => void;
  // стоимость
  isFree: boolean; setIsFree: React.Dispatch<React.SetStateAction<boolean>>;
  priceFrom: number; setPriceFrom: (v: number) => void;
  priceTo: number; setPriceTo: (v: number) => void;
}

const EventFormDetails = ({
  online, places, placeId, city, setCity, address, setAddress, placeName, setPlaceName, onPlaceSelect,
  age, setAge, visibility, setVisibility, priority, setPriority,
  description, setDescription,
  link1Url, setLink1Url, link1Label, setLink1Label,
  link2Url, setLink2Url, link2Label, setLink2Label,
  adminNotes, setAdminNotes,
  isScheduled, setIsScheduled, publishAt, setPublishAt,
  isFree, setIsFree, priceFrom, setPriceFrom, priceTo, setPriceTo,
}: Props) => (
  <>
    {/* Место */}
    {!online && (
      <div style={section}>
        <div style={block}>
          <Label>Место проведения</Label>
          <select className="vk-input" value={placeId} onChange={(e) => onPlaceSelect(e.target.value === '' ? '' : Number(e.target.value))}>
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

    {/* Отложенная публикация */}
    <div style={section}>
      <Toggle
        checked={isScheduled}
        onChange={() => { setIsScheduled((v) => !v); if (!isScheduled) setPublishAt(''); }}
        label="Отложенная публикация"
      />
      {isScheduled && (
        <div style={{ marginTop: 4 }}>
          <Label required>Дата и время публикации</Label>
          <input type="datetime-local" className="vk-input" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
            Мероприятие появится на главной только после наступления указанного времени
          </div>
        </div>
      )}
    </div>

    {/* Стоимость и бесплатное */}
    <div style={{ ...section, marginBottom: 0 }}>
      <Toggle checked={isFree} onChange={() => setIsFree((v) => !v)} label="Бесплатное мероприятие" />
      {!isFree && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          <div>
            <Label>Цена от, ₽</Label>
            <input type="number" className="vk-input" placeholder="500" min={0} value={priceFrom || ''} onChange={(e) => setPriceFrom(Number(e.target.value))} />
          </div>
          <div>
            <Label>Цена до, ₽</Label>
            <input type="number" className="vk-input" placeholder="2000" min={0} value={priceTo || ''} onChange={(e) => setPriceTo(Number(e.target.value))} />
          </div>
        </div>
      )}
    </div>
  </>
);

export default EventFormDetails;
