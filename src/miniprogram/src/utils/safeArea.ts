import Taro from '@tarojs/taro';

const info = Taro.getSystemInfoSync();
export const STATUS_BAR_HEIGHT = info.statusBarHeight || 44;
