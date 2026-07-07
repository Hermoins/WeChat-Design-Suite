import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface DriverShareCardProps {
  trip: {
    id: string;
    driverName: string;
    driverPhone: string;
    driverPlate: string;
    driverCar: string;
    route: { from: string; to: string };
    timeType: 'now' | 'soon' | 'scheduled';
    scheduledTime: string | null;
    totalSeats: number;
    remainingSeats: number;
    status: 'active' | 'full' | 'completed';
    price: string;
  };
  compact?: boolean; // 紧凑模式，用于预览
  showActionButtons?: boolean; // 是否显示操作按钮
  onUpdateShare?: () => void;
}

/**
 * 司机端分享卡片组件
 * 用于展示和分享车次信息到微信群
 */
export default function DriverShareCard({
  trip,
  compact = false,
  showActionButtons = true,
  onUpdateShare,
}: DriverShareCardProps) {
  const isImmediate = trip.timeType === 'now';
  const isSoon = trip.timeType === 'soon';
  const isScheduled = trip.timeType === 'scheduled';

  // 根据时间和状态决定颜色
  const accentColor = useMemo(() => {
    if (trip.status === 'full') return '#888888';
    if (isScheduled) return '#1D6FA4';
    if (isImmediate) return '#A93226';
    return '#C86820';
  }, [trip.status, isImmediate, isScheduled, isSoon]);

  const timeLabel = isImmediate
    ? '马上走'
    : isSoon
    ? '10分钟后'
    : trip.scheduledTime ?? '预约';

  const bookedSeats = trip.totalSeats - trip.remainingSeats;
  const hasPassengers = bookedSeats > 0;

  // 拨打电话
  const handleCallPhone = () => {
    Taro.makePhoneCall({ phoneNumber: trip.driverPhone });
  };

  // 快捷更新分享
  const handleQuickUpdateShare = () => {
    if (onUpdateShare) {
      onUpdateShare();
    } else {
      Taro.navigateTo({
        url: `/pages/share-card/index?tripId=${trip.id}&mode=driver`,
      });
    }
  };

  return (
    <View className={`share-card-wrapper ${compact ? 'compact' : ''}`}>
      {/* 提示文字（仅完整模式显示） */}
      {!compact && (
        <View className="instruction">
          <Text className="instruction-icon">💡</Text>
          <Text className="instruction-text">
            截图或点击下方按钮分享到微信群，乘客点击即可一键抢座
          </Text>
        </View>
      )}

      {/* 卡片主体 */}
      <View className="share-card-design">
        {/* 顶部彩条 */}
        <View className="card-band" style={{ backgroundColor: accentColor }}>
          <View className="left-section">
            <Text className="seat-count-big">余{trip.remainingSeats}座</Text>
            {trip.status === 'full' && <Text className="status-tag">已满员</Text>}
          </View>
          <View className="time-tag-big">
            <Text className="time-tag-big-text">{timeLabel}</Text>
          </View>
        </View>

        {/* 白色主体 */}
        <View className="card-body">
          {/* 路线展示 */}
          <View className="route-section">
            <Text className="route-city">{trip.route.from}</Text>
            <View className="arrow-big" style={{ backgroundColor: accentColor + '18' }}>
              <Text className="arrow-big-text">→</Text>
            </View>
            <Text className="route-city">{trip.route.to}</Text>
          </View>

          {/* 关键信息 */}
          <View className="info-section">
            <View className="info-item">
              <Text className="info-label">💰</Text>
              <Text className="info-value">{trip.price}</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">🚗</Text>
              <Text className="info-value">{trip.driverCar}</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">📍</Text>
              <Text className="info-value">{trip.driverPlate}</Text>
            </View>
          </View>

          {/* 已接乘客数 */}
          {hasPassengers && (
            <View className="passenger-section">
              <Text className="passenger-tag">✓ 已接 {bookedSeats} 人</Text>
            </View>
          )}

          {/* 分割线 */}
          <View className="divider-row">
            <Text className="divider-text" style={{ color: accentColor + '30' }}>
              • • • • • • • • • • • • • • • • • • • •
            </Text>
          </View>

          {/* CTA区域 */}
          <View className="card-footer">
            <View className="cta-wrap">
              <Text className="cta-main">点击卡片立刻占座</Text>
              <Text className="cta-sub">上门接送 · 按时发车</Text>
            </View>
            <View className="cta-badge" style={{ backgroundColor: accentColor }}>
              <Text className="cta-badge-text">抢座 →</Text>
            </View>
          </View>

          {/* 联系方式 */}
          {!compact && (
            <View className="contact-section">
              <Text className="contact-text">司机：{trip.driverName}</Text>
              <View className="contact-phone" onClick={handleCallPhone}>
                <Text className="phone-text">📞 {trip.driverPhone}</Text>
              </View>
            </View>
          )}

          {/* 水印 */}
          <View className="watermark">
            <Text className="watermark-text">沈北拼车 · {trip.route.from}↔{trip.route.to}</Text>
          </View>
        </View>
      </View>

      {/* 操作按钮区域 */}
      {showActionButtons && !compact && (
        <View className="action-buttons">
          <View className="share-btn" onClick={handleQuickUpdateShare}>
            <Text className="share-btn-text">📤 分享到微信群</Text>
          </View>
          {hasPassengers && (
            <View className="update-btn" onClick={handleQuickUpdateShare}>
              <Text className="update-btn-text">🔄 更新座位信息再分享</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}