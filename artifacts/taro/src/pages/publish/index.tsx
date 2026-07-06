import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

const ROUTES = [
  { from: '新城子', to: '道义商圈' },
  { from: '道义商圈', to: '新城子' },
];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DAY_OPTIONS = ['今天', '明天', '后天'];

// ===== 乘客发布需求 =====
function PassengerPublishForm() {
  const { publishPassengerRequest } = useApp();
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [timeType, setTimeType] = useState<'now' | 'soon' | 'scheduled'>('now');
  const [passengerCount, setPassengerCount] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const route = ROUTES[selectedRoute];

  const handlePublish = async () => {
    setLoading(true);
    try {
      publishPassengerRequest({
        route: { from: route.from, to: route.to },
        timeType,
        scheduledTime: null,
        passengerCount,
        note,
      });
      Taro.showToast({ title: '需求已发布', icon: 'success' });
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1000);
    } catch (e) {
      Taro.showToast({ title: '发布失败', icon: 'error' });
    }
    setLoading(false);
  };

  return (
    <ScrollView className="publish-scroll" scrollY>
      <View className="form-group">
        <Text className="label">路线</Text>
        <Picker value={selectedRoute} onChange={(e) => setSelectedRoute(parseInt(e.detail.value))}>
          <View className="picker">{route.from} → {route.to}</View>
        </Picker>
      </View>
      <View className="form-group">
        <Text className="label">出发时间</Text>
        <View className="time-options">
          {(['now', 'soon', 'scheduled'] as const).map((t) => (
            <Button key={t} onClick={() => setTimeType(t)} className={`time-btn ${timeType === t ? 'active' : ''}`}>
              {t === 'now' ? '现在' : t === 'soon' ? '10分钟后' : '预约'}
            </Button>
          ))}
        </View>
      </View>
      <View className="form-group">
        <Text className="label">乘客人数</Text>
        <View className="control-group">
          <Button onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}>-</Button>
          <Text>{passengerCount}</Text>
          <Button onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}>+</Button>
        </View>
      </View>
      <View className="form-group">
        <Text className="label">备注（可选）</Text>
        <Input className="input" placeholder="例如：正良大街口，2人同行" value={note} onInput={(e) => setNote(e.detail.value)} />
      </View>
      <Button loading={loading} onClick={handlePublish} className="publish-btn">发布需求</Button>
    </ScrollView>
  );
}

// ===== 司机发布行程 =====
function DriverPublishForm() {
  const { publishTrip, addSavedRoute } = useApp();
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [timeType, setTimeType] = useState<'now' | 'soon' | 'scheduled'>('now');
  const [seats, setSeats] = useState(3);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [loading, setLoading] = useState(false);

  const route = ROUTES[selectedRoute];
  const pad = (n: number) => n.toString().padStart(2, '0');
  const scheduledTime = `${DAY_OPTIONS[day]} ${pad(hour)}:${pad(minute)}`;

  const handlePublish = async () => {
    setLoading(true);
    try {
      const trip = publishTrip({
        driverName: '我',
        driverPhone: '13800000000',
        driverPlate: '辽A·88888',
        driverCar: '白色别克GL8',
        route: { from: route.from, to: route.to },
        timeType,
        scheduledTime: timeType === 'scheduled' ? scheduledTime : null,
        totalSeats: seats,
        remainingSeats: seats,
        price: '10元',
      });
      addSavedRoute({ from: route.from, to: route.to });
      Taro.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => Taro.navigateTo({ url: '/pages/driver-board/index' }), 1000);
    } catch (e) {
      Taro.showToast({ title: '发布失败', icon: 'error' });
    }
    setLoading(false);
  };

  return (
    <ScrollView className="publish-scroll" scrollY>
      <View className="form-group">
        <Text className="label">路线</Text>
        <Picker value={selectedRoute} onChange={(e) => setSelectedRoute(parseInt(e.detail.value))}>
          <View className="picker">{route.from} → {route.to}</View>
        </Picker>
      </View>
      <View className="form-group">
        <Text className="label">出发时间</Text>
        <View className="time-options">
          {(['now', 'soon', 'scheduled'] as const).map((t) => (
            <Button key={t} onClick={() => setTimeType(t)} className={`time-btn ${timeType === t ? 'active' : ''}`}>
              {t === 'now' ? '现在' : t === 'soon' ? '10分钟后' : '预约'}
            </Button>
          ))}
        </View>
      </View>
      {timeType === 'scheduled' && (
        <View className="form-group">
          <Text className="label">选择日期与时间</Text>
          <View style={{ marginTop: 8 }}>
            <Picker value={day} range={DAY_OPTIONS} onChange={(e) => setDay(parseInt(e.detail.value))}>
              <View className="picker">{DAY_OPTIONS[day]}</View>
            </Picker>
          </View>
          <View style={{ marginTop: 8 }}>
            <Picker value={hour} range={HOURS} onChange={(e) => setHour(parseInt(e.detail.value))}>
              <View className="picker">时：{pad(hour)}</View>
            </Picker>
          </View>
          <View style={{ marginTop: 8 }}>
            <Picker value={minute} range={MINUTES} onChange={(e) => setMinute(MINUTES[parseInt(e.detail.value)])}>
              <View className="picker">分：{pad(minute)}</View>
            </Picker>
          </View>
        </View>
      )}
      <View className="form-group">
        <Text className="label">可载人数</Text>
        <View className="control-group">
          <Button onClick={() => setSeats(Math.max(1, seats - 1))}>-</Button>
          <Text>{seats}</Text>
          <Button onClick={() => setSeats(Math.min(6, seats + 1))}>+</Button>
        </View>
      </View>
      <Button loading={loading} onClick={handlePublish} className="publish-btn">发布行程</Button>
    </ScrollView>
  );
}

// ===== 主页面 =====
export default function Publish() {
  const { userRole } = useApp();

  return (
    <View className="page publish-page">
      <View className="publish-header">
        <Text className="publish-title">{userRole === 'driver' ? '发布行程' : '拼车需求'}</Text>
      </View>
      {userRole === 'driver' ? <DriverPublishForm /> : <PassengerPublishForm />}
    </View>
  );
}
