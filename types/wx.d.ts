// 微信小程序全局对象声明
declare namespace WechatMiniprogram {
  interface Wx {
    createLivePusherContext(id: string, context?: any): LivePusherContext;
    createLivePlayerContext(id: string, context?: any): LivePlayerContext;
    saveImageToPhotosAlbum(options: SaveImageToPhotosAlbumOptions): void;
    request(options: RequestOptions): void;
    getStorageSync(key: string): any;
    getStorage(options: GetStorageOptions): void;
    TUIScene?: string | number;
  }

  interface GetStorageOptions {
    key: string;
    success?: (res: { data: any }) => void;
    fail?: (error: any) => void;
    complete?: (res: any) => void;
  }

  interface SaveImageToPhotosAlbumOptions {
    filePath: string;
    success?: (res: any) => void;
    fail?: (error: any) => void;
    complete?: (res: any) => void;
  }

  interface RequestOptions {
    url: string;
    method?: string;
    header?: Record<string, string>;
    data?: any;
    success?: (res: any) => void;
    fail?: (error: any) => void;
    complete?: (res: any) => void;
  }

  interface LivePusherContext {
    start(options?: CallbackOptions): void;
    stop(options?: CallbackOptions): void;
    pause(options?: CallbackOptions): void;
    resume(options?: CallbackOptions): void;
    switchCamera(options?: CallbackOptions): void;
    snapshot(options?: SnapshotOptions): void;
    toggleTorch(options?: CallbackOptions): void;
    playBGM(options: PlayBGMOptions): void;
    pauseBGM(options?: CallbackOptions): void;
    resumeBGM(options?: CallbackOptions): void;
    stopBGM(options?: CallbackOptions): void;
    setBGMVolume(options: VolumeOptions): void;
    setMICVolume(options: VolumeOptions): void;
    startPreview(options?: CallbackOptions): void;
    stopPreview(options?: CallbackOptions): void;
    sendMessage(options: { msg: string }): void;
    startDumpAudio(options?: CallbackOptions): void;
    stopDumpAudio(options?: CallbackOptions): void;
  }

  interface LivePlayerContext {
    play(options?: CallbackOptions): void;
    stop(options?: CallbackOptions): void;
    mute(options?: CallbackOptions): void;
    pause(options?: CallbackOptions): void;
    resume(options?: CallbackOptions): void;
    requestFullScreen(options: FullScreenOptions): void;
    exitFullScreen(options?: CallbackOptions): void;
    snapshot(options?: SnapshotOptions): void;
  }

  interface CallbackOptions {
    success?: (res: any) => void;
    fail?: (error: any) => void;
    complete?: (res: any) => void;
  }

  interface SnapshotOptions extends CallbackOptions {
    quality?: string;
  }

  interface PlayBGMOptions extends CallbackOptions {
    url: string;
  }

  interface VolumeOptions extends CallbackOptions {
    volume: number | { volume: number };
  }

  interface FullScreenOptions extends CallbackOptions {
    direction: number;
  }
}

// 全局wx对象
declare const wx: WechatMiniprogram.Wx;

// 全局getApp函数
declare function getApp(): {
  globalData?: {
    TUIScene?: string | number;
  };
};