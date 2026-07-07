import React, { useEffect, useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useApp } from '../../store/appContext';
import DriverShareCard from '../../components/DriverShareCard';
import PassengerShareCard from '../../components/PassengerShareCard';
import shareService, { ShareMode, ShareCardData } from '../../services/shareService';
import './index.scss';

/**
 * 分享卡片页面
 * 支持司机端和乘客端的分享卡片展示
 */
export default function ShareCard() {
  const { trips, myPassengerRequests, myTrips } = useApp();
  const [mode, setMode] = useState<ShareMode | null>(null);
  const [tripId, setTripId] = useState<string | undefined>();
  const [requestId, setRequestId] = useState<string | undefined>();
  const [shareSource, setShareSource] = useState<string | undefined>();

  useEffect(() => {
    // 从路由参数中解析分享数据
    const instance = Taro.getCurrentInstance();
    const params = instance.router?.params || {};

    setMode(params.mode as ShareMode);
    setTripId(params.tripId);
    setRequestId(params.requestId);
    setShareSource(params.source);
  }, []);

  useDidShow(() => {
    // 页面显示时重新设置分享配置
    const instance = Taro.getCurrentInstance();
    const params = instance.router?.params || {};

    if (params.mode && ['driver', 'passenger'].includes(params.mode)) {
      const shareData: ShareCardData = {
        mode: params.mode as ShareMode,
        tripId: params.tripId,
        requestId: params.requestId,
        source: params.source,
        timestamp: params.timestamp ? parseInt(params.timestamp) : Date.now(),
      };

      shareService.setupShareConfig(shareData);

      // 记录分享来源
      if (shareSource && shareSource !== 'share') {
        console.log('分享来源:', shareSource);
      }
    }
  });

  // 获取对应的车次或请求
  const trip = tripId
    ? [...trips, ...myTrips].find((t) => t.id === tripId)
    : myTrips[0];
  const request = requestId
    ? myPassengerRequests.find((r) => r.id === requestId)
    : myPassengerRequests[0];

  // 根据模式显示对应卡片
  const renderContent = () => {
    if (!mode) {
      return (
        <View className="page share-card-page">
          <Text className="not-found">参数错误，请重新进入</Text>
        </View>
      );
    }

    if (mode === 'driver') {
      if (!trip) {
        return (
          <View className="page share-card-page">
            <Text className="not-found">行程不存在</Text>
            <Button
              className="back-btn"
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              返回首页
            </Button>
          </View>
        );
      }

      return (
        <View className="page share-card-page">
          {/* 司机端卡片 */}
          <DriverShareCard
            trip={trip}
            onUpdateShare={() => {
              shareService.triggerShare({
                mode: 'driver',
                tripId: trip.id,
                source: shareSource,
                timestamp: Date.now(),
              });
            }}
          />

          {/* 底部提示 */}
          <View className="bottom-tips">
            <Text className="tips-title">分享小贴士</Text>
            <View className="tips-list">
              <Text className="tips-item">• 分享到附近的小区群、公司群</Text>
              <Text className="tips-item">• 朋友圈可以扩大覆盖范围</Text>
              <Text className="tips-item">• 座位变化时及时更新再分享</Text>
            </View>
          </View>

          {/* 返回按钮 */}
          {shareSource === 'share' && (
            <View className="back-section">
              <Button
                className="back-home-btn"
                onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
              >
                返回首页
              </Button>
            </View>
          )}
        </View>
      );
    }

    if (mode === 'passenger') {
      if (!request) {
        return (
          <View className="page share-card-page">
            <Text className="not-found">拼车需求不存在</Text>
            <Button
              className="back-btn"
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
            >
              返回首页
            </Button>
          </View>
        );
      }

      return (
        <View className="page share-card-page">
          {/* 乘客端卡片 */}
          <PassengerShareCard
            request={request}
            onShare={() => {
              shareService.triggerShare({
                mode: 'passenger',
                requestId: request.id,
                source: shareSource,
                timestamp: Date.now(),
              });
            }}
          />

          {/* 底部提示 */}
          {!request.acceptedBy && (
            <View className="bottom-tips">
              <Text className="tips-title">提高接单率小贴士</Text>
              <View className="tips-list">
                <Text className="tips-item">• 写清楚上车点的具体位置</Text>
                <Text className="tips-item">• 分享到附近的小区群、老乡群</Text>
                <Text className="tips-item">• 备注[可拼多人]可以提高接单率</Text>
              </View>
            </View>
          )}

          {/* 返回按钮 */}
          {shareSource === 'share' && (
            <View className="back-section">
              <Button
                className="back-home-btn"
                onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
              >
                返回首页
              </Button>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  return renderContent();
}