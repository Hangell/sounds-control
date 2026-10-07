# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

面向 **JavaScript 和 TypeScript** 的 Web Audio 控制库，不依赖框架。可用于 **Ionic、React、Vue、Angular** 和普通网页应用，无运行时依赖。

## 功能

- 批量加载、缓存、重复请求合并、取消加载和 HTTP 状态检查。
- 多个独立音轨，支持暂停、恢复、循环、跳转及位置/时长查询。
- 可叠加的音效、独立音效音量、播放速度、总音量和静音。
- SSR 安全导入，按需创建 AudioContext，显式释放资源。
- 提供 ESM、CommonJS、UMD 和 TypeScript 类型声明。

## 安装

```sh
npm install sounds-control
```

本文描述的 1.1.0 版本需要维护者发布后才会出现在 npm。发布前安装的是当前已发布版本；要测试此代码，请构建并安装 `npm pack` 生成的压缩包。

播放需要支持 Web Audio 和 Fetch 的浏览器或 WebView。Ionic 使用其 WebView。不支持 React Native 原生音频或 Node.js 音频。SSR 可以安全导入，播放应在客户端进行。开发工具需要 Node.js 22.14+。

## 快速开始

```js
import { SoundsControl } from 'sounds-control';

const sounds = new SoundsControl();
document.querySelector('#play').addEventListener('click', async () => {
  try {
    await sounds.unlock();
    await sounds.loadSounds([
      { id: 'music', url: '/audio/music.mp3' },
      { id: 'click', url: '/audio/click.wav' },
    ]);
    sounds.setVolume(0.5);
    await sounds.loop('music');
    await sounds.playEffect('click');
  } catch (error) {
    console.error(error);
  }
});
```

请在点击或触摸事件中直接调用 `unlock()`，然后再等待网络请求，并处理错误。使用应用的公共资源 URL；跨域资源需要 CORS。编解码器支持取决于浏览器。解码后的音频保存在内存中，本库不是流式播放器。

## 控制与 API

```js
sounds.pause('music');
await sounds.resume('music');
await sounds.seek('music', 10);
sounds.setPlaybackRate('music', 1.25);
sounds.setEffectVolume(0.7);
sounds.mute();
sounds.unmute();
sounds.stopAll();
await sounds.dispose();
```

| API                                                                           | 用途                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------ |
| `loadSound(url, id, options?)` / `loadSounds(assets, options?)`               | 加载一个或多个文件；通过 `{ signal }` 取消 |
| `play(id, offset?)` / `loop(id, offset?)`                                     | 启动或替换音轨 / 开启循环；偏移以秒为单位  |
| `playEffect(id)` / `stopEffects(id?)`                                         | 播放叠加音效 / 停止指定 id 或全部音效      |
| `pause(id)` / `resume(id)` / `stop(id)`                                       | 暂停并保留位置 / 恢复 / 停止并重置位置     |
| `pauseAll()` / `resumeAll()` / `stopAll()`                                    | 控制所有音轨；stopAll 也停止音效           |
| `seek(id, seconds)` / `setLoop(id, enabled)`                                  | 改变位置 / 开启或关闭循环                  |
| `getDuration(id)` / `getPosition(id)` / `getState(id)` / `isSoundPlaying(id)` | 查询音轨的时长、位置和状态                 |
| `isSoundLoaded(id)` / `getLoadedSounds()`                                     | 检查和列出已加载的音频                     |
| `setVolume(v)` / `setEffectVolume(v)` / `setMasterVolume(v)`                  | 音乐、音效和总音量；提供对应 getter        |
| `mute()` / `unmute()` / `isMuted()`                                           | 静音且保留音量设置 / 恢复 / 查询           |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)`                   | 按 id 或全局设置速度，也适用于后续音轨     |
| `faster` / `slow` / `fasterEffect` / `slowEffect`                             | 速度快捷方法；默认 1.5 和 0.75             |
| `unloadSound(id)` / `unloadAll()` / `dispose()`                               | 删除音频并取消加载 / 释放全部资源          |

有限的音量值会限制在 [0, 1]；NaN 和 Infinity 会报错。速度必须是正的有限值，也会改变音高。偏移必须在时长范围内。`pauseAll`/`resumeAll` 不暂停音效。`stop(id)` 仅控制普通音轨；音效请使用 `stopEffects(id)`。`getState` 返回普通音轨的 unloaded、ready、playing 或 paused 状态。

`dispose()` 是幂等的，仅关闭库自行创建的 AudioContext；注入的 context 归应用所有。释放后请创建新实例。`unloadSound` 会停止声音，并防止已取消的加载重新填充缓存。

[API](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [CHANGELOG](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## 框架集成

React 中用 useRef 保存实例，在 useEffect 清理函数中释放。Vue 中在 onMounted 创建，在 onBeforeUnmount 释放。Angular 中在组件或服务保存实例，并在 ngOnDestroy 释放。Ionic 缓存页面可在 ionViewDidLeave 释放、ionViewDidEnter 重新创建。把 unlock 和 play 绑定到点击或触摸事件。完整示例见英文 README。

[React / Vue / Angular / Ionic](https://github.com/Hangell/sounds-control/blob/master/README.md#framework-integration)

## 贡献与质量

欢迎提交修复、测试、示例和翻译。ESLint 检查代码，Prettier 统一格式，Husky 在提交前检查暂存文件、推送前运行全部检查。CI 使用 Node 22/24。测试覆盖状态、异步竞争、类型和安装后的包。Mock 测试需要配合真实浏览器/WebView 验证。

```sh
npm ci
npm run check
```

[CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md) · [CODE_OF_CONDUCT](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) · [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md)

## 许可证

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
