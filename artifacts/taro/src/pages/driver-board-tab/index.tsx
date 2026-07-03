import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function DriverBoardTab() {
  const { passengerRequests } = useApp();

  return (
    <ScrollView className="page driver-board-tab" scrollY>
      <View className="requests-list">
        <Text className="list-title">乘客需求（{passengerRequests.length}条）</Text>
        {passengerRequests.map((req) => (
          <View key={req.id} className="request-item">
            <View className="request-info">
              <Text className="request-route">
                {req.route.from} → {req.route.to}
              </Text>
              <Text className="request-detail">
                {req.passengerCount}人 · {req.timeType === 'now' ? '现在' : '稍后'}
              </Text>
              {req.note && <Text className="request-note">{req.note}</Text>}
            </View>
            <Button className="accept-btn">接单</Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
