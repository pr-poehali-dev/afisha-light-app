import React, { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Label, section, UPLOAD_URL } from './EventFormShared';

interface Props {
  image: string;
  uploading: boolean;
  uploadError: string;
  groupId?: number;
  vkToken?: string | null;
  onImageChange: (url: string) => void;
  onUploadingChange: (v: boolean) => void;
  onUploadErrorChange: (msg: string) => void;
  onVkCoverIdChange?: (id: string) => void;
}

const EventFormCover = ({ image, uploading, uploadError, groupId, vkToken, onImageChange, onUploadingChange, onUploadErrorChange, onVkCoverIdChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { onUploadErrorChange('Файл слишком большой. Максимум 5 МБ'); return; }
    onUploadingChange(true); onUploadErrorChange('');
    const token = vkToken;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      onImageChange(base64);
      try {
        const payload: Record<string, unknown> = { image: base64 };
        if (groupId && token) { payload.group_id = groupId; payload.vk_token = token; }
        console.log('[upload] groupId:', groupId, 'hasToken:', !!token, 'payload keys:', Object.keys(payload));
        const res = await fetch(UPLOAD_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        console.log('[upload] response:', data);
        if (data.url) { onImageChange(data.url); if (data.vk_cover_id) onVkCoverIdChange?.(data.vk_cover_id); }
        else onUploadErrorChange('Ошибка загрузки');
      } catch { onUploadErrorChange('Ошибка сети'); }
      finally { onUploadingChange(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
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
              <button onClick={() => { onImageChange(''); if (fileRef.current) fileRef.current.value = ''; }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#fff', background: 'rgba(220,0,0,0.6)', border: 'none', cursor: 'pointer', borderRadius: 8 }}>
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
  );
};

export default EventFormCover;