import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Dialog } from '@nutui/nutui-react-taro';
import { parseTodoFromText, ParsedTodoDraft, isAiConfigured } from '../../services/ai';
import { Todo } from '../../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const LEVEL_LABELS: Record<Todo['level'], string> = {
  'urgent-important': '重要紧急',
  'urgent-not-important': '紧急不重要',
  'not-urgent-important': '重要不紧急',
  'not-urgent-not-important': '不重要不紧急',
};

interface SmartInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (draft: ParsedTodoDraft) => void;
}

export function SmartInputSheet({ open, onOpenChange, onConfirm }: SmartInputSheetProps) {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [draft, setDraft] = useState<ParsedTodoDraft | null>(null);

  useEffect(() => {
    if (!open) {
      setText('');
      setDraft(null);
      setParsing(false);
    }
  }, [open]);

  const handleParse = async () => {
    if (!text.trim()) {
      Taro.showToast({ title: '请输入任务内容', icon: 'none' });
      return;
    }
    setParsing(true);
    setDraft(null);
    try {
      const result = await parseTodoFromText(text.trim());
      setDraft(result);
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : '解析失败', icon: 'none' });
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    if (!draft) return;
    onConfirm(draft);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog visible title=""
      onCancel={() => onOpenChange(false)}
      cancelText="关闭"
      style={{ borderRadius: '24rpx' }}
    >
      <View>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '16rpx' }}>
          <Text style={{ fontSize: '28rpx' }}>✨</Text>
          <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>
            灵动输入 · {isAiConfigured() ? 'AI 已连接' : '演示模式'}
          </Text>
        </View>

        <View style={{ position: 'relative', marginBottom: '16rpx' }}>
          <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '16rpx', backgroundColor: '#f5f1ed' }}>
            <textarea
              style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a', minHeight: '160rpx' }}
              value={text}
              onInput={(e) => { setText(e.detail.value); setDraft(null); }}
              placeholder="像 Spotlight 一样输入：明天下午三点交软件工程报告..."
              placeholderStyle="color: #ccc; font-size: 26rpx"
            />
          </View>
          <View style={{ position: 'absolute', right: '12rpx', bottom: '12rpx' }}>
            <View style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              backgroundColor: '#f5f1ed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: '28rpx' }}>🎤</Text>
            </View>
          </View>
        </View>

        <View
          onClick={handleParse}
          style={{
            width: '100%', padding: '20rpx', borderRadius: '40rpx',
            background: 'linear-gradient(135deg, #d4726f, #e9b893)',
            textAlign: 'center', marginBottom: '16rpx',
            opacity: parsing || !text.trim() ? 0.5 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontSize: '28rpx' }}>
            {parsing ? 'AI 解析中...' : '✨ 智能解析'}
          </Text>
        </View>

        {draft && (
          <View>
            <View style={{
              backgroundColor: '#fff', borderRadius: '20rpx', padding: '24rpx',
              border: '1px solid #e8e4e0', marginBottom: '16rpx',
            }}>
              <Text style={{ fontWeight: 500, fontSize: '28rpx', color: '#4a4a4a', marginBottom: '8rpx', display: 'block' }}>
                {draft.title}
              </Text>
              {draft.desc && (
                <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '12rpx', lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {draft.desc}
                </Text>
              )}
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8rpx' }}>
                {draft.endTime && (
                  <Text style={{
                    fontSize: '20rpx', backgroundColor: '#f5f1ed', color: '#4a4a4a',
                    padding: '4rpx 16rpx', borderRadius: '20rpx',
                  }}>
                    截止：{format(new Date(draft.endTime), 'M月d日 HH:mm', { locale: zhCN })}
                  </Text>
                )}
                <Text style={{
                  fontSize: '20rpx', backgroundColor: '#fef0ef', color: '#d4726f',
                  padding: '4rpx 16rpx', borderRadius: '20rpx',
                }}>
                  优先级：{draft.priorityLabel || LEVEL_LABELS[draft.level]}
                </Text>
                <Text style={{
                  fontSize: '20rpx', backgroundColor: '#f0f5f3', color: '#88a096',
                  padding: '4rpx 16rpx', borderRadius: '20rpx',
                }}>
                  {draft.category} · {LEVEL_LABELS[draft.level]}
                </Text>
              </View>
            </View>

            <View
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '20rpx', borderRadius: '40rpx',
                backgroundColor: '#88a096', textAlign: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>确认并加入任务列表</Text>
            </View>
          </View>
        )}
      </View>
    </Dialog>
  );
}
