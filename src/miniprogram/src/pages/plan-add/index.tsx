import { useState, useEffect } from 'react';
import { View, Text, Picker as TaroPicker, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { PageHeader } from '../../components/PageHeader';
import { usePlans } from '../../hooks/usePlans';
import { useTargets } from '../../hooks/useTargets';
import { format } from 'date-fns';

export default function AddPlan() {
  const router = useRouter();
  const id = router.params.id;
  const isEdit = !!id;

  const { addPlan, updatePlan, deletePlan, getPlan } = usePlans();
  const { targets } = useTargets();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [targetId, setTargetId] = useState('');
  const [beginTime, setBeginTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(3);
  const [isRepeat, setIsRepeat] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      const plan = getPlan(id);
      if (plan) {
        setTitle(plan.title);
        setDesc(plan.desc);
        setTargetId(plan.targetId || '');
        setBeginTime(plan.beginTime);
        setEndTime(plan.endTime);
        setWeight(plan.weight);
        setIsRepeat(plan.isRepeat);
        setCompleted(plan.completed);
      }
    }
  }, [id, isEdit, getPlan]);

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入计划标题', icon: 'none' });
      return;
    }
    if (new Date(endTime) < new Date(beginTime)) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' });
      return;
    }

    const planData = {
      title, desc,
      targetId: targetId || undefined,
      beginTime, endTime, weight, isRepeat, completed,
    };

    if (isEdit && id) {
      updatePlan(id, planData);
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } else {
      addPlan(planData);
      Taro.showToast({ title: '计划创建成功', icon: 'success' });
    }
    Taro.navigateBack();
  };

  const handleDelete = () => {
    if (!id) return;
    Taro.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这个计划吗？',
      success: (res) => {
        if (res.confirm) {
          deletePlan(id);
          Taro.showToast({ title: '计划已删除', icon: 'success' });
          Taro.navigateBack();
        }
      },
    });
  };

  const weightLabels = ['很低', '较低', '中等', '较高', '很高'];
  const targetIndex = targetId ? targets.findIndex(t => t.id === targetId) + 1 : 0;
  const targetLabel = targetId ? targets.find(t => t.id === targetId)?.title || '目标' : '无';

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '40rpx' }}>
      <PageHeader
        title={isEdit ? '编辑计划' : '新增计划'}
        showBack
        rightElement={isEdit ? (
          <Text style={{ color: '#d4726f', fontSize: '28rpx' }} onClick={handleDelete}>删除</Text>
        ) : undefined}
      />

      <View style={{ padding: '24rpx 36rpx' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: '24rpx', padding: '28rpx', marginBottom: '24rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>计划标题 *</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <Input style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={title} onInput={(e) => setTitle(e.detail.value)} placeholder="输入计划标题" placeholderStyle="color: #ccc" />
            </View>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>计划描述</Text>
            <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
              <Input style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={desc} onInput={(e) => setDesc(e.detail.value)} placeholder="描述你的计划..." placeholderStyle="color: #ccc; font-size: 28rpx" />
            </View>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>所属目标</Text>
            <TaroPicker mode='selector' range={['无', ...targets.map(t => t.title)]} value={targetIndex}
              onChange={(e) => { const v = Number(e.detail.value); setTargetId(v === 0 ? '' : targets[v - 1].id); }}>
              <View style={{
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx',
                backgroundColor: '#f5f1ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Text style={{ color: targetId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>{targetLabel}</Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>

          <View style={{ display: 'flex', gap: '16rpx', marginBottom: '28rpx' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>开始时间</Text>
              <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
                <Input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={beginTime} onInput={(e) => setBeginTime(e.detail.value)} placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>结束时间</Text>
              <View style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx', padding: '20rpx', backgroundColor: '#f5f1ed' }}>
                <Input style={{ width: '100%', fontSize: '26rpx', color: '#4a4a4a' }}
                  value={endTime} onInput={(e) => setEndTime(e.detail.value)} placeholder="yyyy-MM-dd" placeholderStyle="color: #ccc" />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: '28rpx' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>权重</Text>
              <Text style={{ fontSize: '26rpx', color: '#88a096', fontWeight: 500 }}>{weightLabels[weight - 1]}</Text>
            </View>
            <View style={{ display: 'flex', gap: '8rpx' }}>
              {[1, 2, 3, 4, 5].map((w) => (
                <View
                  key={w}
                  onClick={() => setWeight(w)}
                  style={{
                    flex: 1, height: '64rpx', borderRadius: '16rpx',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: w <= weight ? '#88a096' : '#f0f0f0',
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

          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '28rpx', borderTop: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a' }}>重复计划</Text>
            <View
              onClick={() => setIsRepeat(!isRepeat)}
              style={{
                width: '88rpx', height: '48rpx', borderRadius: '24rpx',
                backgroundColor: isRepeat ? '#88a096' : '#e0e0e0',
                display: 'flex', alignItems: 'center', padding: '4rpx',
                justifyContent: isRepeat ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={{ width: '40rpx', height: '40rpx', borderRadius: '50%', backgroundColor: '#fff' }} />
            </View>
          </View>

          {isEdit && (
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '28rpx', borderTop: '1px solid #f0f0f0', marginTop: '28rpx' }}>
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
            width: '100%', padding: '28rpx', borderRadius: '16rpx',
            background: 'linear-gradient(135deg, #88a096, #b8a89d)', textAlign: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '30rpx', fontWeight: 500 }}>保存</Text>
        </View>
      </View>
    </View>
  );
}
