import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import React, { useEffect, useState } from 'react';
import { useApp } from '../store/appContext';
import './index.scss';

const sharedTabs = [
  { key: 'pages/index/index', title: '首页', page: '/pages/index/index' },
  { key: 'pages/publish/index', title: '发布', page: '/pages/publish/index' },
  { key: 'pages/my-trips/index', title: '行程', page: '/pages/my-trips/index' },
  { key: 'pages/profile/index', title: '我的', page: '/pages/profile/index' },
];

export default function CustomTabBar() {
  const { userRole } = useApp();
  const [current, setCurrent] = useState('');

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const route = pages[pages.length - 1].route || '';
      setCurrent(route);
    }
  }, []);

  const handleClick = (page: string) => {
    Taro.switchTab({ url: page }).catch(() => {
      Taro.reLaunch({ url: page });
    });
  };

  return (
    <View className="custom-tabbar">
      {sharedTabs.map((it) => (
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
