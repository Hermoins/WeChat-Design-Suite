import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function Profile() {
  const { userRole, setUserRole } = useApp();
  return (
    <View className="page">
      <Text>个人中心 — 当前角色：{userRole ?? '未选择'}</Text>
      <View style={{ marginTop: 12 }}>
        <Button onClick={() => setUserRole('passenger')}>切换到乘客</Button>
      </View>
      <View style={{ marginTop: 8 }}>
        <Button onClick={() => setUserRole('driver')}>切换到司机</Button>
      </View>
    </View>
  );
}
