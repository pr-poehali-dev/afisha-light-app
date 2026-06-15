import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import {
  fetchStats, scanSubscribers, importSubscribers,
  sendMailing, exportSubscribersUrl, clearSubscribers,
  type Stats, type Mailing,
} from '@/api/subscribers';
import { getGroupToken } from '@/lib/vk';

interface MailingsProps { groupId: number; }

type SubTab = 'send' | 'base' | 'history';

const section: React.CSSProperties = {
  background: '#fff', border: '1px solid #F0F0F0',
  borderRadius: 16, padding: '16px', marginBottom: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
    {children}
  </div>
);

function fmtDate(s: string) {
  return new Date(s).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  draft:   { label: 'Черновик', bg: '#F3F4F6', color: '#6B7280' },
  sending: { label: 'Отправка…', bg: '#FEF9C3', color: '#A16207' },
  sent:    { label: 'Отправлено', bg: '#D1FAE5', color: '#065F46' },
  error:   { label: 'Ошибка', bg: '#FEE2E2', color: '#B91C1C' },
};

const PageMailings = ({ groupId }: MailingsProps) => {
  const VK_GROUP_ID = groupId;
  const [subTab, setSubTab] = useState<SubTab>('send');
  const [stats, setStats] = useState<Stats | null>(null);
  const [mailings, setMailings] = useState<Mailing[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupToken, setGroupToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Форма рассылки
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; errors: number } | null>(null);

  // База
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ added: number } | null>(null);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ added: number; total: number } | null>(null);
  const [clearing, setClearing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetchStats(VK_GROUP_ID)
      .then((d) => { setStats(d.stats); setMailings(d.mailings); })
      .finally(() => setLoading(false));
  };

  // Получаем токен сообщества автоматически при открытии
  const requestToken = async () => {
    setTokenLoading(true);
    const token = await getGroupToken(VK_GROUP_ID);
    setGroupToken(token);
    setTokenLoading(false);
    return token;
  };

  useEffect(() => {
    load();
    // Автоматически запрашиваем токен
    requestToken();
  }, []);

  const ensureToken = async (): Promise<string | null> => {
    if (groupToken) return groupToken;
    return requestToken();
  };

  const handleScan = async () => {
    const token = await ensureToken();
    if (!token) { alert('Не удалось получить токен сообщества. Попробуйте ещё раз.'); return; }
    setScanning(true); setScanResult(null);
    try {
      const res = await scanSubscribers(VK_GROUP_ID, token);
      if ((res as { error?: string }).error) {
        alert((res as { error: string }).error);
      } else {
        setScanResult(res);
        load();
      }
    } finally { setScanning(false); }
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImporting(true); setImportResult(null);
    const res = await importSubscribers(VK_GROUP_ID, importText);
    setImportResult(res);
    setImportText('');
    load();
    setImporting(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImportText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    const token = await ensureToken();
    if (!token) { alert('Не удалось получить токен сообщества. Попробуйте ещё раз.'); return; }
    setSending(true); setSendResult(null);
    const res = await sendMailing(VK_GROUP_ID, title || 'Рассылка', message, token);
    setSendResult(res);
    setMessage(''); setTitle('');
    load();
    setSending(false);
  };

  const handleClear = async () => {
    if (!confirm('Удалить всю базу подписчиков? Это действие нельзя отменить.')) return;
    setClearing(true);
    await clearSubscribers(VK_GROUP_ID);
    setClearing(false);
    load();
  };

  const TABS: { key: SubTab; label: string; icon: string }[] = [
    { key: 'send', label: 'Рассылка', icon: 'Send' },
    { key: 'base', label: 'База', icon: 'Users' },
    { key: 'history', label: 'История', icon: 'History' },
  ];

  return (
    <div style={{ background: '#F5F5F7', minHeight: '100vh' }}>

      {/* Шапка со статистикой */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '14px 16px' }}>
        {/* Статус токена */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: '#999' }}>База подписчиков</div>
          {tokenLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#999' }}>
              <Icon name="Loader" size={12} /> Получение токена…
            </div>
          ) : groupToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#059669', background: '#D1FAE5', padding: '3px 8px', borderRadius: 6 }}>
              <Icon name="ShieldCheck" size={12} /> Токен получен
            </div>
          ) : (
            <button onClick={requestToken} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF9C3', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
              <Icon name="RefreshCw" size={12} /> Получить токен
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { n: loading ? '…' : (stats?.total ?? 0), l: 'всего', icon: 'Users', color: '#7C3AED', bg: '#EDE9FE' },
            { n: loading ? '…' : (stats?.can_write ?? 0), l: 'получат', icon: 'MessageCircle', color: '#059669', bg: '#D1FAE5' },
          ].map((s) => (
            <div key={s.l} style={{ flex: 1, background: s.bg, borderRadius: 14, padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name={s.icon} size={22} style={{ color: s.color }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: s.color, opacity: 0.7 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Внутренние табы */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '0 8px' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setSubTab(t.key)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '12px 0', fontSize: 13, fontWeight: 700,
            color: subTab === t.key ? '#7C3AED' : '#999',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: subTab === t.key ? '2px solid #7C3AED' : '2px solid transparent',
          }}>
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 12px 24px' }}>

        {/* === РАССЫЛКА === */}
        {subTab === 'send' && (
          <>
            <div style={section}>
              <div style={{ marginBottom: 12 }}>
                <Label>Название рассылки (для истории)</Label>
                <input className="vk-input" placeholder="Анонс концерта" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label>Текст сообщения *</Label>
                <textarea
                  className="vk-input"
                  placeholder="Привет! Приглашаем тебя на наше мероприятие..."
                  value={message}
                  rows={6}
                  style={{ resize: 'none' }}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div style={{ fontSize: 11, color: '#BBB', marginTop: 4 }}>{message.length} / 4096 символов</div>
              </div>

              {sendResult && (
                <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="CheckCircle" size={16} style={{ color: '#059669' }} />
                  <span style={{ fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                    Отправлено: {sendResult.sent} · Ошибок: {sendResult.errors}
                  </span>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={!message.trim() || sending || (stats?.can_write ?? 0) === 0}
                style={{
                  width: '100%', padding: '12px', fontSize: 14, fontWeight: 700,
                  color: '#fff', border: 'none', borderRadius: 12, cursor: message.trim() && !sending ? 'pointer' : 'default',
                  background: message.trim() && !sending ? '#7C3AED' : '#DDD',
                  boxShadow: message.trim() && !sending ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {sending ? (
                  <><Icon name="Loader" size={16} /> Отправка…</>
                ) : (
                  <><Icon name="Send" size={16} /> Отправить {stats?.can_write ? `(${stats.can_write} чел.)` : ''}</>
                )}
              </button>
            </div>

            <div style={{ ...section, background: '#FEF9C3', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="AlertTriangle" size={16} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                  Рассылка идёт только тем, кто разрешил сообщения от сообщества. VK ограничивает скорость: ~10 сообщений/сек. Большие базы могут обрабатываться несколько минут.
                </div>
              </div>
            </div>
          </>
        )}

        {/* === БАЗА === */}
        {subTab === 'base' && (
          <>
            {/* Сканирование */}
            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>Сканировать участников</div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
                Алгоритм обойдёт всех участников сообщества и добавит тех, кому можно писать в ЛС
              </div>
              {scanResult && (
                <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                  ✓ Добавлено / обновлено: {scanResult.added} подписчиков
                </div>
              )}
              <button onClick={handleScan} disabled={scanning} style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12, cursor: scanning ? 'default' : 'pointer',
                background: scanning ? '#DDD' : '#7C3AED', color: '#fff',
                boxShadow: scanning ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Icon name={scanning ? 'Loader' : 'ScanLine'} size={16} />
                {scanning ? 'Сканирование…' : 'Запустить сканирование'}
              </button>
            </div>

            {/* Импорт */}
            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>Импорт базы</div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
                Загрузи .txt файл или вставь ID через запятую или по одному на строку
              </div>
              <input ref={fileRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFileImport} />
              <button onClick={() => fileRef.current?.click()} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '9px', marginBottom: 10, fontSize: 13, fontWeight: 600,
                color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 10, cursor: 'pointer',
              }}>
                <Icon name="Upload" size={14} /> Загрузить .txt файл
              </button>
              <textarea
                className="vk-input"
                placeholder={'123456789\n987654321\n...'}
                value={importText}
                rows={4}
                style={{ resize: 'none', marginBottom: 10, fontFamily: 'monospace', fontSize: 13 }}
                onChange={(e) => setImportText(e.target.value)}
              />
              {importResult && (
                <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#065F46', fontWeight: 600 }}>
                  ✓ Добавлено {importResult.added} из {importResult.total}
                </div>
              )}
              <button onClick={handleImport} disabled={!importText.trim() || importing} style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12,
                cursor: importText.trim() && !importing ? 'pointer' : 'default',
                background: importText.trim() && !importing ? '#7C3AED' : '#DDD', color: '#fff',
              }}>
                {importing ? 'Импорт…' : 'Импортировать'}
              </button>
            </div>

            {/* Экспорт */}
            <div style={section}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 4 }}>Экспорт базы</div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>
                Скачать список ID всех подписчиков в формате .txt
              </div>
              <a href={exportSubscribersUrl(VK_GROUP_ID)} download="subscribers.txt" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px', fontSize: 14, fontWeight: 700,
                color: '#7C3AED', background: '#EDE9FE', border: 'none', borderRadius: 12,
                textDecoration: 'none', cursor: 'pointer',
              }}>
                <Icon name="Download" size={16} /> Скачать subscribers.txt
              </a>
            </div>

            {/* Очистка */}
            <div style={{ ...section, border: '1px solid #FEE2E2' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#B91C1C', marginBottom: 4 }}>Очистить базу</div>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>Удалить всех подписчиков из базы. Действие нельзя отменить.</div>
              <button onClick={handleClear} disabled={clearing} style={{
                width: '100%', padding: '11px', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 12,
                cursor: clearing ? 'default' : 'pointer',
                background: clearing ? '#DDD' : '#FEE2E2', color: '#B91C1C',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <Icon name="Trash2" size={16} /> {clearing ? 'Удаление…' : 'Очистить базу'}
              </button>
            </div>
          </>
        )}

        {/* === ИСТОРИЯ === */}
        {subTab === 'history' && (
          <>
            {mailings.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}>
                <Icon name="History" size={40} style={{ color: '#DDD', marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: '#999', margin: 0 }}>Рассылок пока не было</p>
              </div>
            ) : (
              mailings.map((m) => {
                const st = STATUS_MAP[m.status] ?? STATUS_MAP.draft;
                return (
                  <div key={m.id} style={section}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{m.title || 'Рассылка'}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: st.bg, color: st.color, borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>{st.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.5, background: '#F9F9F9', borderRadius: 8, padding: '8px 10px' }}>
                      {m.message.length > 120 ? m.message.slice(0, 120) + '…' : m.message}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999' }}>
                      {m.sent_at && <span><Icon name="Send" size={11} style={{ display: 'inline', marginRight: 3 }} />{fmtDate(m.sent_at)}</span>}
                      {m.sent_count > 0 && <span style={{ color: '#059669', fontWeight: 600 }}>✓ {m.sent_count}</span>}
                      {m.error_count > 0 && <span style={{ color: '#DC2626', fontWeight: 600 }}>✗ {m.error_count}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PageMailings;