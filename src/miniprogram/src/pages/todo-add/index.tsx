import { useState, useEffect, useRef } from 'react';
import { View, Text, Picker as TaroPicker, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { PageHeader } from '../../components/PageHeader';
import { useTodos } from '../../hooks/useTodos';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { Todo } from '../../types';
import { isAiConfigured, parseTodoFromText, ParsedTodoDraft } from '../../services/ai';
import { todoTimeForInput } from '../../utils/typeMapper';

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];
const LEVELS: { value: Todo['level']; label: string }[] = [
  { value: 'urgent-important', label: '重要且紧急' },
  { value: 'urgent-not-important', label: '紧急但不重要' },
  { value: 'not-urgent-important', label: '重要但不紧急' },
  { value: 'not-urgent-not-important', label: '不重要不紧急' },
];

export default function AddTodo() {
  const router = useRouter();
  const id = router.params.id;
  const isEdit = !!id;

  const { addTodo, updateTodo, deleteTodo, getTodo } = useTodos();
  const { targets } = useTargets();
  const { plans } = usePlans();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [level, setLevel] = useState<Todo['level']>('not-urgent-important');
  const [category, setCategory] = useState('');
  const [beginTime, setBeginTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [targetId, setTargetId] = useState('');
  const [planId, setPlanId] = useState('');
  const [isContinuous, setIsContinuous] = useState(false);
  const [summury, setSummury] = useState('');
  const [completed, setCompleted] = useState(false);

  const [aiText, setAiText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);

  const formLoaded = useRef(false);

  useEffect(() => {
    if (isEdit && id) {
      if (formLoaded.current) return;
      const todo = getTodo(id);
      if (todo) {
        setTitle(todo.title);
        setDesc(todo.desc);
        setLevel(todo.level);
        setCategory(todo.category || '');
        setBeginTime(todoTimeForInput(todo.beginTime) || '');
        setEndTime(todoTimeForInput(todo.endTime) || '');
        setTargetId(todo.targetId || '');
        setPlanId(todo.planId || '');
        setIsContinuous(todo.isContinuous);
        setSummury(todo.summury || '');
        setCompleted(todo.completed);
        formLoaded.current = true;
      }
      return;
    }

    try {
      const raw = Taro.getStorageSync('smartInputDraft');
      if (raw) {
        const draft: ParsedTodoDraft = JSON.parse(raw);
        setTitle(draft.title);
        if (draft.desc) setDesc(draft.desc);
        setLevel(draft.level);
        if (draft.category) setCategory(draft.category);
        if (draft.endTime) setEndTime(todoTimeForInput(draft.endTime) || draft.endTime);
        Taro.removeStorageSync('smartInputDraft');
      }
    } catch { /* ignore */ }
  }, [id, isEdit, getTodo]);

  const handleAiParse = async () => {
    if (!aiText.trim()) {
      Taro.showToast({ title: '请输入要解析的任务描述', icon: 'none' });
      return;
    }
    setAiParsing(true);
    try {
      const draft = await parseTodoFromText(aiText.trim());
      setTitle(draft.title);
      if (draft.desc) setDesc(draft.desc);
      setLevel(draft.level);
      if (draft.category) setCategory(draft.category);
      if (draft.endTime) setEndTime(todoTimeForInput(draft.endTime) || draft.endTime);
      Taro.showToast({ title: '已填入表单，可继续编辑后保存', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: e instanceof Error ? e.message : '解析失败', icon: 'none' });
    } finally {
      setAiParsing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }
    if (beginTime && endTime && new Date(endTime) < new Date(beginTime)) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' });
      return;
    }

    const todoData = {
      title, desc, level,
      category: category || undefined,
      beginTime: beginTime || undefined,
      endTime: endTime || undefined,
      targetId: targetId || undefined,
      planId: planId || undefined,
      isContinuous, summury: summury || undefined, completed,
    };

    if (isEdit && id) {
      await updateTodo(id, todoData);
    } else {
      await addTodo(todoData);
    }
    Taro.navigateBack();
  };

  const handleDelete = () => {
    if (!id) return;
    Taro.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          deleteTodo(id);
          Taro.showToast({ title: '任务已删除', icon: 'success' });
          Taro.navigateBack();
        }
      },
    });
  };

  const levelIndex = LEVELS.findIndex(l => l.value === level);
  const categoryIndex = category ? CATEGORIES.indexOf(category) + 1 : 0;
  const targetIndex = targetId ? targets.findIndex(t => t.id === targetId) + 1 : 0;
  const planIndex = planId ? plans.findIndex(p => p.id === planId) + 1 : 0;

  const levelLabel = levelIndex >= 0 ? LEVELS[levelIndex].label : '选择优先级';
  const categoryLabel = category || '未分类';
  const targetLabel = targetId ? targets.find(t => t.id === targetId)?.title || '目标' : '无';
  const planLabel = planId ? plans.find(p => p.id === planId)?.title || '计划' : '无';

  const pickerContainer = {
    border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
    padding: '20rpx', backgroundColor: '#f5f1ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  };

  const todayStr = (() => { const d = new Date(); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'); })();

  const dtSep = (dt: string) => dt.includes('T') ? 'T' : dt.includes(' ') ? ' ' : '';
  const dtDate = (dt: string) => dt ? dt.split(/[T ]/)[0] : '';
  const dtTime = (dt: string) => { const p = dt.split(/[T ]/); return p.length > 1 ? p[1].slice(0, 5) : ''; };
  const dtJoin = (date: string, time: string) => time ? `${date}T${time}` : date;
  const dtDisplay = (dt: string) => dt ? dt.replace(/[T ]/, '  ') : '';

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '40rpx' }}>
      <PageHeader
        title={isEdit ? '编辑任务' : '新增任务'}
        showBack
        rightElement={isEdit ? (
          <Text style={{ color: '#d4726f', fontSize: '28rpx' }} onClick={handleDelete}>删除</Text>
        ) : undefined}
      />

      <View style={{ padding: '24rpx 36rpx' }}>
        {/* AI 智能解析 */}
        {!isEdit && (
          <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '24rpx', color: '#d4726f' }}>✨</Text>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4a4a4a' }}>AI 智能解析（可选）</Text>
              <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>{isAiConfigured() ? '已连接' : '演示模式'}</Text>
            </View>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed', marginBottom: '16rpx' }}>
              <Input
                style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                value={aiText}
                onInput={(e) => setAiText(e.detail.value)}
                placeholder="例如：明天下午三点前完成软件工程报告，比较重要..."
                placeholderStyle="color: #ccc; font-size: 26rpx"
              />
            </View>
            <View
              onClick={handleAiParse}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '20rpx', borderRadius: '40rpx',
                border: '1px solid rgba(212,114,111,0.3)', textAlign: 'center',
                opacity: aiParsing || !aiText.trim() ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#d4726f', fontSize: '26rpx' }}>
                {aiParsing ? '解析中...' : '✨ 智能解析'}
              </Text>
            </View>
            <Text style={{ fontSize: '22rpx', color: '#8b8680', marginTop: '12rpx', display: 'block' }}>
              解析后直接填入下方表单，可继续编辑后保存。
            </Text>
          </View>
        )}

        {/* 基本信息 */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>任务标题 *</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <Input
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                placeholder="输入任务标题"
                placeholderStyle="color: #ccc"
              />
            </View>
          </View>
          <View>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>任务说明</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <Input
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={desc}
                onInput={(e) => setDesc(e.detail.value)}
                placeholder="描述任务详情..."
                placeholderStyle="color: #ccc; font-size: 28rpx"
              />
            </View>
          </View>
        </View>

        {/* 优先级和分类 */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>优先级（四象限）</Text>
            <TaroPicker mode='selector' range={LEVELS.map(l => l.label)} value={levelIndex >= 0 ? levelIndex : 2}
              onChange={(e) => setLevel(LEVELS[Number(e.detail.value)].value)}>
              <View style={pickerContainer}>
                <Text style={{ color: '#4a4a4a', fontSize: '28rpx' }}>{levelLabel}</Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>
          <View>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>分类</Text>
            <TaroPicker mode='selector' range={['未分类', ...CATEGORIES]} value={categoryIndex}
              onChange={(e) => { const v = Number(e.detail.value); setCategory(v === 0 ? '' : CATEGORIES[v - 1]); }}>
              <View style={pickerContainer}>
                <Text style={{ color: category ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>{categoryLabel}</Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>
        </View>

        {/* 时间、关联 */}
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {/* 开始时间 */}
          <View style={{ marginBottom: '24rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>开始时间</Text>
            <View style={{ display: 'flex', gap: '16rpx' }}>
              <View style={{ flex: 1 }}>
                <TaroPicker
                  mode="date"
                  value={dtDate(beginTime) || todayStr}
                  onChange={(e) => setBeginTime(dtJoin(e.detail.value as string, dtTime(beginTime)))}
                >
                  <View style={pickerContainer}>
                    <Text style={{ color: beginTime ? '#4a4a4a' : '#ccc', fontSize: '26rpx' }}>
                      {dtDate(beginTime) || '选择日期'}
                    </Text>
                    <Text style={{ color: '#8b8680' }}>&#9662;</Text>
                  </View>
                </TaroPicker>
              </View>
              <View style={{ flex: 1 }}>
                <TaroPicker
                  mode="time"
                  value={dtTime(beginTime) || '00:00'}
                  onChange={(e) => setBeginTime(dtJoin(dtDate(beginTime) || todayStr, e.detail.value as string))}
                >
                  <View style={pickerContainer}>
                    <Text style={{ color: dtTime(beginTime) ? '#4a4a4a' : '#ccc', fontSize: '26rpx' }}>
                      {dtTime(beginTime) || '选择时间'}
                    </Text>
                    <Text style={{ color: '#8b8680' }}>&#9662;</Text>
                  </View>
                </TaroPicker>
              </View>
            </View>
            {beginTime ? (
              <Text style={{ fontSize: '22rpx', color: '#d4726f', marginTop: '8rpx', display: 'block' }}>
                已选：{dtDisplay(beginTime)}
              </Text>
            ) : null}
          </View>

          {/* 结束时间 */}
          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>结束时间</Text>
            <View style={{ display: 'flex', gap: '16rpx' }}>
              <View style={{ flex: 1 }}>
                <TaroPicker
                  mode="date"
                  value={dtDate(endTime) || todayStr}
                  onChange={(e) => setEndTime(dtJoin(e.detail.value as string, dtTime(endTime)))}
                >
                  <View style={pickerContainer}>
                    <Text style={{ color: endTime ? '#4a4a4a' : '#ccc', fontSize: '26rpx' }}>
                      {dtDate(endTime) || '选择日期'}
                    </Text>
                    <Text style={{ color: '#8b8680' }}>&#9662;</Text>
                  </View>
                </TaroPicker>
              </View>
              <View style={{ flex: 1 }}>
                <TaroPicker
                  mode="time"
                  value={dtTime(endTime) || '00:00'}
                  onChange={(e) => setEndTime(dtJoin(dtDate(endTime) || todayStr, e.detail.value as string))}
                >
                  <View style={pickerContainer}>
                    <Text style={{ color: dtTime(endTime) ? '#4a4a4a' : '#ccc', fontSize: '26rpx' }}>
                      {dtTime(endTime) || '选择时间'}
                    </Text>
                    <Text style={{ color: '#8b8680' }}>&#9662;</Text>
                  </View>
                </TaroPicker>
              </View>
            </View>
            {endTime ? (
              <Text style={{ fontSize: '22rpx', color: '#d4726f', marginTop: '8rpx', display: 'block' }}>
                已选：{dtDisplay(endTime)}
              </Text>
            ) : null}
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>所属目标</Text>
            <TaroPicker mode='selector' range={['无', ...targets.map(t => t.title)]} value={targetIndex}
              onChange={(e) => { const v = Number(e.detail.value); setTargetId(v === 0 ? '' : targets[v - 1].id); }}>
              <View style={pickerContainer}>
                <Text style={{ color: targetId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>{targetLabel}</Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>所属计划</Text>
            <TaroPicker mode='selector' range={['无', ...plans.map(p => p.title)]} value={planIndex}
              onChange={(e) => { const v = Number(e.detail.value); setPlanId(v === 0 ? '' : plans[v - 1].id); }}>
              <View style={pickerContainer}>
                <Text style={{ color: planId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>{planLabel}</Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>

          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16rpx', borderTop: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>持续任务</Text>
            <View
              onClick={() => setIsContinuous(!isContinuous)}
              style={{
                width: '88rpx', height: '48rpx', borderRadius: '24rpx',
                backgroundColor: isContinuous ? '#88a096' : '#e0e0e0',
                display: 'flex', alignItems: 'center', padding: '4rpx',
                justifyContent: isContinuous ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={{ width: '40rpx', height: '40rpx', borderRadius: '50%', backgroundColor: '#fff' }} />
            </View>
          </View>
        </View>

        {/* 编辑模式额外字段 */}
        {isEdit && (
          <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <View style={{ marginBottom: '28rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>任务总结</Text>
              <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
                <Input
                  style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                  value={summury}
                  onInput={(e) => setSummury(e.detail.value)}
                  placeholder="总结任务完成情况..."
                  placeholderStyle="color: #ccc; font-size: 28rpx"
                />
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '28rpx', borderTop: '1px solid #f0f0f0' }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>标记为已完成</Text>
              <View
                onClick={() => setCompleted(!completed)}
                style={{
                  width: '88rpx', height: '48rpx', borderRadius: '24rpx',
                  backgroundColor: completed ? '#88a096' : '#e0e0e0',
                  display: 'flex', alignItems: 'center', padding: '4rpx',
                  justifyContent: completed ? 'flex-end' : 'flex-start',
                }}
              >
                <View style={{ width: '40rpx', height: '40rpx', borderRadius: '50%', backgroundColor: '#fff' }} />
              </View>
            </View>
          </View>
        )}

        <View
          onClick={handleSave}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '28rpx', borderRadius: '16rpx',
            background: 'linear-gradient(135deg, #d4726f, #e9b893)', textAlign: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '30rpx', fontWeight: 500 }}>保存</Text>
        </View>
      </View>
    </View>
  );
}
