import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function TripSuccess() {
  const handleBackHome = () => {
    Taro.switchTab({ url: '/pages/index/index' });
  };

  const handleShare = () => {
    Taro.navigateTo({ url: '/pages/share-card/index' });
  };

  return (
    <View className="page trip-success">
      <View className="success-container">
        <View className="success-icon">✓</View>
        <Text className="success-title">成功上车！</Text>
        <Text className="success-desc">感谢使用拼车服务，期待您的好评</Text>
      </View>

      <View className="button-group">
        <Button onClick={handleShare} className="btn-share">
          分享行程
        </Button>
        <Button onClick={handleBackHome} className="btn-home">
          返回首页
        </Button>
      </View>
    </View>
  );
}
