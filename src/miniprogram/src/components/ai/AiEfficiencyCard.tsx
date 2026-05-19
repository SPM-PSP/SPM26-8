import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import { streamEfficiencyDiagnosis, AiContext, isAiConfigured } from '../../services/ai';

interface AiEfficiencyCardProps {
  context: AiContext;
}

export function AiEfficiencyCard({ context }: AiEfficiencyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [expandedOnce, setExpandedOnce] = useState(false);

  const handleToggle = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (!expandedOnce) {
      setExpandedOnce(true);
      setText('');
      setStreaming(true);
      try {
        await streamEfficiencyDiagnosis(context, (chunk) => {
          setText((prev) => prev + chunk);
        });
      } catch (e) {
        if (e instanceof Error) {
          const hint = !isAiConfigured()
            ? '未检测到 API Key：请配置 ai.config.ts 中的 TARO_APP_AI_API_KEY。'
            : e.message || '诊断生成失败，请稍后重试。';
          setText((prev) => prev || hint);
        }
      } finally {
        setStreaming(false);
      }
    }
  }, [expanded, expandedOnce, context]);

  return (
    <View
      onClick={handleToggle}
      style={{
        borderRadius: '24rpx', overflow: 'hidden', marginBottom: '24rpx',
        boxShadow: '0 4px 24px rgba(136,160,150,0.25)',
      }}
    >
      <View style={{
        padding: '28rpx',
        background: 'linear-gradient(135deg, #667eea, #88a096, #d4726f)',
        backgroundSize: '200% 200%',
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx' }}>
            <Text style={{ fontSize: '28rpx' }}>✨</Text>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: '30rpx' }}>AI 效率诊断</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '28rpx' }}>{expanded ? '▲' : '▼'}</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '24rpx', marginTop: '8rpx' }}>
          {expanded ? '点击收起' : '点击展开，查看本周时间点评'}
        </Text>

        {expanded && (
          <View style={{
            marginTop: '20rpx', padding: '24rpx', borderRadius: '20rpx',
            backgroundColor: 'rgba(0,0,0,0.15)', minHeight: '160rpx',
          }}>
            {text ? (
              <Text style={{ color: '#fff', fontSize: '26rpx', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {text}
                {streaming && <Text style={{ color: 'rgba(255,255,255,0.8)' }}>|</Text>}
              </Text>
            ) : streaming ? (
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '24rpx' }}>
                正在生成诊断书...
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}
