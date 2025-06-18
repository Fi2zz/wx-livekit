import { createSnapshot, createLivePlayerContext } from "./shared";
export type Player = ReturnType<typeof createPlayerFactory>;
// 播放器属性接口
export interface PlayerAttributes {
  src: string;
  mode: string;
  autoplay: boolean;
  muteAudio: boolean;
  muteVideo: boolean;
  orientation: string;
  objectFit: string;
  enableBackgroundMute: boolean;
  minCache: number;
  maxCache: number;
  soundMode: string;
  enableRecvMessage: boolean;
  autoPauseIfNavigate: boolean;
  autoPauseIfOpenNative: boolean;
  isVisible: boolean;
  _definitionType: string;
  netStatus: Record<string, any>;
  userID?: string;
  streamType?: string;
  streamID?: string;
  id?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
  volume?: number;
  playerContext?: any;
  [key: string]: any;
}
export type Players = PlayerAttributes[];
// 获取初始播放器属性
export function getInitialAttributes(
  patrial?: Partial<PlayerAttributes>
): PlayerAttributes {
  return Object.assign(
    {
      //defaults
      // 默认播放器属性
      src: "",
      mode: "RTC",
      autoplay: true,
      muteAudio: false,
      muteVideo: false,
      orientation: "vertical",
      objectFit: "fillCrop",
      enableBackgroundMute: false,
      minCache: 1,
      maxCache: 2,
      soundMode: "speaker",
      enableRecvMessage: false,
      autoPauseIfNavigate: true,
      autoPauseIfOpenNative: true,
      isVisible: true,
      _definitionType: "main",
      netStatus: {},

      //其余属性
      userID: "",
      streamType: "",
      streamID: "",
      id: "",
      hasVideo: false,
      hasAudio: false,
      volume: 0,
      playerContext: undefined,
    },
    patrial
  );
}

// 创建播放器工厂函数
export const createPlayerFactory = (
  partial: Partial<PlayerAttributes>,
  ctx: any
) => {
  // 播放器状态
  let attributes = getInitialAttributes(partial);
  let context: any = null;
  // 获取播放器上下文
  function getContext() {
    if (!context) context = createLivePlayerContext(attributes.id!, ctx);
    return context;
  }
  // 播放
  const play = (options?: any): void => getContext().play(options);
  // 停止
  const stop = (options?: any): void => getContext().stop(options);
  // 静音
  const mute = (options?: any): void => getContext().mute(options);
  // 暂停
  const pause = (options?: any): void => getContext().pause(options);
  // 恢复
  const resume = (options?: any): void => getContext().resume(options);
  // 请求全屏
  const requestFullScreen = (options: { direction: number }): Promise<any> => {
    return new Promise((success, fail) => {
      getContext().requestFullScreen({
        direction: options.direction,
        success,
        fail,
      });
    });
  };

  // 退出全屏
  const requestExitFullScreen = (): Promise<any> => {
    return new Promise((success, fail) => {
      getContext().exitFullScreen({ success, fail });
    });
  };

  // 设置播放器属性
  const setAttributes = (attrs: Partial<PlayerAttributes>) =>
    Object.assign(attributes, attrs);
  // 重置播放器
  const reset = (): void => {
    if (context) context.stop();
    context = undefined;
    attributes = getInitialAttributes();
  };
  function getAttributes() {
    return attributes;
  }

  const snapshot = createSnapshot(getContext);
  // 返回播放器对象
  return {
    play,
    stop,
    mute,
    pause,
    resume,
    requestFullScreen,
    requestExitFullScreen,
    snapshot,
    reset,
    getAttributes,
    setAttributes,
    get context() {
      return getContext();
    },
    get attributes() {
      return getAttributes();
    },
  };
};
