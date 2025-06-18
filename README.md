# wx-livekit 项目文档

## 项目概述

wx-livekit 是一个用于微信小程序的直播套件，提供了推流和拉流的功能封装，简化了在微信小程序中实现音视频直播的开发流程。该项目基于微信小程序的 live-pusher 和 live-player 组件，提供了更加友好和易用的 API。

## 项目结构

```
├── .gitignore
├── LICENSE
├── README.md
├── index.ts            # 主入口文件
├── package.json        # 项目配置文件
├── src/                # 源代码目录
│   ├── createPlayer.ts # 播放器创建相关
│   ├── createPusher.ts # 推流器创建相关
│   ├── index.ts        # 核心功能实现
│   └── shared.ts       # 共享工具和常量
├── types/              # 类型定义
│   └── wx.d.ts         # 微信小程序类型定义
└── yarn.lock
```

## 项目依赖

项目使用了以下依赖：

- mitt: ^3.0.1 - 轻量级的事件发射器/订阅库

## 核心功能

### 1. 推流功能 (Pusher)

推流功能通过 `createPusher` 方法创建，封装了微信小程序的 live-pusher 组件，提供了以下功能：

- 推流控制：开始、停止、暂停、恢复推流
- 摄像头控制：切换前后摄像头、开启/关闭摄像头
- 麦克风控制：开启/关闭麦克风
- 美颜设置：设置美颜、美白等级
- 视频参数设置：设置视频宽高、码率、方向等
- 音频参数设置：设置音频质量、音量类型等
- 网络状态监控：获取推流网络状态

### 2. 播放功能 (Player)

播放功能通过 `createPlayerFactory` 方法创建，封装了微信小程序的 live-player 组件，提供了以下功能：

- 播放控制：播放、停止、暂停、恢复
- 音频控制：静音/取消静音
- 全屏控制：请求全屏/退出全屏
- 视频参数设置：设置视频填充模式、方向等
- 网络状态监控：获取播放网络状态

### 3. 用户管理

提供了用户管理功能，包括：

- 添加/移除用户
- 获取用户列表
- 获取特定用户信息

### 4. 事件系统

基于 `mitt` 库实现了事件系统，支持以下事件：

- 远程用户加入/离开事件
- 远程视频添加/移除事件
- 远程音频添加/移除事件
- 本地/远程网络状态更新事件
- 音量更新事件
- 错误事件

## API 文档

### 主要函数

#### createWXLiveKit(context, config)

创建一个 wx-livekit 实例。

**参数：**

- `context`: 页面上下文
- `config`: 配置项，可包含 env 等参数

**返回值：**
返回一个包含多种方法的对象，用于控制直播功能。

### 推流相关 API

#### createPusher(attrs)

创建一个推流器实例。

**参数：**

- `attrs`: 推流器属性，可选

**返回值：**
返回一个推流器实例。

#### getPusher()

获取当前推流器实例。

#### getPusherAttributes()

获取推流器属性。

#### setPusherAttributes(attrs)

设置推流器属性。

**参数：**

- `attrs`: 要设置的推流器属性

### 播放相关 API

#### getPlayers()

获取所有播放器列表。

#### getPlayer(streamID)

获取指定 streamID 的播放器。

**参数：**

- `streamID`: 流 ID

#### setPlayerAttributes(streamID, options)

设置播放器属性。

**参数：**

- `streamID`: 流 ID
- `options`: 要设置的播放器属性

#### switchStreamType(streamID)

切换流类型（在主流和小流之间切换）。

**参数：**

- `streamID`: 流 ID

### 用户相关 API

#### getUsers()

获取所有用户列表。

#### getUser(userID)

获取指定 userID 的用户。

**参数：**

- `userID`: 用户 ID

### 事件相关 API

#### on(name, handler)

监听指定事件。

**参数：**

- `name`: 事件名称
- `handler`: 事件处理函数

#### off(name, handler)

取消监听指定事件。

**参数：**

- `name`: 事件名称
- `handler`: 事件处理函数，可选

### 其他 API

#### setLogLevel(level)

设置日志级别。

**参数：**

- `level`: 日志级别，0-DEBUG, 1-INFO, 2-WARN, 3-ERROR

#### dispose()

释放资源，清理所有流和用户。

## 事件列表

项目中定义了多种事件类型，可以通过 `on` 方法监听：

- `REMOTE_USER_JOIN`: 远程用户加入
- `REMOTE_USER_LEAVE`: 远程用户离开
- `REMOTE_VIDEO_ADD`: 远程视频添加
- `REMOTE_VIDEO_REMOVE`: 远程视频移除
- `REMOTE_AUDIO_ADD`: 远程音频添加
- `REMOTE_AUDIO_REMOVE`: 远程音频移除
- `LOCAL_NET_STATE_UPDATE`: 本地网络状态更新
- `REMOTE_NET_STATE_UPDATE`: 远程网络状态更新
- `LOCAL_AUDIO_VOLUME_UPDATE`: 本地音频音量更新
- `REMOTE_AUDIO_VOLUME_UPDATE`: 远程音频音量更新
- `REMOTE_STATE_UPDATE`: 远程状态更新
- `VIDEO_FULLSCREEN_UPDATE`: 视频全屏状态更新
- `ERROR`: 错误事件

## 使用示例

```javascript
// 创建 wx-livekit 实例
const livekit = createWXLiveKit(this, { env: "prod" });

// 创建推流器
const pusher = livekit.createPusher({
  url: "rtmp://your-push-url",
  mode: "RTC",
  enableCamera: true,
  enableMic: true,
});

// 开始推流
pusher.start();

// 监听远程用户加入事件
livekit.on(LIVEKIT_EVENT.REMOTE_USER_JOIN, ({ userID }) => {
  console.log(`用户 ${userID} 加入了直播`);
});

// 监听远程视频添加事件
livekit.on(LIVEKIT_EVENT.REMOTE_VIDEO_ADD, ({ player }) => {
  console.log(`添加了视频流：${player.streamID}`);
});

// 释放资源
livekit.dispose();
```

## 总结

wx-livekit 是一个功能完善的微信小程序直播套件，通过封装微信小程序的原生组件，提供了更加友好和易用的 API，简化了在微信小程序中实现音视频直播的开发流程。它支持推流、拉流、用户管理和事件系统等功能，是开发微信小程序直播应用的理想选择。
