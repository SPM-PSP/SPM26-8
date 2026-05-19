import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Dialog } from '@nutui/nutui-react-taro';
import { PageHeader } from '../../components/PageHeader';
import { useTargets } from '../../hooks/useTargets';
import { useTodos } from '../../hooks/useTodos';
import { isAiConfigured } from '../../services/ai';
import {
  AiTargetWizardDialog,
  TargetWizardResult,
} from '../../components/ai/AiTargetWizardDialog';
import { format } from 'date-fns';

export default function AddTarget() {
  const router = useRouter();
  const id = router.params.id;
  const isEdit = !!id;

  const { addTarget, updateTarget, deleteTarget, getTarget } = useTargets();
  const { addTodo } = useTodos();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [beginTime, setBeginTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingSync, setPendingSync] = useState<TargetWizardResult | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const target = getTarget(id);
      if (target) {
        setTitle(target.title);
        setDesc(target.desc);
        setBeginTime(target.beginTime);
        setEndTime(target.endTime);
        setWeight(target.weight);
        setCompleted(target.completed);
      }
    }
  }, [id, isEdit, getTarget]);

  const handleWizardApply = (result: TargetWizardResult) => {
    setTitle(result.target.title);
    setDesc(result.target.desc);
    setBeginTime(result.target.beginTime);
    setEndTime(result.target.endTime);
    setWeight(result.target.weight);
    if (result.syncTodos && result.todos.length > 0) {
      setPendingSync(result);
    } else {
      setPendingSync(null);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入目标标题', icon: 'none' });
      return;
    }
    if (new Date(endTime) < new Date(beginTime)) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' });
      return;
    }

    const payload = { title, desc, beginTime, endTime, weight, completed };

    if (isEdit && id) {
      updateTarget(id, payload);
      Taro.showToast({ title: '保存成功', icon: 'success' });
      Taro.navigateBack();
      return;
    }

    const created = await addTarget(payload);

    if (pendingSync?.syncTodos && pendingSync.todos.length > 0) {
      for (const todo of pendingSync.todos) {
        addTodo({
          title: todo.title,
          desc: todo.desc || '',
          level: todo.level,
          category: todo.category,
          completed: false,
          targetId: created.id,
          isContinuous: false,
        });
      }
      setPendingSync(null);
      Taro.showToast({ title: `目标已创建，并同步 ${pendingSync.todos.length} 条任务`, icon: 'success' });
    } else {
      Taro.showToast({ title: '目标创建成功', icon: 'success' });
    }
    Taro.navigateBack();
  };

  const handleDelete = () => {
    if (id) {
      deleteTarget(id);
      Taro.showToast({ title: '目标已删除', icon: 'success' });
      Taro.navigateBack();
    }
  };

  const weightLabels = ['很低', '较低', '中等', '较高', '很高'];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '40rpx' }}>
      <PageHeader
        title={isEdit ? '编辑目标' : '新增目标'}
        showBack
        rightElement={isEdit ? (
          <Text style={{ color: '#d4726f', fontSize: '28rpx' }} onClick={() => setShowDeleteDialog(true)}>删除</Text>
        ) : undefined}
      />

      <View style={{ padding: '24rpx 36rpx' }}>
        {!isEdit && (
          <View style={{
            backgroundColor: '#f0f5f3', borderRadius: '20rpx', padding: '28rpx',
            marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4a4a4a', marginBottom: '8rpx', display: 'block' }}>
              目标、计划、任务的关系
            </Text>
            <Text style={{ fontSize: '22rpx', color: '#8b8680', lineHeight: 1.6 }}>
              目标是长期方向（如一个月减重）；计划是阶段安排（可在目标详情里新建）；任务是具体要做的事（如今日跑步）。
            </Text>
          </View>
        )}

        {!isEdit && (
          <View
            onClick={() => setWizardOpen(true)}
            style={{
              width: '100%', padding: '24rpx', borderRadius: '20rpx',
              border: '1px solid rgba(212,114,111,0.3)', textAlign: 'center',
              marginBottom: '24rpx', backgroundColor: '#fff',
            }}
          >
            <Text style={{ color: '#d4726f', fontSize: '28rpx' }}>✨ AI 目标规划助手</Text>
            <Text style={{ color: '#8b8680', fontSize: '22rpx', marginLeft: '8rpx' }}>
              {isAiConfigured() ? '' : '（演示）'}
            </Text>
          </View>
        )}

        {pendingSync && pendingSync.todos.length > 0 && (
          <View style={{
            fontSize: '24rpx', color: '#88a096', backgroundColor: '#fff',
            borderRadius: '16rpx', padding: '16rpx 20rpx', marginBottom: '24rpx',
            border: '1px solid rgba(136,160,150,0.3)',
          }}>
            <Text style={{ color: '#88a096', fontSize: '24rpx' }}>
              保存时将同步创建 {pendingSync.todos.length} 条关联任务
            </Text>
            <Text
              style={{ color: '#d4726f', fontSize: '24rpx', textDecoration: 'underline', marginLeft: '12rpx' }}
              onClick={() => setPendingSync(null)}
            >
              取消同步
            </Text>
          </View>
        )}

        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>目标标题 *</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <input style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={title} onInput={(e) => setTitle(e.detail.value)} placeholder="输入目标标题" placeholderStyle="color: #ccc" />
            </View>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>目标描述</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <textarea style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a', minHeight: '120rpx' }}
                value={desc} onInput={(e) => setDesc(e.detail.value)} placeholder="描述你的目标..." placeholderStyle="color: #ccc; font-size: 28rpx" />
            </View>
          </View>

          <View style={{ display: 'flex', gap: '16rpx', marginBottom: '28rpx' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>开始时间</Text>
              <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
                <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={beginTime} onInput={(e) => setBeginTime(e.detail.value)} placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>结束时间</Text>
              <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
                <input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={endTime} onInput={(e) => setEndTime(e.detail.value)} placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>权重</Text>
              <Text style={{ fontSize: '26rpx', color: '#d4726f', fontWeight: 500 }}>{weightLabels[weight - 1]}</Text>
            </View>
            <View style={{ display: 'flex', gap: '8rpx' }}>
              {[1, 2, 3, 4, 5].map((w) => (
                <View
                  key={w}
                  onClick={() => setWeight(w)}
                  style={{
                    flex: 1, height: '64rpx', borderRadius: '16rpx',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: w <= weight ? '#d4726f' : '#f0f0f0',
                    color: w <= weight ? '#fff' : '#8b8680',
                    fontSize: '28rpx', fontWeight: w <= weight ? 600 : 400,
                  }}
                >
                  <Text style={{ color: 'inherit', fontSize: '28rpx' }}>{w}</Text>
                </View>
              ))}
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8rpx' }}>
              <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>低</Text>
              <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>高</Text>
            </View>
          </View>

          {isEdit && (
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
          )}
        </View>

        <View
          onClick={handleSave}
          style={{
            width: '60%', margin: '0 auto', padding: '24rpx', borderRadius: '40rpx',
            background: 'linear-gradient(135deg, #d4726f, #e9b893)', textAlign: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '30rpx', fontWeight: 500 }}>保存</Text>
        </View>
      </View>

      {wizardOpen && (
        <AiTargetWizardDialog
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onApply={handleWizardApply}
        />
      )}

      {showDeleteDialog && (
        <Dialog visible={showDeleteDialog} title="确认删除" content="删除后将无法恢复，确定要删除这个目标吗？"
          onConfirm={handleDelete} onCancel={() => setShowDeleteDialog(false)} />
      )}
    </View>
  );
}
