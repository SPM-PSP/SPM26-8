import { View, Text } from '@tarojs/components';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 16px', textAlign: 'center' }}>
      <View style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Text style={{ fontSize: '32px', color: '#999' }}>📄</Text>
      </View>
      <Text style={{ fontSize: '18px', fontWeight: 500, color: '#4a4a4a', marginBottom: '8px' }}>{title}</Text>
      <Text style={{ fontSize: '14px', color: '#8b8680', maxWidth: '280px' }}>{description}</Text>
    </View>
  );
}
