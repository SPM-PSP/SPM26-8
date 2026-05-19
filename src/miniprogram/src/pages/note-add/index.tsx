import { useState, useEffect } from 'react';
import { View, Text, Picker as TaroPicker, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { PageHeader } from '../../components/PageHeader';
import { useNotes } from '../../hooks/useNotes';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';

export default function AddNote() {
  const router = useRouter();
  const id = router.params.id;
  const isEdit = !!id;

  const { addNote, updateNote, deleteNote, getNote } = useNotes();
  const { targets } = useTargets();
  const { plans } = usePlans();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetId, setTargetId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');

  useEffect(() => {
    if (isEdit && id) {
      const note = getNote(id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTargetId(note.targetId || '');
        setPlanId(note.planId || '');
      }
    }
  }, [id, isEdit, getNote]);

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入笔记标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入笔记内容', icon: 'none' });
      return;
    }

    const noteData = {
      title,
      content,
      targetId: targetId || undefined,
      planId: planId || undefined,
    };

    if (isEdit && id) {
      updateNote(id, noteData);
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } else {
      addNote(noteData);
      Taro.showToast({ title: '笔记创建成功', icon: 'success' });
    }
    Taro.navigateBack();
  };

  const handleDelete = () => {
    if (!id) return;
    Taro.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          deleteNote(id);
          Taro.showToast({ title: '笔记已删除', icon: 'success' });
          Taro.navigateBack();
        }
      },
    });
  };

  const targetIndex = targetId ? targets.findIndex(t => t.id === targetId) + 1 : 0;
  const planIndex = planId ? plans.findIndex(p => p.id === planId) + 1 : 0;

  const targetLabel = targetId ? (targets.find(t => t.id === targetId)?.title || '目标') : '无';
  const planLabel = planId ? (plans.find(p => p.id === planId)?.title || '计划') : '无';

  const pickerContainer = {
    border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
    padding: '20rpx', backgroundColor: '#f5f1ed', display: 'flex', justifyContent: 'space-between',
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '40rpx' }}>
      <PageHeader
        title={isEdit ? '编辑笔记' : '新增笔记'}
        showBack
        rightElement={
          isEdit ? (
            <Text
              style={{ color: '#d4726f', fontSize: '28rpx' }}
              onClick={handleDelete}
            >
              删除
            </Text>
          ) : undefined
        }
      />

      <View style={{ padding: '24rpx 36rpx' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: '20rpx', padding: '36rpx' }}>
          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              笔记标题 *
            </Text>
            <View style={{
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
              padding: '20rpx', backgroundColor: '#f5f1ed',
            }}>
              <Input
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                placeholder="输入笔记标题"
                placeholderStyle="color: #ccc"
              />
            </View>
          </View>

          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              笔记内容 *
            </Text>
            <View style={{
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
              padding: '20rpx', backgroundColor: '#f5f1ed',
            }}>
              <Input
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={content}
                onInput={(e) => setContent(e.detail.value)}
                placeholder="写下你的想法..."
                placeholderStyle="color: #ccc; font-size: 28rpx"
              />
            </View>
          </View>

          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              关联目标
            </Text>
            <TaroPicker mode='selector' range={['无', ...targets.map(t => t.title)]} value={targetIndex}
              onChange={(e) => { const v = Number(e.detail.value); setTargetId(v === 0 ? '' : targets[v - 1].id); }}>
              <View style={pickerContainer}>
                <Text style={{ color: targetId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>
                  {targetId ? targetLabel : '选择目标（可选）'}
                </Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>

          <View style={{ marginBottom: '48rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              关联计划
            </Text>
            <TaroPicker mode='selector' range={['无', ...plans.map(p => p.title)]} value={planIndex}
              onChange={(e) => { const v = Number(e.detail.value); setPlanId(v === 0 ? '' : plans[v - 1].id); }}>
              <View style={pickerContainer}>
                <Text style={{ color: planId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>
                  {planId ? planLabel : '选择计划（可选）'}
                </Text>
                <Text style={{ color: '#8b8680' }}>&#9662;</Text>
              </View>
            </TaroPicker>
          </View>

          <View
            onClick={handleSave}
            style={{
              width: '100%', padding: '24rpx', borderRadius: '16rpx',
              background: 'linear-gradient(135deg, #e9b893, #d4c5b9)',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '30rpx', fontWeight: 500 }}>保存</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
