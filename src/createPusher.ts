import {
  createLivePusherContext,
  createSnapshot,
  logger,
  type PusherContext,
  LIVEKIT_EVENT,
  WXEvent,
} from "./shared";
// 推流器属性接口
export interface PusherAttributes {
  url: string;
  mode: string;
  autopush: boolean;
  enableCamera: boolean;
  enableMic: boolean;
  enableAgc: boolean;
  enableAns: boolean;
  enableEarMonitor: boolean;
  enableAutoFocus: boolean;
  enableZoom: boolean;
  minBitrate: number;
  maxBitrate: number;
  videoWidth: number;
  videoHeight: number;
  beautyLevel: number;
  whitenessLevel: number;
  videoOrientation: string;
  videoAspect: string;
  frontCamera: string;
  enableRemoteMirror: boolean;
  localMirror: string;
  enableBackgroundMute: boolean;
  audioQuality: string;
  audioVolumeType: string;
  audioReverbType: number;
  waitingImage: string;
  waitingImageHash: string;
  beautyStyle: string;
  filter: string;
  netStatus: Record<string, any>;
  [key: string]: any;
}

function getInitialAttributes(patrial: Partial<PusherAttributes>) {
  return Object.assign(
    {
      url: "",
      mode: "RTC",
      autopush: false,
      enableCamera: false,
      enableMic: false,
      enableAgc: false,
      enableAns: false,
      enableEarMonitor: false,
      enableAutoFocus: true,
      enableZoom: false,
      minBitrate: 600,
      maxBitrate: 900,
      videoWidth: 360,
      videoHeight: 640,
      beautyLevel: 0,
      whitenessLevel: 0,
      videoOrientation: "vertical",
      videoAspect: "9:16",
      frontCamera: "front",
      enableRemoteMirror: false,
      localMirror: "auto",
      enableBackgroundMute: false,
      audioQuality: "high",
      audioVolumeType: "voicecall",
      audioReverbType: 0,
      waitingImage: "",
      waitingImageHash: "",
      beautyStyle: "smooth",
      filter: "",
      netStatus: {},
    },

    patrial
  );
}

// 默认推流器属性

// 创建推流器工厂函数
export function createPusherFactory(
  partial: Partial<PusherAttributes>,
  ctx: any
  // pageContext:
  // PusherContext
) {
  // 推流器状态
  let attributes = getInitialAttributes(partial);

  let context: PusherContext = createLivePusherContext(ctx);
  // 设置推流器属性
  const setAttributes = (attrs: Partial<PusherAttributes>) =>
    Object.assign(attributes, attrs);
  const getAttributes = () => attributes;
  // 开始推流
  const start = (options?: any) => {
    logger.log("[pusherStart]");
    context.start(options);
  };

  // 停止推流
  const stop = (options?: any): void => {
    logger.log("[pusherStop]");
    context.stop(options);
  };

  // 暂停推流
  const pause = (options?: any): void => {
    logger.log(" pusherPause()");
    context.pause(options);
  };

  // 恢复推流
  const resume = (options?: any): void => {
    logger.log("[pusherResume]");
    context.resume(options);
  };
  // 切换摄像头
  const switchCamera = (options?: any) => {
    logger.log("[switchCamera]");
    attributes.frontCamera =
      attributes.frontCamera === "front" ? "back" : "front";
    context.switchCamera(options);
  };
  // 发送消息
  const sendMessage = (options: { msg: string }): void => {
    logger.log("[sendMessage]", options.msg);
    context.sendMessage(options);
  };
  // 截图
  const snapshot = createSnapshot(() => context);
  // 切换手电筒
  const toggleTorch = (options?: any) => context.toggleTorch(options);
  // 开始音频转储
  const startDumpAudio = (options?: any) => context.startDumpAudio(options);
  // 停止音频转储
  const stopDumpAudio = (options?: any) => context.stopDumpAudio(options);
  // 播放背景音乐
  const playBGM = (options: { url: string }): void => {
    logger.log(" playBGM() url: ", options.url);
    context.playBGM(options);
  };

  // 暂停背景音乐
  const pauseBGM = (options?: any): void => {
    logger.log(" pauseBGM()");
    context.pauseBGM(options);
  };

  // 恢复背景音乐
  const resumeBGM = (options?: any): void => {
    logger.log(" resumeBGM()");
    context.resumeBGM(options);
  };

  // 停止背景音乐
  const stopBGM = (options?: any): void => {
    logger.log(" stopBGM()");
    context.stopBGM(options);
  };

  // 设置背景音乐音量
  const setBGMVolume = (options: any): void => {
    logger.log(" setBGMVolume() volume:", options);
    if (
      options &&
      options.volume &&
      typeof options.volume === "object" &&
      options.volume.volume
    ) {
      context.setBGMVolume(options.volume);
    } else {
      context.setBGMVolume(options);
    }
  };

  // 设置麦克风音量
  const setMICVolume = (options: any): void => {
    logger.log(" setMICVolume() volume:", options);
    if (
      options &&
      options.volume &&
      typeof options.volume === "object" &&
      options.volume.volume
    ) {
      context.setMICVolume(options.volume);
    } else {
      context.setMICVolume(options);
    }
  };

  // 开始预览
  const startPreview = (options?: any): void => {
    logger.log(" startPreview()");
    context.startPreview(options);
  };

  // 停止预览
  const stopPreview = (options?: any): void => {
    logger.log("context.stopPreview()");
    context.stopPreview(options);
  };

  // 重置推流器
  const reset = () => {
    attributes = {} as PusherAttributes;
    if (context) {
      stop({
        success: () => {
          logger.log("Pusher context.stop");
        },
      });
    }
    //@ts-ignore
    context = null;
  };

  // 返回推流器对象
  return {
    start,
    stop,
    pause,
    resume,
    switchCamera,
    sendMessage,
    snapshot,
    toggleTorch,
    startDumpAudio,
    stopDumpAudio,
    playBGM,
    pauseBGM,
    resumeBGM,
    stopBGM,
    setBGMVolume,
    setMICVolume,
    startPreview,
    stopPreview,
    reset,
    get attributes() {
      return getAttributes();
    },
    getAttributes,
    setAttributes,
  };
}

