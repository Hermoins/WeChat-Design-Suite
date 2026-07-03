import React, { useState } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function SeatBooking() {
  const { trips, bookSeat } = useApp();
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState('');
  const [loading, setLoading] = useState(false);

  const tripId = Taro.getCurrentInstance().router?.params?.tripId as string | undefined;
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <View className="page seat-booking">
        <Text>找不到该行程</Text>
      </View>
    );
  }

  const handleBook = async () => {
    if (!pickupPoint.trim() || !dropoffPoint.trim()) {
      Taro.showToast({ title: '请填写上车和下车地点', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      bookSeat(tripId, pickupPoint, dropoffPoint);
      Taro.showToast({ title: '订座成功', icon: 'success' });
      setTimeout(() => Taro.navigateTo({ url: '/pages/wait-confirm/index' }), 1000);
    } catch (e) {
      Taro.showToast({ title: '订座失败', icon: 'error' });
    }
    setLoading(false);
  };

  return (
    <ScrollView className="page seat-booking" scrollY>
      <View className="trip-card">
        <Text className="trip-route">
          {trip.route.from} → {trip.route.to}
        </Text>
        <Text className="trip-detail">司机：{trip.driverName} · 剩余座位：{trip.remainingSeats}</Text>
      </View>

      <View className="form-group">
        <Text className="label">上车地点</Text>
        <Input
          placeholder="例如：千禧家园南门"
          value={pickupPoint}
          onInput={(e) => setPickupPoint(e.detail.value)}
          className="input"
        />
      </View>

      <View className="form-group">
        <Text className="label">下车地点</Text>
        <Input
          placeholder="例如：辽大北门"
          value={dropoffPoint}
          onInput={(e) => setDropoffPoint(e.detail.value)}
          className="input"
        />
      </View>

      <Button loading={loading} onClick={handleBook} className="book-btn">
        确认订座
      </Button>
    </ScrollView>
  );
}
