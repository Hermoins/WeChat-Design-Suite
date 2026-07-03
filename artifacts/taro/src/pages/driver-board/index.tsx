import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function DriverBoard() {
  const { myTrips, driverPassengers, simulatePassengerRequest, confirmBoarded, removePassenger } = useApp();

  const activeTrip = myTrips[0];

  if (!activeTrip) {
    return (
      <View className="page driver-board">
        <Text>暂无活跃行程，请先发布行程</Text>
      </View>
    );
  }

  return (
    <ScrollView className="page driver-board" scrollY>
      <View className="trip-info">
        <Text className="trip-route">
          {activeTrip.route.from} → {activeTrip.route.to}
        </Text>
        <Text className="trip-detail">可载人数：{activeTrip.remainingSeats}/{activeTrip.totalSeats}</Text>
      </View>

      <Button onClick={simulatePassengerRequest} className="simulate-btn">
        模拟乘客请求
      </Button>

      <View className="passenger-list">
        <Text className="list-title">已接客人（{driverPassengers.length}人）</Text>
        {driverPassengers.map((p) => (
          <View key={p.id} className="passenger-item">
            <View>
              <Text className="passenger-name">{p.name}</Text>
              <Text className="passenger-detail">{p.pickupPoint} → {p.dropoffPoint}</Text>
            </View>
            <View className="passenger-actions">
              <Button
                onClick={() => confirmBoarded(p.id)}
                className="action-btn"
                disabled={p.status === 'boarded'}
              >
                {p.status === 'boarded' ? '已上车' : '上车'}
              </Button>
              <Button onClick={() => removePassenger(p.id)} className="action-btn remove">
                移除
              </Button>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
