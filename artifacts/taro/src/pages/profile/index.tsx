import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function Profile() {
  const { userRole, savedRoutes, removeSavedRoute, simulatePassengerRequest } = useApp();

  const isDriver = userRole === 'driver';
  const roleColor = isDriver ? '#A93226' : '#1D6FA4';
  const roleLabel = isDriver ? '司机' : '乘客';
  const roleIcon = isDriver ? '🚗' : '👥';

  const handleSwitchRole = () => {
    Taro.redirectTo({ url: '/pages/role-select/index' });
  };

  return (
    <ScrollView className="page profile-page" scrollY>
      {/* Header */}
      <View className="profile-header">
        <View className="avatar-wrap">
          <Text className="avatar-icon">👤</Text>
        </View>
        <Text className="user-name">用户_12345</Text>
        <Text className="user-sub">沈北新城子 · 拼车用户</Text>
        <View className="role-pill" style={{ backgroundColor: roleColor + '30' }}>
          <Text className="role-pill-icon">{roleIcon}</Text>
          <Text className="role-pill-text" style={{ color: roleColor }}>{roleLabel}端</Text>
        </View>
      </View>

      {/* Switch role banner */}
      <View className="switch-banner" onClick={handleSwitchRole}>
        <View className="switch-icon" style={{ backgroundColor: roleColor + '18' }}>
          <Text className="switch-icon-text">🔄</Text>
        </View>
        <View className="switch-text">
          <Text className="switch-title">切换身份</Text>
          <Text className="switch-sub">
            当前：{roleLabel}端 · 点击切换为{isDriver ? '乘客' : '司机'}端
          </Text>
        </View>
        <Text className="switch-arrow">›</Text>
      </View>

      {/* Simulate passenger request (driver only) */}
      {isDriver && (
        <View className="simulate-btn" onClick={simulatePassengerRequest}>
          <Text className="simulate-btn-icon">🔔</Text>
          <Text className="simulate-btn-text" style={{ color: '#1D6FA4' }}>
            模拟乘客抢座请求（演示）
          </Text>
        </View>
      )}

      {/* Saved routes */}
      {savedRoutes.length > 0 && (
        <View className="section">
          <Text className="section-title">常用路线</Text>
          {savedRoutes.map((route, i) => (
            <View key={i} className="saved-route-row">
              <Text className="saved-route-icon">📍</Text>
              <Text className="saved-route-text">{route.from} → {route.to}</Text>
              <View className="saved-route-del" onClick={() => removeSavedRoute(i)}>
                <Text className="saved-route-del-text">✕</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Menu sections */}
      <View className="section section-menu">
        <Text className="section-title">出行</Text>
        {!isDriver && (
          <View className="menu-item" onClick={() => Taro.switchTab({ url: '/pages/my-trips/index' })}>
            <View className="menu-icon-wrap" style={{ backgroundColor: '#1D6FA418' }}>
              <Text className="menu-icon">🗺️</Text>
            </View>
            <View className="menu-content">
              <Text className="menu-label">我的行程</Text>
              <Text className="menu-sub">查看历史拼车记录</Text>
            </View>
            <Text className="menu-arrow">›</Text>
          </View>
        )}
        <View className="menu-item">
          <View className="menu-icon-wrap" style={{ backgroundColor: '#C8682018' }}>
            <Text className="menu-icon">⭐</Text>
          </View>
          <View className="menu-content">
            <Text className="menu-label">常用地址</Text>
            <Text className="menu-sub">管理常用上下车点</Text>
          </View>
          <Text className="menu-arrow">›</Text>
        </View>
      </View>

      <View className="section section-menu">
        <Text className="section-title">我的</Text>
        <View className="menu-item">
          <View className="menu-icon-wrap" style={{ backgroundColor: '#2D9B5A18' }}>
            <Text className="menu-icon">🛡️</Text>
          </View>
          <View className="menu-content">
            <Text className="menu-label">实名认证</Text>
            <Text className="menu-sub" />
          </View>
          <View className="badge" style={{ backgroundColor: '#C86820' }}>
            <Text className="badge-text">未认证</Text>
          </View>
          <Text className="menu-arrow">›</Text>
        </View>
        <View className="menu-item">
          <View className="menu-icon-wrap" style={{ backgroundColor: '#88888818' }}>
            <Text className="menu-icon">⚙️</Text>
          </View>
          <View className="menu-content">
            <Text className="menu-label">设置</Text>
            <Text className="menu-sub" />
          </View>
          <Text className="menu-arrow">›</Text>
        </View>
        <View className="menu-item">
          <View className="menu-icon-wrap" style={{ backgroundColor: '#88888818' }}>
            <Text className="menu-icon">❓</Text>
          </View>
          <View className="menu-content">
            <Text className="menu-label">帮助与反馈</Text>
            <Text className="menu-sub" />
          </View>
          <Text className="menu-arrow">›</Text>
        </View>
      </View>
    </ScrollView>
  );
}
