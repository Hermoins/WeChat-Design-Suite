import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import React from 'react';
import './CustomTabBar.scss';

type Role = 'driver' | 'passenger' | null;

const passengerTabs = [
  { key: 'index', title: '拼车大厅', page: '/pages/index/index' },
  { key: 'passenger-publish', title: '发布需求', page: '/pages/passenger-publish/index' },
  { key: 'my-trips', title: '我的行程', page: '/pages/my-trips/index' },
  { key: 'profile', title: '个人中心', page: '/pages/profile/index' },
];

const driverTabs = [
  { key: 'driver-home', title: '发布行程', page: '/pages/driver-home/index' },
  { key: 'driver-board-tab', title: '接客看板', page: '/pages/driver-board-tab/index' },
  { key: 'my-trips', title: '我的行程', page: '/pages/my-trips/index' },
  { key: 'profile', title: '个人中心', page: '/pages/profile/index' },
];

interface Props {
  role: Role;
  current?: string; // optional identifier for active tab
}

export default function CustomTabBar({ role, current }: Props) {
  const items = role === 'driver' ? driverTabs : passengerTabs;

  const handleClick = (page: string) => {
    // Use switchTab for tab pages if they are configured as tabBar pages,
    // otherwise use navigateTo.
    try {
      Taro.switchTab({ url: page });
    } catch (e) {
      Taro.navigateTo({ url: page });
    }
  };

  return (
    <View className="custom-tabbar">
      {items.map((it) => (
        <View
          className={`tab-item ${current === it.key ? 'active' : ''}`}
          key={it.key}
          onClick={() => handleClick(it.page)}
        >
          <Text className="tab-title">{it.title}</Text>
        </View>
      ))}
    </View>
  );
}
