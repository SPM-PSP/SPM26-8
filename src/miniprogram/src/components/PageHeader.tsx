import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { STATUS_BAR_HEIGHT } from '../utils/safeArea';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, showBack, rightElement }: PageHeaderProps) {
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${STATUS_BAR_HEIGHT + 12}px 24px 12px 24px`,
        backgroundColor: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showBack && (
          <View
            onClick={() => Taro.navigateBack()}
            style={{ padding: '4px', cursor: 'pointer' }}
          >
            <Text style={{ fontSize: '20px', color: '#4a4a4a' }}>&larr;</Text>
          </View>
        )}
        <Text style={{ fontSize: '18px', fontWeight: 600, color: '#4a4a4a' }}>{title}</Text>
      </View>
      {rightElement && <View>{rightElement}</View>}
    </View>
  );
}
