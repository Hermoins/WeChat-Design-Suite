import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function TripSuccess() {
  const tripId = Taro.getCurrentInstance().router?.params?.tripId as string | undefined;
  const { trips, myBookings } = useApp();

  const trip = trips.find((t) => t.id === tripId) ?? trips[0];
  const booking = myBookings.find((b) => b.tripId === tripId);

  const callDriver = () => {
    if (trip?.driverPhone) {
      Taro.makePhoneCall({ phoneNumber: trip.driverPhone }).catch(() => {});
    }
  };

  if (!trip) return null;

  const timeTagBg =
    trip.timeType === 'now' ? '#A93226' :
    trip.timeType === 'soon' ? '#C86820' :
    '#1D6FA4';
  const timeLabel =
    trip.timeType === 'now' ? '马上走' :
    trip.timeType === 'soon' ? '10分钟后' :
    trip.scheduledTime ?? '预约';

  return (
    <View className="page trip-success-page">
      <View className="ts-content">
        {/* Success icon */}
        <View className="success-circle" style={{ backgroundColor: '#2D9B5A' }}>
          <Text className="success-icon-text">✓</Text>
        </View>
        <Text className="success-title" style={{ color: '#2D9B5A' }}>拼车成功！</Text>
        <Text className="success-sub">等待接驾中</Text>

        {/* Trip info card */}
        <View className="trip-info-card">
          <View className="trip-card-header">
            <View className="time-tag" style={{ backgroundColor: timeTagBg }}>
              <Text className="time-tag-text">{timeLabel}</Text>
            </View>
          </View>
          <View className="route-row">
            <Text className="route-text">{trip.route.from}</Text>
            <Text className="route-arrow">→</Text>
            <Text className="route-text">{trip.route.to}</Text>
          </View>

          {booking && (
            <View className="points-section">
              <View className="point-row">
                <View className="point-dot" style={{ backgroundColor: '#2D9B5A' }} />
                <View className="point-info">
                  <Text className="point-label">上车点</Text>
                  <Text className="point-value">{booking.pickupPoint}</Text>
                </View>
              </View>
              <View className="point-row">
                <View className="point-dot" style={{ backgroundColor: '#A93226' }} />
                <View className="point-info">
                  <Text className="point-label">下车点</Text>
                  <Text className="point-value">{booking.dropoffPoint}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Driver info */}
          <View className="driver-section">
            <Text className="driver-section-label" style={{ color: '#2D9B5A' }}>司机信息已解锁</Text>
            <View className="driver-row">
              <View className="driver-item">
                <Text className="driver-item-label">司机</Text>
                <Text className="driver-item-value">{trip.driverName}</Text>
              </View>
              <View className="driver-item">
                <Text className="driver-item-label">车牌</Text>
                <Text className="driver-item-value">{trip.driverPlate}</Text>
              </View>
              <View className="driver-item">
                <Text className="driver-item-label">车型</Text>
                <Text className="driver-item-value">{trip.driverCar}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Call button */}
        <View className="call-btn" onClick={callDriver}>
          <Text className="call-btn-text">📞 一键拨打司机电话</Text>
        </View>

        <View className="back-btn" onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
          <Text className="back-btn-text">返回大厅</Text>
        </View>
      </View>
    </View>
  );
}
