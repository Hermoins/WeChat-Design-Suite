import Taro from '@tarojs/taro';
import { Trip, PassengerRequest } from '../store/appContext';

/**
 * 分享模式类型
 */
export type ShareMode = 'driver' | 'passenger';

/**
 * 分享卡片数据接口
 */
export interface ShareCardData {
  mode: ShareMode;
  tripId?: string;
  requestId?: string;
  // 添加分享来源追踪
  source?: string;
  timestamp?: number;
}

/**
 * 分享服务
 * 处理微信小程序的原生分享功能
 */
class ShareService {
  /**
   * 设置当前页面的分享配置
   * @param data 分享卡片数据
   * @param options 自定义选项
   */
  setupShareConfig(
    data: ShareCardData,
    options?: {
      title?: string;
      imageUrl?: string;
      path?: string;
    }
  ) {
    // 设置小程序分享消息
    Taro.onShareAppMessage(() => {
      const shareData = this.generateShareData(data);

      return {
        title: options?.title || shareData.title,
        path: options?.path || this.generateSharePath(data),
        imageUrl: options?.imageUrl || shareData.imageUrl,
      };
    });

    // 设置分享到朋友圈（小程序基础库 2.11.3 开始支持）
    if (Taro.onShareTimeline) {
      Taro.onShareTimeline(() => {
        return {
          title: options?.title || shareData.title,
          imageUrl: options?.imageUrl || shareData.imageUrl,
          query: this.generateShareQuery(data),
        };
      });
    }
  }

  /**
   * 生成分享数据
   */
  private generateShareData(data: ShareCardData): {
    title: string;
    imageUrl: string;
  } {
    if (data.mode === 'driver') {
      return {
        title: '🚗 拼车啦！有余座，快上车～',
        imageUrl: '', // 可以配置分享图片URL
      };
    } else {
      return {
        title: '🙋 求拼车！有人要拼车吗？',
        imageUrl: '',
      };
    }
  }

  /**
   * 生成分享路径
   */
  private generateSharePath(data: ShareCardData): string {
    const query = this.generateShareQuery(data);
    return `/pages/share-card/index?${query}`;
  }

  /**
   * 生成分享查询参数
   */
  private generateShareQuery(data: ShareCardData): string {
    const params: string[] = [];

    params.push(`mode=${data.mode}`);
    if (data.tripId) params.push(`tripId=${data.tripId}`);
    if (data.requestId) params.push(`requestId=${data.requestId}`);
    if (data.source) params.push(`source=${encodeURIComponent(data.source)}`);
    params.push(`timestamp=${Date.now()}`);

    return params.join('&');
  }

  /**
   * 显示分享菜单
   */
  showShareMenu() {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    });
  }

  /**
   * 隐藏分享菜单
   */
  hideShareMenu() {
    Taro.hideShareMenu();
  }

  /**
   * 触发分享（手动调用分享功能）
   */
  async triggerShare(data: ShareCardData, options?: {
    title?: string;
    imageUrl?: string;
  }) {
    try {
      this.setupShareConfig(data, options);
      this.showShareMenu();

      // 提示用户操作
      await Taro.showModal({
        title: '分享提示',
        content: '请点击右上角 "..." 按钮，选择"转发"或"分享到朋友圈"',
        confirmText: '我知道了',
      });

      return true;
    } catch (error) {
      console.error('分享失败:', error);
      Taro.showToast({
        title: '分享失败，请稍后重试',
        icon: 'none',
      });
      return false;
    }
  }

  /**
   * 生成司机端分享卡片链接
   */
  generateDriverShareLink(trip: Trip): string {
    const params = {
      mode: 'driver',
      tripId: trip.id,
      source: 'share',
      timestamp: Date.now(),
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `/pages/share-card/index?${queryString}`;
  }

  /**
   * 生成乘客端分享卡片链接
   */
  generatePassengerShareLink(request: PassengerRequest): string {
    const params = {
      mode: 'passenger',
      requestId: request.id,
      source: 'share',
      timestamp: Date.now(),
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `/pages/share-card/index?${queryString}`;
  }

  /**
   * 从URL参数中解析分享数据
   */
  parseShareDataFromUrl(): ShareCardData | null {
    try {
      const pages = Taro.getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.router?.params || {};

      const mode = options.mode as ShareMode;
      if (!mode || !['driver', 'passenger'].includes(mode)) {
        return null;
      }

      return {
        mode,
        tripId: options.tripId,
        requestId: options.requestId,
        source: options.source,
        timestamp: options.timestamp ? parseInt(options.timestamp) : undefined,
      };
    } catch (error) {
      console.error('解析分享数据失败:', error);
      return null;
    }
  }

  /**
   * 记录分享事件（可以对接统计服务）
   */
  trackShare(data: ShareCardData) {
    // 这里可以对接统计服务，如友盟、神策等
    console.log('分享事件:', {
      mode: data.mode,
      tripId: data.tripId,
      requestId: data.requestId,
      source: data.source,
      timestamp: data.timestamp,
    });

    // 也可以保存到本地存储用于分析
    try {
      const shareHistory = JSON.parse(
        Taro.getStorageSync('shareHistory') || '[]'
      );
      shareHistory.push({
        ...data,
        timestamp: Date.now(),
      });
      // 只保留最近100条记录
      if (shareHistory.length > 100) {
        shareHistory.splice(0, shareHistory.length - 100);
      }
      Taro.setStorageSync('shareHistory', JSON.stringify(shareHistory));
    } catch (error) {
      console.error('保存分享历史失败:', error);
    }
  }

  /**
   * 获取分享统计
   */
  getShareStats(): {
    totalShares: number;
    driverShares: number;
    passengerShares: number;
  } {
    try {
      const shareHistory = JSON.parse(
        Taro.getStorageSync('shareHistory') || '[]'
      );

      return {
        totalShares: shareHistory.length,
        driverShares: shareHistory.filter((s: any) => s.mode === 'driver')
          .length,
        passengerShares: shareHistory.filter(
          (s: any) => s.mode === 'passenger'
        ).length,
      };
    } catch (error) {
      return {
        totalShares: 0,
        driverShares: 0,
        passengerShares: 0,
      };
    }
  }

  /**
   * 添加分享统计和分析功能
   */
  getShareAnalytics() {
    try {
      const shareHistory = JSON.parse(
        Taro.getStorageSync('shareHistory') || '[]'
      );

      const driverShares = shareHistory.filter((s: any) => s.mode === 'driver');
      const passengerShares = shareHistory.filter(
        (s: any) => s.mode === 'passenger'
      );

      // 统计按来源分组
      const sharesBySource = shareHistory.reduce((acc: any, s: any) => {
        const source = s.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      // 统计最活跃的行程/需求
      const sharesByTrip = shareHistory.reduce((acc: any, s: any) => {
        const key = s.tripId || s.requestId || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      return {
        totalShares: shareHistory.length,
        driverShares: driverShares.length,
        passengerShares: passengerShares.length,
        sharesBySource,
        sharesByTrip,
        mostSharedTrip: Object.entries(sharesByTrip).sort(
          ([, a]: any, [, b]: any) => b - a
        )[0],
      };
    } catch (error) {
      return {
        totalShares: 0,
        driverShares: 0,
        passengerShares: 0,
        sharesBySource: {},
        sharesByTrip: {},
      };
    }
  }
}

// 导出单例
export default new ShareService();