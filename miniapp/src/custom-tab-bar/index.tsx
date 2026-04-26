import Taro from '@tarojs/taro';
import { Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { tabBarIconMap } from '@/utils/tabbar';

const tabs = [
  { pagePath: '/pages/index/index', text: '首页', key: 'home' as const },
  { pagePath: '/pages/records/index', text: '记录', key: 'record' as const },
  { pagePath: '/pages/trends/index', text: '趋势', key: 'trend' as const },
  { pagePath: '/pages/calendar/index', text: '日历', key: 'calendar' as const },
  { pagePath: '/pages/mine/index', text: '我的', key: 'mine' as const },
];

function getCurrentRoute() {
  const pages = Taro.getCurrentPages();
  const current = pages[pages.length - 1];
  return current ? `/${current.route}` : '/pages/index/index';
}

export default function CustomTabBar() {
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute());

  useEffect(() => {
    setCurrentRoute(getCurrentRoute());
  });

  const currentIndex = tabs.findIndex((tab) => tab.pagePath === currentRoute);
  const selectedWidth = 52;
  const unselectedWidth = 44;
  const itemGap = 6;
  const trackWidth = tabs.reduce((sum, tab, index) => {
    const width = index === currentIndex ? selectedWidth : unselectedWidth;
    return sum + width + (index === tabs.length - 1 ? 0 : itemGap);
  }, 0);
  const indicatorLeft = tabs.slice(0, Math.max(currentIndex, 0)).reduce((sum, _, index) => {
    const tab = tabs[index];
    return sum + (tab.pagePath === currentRoute ? selectedWidth : unselectedWidth) + itemGap;
  }, 0);
  const containerWidth = trackWidth + 12;

  return (
    <View
      style={{
        position: 'fixed',
        left: '50%',
        width: `${containerWidth}px`,
        bottom: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '52px',
        padding: '0 6px',
        borderRadius: '20px',
        background: 'rgba(249, 252, 255, 0.78)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 18px rgba(103, 124, 159, 0.09)',
        border: '1px solid rgba(255, 255, 255, 0.68)',
        transform: 'translateX(-50%)',
        zIndex: 999,
      }}
    >
      <View style={{ width: `${trackWidth}px`, position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <View
          style={{
            position: 'absolute',
            left: `${indicatorLeft}px`,
            top: '8px',
            width: `${selectedWidth}px`,
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(21,122,255,0.12) 0%, rgba(97,170,255,0.18) 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 12px rgba(21,122,255,0.07)',
            transition: 'all 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            pointerEvents: 'none',
          }}
        />
        <View style={{ display: 'flex', gap: `${itemGap}px`, width: `${trackWidth}px`, position: 'relative', zIndex: 1 }}>
      {tabs.map((tab) => {
        const selected = currentRoute === tab.pagePath;
        const icon = tabBarIconMap[tab.key]({ selected });

        return (
          <View
            key={tab.pagePath}
            style={{
              width: selected ? `${selectedWidth}px` : `${unselectedWidth}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              height: '52px',
              padding: '0',
              borderRadius: '12px',
              background: 'transparent',
              transform: selected ? 'translateY(0) scale(1.01)' : 'translateY(0) scale(1)',
              boxShadow: 'none',
              overflow: 'hidden',
              transition: 'all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            onClick={() => {
              if (!selected) {
                void Taro.switchTab({ url: tab.pagePath });
              }
            }}
          >
            <View style={{ position: 'relative', width: selected ? '26px' : '22px', height: selected ? '20px' : '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: selected ? 'scale(1.16)' : 'scale(1)', transition: 'all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
              {'wrapper' in icon && <View style={icon.wrapper as never} />}
              {'roof' in icon && <View style={icon.roof as never} />}
              {'body' in icon && <View style={icon.body as never} />}
              {'capsule' in icon && <View style={icon.capsule as never} />}
              {'dot' in icon && <View style={icon.dot as never} />}
              {'lineA' in icon && <View style={icon.lineA as never} />}
              {'lineB' in icon && <View style={icon.lineB as never} />}
              {'lineC' in icon && <View style={icon.lineC as never} />}
              {'shell' in icon && <View style={icon.shell as never} />}
              {'bar' in icon && <View style={icon.bar as never} />}
              {'pinLeft' in icon && <View style={icon.pinLeft as never} />}
              {'pinRight' in icon && <View style={icon.pinRight as never} />}
              {'head' in icon && <View style={icon.head as never} />}
            </View>
            {selected && (
              <Text style={{ marginTop: '2px', fontSize: '9px', lineHeight: '1', color: '#157AFF', fontWeight: '600', letterSpacing: '-0.01em', opacity: selected ? '1' : '0', transform: selected ? 'translateY(0)' : 'translateY(-4px)', transition: 'all 260ms cubic-bezier(0.2, 0.8, 0.2, 1)', whiteSpace: 'nowrap' }}>
                {tab.text}
              </Text>
            )}
          </View>
        );
      })}
        </View>
      </View>
    </View>
  );
}
