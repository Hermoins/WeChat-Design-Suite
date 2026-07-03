import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function WaitConfirm() {
  const handleSuccess = () => {
    Taro.navigateTo({ url: '/pages/trip-success/index' });
  };

  const handleCancel = () => {
    Taro.switchTab({ url: '/pages/index/index' });
  };

  return (
    <View className="page wait-confirm">
      <View className="status-container">
        <Text className="status-title">等待司机确认</Text>
        <View className="loading-spinner" />
        <Text className="status-desc">您的订座请求已发送，等待司机确认...</Text>
      </View>

      <View className="button-group">
        <Button onClick={handleSuccess} className="btn-success">
          继续
        </Button>
        <Button onClick={handleCancel} className="btn-cancel">
          返回首页
        </Button>
      </View>
    </View>
  );
}
