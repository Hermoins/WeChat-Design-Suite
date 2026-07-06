import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import type { Trip, PassengerRequest } from '../../store/appContext';
import './index.scss';

// ========== 共用组件：时间标签 ==========
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

// ========== 乘客端：拼车大厅 ==========
const ROUTES = [
  { key: 'all', label: '全部' },
  { key: 'to-daoyuan', label: '新城子 → 道义' },
  { key: 'to-xinchengzi', label: '道义 → 新城子' },
];

function PassengerHall({ trips }: { trips: Trip[] }) {
  const { routeFilter, setRouteFilter } = useApp();
  const [count, setCount] = useState(3);

  const filtered = trips.filter((t) => {
    if (routeFilter === 'to-daoyuan') return t.route.from === '新城子';
    if (routeFilter === 'to-xinchengzi') return t.route.from === '道义商圈';
    return true;
  });

  return (
    <View className="tab-content passenger-hall">
      {/* Header */}
      <View className="hall-header">
        <Text className="hall-title">拼车大厅</Text>
        <Text className="hall-subtitle">沈北·新城子同城拼车</Text>
      </View>

      {/* Route filter */}
      <View className="filter-wrap">
        <ScrollView className="filter-row" scrollX showScrollbar={false}>
          {ROUTES.map((r) => {
            const active = routeFilter === r.key;
            return (
              <View
                key={r.key}
                className={`filter-chip ${active ? 'active' : ''}`}
                onClick={() => setRouteFilter(r.key as any)}
              >
                <Text className={`filter-text ${active ? 'active' : ''}`}>{r.label}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Trip list */}
      <ScrollView className="trip-list" scrollY>
        {filtered.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-title">当前没有车次</Text>
            <Text className="empty-sub">您可以发布出行需求，等候司机匹配</Text>
          </View>
        ) : (
          filtered.map((trip) => {
            const isFull = trip.remainingSeats === 0;
            return (
              <View key={trip.id} className="trip-card" onClick={() => !isFull && Taro.navigateTo({ url: `/pages/seat-booking/index?tripId=${trip.id}` })}>
                <View className="trip-top-row">
                  <TimeTag timeType={trip.timeType} scheduledTime={trip.scheduledTime} />
                  <View className={`seat-badge ${isFull ? 'full' : ''}`}>
                    <Text className="seat-text">{isFull ? '满座' : `余 ${trip.remainingSeats} 座`}</Text>
                  </View>
                </View>
                <View className="trip-route-row">
                  <Text className="route-from">{trip.route.from}</Text>
                  <Text className="route-arrow">→</Text>
                  <Text className="route-to">{trip.route.to}</Text>
                </View>
                <View className="trip-bottom-row">
                  <View className="driver-info">
                    <Text className="driver-name">{trip.driverName}</Text>
                    <Text className="driver-hint">· 车牌/电话抢座后显示</Text>
                  </View>
                  <View className={`grab-btn ${isFull ? 'disabled' : ''}`}>
                    <Text className="grab-btn-text">{isFull ? '满座' : '抢座'}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ========== 司机端：乘客需求列表 ==========
const DEMO_PHONES: Record<string, string> = {
  pr1: '13800001111', pr2: '13800002222', pr3: '13800003333',
  pr4: '13800004444', pr5: '13800005555',
};

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  return `${Math.floor(mins / 60)}小时前`;
}

function DriverDashboard({ requests }: { requests: PassengerRequest[] }) {
  const { myTrips, savedRoutes, removeSavedRoute } = useApp();
  const [filterKey, setFilterKey] = useState<string>('all');

  const activeTrip = myTrips[0];
  const savedFromSet = new Set(savedRoutes.map((r) => `${r.from}|${r.to}`));

  const filtered = requests.filter((r) => {
    if (filterKey === 'to-daoyuan') return r.route.to === '道义商圈';
    if (filterKey === 'to-xinchengzi') return r.route.to === '新城子';
    return true;
  });

  return (
    <View className="tab-content driver-dashboard">
      {/* Dark header */}
      <View className="dd-header">
        <View className="header-top">
          <View>
            <Text className="header-title">求拼大厅</Text>
            <Text className="header-sub">乘客实时需求 · 顺路就接</Text>
          </View>
          <View className="role-badge"><Text className="role-badge-text">🚗 司机</Text></View>
        </View>
        {activeTrip && (
          <View className="active-banner" onClick={() => Taro.navigateTo({ url: '/pages/driver-board/index' })}>
            <View className="active-dot" />
            <Text className="active-banner-text">行程进行中：{activeTrip.route.from} → {activeTrip.route.to}</Text>
            <Text className="active-arrow">›</Text>
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <View className="filter-bar">
        {[
          { key: 'all', label: `全部 (${requests.length})` },
          { key: 'to-daoyuan', label: '→ 道义商圈' },
          { key: 'to-xinchengzi', label: '→ 新城子' },
        ].map((f) => (
          <View key={f.key} className={`filter-tab ${filterKey === f.key ? 'active' : ''}`} onClick={() => setFilterKey(f.key)}>
            <Text className={`filter-tab-text ${filterKey === f.key ? 'active' : ''}`}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* Saved routes */}
      {savedRoutes.length > 0 && (
        <View className="saved-bar">
          <Text className="saved-label">常用路线</Text>
          <View className="saved-chips">
            {savedRoutes.map((r, i) => (
              <View key={i} className="saved-chip">
                <View className="saved-chip-main" onClick={() => Taro.navigateTo({ url: '/pages/driver-publish/index?from=' + encodeURIComponent(r.from) + '&to=' + encodeURIComponent(r.to) })}>
                  <Text className="saved-chip-text">{r.from}→{r.to}</Text>
                </View>
                <View className="saved-chip-del" onClick={() => removeSavedRoute(i)}><Text>✕</Text></View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Request list */}
      <ScrollView className="req-list" scrollY>
        {filtered.length === 0 ? (
          <View className="empty-wrap"><Text className="empty-text">暂无求拼需求，稍后再看</Text></View>
        ) : (
          filtered.map((req) => {
            const isMatch = savedFromSet.has(`${req.route.from}|${req.route.to}`);
            const tagColor = req.timeType === 'now' ? '#A93226' : req.timeType === 'soon' ? '#C86820' : '#1D6FA4';
            const tagLabel = req.timeType === 'now' ? '马上走' : req.timeType === 'soon' ? '10分钟后' : req.scheduledTime ?? '预约';
            const phone = DEMO_PHONES[req.id] ?? '13800000000';

            return (
              <View key={req.id} className={`req-card ${isMatch ? 'match' : ''}`}>
                <View className="req-top">
                  <View className="req-route-row">
                    <Text className="req-from">{req.route.from}</Text>
                    <Text className="req-arrow">→</Text>
                    <Text className="req-to">{req.route.to}</Text>
                    {isMatch && <View className="match-badge" style={{ backgroundColor: tagColor + '20' }}><Text className="match-text" style={{ color: tagColor }}>顺路</Text></View>}
                  </View>
                  <Text className="req-time">{timeAgo(req.createdAt)}</Text>
                </View>
                <View className="req-tags">
                  <View className="tag" style={{ backgroundColor: tagColor + '18' }}>
                    <View className="tag-dot" style={{ backgroundColor: tagColor }} />
                    <Text className="tag-text" style={{ color: tagColor }}>{tagLabel}</Text>
                  </View>
                  <View className="tag muted"><Text className="tag-text">{req.passengerCount}人</Text></View>
                </View>
                {req.note ? <Text className="req-note">{req.note}</Text> : null}
                <View className="req-actions">
                  <View className="action-btn phone-btn" onClick={() => Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {})}>
                    <Text className="action-btn-text">📞 联系乘客</Text>
                  </View>
                  <View className="action-btn invite-btn" onClick={() => Taro.navigateTo({ url: `/pages/driver-publish/index?preRoute=${encodeURIComponent(JSON.stringify(req.route))}&preTime=${req.timeType}&requestId=${req.id}` })}>
                    <Text className="action-btn-text">🚗 邀请上车</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ========== 主页面 ==========
export default function Index() {
  const { userRole, trips, passengerRequests } = useApp();

  return (
    <View className="page index-page">
      {userRole === 'driver' ? (
        <DriverDashboard requests={passengerRequests} />
      ) : (
        <PassengerHall trips={trips} />
      )}
    </View>
  );
}
