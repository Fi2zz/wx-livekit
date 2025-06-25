import {
  createPusherFactory,
  getInitialPusherAttributes,
  parsePusherEvent,
  pickPusherEvent,
  withUserlist,
  type PusherAttributes,
  type PusherEventResult,
} from "./createPusher";
import { emitter, LIVEKIT_EVENT, logger, WXEvent } from "./shared";
import { createPlayerFactory, type PlayerAttributes } from "./createPlayer";
function createUserFactory(options?: {
  userID: string;
  streams?: Record<string, Player | undefined>;
}) {
  return {
    userID: options?.userID || "",
    streams: options?.streams || {},
  };
}
export type User = ReturnType<typeof createUserFactory>;
export type Player = ReturnType<typeof createPlayerFactory>;
export type Pusher = ReturnType<typeof createPusherFactory>;
export type { PlayerAttributes, PusherAttributes };
export type GetSteamOptions = {
  userID: string;
  streamType: string;
};
function streamIdToStreamOptions(streamID: string): GetSteamOptions {
  try {
    const lastIndex = streamID.lastIndexOf("_");
    return {
      userID: streamID.slice(0, lastIndex),
      streamType: streamID.slice(lastIndex + 1),
    };
  } catch (error: any) {
    logger.error(
      `streamIdToStreamOptions error: streamID = ${streamID}, error = ${error}`
    );
    throw error;
  }
}

