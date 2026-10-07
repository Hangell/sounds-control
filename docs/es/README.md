# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

Control de audio para **JavaScript y TypeScript**, independiente del framework y basado en Web Audio. Funciona con **Ionic, React, Vue, Angular** y aplicaciones web, sin dependencias de ejecución.

## Funciones

- Carga por lotes, caché, deduplicación, cancelación y validación HTTP.
- Varias pistas con pausa, reanudación, bucle, búsqueda y consulta de posición/duración.
- Efectos simultáneos con volumen independiente, velocidad, volumen general y silencio.
- Importación segura en SSR, creación diferida del contexto y liberación de recursos.
- ESM, CommonJS y UMD con declaraciones TypeScript.

## Instalación

```sh
npm install sounds-control
```

La versión 1.1.0 descrita aquí requiere publicación por el mantenedor. Antes de ella, npm instala la versión publicada actualmente; para probar este código, compile e instale el archivo de `npm pack`.

La reproducción necesita un navegador o WebView con Web Audio y Fetch. Ionic utiliza su WebView. No incluye audio nativo de React Native ni Node.js. SSR puede importar la biblioteca; reproduzca en el cliente. Las herramientas de desarrollo requieren Node.js 22.14+.

## Inicio rápido

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

Llame a `unlock()` directamente desde un clic/toque, antes de esperar la red. Gestione los errores. Use las rutas de recursos públicos de su aplicación; otros orígenes necesitan CORS. Los códecs dependen del navegador y el audio decodificado ocupa memoria: no es un reproductor de streaming.

## Controles y API

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

| API                                                                           | Propósito                                                                 |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `loadSound(url, id, options?)` / `loadSounds(assets, options?)`               | Cargar uno / varios archivos; aceptar `{ signal }` para cancelar          |
| `play(id, offset?)` / `loop(id, offset?)`                                     | Iniciar o sustituir una pista / activar bucle; desplazamiento en segundos |
| `playEffect(id)` / `stopEffects(id?)`                                         | Reproducir efectos simultáneos / detener los de un id o todos             |
| `pause(id)` / `resume(id)` / `stop(id)`                                       | Pausar guardando posición / reanudar / detener y reiniciar                |
| `pauseAll()` / `resumeAll()` / `stopAll()`                                    | Controlar todas las pistas; stopAll también detiene efectos               |
| `seek(id, seconds)` / `setLoop(id, enabled)`                                  | Cambiar posición / activar o desactivar bucle                             |
| `getDuration(id)` / `getPosition(id)` / `getState(id)` / `isSoundPlaying(id)` | Consultar duración, posición y estado de la pista                         |
| `isSoundLoaded(id)` / `getLoadedSounds()`                                     | Comprobar y listar sonidos cargados                                       |
| `setVolume(v)` / `setEffectVolume(v)` / `setMasterVolume(v)`                  | Volumen de música, efectos y salida general; getters correspondientes     |
| `mute()` / `unmute()` / `isMuted()`                                           | Silenciar conservando volúmenes / restaurar / consultar                   |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)`                   | Velocidad por id o global, también para sonidos futuros                   |
| `faster` / `slow` / `fasterEffect` / `slowEffect`                             | Atajos de velocidad; valores predeterminados 1.5 y 0.75                   |
| `unloadSound(id)` / `unloadAll()` / `dispose()`                               | Eliminar sonidos y cancelar cargas / liberar todos los recursos           |

Los volúmenes finitos se limitan a [0, 1]; NaN e Infinity producen errores. Las velocidades deben ser positivas y finitas; también cambian el tono. El desplazamiento debe estar dentro de la duración. `pauseAll`/`resumeAll` no pausan efectos. `stop(id)` controla solo la pista; para efectos use `stopEffects(id)`. `getState` devuelve unloaded, ready, playing o paused para pistas normales.

`dispose()` es idempotente y solo cierra el AudioContext creado por la biblioteca; el contexto inyectado pertenece a la aplicación. Cree otra instancia después de liberarla. `unloadSound` detiene sonidos y evita que una carga cancelada restaure la caché.

[API](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [CHANGELOG](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## Integración con frameworks

En React, guarde la instancia en useRef y libérela en la limpieza de useEffect. En Vue, créela en onMounted y libérela en onBeforeUnmount. En Angular, use un componente/servicio y libérela en ngOnDestroy. En Ionic, libérela en ionViewDidLeave y recréela en ionViewDidEnter para páginas en caché. Vincule unlock y play al clic/toque. Los ejemplos completos están en el README en inglés.

[React / Vue / Angular / Ionic](https://github.com/Hangell/sounds-control/blob/master/README.md#framework-integration)

## Contribución y calidad

Se aceptan mejoras, pruebas, ejemplos y traducciones. ESLint revisa código, Prettier formatea y Husky valida archivos preparados antes del commit y todos los checks antes del push. CI usa Node 22/24. Las pruebas verifican estados, concurrencia, tipos y el paquete instalado. Complete las pruebas con mocks con validación en navegadores/WebViews reales.

```sh
npm ci
npm run check
```

[CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md) · [CODE_OF_CONDUCT](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) · [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md)

## Licencia

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
