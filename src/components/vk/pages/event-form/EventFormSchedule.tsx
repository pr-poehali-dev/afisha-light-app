import Icon from '@/components/ui/icon';
import type { EventScheduleType } from '@/types';
import { Label, Toggle, section, block, WEEKDAYS_SHORT, MONTHS_FULL, getDaysInMonth, pad } from './EventFormShared';

interface Props {
  scheduleType: EventScheduleType;
  setScheduleType: (v: EventScheduleType) => void;
  schedTab: 'calendar' | 'list';
  setSchedTab: (v: 'calendar' | 'list') => void;
  // once
  date: string; setDate: (v: string) => void;
  startTime: string; setStartTime: (v: string) => void;
  finishTime: string; setFinishTime: (v: string) => void;
  // calendar
  calYear: number; setCalYear: (v: number) => void;
  calMonth: number; setCalMonth: (v: number) => void;
  calDates: Record<string, { start: string; finish: string }>;
  setCalDates: React.Dispatch<React.SetStateAction<Record<string, { start: string; finish: string }>>>;
  calModal: string | null; setCalModal: (v: string | null) => void;
  calModalStart: string; setCalModalStart: (v: string) => void;
  calModalFinish: string; setCalModalFinish: (v: string) => void;
  // list
  listDates: { date: string; start: string; finish: string }[];
  setListDates: React.Dispatch<React.SetStateAction<{ date: string; start: string; finish: string }[]>>;
  // multiday
  multiStart: string; setMultiStart: (v: string) => void;
  multiEnd: string; setMultiEnd: (v: string) => void;
  multiStartTime: string; setMultiStartTime: (v: string) => void;
  // toggles
  showDates: boolean; setShowDates: React.Dispatch<React.SetStateAction<boolean>>;
  online: boolean; setOnline: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventFormSchedule = ({
  scheduleType, setScheduleType, schedTab, setSchedTab,
  date, setDate, startTime, setStartTime, finishTime, setFinishTime,
  calYear, setCalYear, calMonth, setCalMonth,
  calDates, setCalDates, calModal, setCalModal,
  calModalStart, setCalModalStart, calModalFinish, setCalModalFinish,
  listDates, setListDates,
  multiStart, setMultiStart, multiEnd, setMultiEnd, multiStartTime, setMultiStartTime,
  showDates, setShowDates, online, setOnline,
}: Props) => {
  const today = new Date();

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
              <div key={i} onClick={() => {
                if (selected) {
                  const next = { ...calDates };
                  delete next[key];
                  setCalDates(next);
                } else {
                  setCalModal(key);
                  setCalModalStart('09:00');
                  setCalModalFinish('');
                }
              }} style={{
                textAlign: 'center', padding: '5px 2px', fontSize: 12, cursor: 'pointer', borderRadius: 4,
                background: selected ? '#3F51B5' : isToday ? '#EEF0FB' : 'transparent',
                color: selected ? '#fff' : '#1A1A1A',
                fontWeight: selected || isToday ? 600 : 400,
              }}>
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
                <button disabled={!calModalStart} onClick={() => {
                  if (calModalStart && calModal) {
                    setCalDates((prev) => ({ ...prev, [calModal]: { start: calModalStart, finish: calModalFinish } }));
                    setCalModal(null);
                  }
                }} style={{ flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, color: '#fff', background: calModalStart ? '#3F51B5' : '#DCDFE6', border: 'none', cursor: 'pointer' }}>
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
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
    </>
  );
};

export default EventFormSchedule;
