import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Picker, Button, Dialog } from '@nutui/nutui-react-taro';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [targetPickerVisible, setTargetPickerVisible] = useState(false);
  const [planPickerVisible, setPlanPickerVisible] = useState(false);

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
    if (id) {
      deleteNote(id);
      Taro.showToast({ title: '笔记已删除', icon: 'success' });
      Taro.navigateBack();
    }
  };

  const targetOptions = [
    [{ text: '无', value: '' } as const, ...targets.map(t => ({ text: t.title, value: t.id } as const))],
  ];

  const planOptions = [
    [{ text: '无', value: '' } as const, ...plans.map(p => ({ text: p.title, value: p.id } as const))],
  ];

  const selectedTargetName = targetId ? targets.find(t => t.id === targetId)?.title || '目标' : '无';
  const selectedPlanName = planId ? plans.find(p => p.id === planId)?.title || '计划' : '无';

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '40rpx' }}>
      <PageHeader
        title={isEdit ? '编辑笔记' : '新增笔记'}
        showBack
        rightElement={
          isEdit ? (
            <Text
              style={{ color: '#d4726f', fontSize: '28rpx' }}
              onClick={() => setShowDeleteDialog(true)}
            >
              删除
            </Text>
          ) : undefined
        }
      />

      <View style={{ padding: '24rpx 36rpx' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: '20rpx', padding: '36rpx' }}>
          {/* 标题 */}
          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              笔记标题 *
            </Text>
            <View style={{
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
              padding: '20rpx', backgroundColor: '#f5f1ed',
            }}>
              <input
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a' }}
                value={title}
                onInput={(e) => setTitle(e.detail.value)}
                placeholder="输入笔记标题"
                placeholderStyle="color: #ccc"
              />
            </View>
          </View>

          {/* 内容 */}
          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              笔记内容 *
            </Text>
            <View style={{
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
              padding: '20rpx', backgroundColor: '#f5f1ed',
            }}>
              <textarea
                style={{ width: '100%', fontSize: '28rpx', color: '#4a4a4a', minHeight: '200rpx' }}
                value={content}
                onInput={(e) => setContent(e.detail.value)}
                placeholder="写下你的想法..."
                placeholderStyle="color: #ccc; font-size: 28rpx"
              />
            </View>
          </View>

          {/* 关联目标 */}
          <View style={{ marginBottom: '36rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              关联目标
            </Text>
            <View
              onClick={() => setTargetPickerVisible(true)}
              style={{
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
                padding: '20rpx', backgroundColor: '#f5f1ed', display: 'flex', justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: targetId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>
                {targetId ? selectedTargetName : '选择目标（可选）'}
              </Text>
              <Text style={{ color: '#8b8680' }}>&#9662;</Text>
            </View>
          </View>

          {/* 关联计划 */}
          <View style={{ marginBottom: '48rpx' }}>
            <Text style={{ fontSize: '28rpx', color: '#4a4a4a', marginBottom: '16rpx', display: 'block' }}>
              关联计划
            </Text>
            <View
              onClick={() => setPlanPickerVisible(true)}
              style={{
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16rpx',
                padding: '20rpx', backgroundColor: '#f5f1ed', display: 'flex', justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: planId ? '#4a4a4a' : '#ccc', fontSize: '28rpx' }}>
                {planId ? selectedPlanName : '选择计划（可选）'}
              </Text>
              <Text style={{ color: '#8b8680' }}>&#9662;</Text>
            </View>
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

      {/* 目标选择器 */}
      {targetPickerVisible && (
        <Picker
          visible title="选择目标"
          options={targetOptions as any}
          value={[targetId]}
          onConfirm={(_, vals) => {
            setTargetId(String(vals[0] || ''));
            setTargetPickerVisible(false);
          }}
          onClose={() => setTargetPickerVisible(false)}
        />
      )}

      {/* 计划选择器 */}
      {planPickerVisible && (
        <Picker
          visible title="选择计划"
          options={planOptions as any}
          value={[planId]}
          onConfirm={(_, vals) => {
            setPlanId(String(vals[0] || ''));
            setPlanPickerVisible(false);
          }}
          onClose={() => setPlanPickerVisible(false)}
        />
      )}

      {/* 删除确认弹窗 */}
      {showDeleteDialog && (
        <Dialog
          visible title="确认删除"
          content="删除后将无法恢复，确定要删除这条笔记吗？"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </View>
  );
}
