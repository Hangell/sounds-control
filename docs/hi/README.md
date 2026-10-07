# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

**JavaScript और TypeScript** के लिए framework से स्वतंत्र Web Audio लाइब्रेरी। **Ionic, React, Vue, Angular** और सामान्य वेब ऐप में एक ही API इस्तेमाल करें। रनटाइम निर्भरताएँ नहीं हैं।

## सुविधाएँ

- बैच लोडिंग, कैश, दोहराए गए अनुरोधों का संयोजन, रद्द करना और HTTP जाँच।
- कई ट्रैक के लिए pause/resume, loop, seek और स्थिति/अवधि की जानकारी।
- एक साथ कई ध्वनि प्रभाव, अलग वॉल्यूम, गति और मास्टर वॉल्यूम।
- SSR में सुरक्षित import, ज़रूरत पर AudioContext बनाना और संसाधन मुक्त करना।
- ESM, CommonJS, UMD और TypeScript प्रकार।

## इंस्टॉल

```sh
npm install sounds-control
```

यहाँ बताई गई 1.1.0 सुविधाएँ maintainer के प्रकाशन के बाद npm पर उपलब्ध होंगी। उससे पहले npm वर्तमान प्रकाशित संस्करण देता है; इस कोड को आज़माने के लिए build करके `npm pack` का tarball इंस्टॉल करें।

ऑडियो के लिए Web Audio और Fetch वाला ब्राउज़र या WebView चाहिए। Ionic अपना WebView इस्तेमाल करता है। React Native के native ऑडियो और Node.js ऑडियो का समर्थन नहीं है। SSR में import कर सकते हैं, लेकिन playback client पर करें। विकास उपकरणों के लिए Node.js 22.14+ चाहिए।

## शुरुआत

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

नेटवर्क का इंतज़ार करने से पहले क्लिक/टैप हैंडलर में सीधे `unlock()` कॉल करें। त्रुटियाँ संभालें। अपने ऐप की public asset URL इस्तेमाल करें; दूसरी origin के लिए CORS चाहिए। codec समर्थन ब्राउज़र पर निर्भर है। डिकोड किया गया ऑडियो मेमोरी में रहता है; यह streaming player नहीं है।

## नियंत्रण और API

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

| API                                                                           | उद्देश्य                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| `loadSound(url, id, options?)` / `loadSounds(assets, options?)`               | एक / कई फ़ाइलें लोड करें; रद्द करने के लिए `{ signal }` |
| `play(id, offset?)` / `loop(id, offset?)`                                     | ट्रैक शुरू/बदलें या loop चालू करें; offset सेकंड में    |
| `playEffect(id)` / `stopEffects(id?)`                                         | एक साथ प्रभाव चलाएँ / एक id या सभी प्रभाव रोकें         |
| `pause(id)` / `resume(id)` / `stop(id)`                                       | स्थिति रखते हुए रोकें / फिर चलाएँ / स्थिति शून्य करें   |
| `pauseAll()` / `resumeAll()` / `stopAll()`                                    | सभी ट्रैक नियंत्रित करें; stopAll प्रभाव भी रोकता है    |
| `seek(id, seconds)` / `setLoop(id, enabled)`                                  | स्थिति बदलें / loop चालू या बंद करें                    |
| `getDuration(id)` / `getPosition(id)` / `getState(id)` / `isSoundPlaying(id)` | अवधि, स्थिति और ट्रैक की अवस्था पढ़ें                   |
| `isSoundLoaded(id)` / `getLoadedSounds()`                                     | लोड किए गए ऑडियो की जाँच और सूची                        |
| `setVolume(v)` / `setEffectVolume(v)` / `setMasterVolume(v)`                  | संगीत, प्रभाव और मास्टर वॉल्यूम; संबंधित getters        |
| `mute()` / `unmute()` / `isMuted()`                                           | वॉल्यूम सुरक्षित रखकर mute / पुनर्स्थापित / जाँच        |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)`                   | एक id या सबकी गति; नए ट्रैक पर भी लागू                  |
| `faster` / `slow` / `fasterEffect` / `slowEffect`                             | गति के शॉर्टकट; डिफ़ॉल्ट 1.5 और 0.75                    |
| `unloadSound(id)` / `unloadAll()` / `dispose()`                               | ऑडियो हटाएँ और लोड रद्द करें / सभी संसाधन मुक्त करें    |

सीमित वॉल्यूम [0, 1] में समायोजित होते हैं; NaN/Infinity पर त्रुटि आती है। गति सकारात्मक और सीमित होनी चाहिए; इससे pitch भी बदलती है। offset अवधि के भीतर होना चाहिए। `pauseAll`/`resumeAll` प्रभावों को pause नहीं करते। `stop(id)` सामान्य ट्रैक रोकता है; प्रभावों के लिए `stopEffects(id)` इस्तेमाल करें। `getState` सामान्य ट्रैक के लिए unloaded, ready, playing या paused लौटाता है।

`dispose()` कई बार सुरक्षित रूप से कॉल किया जा सकता है और केवल लाइब्रेरी का बनाया AudioContext बंद करता है। Inject किया गया context ऐप का है। dispose के बाद नया instance बनाएँ। `unloadSound` playback रोकता है और रद्द हुई लोडिंग को cache वापस भरने से रोकता है।

[API](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [CHANGELOG](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## Framework के साथ उपयोग

React में useRef में instance रखें और useEffect cleanup में dispose करें। Vue में onMounted पर बनाएँ और onBeforeUnmount पर dispose करें। Angular में component/service का instance ngOnDestroy पर dispose करें। Ionic में cached page छोड़ते समय ionViewDidLeave पर dispose और ionViewDidEnter पर नया instance बनाएँ। unlock और play क्लिक/टैप से जोड़ें। पूरे उदाहरण अंग्रेज़ी README में हैं।

[React / Vue / Angular / Ionic](https://github.com/Hangell/sounds-control/blob/master/README.md#framework-integration)

## योगदान और गुणवत्ता

सुधार, परीक्षण, उदाहरण और अनुवाद का स्वागत है। ESLint कोड जाँचता है, Prettier फ़ॉर्मैट करता है और Husky commit से पहले staged फ़ाइलों तथा push से पहले सभी checks चलाता है। CI Node 22/24 पर चलता है। परीक्षण अवस्था, async races, प्रकार और इंस्टॉल किए गए पैकेज को जाँचते हैं। Mock परीक्षणों के साथ वास्तविक ब्राउज़र/WebView पर भी जाँच करें।

```sh
npm ci
npm run check
```

[CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md) · [CODE_OF_CONDUCT](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) · [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md)

## लाइसेंस

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
