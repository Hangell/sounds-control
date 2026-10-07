# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

Управление Web Audio для **JavaScript и TypeScript**, независимое от фреймворка. Подходит для **Ionic, React, Vue, Angular** и обычных веб-приложений. Без зависимостей времени выполнения.

## Возможности

- Пакетная загрузка, кеш, объединение повторных запросов, отмена и проверка HTTP.
- Несколько дорожек: пауза, возобновление, цикл, перемотка, позиция и длительность.
- Одновременные эффекты с отдельной громкостью, скорость, общая громкость и mute.
- Безопасный импорт в SSR, отложенное создание контекста и освобождение ресурсов.
- ESM, CommonJS, UMD и типы TypeScript.

## Установка

```sh
npm install sounds-control
```

Описанная версия 1.1.0 появится в npm после публикации сопровождающим. До этого npm устанавливает текущую опубликованную версию; для проверки этого кода соберите и установите архив `npm pack`.

Для воспроизведения нужен браузер или WebView с Web Audio и Fetch. Ionic использует WebView. Нативное аудио React Native и аудио Node.js не поддерживаются. Импорт в SSR безопасен, воспроизведение выполняется на клиенте. Инструменты разработки требуют Node.js 22.14+.

## Начало работы

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

Вызывайте `unlock()` непосредственно в обработчике клика/касания до ожидания сети. Обрабатывайте ошибки. Используйте URL общедоступных ресурсов приложения; другой origin требует CORS. Кодеки зависят от браузера. Декодированный звук хранится в памяти: это не потоковый плеер.

## Управление и API

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

| API                                                                           | Назначение                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `loadSound(url, id, options?)` / `loadSounds(assets, options?)`               | Загрузить один / несколько файлов; `{ signal }` для отмены          |
| `play(id, offset?)` / `loop(id, offset?)`                                     | Запустить или заменить дорожку / включить цикл; смещение в секундах |
| `playEffect(id)` / `stopEffects(id?)`                                         | Запустить параллельные эффекты / остановить один id или все эффекты |
| `pause(id)` / `resume(id)` / `stop(id)`                                       | Пауза с сохранением позиции / продолжить / сбросить позицию         |
| `pauseAll()` / `resumeAll()` / `stopAll()`                                    | Управлять всеми дорожками; stopAll также останавливает эффекты      |
| `seek(id, seconds)` / `setLoop(id, enabled)`                                  | Изменить позицию / включить или выключить цикл                      |
| `getDuration(id)` / `getPosition(id)` / `getState(id)` / `isSoundPlaying(id)` | Получить длительность, позицию и состояние дорожки                  |
| `isSoundLoaded(id)` / `getLoadedSounds()`                                     | Проверить и перечислить загруженные звуки                           |
| `setVolume(v)` / `setEffectVolume(v)` / `setMasterVolume(v)`                  | Громкость музыки, эффектов и общая; соответствующие getters         |
| `mute()` / `unmute()` / `isMuted()`                                           | Отключить звук с сохранением громкости / восстановить / проверить   |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)`                   | Скорость по id или общая, в том числе для будущих дорожек           |
| `faster` / `slow` / `fasterEffect` / `slowEffect`                             | Сокращения для скорости; значения по умолчанию 1.5 и 0.75           |
| `unloadSound(id)` / `unloadAll()` / `dispose()`                               | Удалить звуки и отменить загрузки / освободить все ресурсы          |

Конечные значения громкости ограничиваются [0, 1]; NaN и Infinity вызывают ошибку. Скорость должна быть положительной и конечной; она меняет и высоту тона. Смещение должно быть в пределах длительности. `pauseAll`/`resumeAll` не приостанавливают эффекты. `stop(id)` влияет только на обычную дорожку; для эффектов используйте `stopEffects(id)`. `getState` возвращает unloaded, ready, playing или paused для обычной дорожки.

`dispose()` идемпотентен и закрывает только AudioContext, созданный библиотекой; переданный контекст принадлежит приложению. После освобождения создайте новый экземпляр. `unloadSound` останавливает звук и не позволяет отменённой загрузке восстановить кеш.

[API](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [CHANGELOG](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## Интеграция с фреймворками

В React храните экземпляр в useRef и освобождайте в cleanup useEffect. В Vue создавайте в onMounted и освобождайте в onBeforeUnmount. В Angular используйте экземпляр компонента/сервиса и освобождайте в ngOnDestroy. В Ionic для кешируемых страниц освобождайте в ionViewDidLeave и создавайте заново в ionViewDidEnter. Привяжите unlock и play к клику/касанию. Полные примеры находятся в английском README.

[React / Vue / Angular / Ionic](https://github.com/Hangell/sounds-control/blob/master/README.md#framework-integration)

## Участие и качество

Приветствуются исправления, тесты, примеры и переводы. ESLint проверяет код, Prettier форматирует, Husky проверяет staged-файлы перед commit и все проверки перед push. CI использует Node 22/24. Тесты проверяют состояния, гонки, типы и установленный пакет. Дополняйте тесты с mock проверками в реальных браузерах/WebView.

```sh
npm ci
npm run check
```

[CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md) · [CODE_OF_CONDUCT](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) · [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md)

## Лицензия

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
