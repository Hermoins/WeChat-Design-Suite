import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import type { UserRole } from '../../store/appContext';
import './index.scss';

export default function RoleSelect() {
  const { setUserRole } = useApp();
  const [selected, setSelected] = useState<UserRole | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    setUserRole(selected);
    Taro.switchTab({ url: '/pages/index/index' });
  };

  return (
    <View className="role-select-page">
      <View className="role-header">
        <Text className="app-name">沈北拼车</Text>
        <Text className="role-title">你是司机还是乘客？</Text>
        <Text className="role-sub">选择后进入对应界面，如需切换请重新登录</Text>
      </View>

      <View className="role-cards">
        {/* Passenger */}
        <View
          className={`role-card ${selected === 'passenger' ? 'selected' : ''}`}
          style={selected === 'passenger' ? { borderColor: '#1D6FA4' } : {}}
          onClick={() => setSelected('passenger')}
        >
          <View className={`icon-wrap ${selected === 'passenger' ? 'passenger' : ''}`}>
            <Text className="icon-text">👥</Text>
          </View>
          <Text className="role-label" style={selected === 'passenger' ? { color: '#1D6FA4' } : {}}>
            我是乘客
          </Text>
          <Text className="role-desc">浏览拼车大厅{'\n'}一键抢座出行</Text>
          {selected === 'passenger' && (
            <View className="checkmark" style={{ backgroundColor: '#1D6FA4' }}>
              <Text className="checkmark-text">✓</Text>
            </View>
          )}
        </View>

        {/* Driver */}
        <View
          className={`role-card ${selected === 'driver' ? 'selected' : ''}`}
          style={selected === 'driver' ? { borderColor: '#A93226' } : {}}
          onClick={() => setSelected('driver')}
        >
          <View className={`icon-wrap ${selected === 'driver' ? 'driver' : ''}`}>
            <Text className="icon-text">🚗</Text>
          </View>
          <Text className="role-label" style={selected === 'driver' ? { color: '#A93226' } : {}}>
            我是司机
          </Text>
          <Text className="role-desc">发布行程接乘客{'\n'}赚取顺路油费</Text>
          {selected === 'driver' && (
            <View className="checkmark" style={{ backgroundColor: '#A93226' }}>
              <Text className="checkmark-text">✓</Text>
            </View>
          )}
        </View>
      </View>

      {/* Confirm button */}
      <View
        className={`confirm-btn ${!selected ? 'disabled' : ''}`}
        style={selected === 'driver' ? { backgroundColor: '#A93226' } : selected === 'passenger' ? { backgroundColor: '#1D6FA4' } : {}}
        onClick={handleConfirm}
      >
        <Text className="confirm-text">
          {selected ? `进入${selected === 'driver' ? '司机' : '乘客'}端` : '请先选择身份'}
        </Text>
        {selected && <Text className="confirm-arrow">→</Text>}
      </View>

      <Text className="role-tip">同一账号可以既是司机也是乘客{'\n'}切换请重新进入本页面选择</Text>
    </View>
  );
}
