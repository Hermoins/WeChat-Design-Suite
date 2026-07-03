import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function RoleSelect() {
  const { setUserRole } = useApp();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (role: 'driver' | 'passenger') => {
    setLoading(true);
    setUserRole(role);
    setTimeout(() => {
      Taro.switchTab({ url: role === 'driver' ? '/pages/driver-home/index' : '/pages/index/index' });
    }, 300);
  };

  return (
    <View className="page role-select">
      <View className="role-container">
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>选择身份</Text>
        <Button loading={loading} onClick={() => handleSelectRole('passenger')} className="role-btn">
          乘客
        </Button>
        <Button loading={loading} onClick={() => handleSelectRole('driver')} className="role-btn" style={{ marginTop: 12 }}>
          司机
        </Button>
      </View>
    </View>
  );
}