type UserList = Array<{ userID: string; [key: string]: any }>;
type KeyValue = { [k: string]: any };
export { LIVEKIT_EVENT };
export default function createWXLiveKit(context: any, config: KeyValue = {}) {
  const env = config.env || "prod";
  const users = new Map<string, User>();
  let streams: Player[] = [];
  let pusher: Pusher | null = null;

  function withPusher(callback: (pusher: Pusher) => any) {
    if (!pusher) return;
    return callback(pusher);
  }
  // 添加用户
  function addUser(userlist: PusherEventResult["userlist"]): void {
    userlist.forEach((item) => {
      const userID = item.userid;
      let user = getUser(userID);
      if (!user) user = createUserFactory({ userID });
      users.set(userID, user);
      emitter.emit(LIVEKIT_EVENT.REMOTE_USER_JOIN, { userID });
    });
  }

  // 移除用户
  function removeUser(userlist: PusherEventResult["userlist"]): void {
    userlist.forEach((item) => {
      const userID = item.userid;
      let user = getUser(userID);
      if (user && user.streams) {
        if (user.streams) {
          const mainStream = user.streams?.main;
          const auxStream = user.streams?.aux;

          const handleStream = (stream: Player | undefined) => {
            const player = stream?.attributes;
            if (stream?.attributes?.hasVideo)
              emitter.emit(LIVEKIT_EVENT.REMOTE_VIDEO_REMOVE, { player });
            if (stream?.attributes?.hasAudio)
              emitter.emit(LIVEKIT_EVENT.REMOTE_AUDIO_REMOVE, { player });
          };

          handleStream(mainStream);
          handleStream(auxStream);
        }

        _removeUserAndStream(userID);
        user.streams.main && user.streams.main.reset();
        user.streams.aux && user.streams.aux.reset();
        emitter.emit(LIVEKIT_EVENT.REMOTE_USER_LEAVE, { userID });
        users.delete(userID);
      }
    });
  }
  function streamIdBuilder(userId: string, streamType: string) {
    streamType = streamType || "main";
    return `${userId}_${streamType}`.trim();
  }

  // 更新用户视频
  function updateUserVideo(userlist: PusherEventResult["userlist"]): void {
    logger.log("updateUserVideo", { userlist });
    userlist.forEach((item) => {
      const userID = item.userid;
      const streamType = item.streamtype!;
      const streamID = streamIdBuilder(userID, streamType);
      const id = streamID;
      const hasVideo = item.hasvideo;
      const playUrl = item.playurl;
      const user = getUser(userID);

      if (user) {
        let stream = user.streams[streamType];
        logger.log("updateUserVideo start", user, streamType, stream);

        if (stream) {
          stream.setAttributes({ hasVideo });
          if (!hasVideo && !stream.attributes.hasAudio) {
            _removeStream(stream);
          }
        } else {
          stream = createPlayerFactory(
            { userID, streamID, hasVideo, src: playUrl, streamType, id },
            context
          );
          user.streams[streamType] = stream;
          _addStream(stream);
        }

        if (streamType === "aux") {
          if (hasVideo) {
            stream.setAttributes({
              objectFit: "contain",
              muteAudio: false,
            });
            _addStream(stream);
          } else {
            _removeStream(stream);
          }
        }

        logger.log("updateUserVideo end", user, streamType, stream);
        let player = stream.attributes;
        if (hasVideo) {
          emitter.emit(LIVEKIT_EVENT.REMOTE_VIDEO_ADD, { player });
        } else {
          emitter.emit(LIVEKIT_EVENT.REMOTE_VIDEO_REMOVE, { player });
        }
      }
    });
  }

  // 更新用户音频
  function updateUserAudio(userlist: PusherEventResult["userlist"]): void {
    userlist.forEach((item) => {
      const userID = item.userid;
      const streamType = "main";
      const streamID = streamIdBuilder(userID, streamType);
      const hasAudio = item.hasaudio;
      const playUrl = item.playurl;
      const user = getUser(userID);

      if (user) {
        let stream = user.streams.main;

        if (stream) {
          stream.setAttributes({ hasAudio });
          if (!hasAudio && !stream.attributes.hasVideo) {
            _removeStream(stream);
          }
        } else {
          stream = createPlayerFactory(
            {
              userID,
              streamID,
              hasAudio,
              src: playUrl,
              streamType,
              id: streamID,
            },
            context
          );

          user.streams.main = stream;
          _addStream(stream);
        }

        let player = stream.attributes;

        if (hasAudio) {
          emitter.emit(LIVEKIT_EVENT.REMOTE_AUDIO_ADD, { player });
        } else {
          emitter.emit(LIVEKIT_EVENT.REMOTE_VIDEO_REMOVE, { player });
        }
      }
    });
  }

  function _removeUserAndStream(userID: string): void {
    streams = streams.filter((stream) => {
      return (
        stream.attributes.userID !== userID && stream.attributes.userID !== ""
      );
    });
    users.delete(userID);
  }

  function _addStream(stream: Player): void {
    const index = streams.findIndex((item) => {
      return (
        item.attributes.userID === stream.attributes.userID &&
        item.attributes.streamType === stream.attributes.streamType
      );
    });
    if (index >= 0) return;
    streams.push(stream);
  }

  // 移除流（内部函数）
  function _removeStream(stream: Player): void {
    streams = streams.filter((item) => {
      return (
        item.attributes.userID !== stream.attributes.userID ||
        item.attributes.streamType !== stream.attributes.streamType
      );
    });
    const user = getUser(stream.attributes.userID!);
    if (!user) return;
    user.streams[stream.attributes.streamType!] = undefined;
  }

  // 设置日志级别
  function setLogLevel(level: number): void {
    logger.setLogLevel(level);
  }

  // 获取推流器实例
  function getPusher(): Pusher {
    return pusher!;
  }
  // 创建推流器
  function createPusher(attrs: Partial<PusherAttributes> = {}): Pusher {
    logger.log("createPusher", attrs);
    pusher = createPusherFactory(attrs, context);
    return pusher;
  }

  function dispose() {
    streams.forEach((stream) => stream.reset());
    streams = [];
    users.clear();
    if (pusher) {
      pusher.reset();
      pusher = null;
    }
    emitter.all.clear();
  }

  // 获取推流器属性
  function getPusherAttributes(): PusherAttributes {
    if (!pusher) return getInitialPusherAttributes({}) as PusherAttributes;
    return pusher!.attributes;
  }
  // 设置推流器属性
  function setPusherAttributes(attrs: Partial<PusherAttributes>) {
    withPusher((pusher) => {
      logger.log("setPusherAttributes", attrs);
      pusher!.setAttributes(attrs);
    });
  }
  // 设置播放器属性
  function setPlayerAttributes(
    streamID: string,
    options: Partial<PlayerAttributes>
  ) {
    const stream = getStream(streamID);
    if (stream) stream.setAttributes(options);
  }

  // 切换流类型
  function switchStreamType(streamID: string) {
    logger.log(" [switchStreamType] id: ", streamID);
    const stream = getStream(streamID);
    const attrs = stream!.attributes;
    if (attrs._definitionType == "main") {
      attrs.src = attrs.src.replace("main", "small");
      attrs._definitionType = "small";
    } else if (attrs._definitionType == "small") {
      attrs.src = attrs.src.replace("small", "main");
      attrs._definitionType = "main";
    }
  }

  // 推流器事件处理
  function pusherEventHandler(event: WXEvent) {
    const code = event.detail.code;
    const message = event.detail.message;
    const $event = pickPusherEvent(event);
    if ($event) return emitter.emit($event, { code, message });
    const targets = [1031, 1032, 1033, 1034];
    if (!targets.includes(code)) return;
    const data = parsePusherEvent(message!);
    if (!data) return;
    emitter.emit(LIVEKIT_EVENT.LOCAL_NET_STATE_UPDATE, event);
    switch (code) {
      case 1031:
        withUserlist(data, addUser);
        break;
      case 1032:
        withUserlist(data, removeUser);
        break;
      case 1033:
        withUserlist(data, updateUserVideo);
        break;
      case 1034:
        withUserlist(data, updateUserAudio);
        break;
    }

    return true;
  }

  function pusherNetStatusHandler(event: any) {
    var netStatus = event.detail.info;
    setPusherAttributes(Object.assign({ netStatus }, netStatus));
    emitter.emit(LIVEKIT_EVENT.LOCAL_NET_STATE_UPDATE);
  }
  // 获取用户列表
  function getUsers(): UserList {
    return Array.from(users.values());
  }
  // 获取播放器列表
  function getPlayers(): Array<PlayerAttributes> {
    return [...(streams || [])].map((stream) => stream.attributes);
  }
  function getPlayer(streamID: string) {
    return getStream(streamID);
  }

  // 获取用户
  function getUser(userID: string): User | undefined {
    return users.get(userID);
  }
  function getStream(streamID: string): Player | undefined {
    const options = streamIdToStreamOptions(streamID);
    const { userID, streamType } = options;
    const user = users.get(userID);
    if (user) return user.streams[streamType];
    return undefined;
  }
  function pusherErrorHandler(event: any) {
    try {
      var code = event.detail.errCode,
        message = event.detail.errMsg;
      emitter.emit(LIVEKIT_EVENT.ERROR, {
        code: code,
        message: message,
      });
    } catch (t) {
      logger.error("pusher error data parser exception", event, t);
    }
  }

  // 处理推流器音量通知
  function pusherAudioVolumeNotify(event: any) {
    withPusher((pusher) => {
      pusher!.attributes.volume = event.detail.volume;
      emitter.emit(LIVEKIT_EVENT.LOCAL_AUDIO_VOLUME_UPDATE);
    });
  }
  // 处理播放器状态变化
  function playerStateChange(event: any) {
    emitter.emit(LIVEKIT_EVENT.REMOTE_STATE_UPDATE, event);
  }

  // 处理播放器网络状态
  function playerNetStatus(event: any) {
    var res = event.currentTarget.dataset.streamid;
    const stream = getStream(res) as any;
    if (!stream) {
      emitter.emit(LIVEKIT_EVENT.REMOTE_NET_STATE_UPDATE);
      return;
    } else {
      // !player ||
      if (
        (stream.videoWidth === event.detail.info.videoWidth &&
          stream.videoHeight === event.detail.info.videoHeight) ||
        stream.setAttributes({ netStatus: event.detail.info })
      )
        emitter.emit(LIVEKIT_EVENT.REMOTE_NET_STATE_UPDATE);
    }
  }

  // 处理播放器音量更新
  function playerAudioVolumeNotify(event: any): void {
    try {
      const streamid = event.currentTarget.dataset.streamid;
      const stream = getStream(streamid);
      if (!stream) return;
      const volume = event.detail.volume;
      stream.setAttributes({ volume });
      emitter.emit(LIVEKIT_EVENT.REMOTE_AUDIO_VOLUME_UPDATE);
    } catch (error) {
      console.warn(error);
    }
  }

  // 监听事件
  function on(name: string, handler: Function): void {
    logger.log("监听事件", name);
    emitter.on("*", (type: string, payload: any) => {
      if (type == name) handler(payload);
    });
  }

  // 取消监听事件
  function off(name: string, handler?: Function): void {
    logger.log("移除事件", name);
    emitter.off("*", (type: string, payload: any) => {
      if (type == name) handler?.(payload);
    });
  }
  function playerEventHandler(event: any) {
    emitter.emit(LIVEKIT_EVENT.REMOTE_STATE_UPDATE, event);
  }
  function playerFullscreenChange(_event: any) {
    emitter.emit(LIVEKIT_EVENT.VIDEO_FULLSCREEN_UPDATE);
  }

  // 返回TRTC对象
  return {
    pusher,
    env,
    context,
    setLogLevel,
    createPusher,
    getPusher,
    getPusherAttributes,
    setPusherAttributes,
    setPlayerAttributes,
    switchStreamType,
    pusherEventHandler,
    getUser,
    getUsers,
    getPlayers,
    getPlayer,
    getStream: getStream,
    pusherAudioVolumeNotify,
    playerEventHandler,
    playerStateChange,
    playerNetStatus,
    playerAudioVolumeNotify,
    on,
    off,
    pusherNetStatusHandler,
    playerFullscreenChange,
    pusherErrorHandler,
    emitter,
    dispose,
  };
}
