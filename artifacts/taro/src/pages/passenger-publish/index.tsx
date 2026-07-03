import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import './index.scss';

const ROUTES = [
  { from: '新城子', to: '道义商圈' },
  { from: '道义商圈', to: '新城子' },
];

export default function PassengerPublish() {
  const { publishPassengerRequest, addHistoryAddress } = useApp();
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
    <ScrollView className="page passenger-publish" scrollY>
      <View className="form-group">
        <Text className="label">路线</Text>
        <Picker value={selectedRoute} onChange={(e) => setSelectedRoute(parseInt(e.detail.value))}>
          <View className="picker">
            {route.from} → {route.to}
          </View>
        </Picker>
      </View>

      <View className="form-group">
        <Text className="label">出发时间</Text>
        <View className="time-options">
          {(['now', 'soon', 'scheduled'] as const).map((t) => (
            <Button
              key={t}
              onClick={() => setTimeType(t)}
              className={`time-btn ${timeType === t ? 'active' : ''}`}
            >
              {t === 'now' ? '现在' : t === 'soon' ? '10分钟后' : '预约'}
            </Button>
          ))}
        </View>
      </View>

      <View className="form-group">
        <Text className="label">乘客人数</Text>
        <View className="passenger-control">
          <Button onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}>-</Button>
          <Text>{passengerCount}</Text>
          <Button onClick={() => setPassengerCount(Math.min(6, passengerCount + 1))}>+</Button>
        </View>
      </View>

      <View className="form-group">
        <Text className="label">备注（可选）</Text>
        <Input
          className="input"
          placeholder="例如：正良大街口，2人同行"
          value={note}
          onInput={(e) => setNote(e.detail.value)}
        />
      </View>

      <Button loading={loading} onClick={handlePublish} className="publish-btn">
        发布需求
      </Button>
    </ScrollView>
  );
}
