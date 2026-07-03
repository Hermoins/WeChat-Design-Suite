import React from 'react';
import { View, Text, Button, Canvas } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function ShareCard() {
  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  const handleDownload = async () => {
    Taro.showToast({ title: '仅在真机上生效', icon: 'info' });
  };

  return (
    <View className="page share-card">
      <View className="card-container">
        <View className="card">
          <Text className="card-title">拼车行程卡片</Text>
          <View className="card-body">
            <Text className="card-route">新城子 → 道义商圈</Text>
            <Text className="card-detail">司机：王师傅 · 白色别克GL8</Text>
            <Text className="card-detail">价格：10元/人</Text>
          </View>
          <Text className="card-footer">邀请朋友一起拼车</Text>
        </View>
      </View>

      <View className="button-group">
        <Button onClick={handleShare} className="btn-share">
          分享给朋友
        </Button>
        <Button onClick={handleDownload} className="btn-download">
          保存卡片
        </Button>
      </View>
    </View>
  );
}
