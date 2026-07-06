import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function SeatBooking() {
  const { trips, bookSeat, historyAddresses } = useApp();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [focusedField, setFocusedField] = useState<'pickup' | 'dropoff' | null>(null);
  const [loading, setLoading] = useState(false);

  const tripId = Taro.getCurrentInstance().router?.params?.tripId as string | undefined;
  const trip = trips.find((t) => t.id === tripId);

  if (!trip) {
    return (
      <View className="page seat-booking-page">
        <Text className="not-found">行程不存在</Text>
      </View>
    );
  }

  const handleConfirm = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      Taro.showToast({ title: '请填写上车和下车地点', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      bookSeat(trip.id, pickup.trim(), dropoff.trim());
      Taro.showToast({ title: '订座成功', icon: 'success' });
      setTimeout(() => Taro.navigateTo({ url: `/pages/wait-confirm/index?tripId=${trip.id}` }), 1000);
    } catch (e) {
      Taro.showToast({ title: '订座失败', icon: 'error' });
    }
    setLoading(false);
  };

  const fillAddress = (addr: string) => {
    if (focusedField === 'pickup' || !pickup) {
      setPickup(addr);
      setFocusedField('dropoff');
    } else {
      setDropoff(addr);
    }
  };

  const timeTagBg =
    trip.timeType === 'now' ? '#A93226' :
    trip.timeType === 'soon' ? '#C86820' :
    '#1D6FA4';
  const timeLabel =
    trip.timeType === 'now' ? '马上走' :
    trip.timeType === 'soon' ? '10分钟后' :
    trip.scheduledTime ?? '预约';

  return (
    <View className="page seat-booking-page">
      <ScrollView className="sb-content" scrollY>
        {/* Trip summary */}
        <View className="trip-summary">
          <View className="time-tag" style={{ backgroundColor: timeTagBg }}>
            <Text className="time-tag-text">{timeLabel}</Text>
          </View>
          <View className="route-row">
            <Text className="route-text">{trip.route.from}</Text>
            <Text className="route-arrow">→</Text>
            <Text className="route-text">{trip.route.to}</Text>
          </View>
          <View className="driver-row">
            <Text className="driver-text">👤 {trip.driverName}</Text>
            <Text className="driver-sep">·</Text>
            <Text className="driver-text">余 {trip.remainingSeats} 座</Text>
          </View>
        </View>

        {/* Input fields */}
        <Text className="section-label">精确填写上下车点</Text>
        <Text className="section-hint">请填写具体到小区门/路口，方便司机接你</Text>

        <View className="input-card">
          <View className="input-row">
            <View className="input-dot" style={{ backgroundColor: '#2D9B5A' }} />
            <Input
              className="input"
              placeholder="上车点（具体到小区门）"
              value={pickup}
              onInput={(e) => setPickup(e.detail.value)}
              onFocus={() => setFocusedField('pickup')}
            />
            {pickup ? (
              <View className="clear-btn" onClick={() => setPickup('')}>
                <Text className="clear-text">✕</Text>
              </View>
            ) : null}
          </View>

          <View className="input-separator" />

          <View className="input-row">
            <View className="input-dot" style={{ backgroundColor: '#A93226' }} />
            <Input
              className="input"
              placeholder="下车点（具体到地点）"
              value={dropoff}
              onInput={(e) => setDropoff(e.detail.value)}
              onFocus={() => setFocusedField('dropoff')}
            />
            {dropoff ? (
              <View className="clear-btn" onClick={() => setDropoff('')}>
                <Text className="clear-text">✕</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* History addresses */}
        {historyAddresses.length > 0 && (
          <>
            <Text className="history-label">⏰ 常用地址</Text>
            <View className="history-row">
              {historyAddresses.map((addr) => (
                <View
                  key={addr}
                  className="history-chip"
                  onClick={() => fillAddress(addr)}
                >
                  <Text className="history-chip-text">{addr}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Notice */}
        <View className="notice" style={{ backgroundColor: '#e8f4fd' }}>
          <Text className="notice-text" style={{ color: '#1D6FA4' }}>
            ℹ️ 确认占座后，司机有60秒时间审核。接单成功后将解锁司机联系方式。
          </Text>
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View className="sb-footer">
        <View
          className={`confirm-btn ${!pickup.trim() || !dropoff.trim() ? 'disabled' : ''}`}
          style={pickup.trim() && dropoff.trim() ? { backgroundColor: '#A93226' } : {}}
          onClick={handleConfirm}
        >
          <Text className={`confirm-text ${!pickup.trim() || !dropoff.trim() ? 'disabled' : ''}`}>
            确认占座
          </Text>
        </View>
      </View>
    </View>
  );
}
