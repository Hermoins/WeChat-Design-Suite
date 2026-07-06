import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

type ViewMode = 'passenger' | 'driver';

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  return `${Math.floor(mins / 60)}小时前`;
}

function TimeTag({ timeType, scheduledTime }: { timeType: string; scheduledTime: string | null }) {
  const bgColor =
    timeType === 'now' ? '#A93226' :
    timeType === 'soon' ? '#C86820' :
    '#1D6FA4';

  const label =
    timeType === 'now' ? '马上走' :
    timeType === 'soon' ? '10分钟后' :
    scheduledTime ?? '预约';

  return (
    <View className="time-tag" style={{ backgroundColor: bgColor }}>
      <Text className="time-tag-text">{label}</Text>
    </View>
  );
}

function AcceptedCard({ req }: { req: any }) {
  const info = req.acceptedBy!;

  return (
    <View className="accepted-card">
      <View className="accepted-header">
        <View className="accepted-icon-wrap" style={{ backgroundColor: '#2D9B5A' }}>
          <Text className="accepted-icon">✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text className="accepted-title" style={{ color: '#2D9B5A' }}>司机已接单！</Text>
          <Text className="accepted-sub">{req.route.from} → {req.route.to} · {timeAgo(info.acceptedAt)}接单</Text>
        </View>
      </View>

      <View className="driver-info-box">
        <View className="driver-info-row">
          <Text className="driver-info-label">司机</Text>
          <Text className="driver-info-val">{info.driverName}</Text>
        </View>
        <View className="divider" />
        <View className="driver-info-row">
          <Text className="driver-info-label">车辆</Text>
          <Text className="driver-info-val">{info.driverCar} {info.driverPlate}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MyTrips() {
  const { myBookings, myTrips, myPassengerRequests, isDriverMode } = useApp();
  const [mode, setMode] = useState<ViewMode>(isDriverMode ? 'driver' : 'passenger');

  const acceptedRequests = myPassengerRequests.filter((r) => !!r.acceptedBy);

  const statusLabel = (s: string) => {
    if (s === 'waiting') return { text: '等待接单', bg: '#FFF3E0', color: '#C86820' };
    if (s === 'confirmed') return { text: '已接单', bg: '#E8F7EF', color: '#2D9B5A' };
    if (s === 'rejected') return { text: '被拒绝', bg: '#F5E8E8', color: '#A93226' };
    return { text: s, bg: '#e8e8ee', color: '#888888' };
  };

  return (
    <View className="page my-trips-page">
      {/* Header */}
      <View className="mt-header">
        <View className="header-left">
          <Text className="title">我的行程</Text>
          {acceptedRequests.length > 0 && mode === 'passenger' && (
            <View className="notif-dot" style={{ backgroundColor: '#2D9B5A' }}>
              <Text className="notif-dot-text">{acceptedRequests.length}</Text>
            </View>
          )}
        </View>
        <View className="mode-switch" style={{ backgroundColor: '#e8e8ee' }}>
          {(['passenger', 'driver'] as ViewMode[]).map((m) => (
            <View
              key={m}
              className={`mode-btn ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              <Text className={`mode-btn-text ${mode === m ? 'active' : ''}`}>
                {m === 'passenger' ? '乘客' : '司机'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="mt-list" scrollY>
        {mode === 'passenger' ? (
          <>
            {acceptedRequests.length > 0 && (
              <View className="notif-section">
                <View className="notif-label-row">
                  <View className="notif-pulse" style={{ backgroundColor: '#2D9B5A' }} />
                  <Text className="notif-label" style={{ color: '#2D9B5A' }}>有司机接了你的求拼需求</Text>
                </View>
                {acceptedRequests.map((req, idx) => (
                  <AcceptedCard key={idx} req={req} />
                ))}
              </View>
            )}

            {myBookings.length === 0 && acceptedRequests.length === 0 ? (
              <View className="empty">
                <Text className="empty-icon">📌</Text>
                <Text className="empty-title">还没有行程记录</Text>
                <Text className="empty-sub">去拼车大厅找一辆车，或者发布求拼需求</Text>
              </View>
            ) : (
              myBookings.map((item) => {
                const sl = statusLabel(item.status);
                return (
                  <View className="booking-card">
                    <View className="booking-top">
                      <TimeTag timeType={item.trip.timeType} scheduledTime={item.trip.scheduledTime} />
                      <View className="status-tag" style={{ backgroundColor: sl.bg }}>
                        <Text className="status-text" style={{ color: sl.color }}>{sl.text}</Text>
                      </View>
                    </View>
                    <View className="route-row">
                      <Text className="route-text">{item.trip.route.from}</Text>
                      <Text className="route-arrow">→</Text>
                      <Text className="route-text">{item.trip.route.to}</Text>
                    </View>
                    <View className="points-row">
                      <View className="point-item">
                        <View className="point-dot" style={{ backgroundColor: '#2D9B5A' }} />
                        <Text className="point-text" numberOfLines={1}>{item.pickupPoint}</Text>
                      </View>
                      <View className="point-sep" style={{ backgroundColor: '#e0e0e6' }} />
                      <View className="point-item">
                        <View className="point-dot" style={{ backgroundColor: '#A93226' }} />
                        <Text className="point-text" numberOfLines={1}>{item.dropoffPoint}</Text>
                      </View>
                    </View>
                    {item.status === 'confirmed' && (
                      <View
                        className="action-btn"
                        style={{ backgroundColor: '#1D6FA4' }}
                        onClick={() => Taro.navigateTo({ url: `/pages/trip-success/index?tripId=${item.tripId}` })}
                      >
                        <Text className="action-btn-text">查看司机信息</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {myTrips.length === 0 ? (
              <View className="empty">
                <Text className="empty-icon">🚗</Text>
                <Text className="empty-title">今天还没出车哦</Text>
                <Text className="empty-sub">去发布常用路线，快速拼满一车</Text>
              </View>
            ) : (
              myTrips.map((item) => (
                <View className="booking-card">
                  <View className="booking-top">
                    <TimeTag timeType={item.timeType} scheduledTime={item.scheduledTime} />
                    <Text className="seats-text">余 {item.remainingSeats}/{item.totalSeats} 座</Text>
                  </View>
                  <View className="route-row">
                    <Text className="route-text">{item.route.from}</Text>
                    <Text className="route-arrow">→</Text>
                    <Text className="route-text">{item.route.to}</Text>
                  </View>
                  <View className="btn-row">
                    <View className="action-btn" style={{ backgroundColor: '#1D6FA4', flex: 1 }}
                      onClick={() => Taro.navigateTo({ url: '/pages/driver-board/index' })}>
                      <Text className="action-btn-text">接客看板</Text>
                    </View>
                    <View className="action-btn" style={{ backgroundColor: '#A93226', flex: 1 }}
                      onClick={() => Taro.navigateTo({ url: `/pages/share-card/index?tripId=${item.id}` })}>
                      <Text className="action-btn-text">分享卡片</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
