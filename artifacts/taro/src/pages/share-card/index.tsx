import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

export default function ShareCard() {
  const tripId = Taro.getCurrentInstance().router?.params?.tripId as string | undefined;
  const { trips } = useApp();

  const trip = trips.find((t) => t.id === tripId) ?? trips[0];

  if (!trip) {
    return (
      <View className="page share-card-page">
        <Text className="not-found">行程不存在</Text>
      </View>
    );
  }

  const isImmediate = trip.timeType === 'now';
  const isSoon = trip.timeType === 'soon';
  const isScheduled = trip.timeType === 'scheduled';
  const accentColor = isScheduled ? '#1D6FA4' : isImmediate ? '#A93226' : '#C86820';

  const timeLabel = isImmediate
    ? '马上走'
    : isSoon
    ? '10分钟后'
    : trip.scheduledTime ?? '预约';

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  return (
    <View className="page share-card-page">
      {/* Instruction */}
      <View className="instruction">
        <Text className="instruction-text">
          ℹ️ 截图此卡片，发到微信群 / 朋友圈，乘客点击进入小程序即可一键抢座
        </Text>
      </View>

      {/* The card */}
      <View className="share-card-design">
        {/* Colored header band */}
        <View className="card-band" style={{ backgroundColor: accentColor }}>
          <Text className="seat-count-big">[余{trip.remainingSeats}座]</Text>
          <View className="time-tag-big">
            <Text className="time-tag-big-text">{timeLabel}</Text>
          </View>
        </View>

        {/* White body */}
        <View className="card-body" style={{ backgroundColor: '#ffffff' }}>
          {/* Route */}
          <View className="route-section">
            <Text className="route-city">{trip.route.from}</Text>
            <View className="arrow-big" style={{ backgroundColor: accentColor + '18' }}>
              <Text className="arrow-big-text">→</Text>
            </View>
            <Text className="route-city">{trip.route.to}</Text>
          </View>

          {/* Divider */}
          <View className="divider-row">
            {/* 模拟虚线圆点 */}
            <Text className="divider-text" style={{ color: accentColor + '30' }}>• • • • • • • • • • • • • • • • • • • •</Text>
          </View>

          {/* CTA */}
          <View className="card-footer">
            <View className="cta-wrap">
              <Text className="cta-main">点击卡片立刻占座</Text>
              <Text className="cta-sub">上门接送 · 按时发车</Text>
            </View>
            <View className="cta-badge" style={{ backgroundColor: accentColor }}>
              <Text className="cta-badge-text">抢座 →</Text>
            </View>
          </View>

          {/* Watermark */}
          <View className="watermark">
            <Text className="watermark-text">沈北拼车 · 新城子↔道义商圈</Text>
          </View>
        </View>
      </View>

      {/* Tip */}
      <Text className="tip">↑ 长按卡片区域可截图保存</Text>

      {/* Action buttons */}
      <View className="share-footer">
        <View className="share-btn" onClick={handleShare}>
          <Text className="share-btn-text">分享到微信群</Text>
        </View>
        <View className="board-menu-btn" onClick={() => Taro.navigateTo({ url: '/pages/driver-board/index' })}>
          <Text className="board-menu-btn-text">进入接客看板</Text>
        </View>
      </View>
    </View>
  );
}
