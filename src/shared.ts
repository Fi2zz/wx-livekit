import mitt, { type Emitter } from "mitt";
export const emitter: Emitter<Record<string, unknown>> = mitt();
export type { Emitter };
export function createLogger(prefix?: string) {
  prefix = prefix || "LIVEKIT";
  const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };
  let logLevel = LogLevel.DEBUG;
  function setLogLevel(level: number) {
    logLevel = level;
  }
  function log(...args: any[]): void {
    if (logLevel <= LogLevel.DEBUG) {
      console.log(prefix, ...args);
    }
  }
  function info(...args: any[]): void {
    if (logLevel <= LogLevel.INFO) {
      console.info(prefix, ...args);
    }
  }

  function warn(...args: any[]): void {
    if (logLevel <= LogLevel.WARN) {
      console.warn(prefix, ...args);
    }
  }

  function error(...args: any[]): void {
    if (logLevel <= LogLevel.ERROR) {
      console.error(prefix, ...args);
    }
  }
  return {
    setLogLevel,
    log,
    info,
    warn,
    error,
  };
}
export const logger = createLogger();
export function createLivePlayerContext(ctx: any, id: string) {
  return wx.createLivePlayerContext(id!, ctx);
}
export function createLivePusherContext(ctx: any) {
  return wx.createLivePusherContext(ctx);
}
export type PusherContext = ReturnType<typeof createLivePusherContext>;
export type PlayerContext = ReturnType<typeof createLivePlayerContext>;
export async function saveSnapshot(context: any): Promise<any> {
  const promise = new Promise((complete, fail) => {
    context.snapshot({
      quality: "raw",
      complete: (res: any) => {
        if (res.tempImagePath) {
          complete(res.tempImagePath);
        } else fail(new Error("截图失败"));
      },
    });
  });

  try {
    const filePath = (await promise) as string;
    await saveImageToPhotosAlbum(filePath);
  } catch (error) {}
}

export function saveImageToPhotosAlbum(filePath: string) {
  return new Promise((success, fail) =>
    wx.saveImageToPhotosAlbum({ filePath, success, fail })
  );
}

export function createSnapshot(getContext: () => any) {
  return () => saveSnapshot(getContext());
}
// 事件类型常量
export const LIVEKIT_EVENT = {
  LOCAL_JOIN: "LOCAL_JOIN",
  LOCAL_LEAVE: "LOCAL_LEAVE",
  KICKED_OUT: "KICKED_OUT",
  REMOTE_USER_JOIN: "REMOTE_USER_JOIN",
  REMOTE_USER_LEAVE: "REMOTE_USER_LEAVE",
  REMOTE_VIDEO_ADD: "REMOTE_VIDEO_ADD",
  REMOTE_VIDEO_REMOVE: "REMOTE_VIDEO_REMOVE",
  REMOTE_AUDIO_ADD: "REMOTE_AUDIO_ADD",
  REMOTE_AUDIO_REMOVE: "REMOTE_AUDIO_REMOVE",
  REMOTE_STATE_UPDATE: "REMOTE_STATE_UPDATE",
  LOCAL_NET_STATE_UPDATE: "LOCAL_NET_STATE_UPDATE",
  REMOTE_NET_STATE_UPDATE: "REMOTE_NET_STATE_UPDATE",
  LOCAL_AUDIO_VOLUME_UPDATE: "LOCAL_AUDIO_VOLUME_UPDATE",
  REMOTE_AUDIO_VOLUME_UPDATE: "REMOTE_AUDIO_VOLUME_UPDATE",
  VIDEO_FULLSCREEN_UPDATE: "VIDEO_FULLSCREEN_UPDATE",
  BGM_PLAY_START: "BGM_PLAY_START",
  BGM_PLAY_FAIL: "BGM_PLAY_FAIL",
  BGM_PLAY_PROGRESS: "BGM_PLAY_PROGRESS",
  BGM_PLAY_COMPLETE: "BGM_PLAY_COMPLETE",
  ERROR: "ERROR",
  IM_READY: "IM_READY",
  IM_MESSAGE_RECEIVED: "IM_MESSAGE_RECEIVED",
  IM_NOT_READY: "IM_NOT_READY",
  IM_KICKED_OUT: "IM_KICKED_OUT",
  IM_ERROR: "IM_ERROR",
};

export type EventTypes = typeof LIVEKIT_EVENT;
export type WXEvent = {
  detail: {
    code: number;
    message?: string;
  };
};
