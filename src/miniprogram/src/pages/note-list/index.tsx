import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../../utils/safeArea';
import { EmptyState } from '../../components/EmptyState';
import { useNotes } from '../../hooks/useNotes';
import { useTargets } from '../../hooks/useTargets';
import { usePlans } from '../../hooks/usePlans';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function NoteList() {
  const { notes } = useNotes();
  const { targets } = useTargets();
  const { plans } = usePlans();

  const getTargetName = (targetId?: string) => {
    if (!targetId) return null;
    return targets.find(t => t.id === targetId)?.title;
  };

  const getPlanName = (planId?: string) => {
    if (!planId) return null;
    return plans.find(p => p.id === planId)?.title;
  };

  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f8f8f6', paddingBottom: '80px' }}>
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        padding: `${STATUS_BAR_HEIGHT + 12}px 36rpx 24rpx 36rpx`,
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#4a4a4a' }}>笔记</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/note-add/index' })}
            style={{
              width: '64rpx', height: '64rpx', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e9b893, #d4c5b9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '36rpx', lineHeight: 1 }}>+</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '36rpx' }}>
        {sortedNotes.length === 0 ? (
          <EmptyState title="暂无笔记" description="创建你的第一条笔记，记录想法和灵感" />
        ) : (
          <View>
            {sortedNotes.map((note) => {
              const targetName = getTargetName(note.targetId);
              const planName = getPlanName(note.planId);

              return (
                <View
                  key={note.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/note-add/index?id=${note.id}` })}
                  style={{
                    backgroundColor: '#fff', borderRadius: '24rpx', padding: '32rpx',
                    marginBottom: '20rpx', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <Text style={{ fontWeight: 500, color: '#4a4a4a', fontSize: '30rpx', marginBottom: '12rpx', display: 'block' }}>
                    {note.title}
                  </Text>
                  <Text style={{
                    fontSize: '26rpx', color: '#8b8680', marginBottom: '20rpx',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: 1.6,
                  }}>
                    {note.content}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: '22rpx', color: '#8b8680' }}>
                      {format(new Date(note.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhCN })}
                    </Text>
                    {targetName && (
                      <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #88a096' }}>
                        <Text style={{ fontSize: '20rpx', color: '#88a096' }}>{targetName}</Text>
                      </View>
                    )}
                    {planName && (
                      <View style={{ padding: '4rpx 16rpx', borderRadius: '20rpx', border: '1px solid #ccc' }}>
                        <Text style={{ fontSize: '20rpx', color: '#8b8680' }}>{planName}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
