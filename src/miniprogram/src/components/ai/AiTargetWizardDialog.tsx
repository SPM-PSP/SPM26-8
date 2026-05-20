import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Dialog } from '@nutui/nutui-react-taro';
import {
  isAiConfigured,
  nextTargetWizardTurn,
  TargetDraft,
  TargetWizardChatMessage,
  TargetWizardQuestion,
  SuggestedTargetTodo,
} from '../../services/ai';

export interface TargetWizardResult {
  target: TargetDraft;
  todos: SuggestedTargetTodo[];
  syncTodos: boolean;
}

interface AiTargetWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: TargetWizardResult) => void;
}

export function AiTargetWizardDialog({
  open,
  onOpenChange,
  onApply,
}: AiTargetWizardDialogProps) {
  const [messages, setMessages] = useState<TargetWizardChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TargetWizardQuestion | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [reviewDraft, setReviewDraft] = useState<TargetDraft | null>(null);
  const [suggestedTodos, setSuggestedTodos] = useState<SuggestedTargetTodo[]>([]);
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(new Set());
  const [syncTodos, setSyncTodos] = useState(true);
  const [phase, setPhase] = useState<'chat' | 'review'>('chat');

  const reset = () => {
    setMessages([]);
    setInput('');
    setLoading(false);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    setReviewDraft(null);
    setSuggestedTodos([]);
    setSelectedTodoIds(new Set());
    setSyncTodos(true);
    setPhase('chat');
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const runTurn = async (
    userText: string,
    optionLabels: string[],
    nextMessages: TargetWizardChatMessage[]
  ) => {
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedOptions([]);
    try {
      const turn = await nextTargetWizardTurn(
        nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant'),
        userText,
        optionLabels
      );

      const assistantMsg: TargetWizardChatMessage = {
        role: 'assistant',
        content: turn.message,
      };
      setMessages([...nextMessages, assistantMsg]);

      if (turn.status === 'ready' && turn.draft) {
        setReviewDraft(turn.draft);
        const todos = turn.suggestedTodos || [];
        setSuggestedTodos(todos);
        setSelectedTodoIds(new Set(todos.map((t) => t.id)));
        setSyncTodos(turn.syncTodosRecommended ?? todos.length > 0);
        setPhase('review');
      } else if (turn.question) {
        setCurrentQuestion(turn.question);
        setPhase('chat');
      }
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : '对话失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async () => {
    const text = input.trim();
    if (!text && selectedOptions.length === 0) return;
    if (loading) return;

    const display = text + (selectedOptions.length ? `（已选：${selectedOptions.join('、')}）` : '');
    const userMsg: TargetWizardChatMessage = { role: 'user', content: display || text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    const labels = [...selectedOptions];
    await runTurn(text, labels, nextMessages);
  };

  const handleSubmitOptions = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'multi' && selectedOptions.length === 0) {
      Taro.showToast({ title: '请至少选择一项', icon: 'none' });
      return;
    }
    if (currentQuestion.type === 'single' && selectedOptions.length === 0) {
      Taro.showToast({ title: '请选择一项', icon: 'none' });
      return;
    }
    const label = currentQuestion.type === 'single' ? selectedOptions[0] : selectedOptions.join('、');
    const userMsg: TargetWizardChatMessage = { role: 'user', content: label };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    await runTurn('', selectedOptions, nextMessages);
  };

  const toggleOption = (label: string, type: TargetWizardQuestion['type']) => {
    if (type === 'single') {
      setSelectedOptions([label]);
      return;
    }
    setSelectedOptions((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleApply = () => {
    if (!reviewDraft?.title.trim()) {
      Taro.showToast({ title: '请填写目标标题', icon: 'none' });
      return;
    }
    const todos = suggestedTodos.filter((t) => selectedTodoIds.has(t.id));
    onApply({
      target: { ...reviewDraft, title: reviewDraft.title.trim() },
      todos,
      syncTodos: syncTodos && todos.length > 0,
    });
    onOpenChange(false);
    Taro.showToast({
      title: syncTodos && todos.length > 0 ? '已填入表单，保存时将同步创建任务' : '已填入目标表单',
      icon: 'success',
    });
  };

  const weightLabels = ['很低', '较低', '中等', '较高', '很高'];

  return (
    <Dialog visible={open} title=""
      onCancel={() => onOpenChange(false)}
      cancelText="关闭"
      style={{ borderRadius: '24rpx' }}
    >
      <View style={{ maxHeight: '60vh' }}>
        <View style={{ marginBottom: '12rpx' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '4rpx' }}>
            <Text style={{ fontSize: '28rpx' }}>✨</Text>
            <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#4a4a4a' }}>AI 目标规划助手</Text>
          </View>
          <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
            多轮对话补全目标细节 · {isAiConfigured() ? 'AI 已连接' : '演示模式'}
          </Text>
        </View>

        {phase === 'chat' && (
          <>
            <ScrollView scrollY style={{ maxHeight: '400rpx', marginBottom: '12rpx' }}>
              {messages.length === 0 && (
                <View style={{ backgroundColor: '#fff', borderRadius: '16rpx', padding: '20rpx', marginBottom: '8rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>
                    例如：我想计划一个月的健身目标，从 140 瘦到 125…
                  </Text>
                </View>
              )}
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={{
                    borderRadius: '16rpx', padding: '16rpx 20rpx', marginBottom: '8rpx',
                    maxWidth: '90%', whiteSpace: 'pre-wrap',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    marginLeft: m.role === 'user' ? 'auto' : '0',
                    background: m.role === 'user'
                      ? 'linear-gradient(135deg, #d4726f, #e9b893)'
                      : '#fff',
                    color: m.role === 'user' ? '#fff' : '#4a4a4a',
                    boxShadow: m.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <Text style={{ color: 'inherit', fontSize: '26rpx' }}>{m.content}</Text>
                </View>
              ))}
              {loading && (
                <Text style={{ fontSize: '24rpx', color: '#8b8680', display: 'block', padding: '8rpx' }}>
                  思考中…
                </Text>
              )}
            </ScrollView>

            {currentQuestion?.type === 'text' && !loading && (
              <Text style={{ fontSize: '24rpx', color: '#8b8680', marginBottom: '8rpx', display: 'block' }}>
                {currentQuestion.label}
              </Text>
            )}

            {currentQuestion &&
              (currentQuestion.type === 'single' || currentQuestion.type === 'multi') &&
              !loading && (
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx', marginBottom: '16rpx' }}>
                  {currentQuestion.options?.map((opt) => {
                    const active = selectedOptions.includes(opt.label);
                    return (
                      <View
                        key={opt.id}
                        onClick={() => toggleOption(opt.label, currentQuestion.type)}
                        style={{
                          padding: '12rpx 24rpx', borderRadius: '40rpx',
                          backgroundColor: active ? '#88a096' : '#f0f0f0',
                          color: active ? '#fff' : '#4a4a4a',
                        }}
                      >
                        <Text style={{ color: 'inherit', fontSize: '24rpx' }}>{opt.label}</Text>
                      </View>
                    );
                  })}
                  <View
                    onClick={handleSubmitOptions}
                    style={{
                      padding: '12rpx 24rpx', borderRadius: '40rpx',
                      backgroundColor: '#d4726f',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: '24rpx' }}>确认选择</Text>
                  </View>
                </View>
              )}

            <View style={{ display: 'flex', gap: '12rpx' }}>
              <View style={{
                flex: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
                padding: '16rpx 20rpx', backgroundColor: '#f5f1ed',
              }}>
                <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={input}
                  onInput={(e) => setInput(e.detail.value)}
                  placeholder={currentQuestion?.placeholder || '描述你的目标或回答问题…'}
                  placeholderStyle="color: #ccc"
                  disabled={loading}
                />
              </View>
              <View
                onClick={handleSendText}
                style={{
                  width: '88rpx', height: '88rpx', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4726f, #e9b893)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: loading || (!input.trim() && selectedOptions.length === 0) ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                <Text style={{ color: '#fff', fontSize: '32rpx' }}>➤</Text>
              </View>
            </View>
          </>
        )}

        {phase === 'review' && reviewDraft && (
          <View>
            <View style={{ backgroundColor: '#fff', borderRadius: '20rpx', padding: '24rpx', marginBottom: '16rpx' }}>
              <View style={{ marginBottom: '20rpx' }}>
                <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>目标标题 *</Text>
                <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx', backgroundColor: '#f5f1ed' }}>
                  <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                    value={reviewDraft.title}
                    onInput={(e) => setReviewDraft((d) => d && { ...d, title: e.detail.value })}
                    placeholder="目标标题" placeholderStyle="color: #ccc" />
                </View>
              </View>
              <View style={{ marginBottom: '20rpx' }}>
                <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>目标描述</Text>
                <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx', backgroundColor: '#f5f1ed' }}>
                  <textarea style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a', minHeight: '120rpx' }}
                    value={reviewDraft.desc}
                    onInput={(e) => setReviewDraft((d) => d && { ...d, desc: e.detail.value })}
                    placeholder="目标描述" placeholderStyle="color: #ccc; font-size: 26rpx" />
                </View>
              </View>
              <View style={{ display: 'flex', gap: '12rpx', marginBottom: '20rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>开始</Text>
                  <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx', backgroundColor: '#f5f1ed' }}>
                    <input style={{ width: '100%', fontSize: '24rpx', color: '#4a4a4a' }}
                      value={reviewDraft.beginTime}
                      onInput={(e) => setReviewDraft((d) => d && { ...d, beginTime: e.detail.value })}
                      placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '26rpx', color: '#4a4a4a', marginBottom: '12rpx', display: 'block' }}>结束</Text>
                  <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12rpx', padding: '16rpx', backgroundColor: '#f5f1ed' }}>
                    <input style={{ width: '100%', fontSize: '24rpx', color: '#4a4a4a' }}
                      value={reviewDraft.endTime}
                      onInput={(e) => setReviewDraft((d) => d && { ...d, endTime: e.detail.value })}
                      placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
                  </View>
                </View>
              </View>
              <View>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12rpx' }}>
                  <Text style={{ fontSize: '26rpx', color: '#4a4a4a' }}>权重</Text>
                  <Text style={{ fontSize: '24rpx', color: '#8b8680' }}>{weightLabels[reviewDraft.weight - 1]}</Text>
                </View>
                <View style={{ display: 'flex', gap: '8rpx' }}>
                  {[1, 2, 3, 4, 5].map((w) => (
                    <View
                      key={w}
                      onClick={() => setReviewDraft((d) => d && { ...d, weight: w })}
                      style={{
                        flex: 1, height: '56rpx', borderRadius: '12rpx',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: w <= reviewDraft.weight ? '#d4726f' : '#f0f0f0',
                        color: w <= reviewDraft.weight ? '#fff' : '#8b8680',
                        fontSize: '24rpx', fontWeight: w <= reviewDraft.weight ? 600 : 400,
                      }}
                    >
                      <Text style={{ color: 'inherit', fontSize: '24rpx' }}>{w}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {suggestedTodos.length > 0 && (
              <View style={{ backgroundColor: '#fff', borderRadius: '20rpx', padding: '24rpx', marginBottom: '16rpx' }}>
                <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4a4a4a', marginBottom: '4rpx', display: 'block' }}>
                  建议同步到任务栏
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#8b8680', marginBottom: '16rpx', display: 'block' }}>
                  这些是达成目标的具体行动，勾选后将在保存目标时一并创建
                </Text>
                {suggestedTodos.map((todo) => (
                  <View
                    key={todo.id}
                    onClick={() => {
                      setSelectedTodoIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(todo.id)) next.delete(todo.id);
                        else next.add(todo.id);
                        return next;
                      });
                    }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12rpx',
                      padding: '16rpx', marginBottom: '8rpx', borderRadius: '16rpx',
                      backgroundColor: '#f8f8f6',
                    }}
                  >
                    <View style={{
                      width: '32rpx', height: '32rpx', borderRadius: '50%',
                      border: `2px solid ${selectedTodoIds.has(todo.id) ? '#88a096' : '#ccc'}`,
                      backgroundColor: selectedTodoIds.has(todo.id) ? '#88a096' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: '2rpx',
                    }}>
                      {selectedTodoIds.has(todo.id) && <Text style={{ color: '#fff', fontSize: '18rpx' }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: '26rpx', color: '#4a4a4a' }}>{todo.title}</Text>
                      {todo.desc && (
                        <Text style={{ fontSize: '22rpx', color: '#8b8680', marginTop: '4rpx' }}>{todo.desc}</Text>
                      )}
                    </View>
                  </View>
                ))}
                <View
                  onClick={() => setSyncTodos(!syncTodos)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '12rpx' }}
                >
                  <View style={{
                    width: '32rpx', height: '32rpx', borderRadius: '50%',
                    border: `2px solid ${syncTodos ? '#88a096' : '#ccc'}`,
                    backgroundColor: syncTodos ? '#88a096' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {syncTodos && <Text style={{ color: '#fff', fontSize: '18rpx' }}>✓</Text>}
                  </View>
                  <Text style={{ fontSize: '24rpx', color: '#4a4a4a' }}>保存目标时同步创建所选任务</Text>
                </View>
              </View>
            )}

            <View
              onClick={handleApply}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '24rpx', borderRadius: '40rpx',
                background: 'linear-gradient(135deg, #88a096, #7a9188)',
                textAlign: 'center', marginBottom: '12rpx',
              }}
            >
              <Text style={{ color: '#fff', fontSize: '28rpx' }}>✓ 填入表单</Text>
            </View>
            <View
              onClick={() => setPhase('chat')}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '16rpx', borderRadius: '40rpx',
                border: '1px solid #ccc', textAlign: 'center',
              }}
            >
              <Text style={{ color: '#8b8680', fontSize: '26rpx' }}>返回继续对话</Text>
            </View>
          </View>
        )}
      </View>
    </Dialog>
  );
}
