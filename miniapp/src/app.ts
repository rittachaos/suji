import { PropsWithChildren } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';

function App({ children }: PropsWithChildren) {
  useDidShow(() => {
    if (typeof Taro.getTabBar !== 'function') {
      return;
    }

    try {
      const tabBar = Taro.getTabBar<any>();
      if (tabBar?.setData) {
        const pages = Taro.getCurrentPages();
        const current = pages[pages.length - 1];
        tabBar.setData({ currentRoute: current ? `/${current.route}` : '/pages/index/index' });
      }
    } catch {
      // ignore custom tab bar sync errors
    }
  });

  return children;
}

export default App;
