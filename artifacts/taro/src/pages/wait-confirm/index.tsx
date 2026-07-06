import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const TOTAL = 60;

export default function WaitConfirm() {
  const [seconds, setSeconds] = useState(TOTAL);
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'rejected'>('waiting');

  // Simulate driver accepting after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('confirmed');
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== 'waiting') return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setStatus('rejected');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const progressPercent = ((TOTAL - seconds) / TOTAL) * 100;

  if (status === 'confirmed') {
    return (
      <View className="page wc-page confirmed-bg">
        <View className="status-content">
          <View className="big-icon success">
            <Text className="big-icon-text">✓</Text>
          </View>
          <Text className="status-title" style={{ color: '#2D9B5A' }}>拼车成功！</Text>
          <Text className="status-subtitle">等待接驾中</Text>
          <View
            className="big-btn"
            style={{ backgroundColor: '#2D9B5A', marginTop: 32 }}
            onClick={() => Taro.navigateTo({ url: '/pages/trip-success/index' })}
          >
            <Text className="big-btn-text">查看司机信息 / 联系司机</Text>
          </View>
          <View
            className="outline-btn"
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text className="outline-btn-text" style={{ color: '#2D9B5A' }}>返回大厅</Text>
          </View>
        </View>
      </View>
    );
  }

  if (status === 'rejected') {
    return (
      <View className="page wc-page rejected-bg">
        <View className="status-content">
          <View className="big-icon error">
            <Text className="big-icon-text">✕</Text>
          </View>
          <Text className="status-title" style={{ color: '#A93226' }}>未能接单</Text>
          <Text className="rejected-sub">
            抱歉，司机因路线不顺未能接单。{'\n'}座位已释放，请重新选择车次。
          </Text>
          <View
            className="big-btn"
            style={{ backgroundColor: '#A93226', marginTop: 32 }}
            onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
          >
            <Text className="big-btn-text">返回大厅重新选车</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="page wc-page">
      <View className="center-content">
        {/* Countdown circle */}
        <View className="countdown-ring">
          <View className="countdown-circle">
            <Text className="countdown-num">{seconds}</Text>
            <Text className="countdown-label">秒</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="progress-bar">
          <View className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </View>

        <Text className="waiting-title">等待司机接单</Text>
        <Text className="waiting-text">
          司机正在看路核对您的位置，{'\n'}1分钟内未接单将自动取消，请稍候...
        </Text>
      </View>

      <View
        className="cancel-btn"
        onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
      >
        <Text className="cancel-text">取消等待</Text>
      </View>
    </View>
  );
}
