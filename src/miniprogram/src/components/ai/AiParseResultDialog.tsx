import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Dialog } from '@nutui/nutui-react-taro';
import { ParsedTodoDraft } from '../../services/ai';
import { Todo } from '../../types';

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];
const LEVELS: { value: Todo['level']; label: string }[] = [
  { value: 'urgent-important', label: '重要且紧急' },
  { value: 'urgent-not-important', label: '紧急但不重要' },
  { value: 'not-urgent-important', label: '重要但不紧急' },
  { value: 'not-urgent-not-important', label: '不重要不紧急' },
];

export interface EditableParseDraft {
  title: string;
  desc: string;
  level: Todo['level'];
  category: string;
  endTime: string;
}

function isoToDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toEditable(draft: ParsedTodoDraft): EditableParseDraft {
  return {
    title: draft.title,
    desc: draft.desc || '',
    level: draft.level,
    category: draft.category || '',
    endTime: isoToDatetimeLocal(draft.endTime),
  };
}

interface AiParseResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ParsedTodoDraft | null;
  onApply: (values: EditableParseDraft) => void;
}

export function AiParseResultDialog({
  open,
  onOpenChange,
  draft,
  onApply,
}: AiParseResultDialogProps) {
  const [form, setForm] = useState<EditableParseDraft>({
    title: '', desc: '', level: 'not-urgent-important', category: '', endTime: '',
  });

  useEffect(() => {
    if (draft && open) {
      setForm(toEditable(draft));
    }
  }, [draft, open]);

  const handleApply = () => {
    if (!form.title.trim()) {
      Taro.showToast({ title: '请填写任务标题', icon: 'none' });
      return;
    }
    onApply({ ...form, title: form.title.trim(), desc: form.desc.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog visible={open} title="解析结果" confirmText="填入表单" cancelText="取消"
      onConfirm={handleApply} onCancel={() => onOpenChange(false)}
    >
      <View style={{ padding: '12rpx 0' }}>
        <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '20rpx', display: 'block' }}>
          请确认或修改以下内容，再填入下方表单
        </Text>

        <View style={{ marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>任务标题 *</Text>
          <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx 20rpx', backgroundColor: '#f5f1ed' }}>
            <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
              value={form.title} onInput={(e) => setForm((f) => ({ ...f, title: e.detail.value }))}
              placeholder="任务标题" placeholderStyle="color: #ccc" />
          </View>
        </View>

        <View style={{ marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>任务说明</Text>
          <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx 20rpx', backgroundColor: '#f5f1ed' }}>
            <textarea style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a', minHeight: '100rpx' }}
              value={form.desc} onInput={(e) => setForm((f) => ({ ...f, desc: e.detail.value }))}
              placeholder="任务说明" placeholderStyle="color: #ccc; font-size: 26rpx" />
          </View>
        </View>

        <View style={{ marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>优先级（四象限）</Text>
          {LEVELS.map((l) => (
            <View
              key={l.value}
              onClick={() => setForm((f) => ({ ...f, level: l.value }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '12rpx',
                padding: '16rpx 20rpx', marginBottom: '8rpx', borderRadius: '12rpx',
                backgroundColor: form.level === l.value ? '#fef0ef' : '#f8f8f6',
              }}
            >
              <View style={{
                width: '32rpx', height: '32rpx', borderRadius: '50%',
                border: `2px solid ${form.level === l.value ? '#d4726f' : '#ccc'}`,
                backgroundColor: form.level === l.value ? '#d4726f' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.level === l.value && <Text style={{ color: '#fff', fontSize: '18rpx' }}>✓</Text>}
              </View>
              <Text style={{ fontSize: '26rpx', color: '#4a4a4a' }}>{l.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginBottom: '20rpx' }}>
          <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>分类</Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
            {CATEGORIES.map((cat) => (
              <View
                key={cat}
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                style={{
                  padding: '12rpx 24rpx', borderRadius: '40rpx',
                  backgroundColor: form.category === cat ? '#88a096' : '#f0f0f0',
                  color: form.category === cat ? '#fff' : '#8b8680',
                }}
              >
                <Text style={{ color: 'inherit', fontSize: '24rpx' }}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>截止时间</Text>
          <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx 20rpx', backgroundColor: '#f5f1ed' }}>
            <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
              value={form.endTime} onInput={(e) => setForm((f) => ({ ...f, endTime: e.detail.value }))}
              placeholder="yyyy-MM-ddTHH:mm" placeholderStyle="color: #ccc" />
          </View>
        </View>
      </View>
    </Dialog>
  );
}
