import React from 'react';
import { View, Text } from '@tarojs/components';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function DriverHome() {
  const { userRole } = useApp();
  return (
    <View className="page">
      <Text>司机首页 — 当前角色：{userRole ?? '未选择'}</Text>
    </View>
  );
}
