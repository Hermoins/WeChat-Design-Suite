import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function DriverBoard() {
  const { myTrips, driverPassengers, simulatePassengerRequest, confirmBoarded, removePassenger } = useApp();

  const activeTrip = myTrips[0];

  if (!activeTrip) {
    return (
      <View className="page driver-board-page">
        <Text className="no-trip-text">暂无活跃行程，请先发布行程</Text>
      </View>
    );
  }

  return (
    <View className="page driver-board-page">
      <ScrollView className="db-scroll" scrollY>
        {/* Trip info banner */}
        <View className="trip-info-banner">
          <Text className="trip-route-big">{activeTrip.route.from} → {activeTrip.route.to}</Text>
          <View className="trip-meta-row">
            <Text className="trip-meta">可载人数：{activeTrip.remainingSeats}/{activeTrip.totalSeats}</Text>
            <Text className="trip-meta">💰 {activeTrip.price}</Text>
          </View>
        </View>

        {/* Simulate button */}
        <View className="simulate-btn-row" onClick={simulatePassengerRequest}>
          <Text className="simulate-btn-text">🔔 模拟乘客请求</Text>
        </View>

        {/* Passenger list */}
        <View className="passenger-list-section">
          <Text className="section-title">已接客人（{driverPassengers.length}人）</Text>
          {driverPassengers.length === 0 ? (
            <View className="empty-passengers">
              <Text className="empty-p-text">暂无已接乘客</Text>
            </View>
          ) : (
            driverPassengers.map((p) => (
              <View key={p.id} className="passenger-item-card">
                <View className="passenger-item-info">
                  <Text className="passenger-item-name">{p.name}</Text>
                  <Text className="passenger-item-detail">{p.pickupPoint} → {p.dropoffPoint}</Text>
                </View>
                <View className="passenger-item-actions">
                  <View
                    className={`passenger-action-btn ${p.status === 'boarded' ? 'disabled' : ''}`}
                    onClick={() => confirmBoarded(p.id)}
                  >
                    <Text className="action-btn-text">{p.status === 'boarded' ? '已上车' : '上车'}</Text>
                  </View>
                  <View className="passenger-action-btn remove" onClick={() => removePassenger(p.id)}>
                    <Text className="action-btn-text" style={{ color: '#ffffff' }}>移除</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
