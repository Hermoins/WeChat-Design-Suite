import React from 'react';
import { View, Text } from '@tarojs/components';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function MyTrips() {
  const { trips } = useApp();
  return (
    <View className="page">
      <Text>我的行程 — 共 {trips.length} 条</Text>
    </View>
  );
}
