import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface PassengerShareCardProps {
  request: {
    id: string;
    route: { from: string; to: string };
    timeType: 'now' | 'soon' | 'scheduled';
    scheduledTime: string | null;
    passengerCount: number;
    note: string;
    acceptedBy?: {
      driverName: string;
      driverPhone: string;
      driverPlate: string;
      driverCar: string;
      tripId: string;
    };
  };
  compact?: boolean;
  showActionButtons?: boolean;
  onShare?: () => void;
}

/**
 * 乘客端分享卡片组件
 * 用于展示和分享乘客拼车需求到微信群
 */
export default function PassengerShareCard({
  request,
  compact = false,
  showActionButtons = true,
  onShare,
}: PassengerShareCardProps) {
  const isImmediate = request.timeType === 'now';
  const isSoon = request.timeType === 'soon';
  const isScheduled = request.timeType === 'scheduled';

  // 根据时间和是否被接单决定颜色
  const accentColor = useMemo(() => {
    if (request.acceptedBy) return '#2E7D32'; // 已接单用绿色
    if (isScheduled) return '#6B21A8'; // 预约用紫色
    if (isImmediate) return '#D97706'; // 立即用橙色
    return '#0891B2'; // 10分钟后用青色
  }, [request.acceptedBy, isImmediate, isScheduled, isSoon]);

  const timeLabel = isImmediate
    ? '现在就要走'
    : isSoon
    ? '约10分钟后'
    : request.scheduledTime ?? '预约';

  const isAccepted = !!request.acceptedBy;

  // 解析上车点信息
  const pickupInfo = request.note.split(/[，,、]/)[0] || request.note;

  // 拨打电话（仅已接单时）
  const handleCallPhone = () => {
    if (request.acceptedBy) {
      Taro.makePhoneCall({ phoneNumber: request.acceptedBy.driverPhone });
    }
  };

  // 分享
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Taro.navigateTo({
        url: `/pages/share-card/index?requestId=${request.id}&mode=passenger`,
      });
    }
  };

  return (
    <View className={`share-card-wrapper passenger-card ${compact ? 'compact' : ''}`}>
      {/* 提示文字（仅完整模式显示） */}
      {!compact && !isAccepted && (
        <View className="instruction passenger-instruction">
          <Text className="instruction-icon">🎯</Text>
          <Text className="instruction-text">
            分享到微信群，附近司机看到后可以联系您
          </Text>
        </View>
      )}

      {/* 卡片主体 */}
      <View className="share-card-design">
        {/* 顶部彩条 */}
        <View className="card-band" style={{ backgroundColor: accentColor }}>
          <View className="left-section">
            <Text className="seat-count-big">
              {isAccepted ? '✓ 已接单' : `求${request.passengerCount}座`}
            </Text>
          </View>
          <View className="time-tag-big">
            <Text className="time-tag-big-text">{timeLabel}</Text>
          </View>
        </View>

        {/* 白色主体 */}
        <View className="card-body">
          {/* 路线展示 */}
          <View className="route-section">
            <Text className="route-city">{request.route.from}</Text>
            <View className="arrow-big" style={{ backgroundColor: accentColor + '18' }}>
              <Text className="arrow-big-text">→</Text>
            </View>
            <Text className="route-city">{request.route.to}</Text>
          </View>

          {/* 关键信息 */}
          <View className="info-section passenger-info">
            <View className="info-item">
              <Text className="info-label">👥</Text>
              <Text className="info-value">{request.passengerCount}人</Text>
            </View>
            <View className="info-item">
              <Text className="info-label">📍</Text>
              <Text className="info-value small-text">{pickupInfo}</Text>
            </View>
          </View>

          {/* 完整备注信息 */}
          {request.note && !compact && (
            <View className="note-section">
              <Text className="note-label">备注：</Text>
              <Text className="note-text">{request.note}</Text>
            </View>
          )}

          {/* 司机信息（已接单时显示） */}
          {isAccepted && request.acceptedBy && !compact && (
            <View className="driver-info-section">
              <View className="driver-info-header">
                <Text className="driver-info-title">🚗 司机已接单</Text>
              </View>
              <View className="driver-info-row">
                <Text className="driver-info-label">司机：</Text>
                <Text className="driver-info-value">{request.acceptedBy.driverName}</Text>
              </View>
              <View className="driver-info-row">
                <Text className="driver-info-label">车型：</Text>
                <Text className="driver-info-value">{request.acceptedBy.driverCar}</Text>
              </View>
              <View className="driver-info-row">
                <Text className="driver-info-label">车牌：</Text>
                <Text className="driver-info-value">{request.acceptedBy.driverPlate}</Text>
              </View>
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
              <Text className="cta-main">
                {isAccepted ? '已接单行程' : '附近司机点击接单'}
              </Text>
              <Text className="cta-sub">
                {isAccepted ? '按约定时间到达' : '快速响应 · 安全可靠'}
              </Text>
            </View>
            <View className="cta-badge" style={{ backgroundColor: accentColor }}>
              <Text className="cta-badge-text">
                {isAccepted ? '联系 →' : '接单 →'}
              </Text>
            </View>
          </View>

          {/* 联系方式（已接单时显示） */}
          {isAccepted && request.acceptedBy && !compact && (
            <View className="contact-section">
              <Text className="contact-text">
                司机：{request.acceptedBy.driverName}
              </Text>
              <View className="contact-phone" onClick={handleCallPhone}>
                <Text className="phone-text">
                  📞 {request.acceptedBy.driverPhone}
                </Text>
              </View>
            </View>
          )}

          {/* 水印 */}
          <View className="watermark">
            <Text className="watermark-text">
              沈北拼车 · {request.route.from}↔{request.route.to}
            </Text>
          </View>
        </View>
      </View>

      {/* 操作按钮区域 */}
      {showActionButtons && !compact && (
        <View className="action-buttons">
          <View className="share-btn" onClick={handleShare}>
            <Text className="share-btn-text">
              📤 {isAccepted ? '分享行程' : '分享到微信群'}
            </Text>
          </View>
          {isAccepted && (
            <View className="call-btn" onClick={handleCallPhone}>
              <Text className="call-btn-text">📞 联系司机</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}