const ErrorCodes = {
  FailToOpenCamera: -1301,
  FailToOpenMicrophone: -1302,
  FailToEncodeVideo: -1303,
  FailToEncodeAudio: -1304,
  PushStreamDisconnected: -1307,
  UserSigInvalid: -100018,
  FailToJoinRoom: -100018,
};
const EventsCodes = {
  PushStreamServerConnected: 1001,
  StartPushingStream: 1002,
  CameraOpen: 1003,
  ScreenRecording: 1004,
  PusherStreamResolutionUpdate: 1005,
  PusherStreamBitrateUpdate: 1006,
  FirstFrameCaptured: 1007,
  EncoderStarted: 1008,
  StartRenderFirstFrame: 1009,
  Hangup: 5000,
  FloatingWindowClosed: 5001,
  StartPlayLocalVideo: 2004,
  LoadingLocalVideo: 2007,
  NetStatusChange: 1021,
  RoomJoint: 1018,
  ExitRoom: 1019,
};

const EventsMessage = {
  [EventsCodes.PushStreamServerConnected]: "已经连接推流服务器",
  [EventsCodes.StartPushingStream]: "已经与服务器握手完毕,开始推流",
  [EventsCodes.CameraOpen]: "打开摄像头成功",
  [EventsCodes.ScreenRecording]: "录屏启动成功",
  [EventsCodes.PusherStreamResolutionUpdate]: "推流动态调整分辨率",
  [EventsCodes.PusherStreamBitrateUpdate]: "推流动态调整码率",
  [EventsCodes.FirstFrameCaptured]: "首帧画面采集完成",
  [EventsCodes.EncoderStarted]: "编码器启动",
  [EventsCodes.StartRenderFirstFrame]: "渲染首帧视频",

  [EventsCodes.Hangup]: "小程序被挂起",
  [EventsCodes.FloatingWindowClosed]: "小程序悬浮窗被关闭",
  [EventsCodes.StartPlayLocalVideo]: "本地视频播放开始",
  [EventsCodes.LoadingLocalVideo]: "本地视频播放loading",
  [EventsCodes.NetStatusChange]: "网络类型发生变化，需要重新进房",
  [EventsCodes.ExitRoom]: "退出房间",
  Kickout: "被踢出房间",
  [EventsCodes.RoomJoint]: "进房成功",
};

const ErrorReasons = {
  [ErrorCodes.FailToOpenCamera]: "打开摄像头失败",
  [ErrorCodes.FailToOpenMicrophone]: "打开麦克风失败",
  [ErrorCodes.FailToEncodeVideo]: "视频编码失败",
  [ErrorCodes.FailToEncodeAudio]: "音频编码失败",
  [ErrorCodes.PushStreamDisconnected]: "推流连接断开",
  [ErrorCodes.UserSigInvalid]: "进房失败:请检查 userSig 是否填写正确",
  [ErrorCodes.FailToJoinRoom]: "进房失败",
};
export function pickPusherEvent(event: WXEvent): any {
  const code = event.detail.code;
  const message = event.detail.message!;
  if (code == 0) {
    logger.log("code 0", message, code);
    return;
  }
  const errorMessage = ErrorReasons[code];
  if (errorMessage) {
    logger.error(`${errorMessage}: ${code}`);
    return LIVEKIT_EVENT.ERROR;
  }
  if (code == 1019) {
    logger.log("退出房间", code);
    if (message.indexOf("reason[0]") < 0) {
    } else {
      logger.log("被踢出房间", { code, message });
      return LIVEKIT_EVENT.KICKED_OUT;
    }
  }
  const normalMessage = EventsMessage[code];
  if (normalMessage) {
    if (code == EventsCodes.ExitRoom && message.indexOf("reason[0]") >= 0) {
      logger.info(EventsMessage.Kickout, { code, message });
    }
    logger.log(`${normalMessage} : ${code}`, message ? message : "");
    if (code == EventsCodes.RoomJoint) return LIVEKIT_EVENT.LOCAL_JOIN;
    return;
  }
  return null;
}

export type PusherUserEvent = {
  userlist: Array<{
    userid: string;
    streamtype?: string;
    hasvideo?: boolean;
    hasaudio?: boolean;
    playurl: string;
  }>;
};
export type PusherUserListOptions = { userlist: PusherUserEvent["userlist"] };
export type PusherEventResult = PusherUserListOptions;
export function parsePusherEvent(message: string): PusherEventResult | null {
  let data: PusherEventResult;
  if (!message || typeof message !== "string") {
    logger.warn("parsePusherEvent 数据格式错误", message);
    return null;
  }
  try {
    data = JSON.parse(message);
  } catch (error) {
    logger.warn("pusherEventHandler 数据格式错误", error);
    return null;
  }
  return data;
}
export function withUserlist(
  data: PusherEventResult,
  callback: (data: PusherEventResult["userlist"]) => void
) {
  const { userlist } = data;
  if (Array.isArray(userlist) && userlist.length) callback(data.userlist);
}
