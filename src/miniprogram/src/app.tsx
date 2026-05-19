import { Component, PropsWithChildren } from 'react';
import { useDidShow } from '@tarojs/taro';
import { initializeSampleData } from './utils/initData';
import './app.scss';

function AppInit({ children }: PropsWithChildren) {
  useDidShow(() => {
    // 每次小程序显示时都检查是否需要初始化数据
  });

  return children as JSX.Element;
}

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    initializeSampleData();
  }

  render() {
    return <AppInit>{this.props.children}</AppInit>;
  }
}

export default App;
