# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

Controle de áudio para **JavaScript e TypeScript**, independente de framework, baseado em Web Audio. Funciona em **Ionic, React, Vue, Angular** e aplicações web sem dependências de execução.

## Recursos

- Carregamento em lote, cache, deduplicação, cancelamento e validação HTTP.
- Várias faixas com pausa, retomada, loop, seek e consulta de posição/duração.
- Efeitos simultâneos com volume separado; controle de velocidade, volume geral e mute.
- Importação segura em SSR, contexto criado sob demanda e liberação de recursos.
- Pacotes ESM, CommonJS e UMD com declarações TypeScript.

## Instalação

```sh
npm install sounds-control
```

A versão 1.1.0 descrita aqui depende de publicação pelo mantenedor. Antes disso, o npm instala a versão atualmente publicada; para testar este código, use o tarball de `npm pack` após compilar.

A reprodução exige navegador ou WebView com Web Audio e Fetch. Ionic usa o WebView. Áudio nativo em React Native e Node.js está fora do escopo. SSR pode importar a lib; reproduza no cliente. As ferramentas de desenvolvimento exigem Node.js 22.14+.

## Primeiros passos

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

Chame `unlock()` diretamente em um clique/toque, antes de aguardar a rede. Trate erros de reprodução. As URLs devem apontar para os assets públicos do aplicativo; arquivos de outra origem exigem CORS. Os codecs dependem do navegador e o áudio decodificado fica na memória: não é um player de streaming.

## Controles e API

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

| API                                                                           | Finalidade                                                                |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `loadSound(url, id, options?)` / `loadSounds(assets, options?)`               | Carregar um arquivo / vários arquivos; aceitar `{ signal }` para cancelar |
| `play(id, offset?)` / `loop(id, offset?)`                                     | Iniciar ou substituir uma faixa / ativar loop; offset em segundos         |
| `playEffect(id)` / `stopEffects(id?)`                                         | Reproduzir efeitos simultâneos / parar efeitos de um id ou todos          |
| `pause(id)` / `resume(id)` / `stop(id)`                                       | Pausar mantendo a posição / retomar / parar e zerar a faixa               |
| `pauseAll()` / `resumeAll()` / `stopAll()`                                    | Controlar todas as faixas; stopAll também para os efeitos                 |
| `seek(id, seconds)` / `setLoop(id, enabled)`                                  | Alterar posição / ativar ou desativar loop                                |
| `getDuration(id)` / `getPosition(id)` / `getState(id)` / `isSoundPlaying(id)` | Consultar duração, posição e estado da faixa                              |
| `isSoundLoaded(id)` / `getLoadedSounds()`                                     | Verificar e listar sons carregados                                        |
| `setVolume(v)` / `setEffectVolume(v)` / `setMasterVolume(v)`                  | Volumes da música, efeitos e saída geral; getters correspondentes         |
| `mute()` / `unmute()` / `isMuted()`                                           | Silenciar sem perder os volumes / restaurar / consultar                   |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)`                   | Velocidade por id ou global (também vale para futuros sons)               |
| `faster` / `slow` / `fasterEffect` / `slowEffect`                             | Atalhos de velocidade; padrões 1.5 e 0.75                                 |
| `unloadSound(id)` / `unloadAll()` / `dispose()`                               | Remover sons e cancelar cargas / liberar todos os recursos                |

Volumes finitos são limitados a [0, 1]; NaN e Infinity geram erro. Velocidades devem ser positivas e finitas e também alteram o tom. O offset deve estar dentro da duração. `pauseAll`/`resumeAll` não pausam efeitos. `stop(id)` atua apenas na faixa; use `stopEffects(id)` para efeitos. `getState` retorna unloaded, ready, playing ou paused para faixas regulares.

`dispose()` é idempotente e fecha somente o AudioContext criado pela biblioteca; contextos injetados pertencem ao aplicativo. Após o descarte, crie outra instância. `unloadSound` interrompe sons e impede que um carregamento cancelado recrie o cache.

[API](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [CHANGELOG](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## Integração com frameworks

Em React, mantenha a instância em useRef e libere no retorno de useEffect. Em Vue, crie em onMounted e libere em onBeforeUnmount. Em Angular, use uma instância no componente/serviço e libere em ngOnDestroy. Em Ionic, libere em ionViewDidLeave e recrie em ionViewDidEnter se a página ficar em cache. Vincule unlock e play ao clique/toque. Confira os exemplos completos no README em inglês.

[React / Vue / Angular / Ionic](https://github.com/Hangell/sounds-control/blob/master/README.md#framework-integration)

## Contribuição e qualidade

Contribuições, testes, exemplos e traduções são bem-vindos. ESLint verifica o código, Prettier formata, Husky valida arquivos preparados antes do commit e executa todos os checks antes do push. CI usa Node 22/24. Os testes verificam estados, concorrência, tipos e o pacote instalado. Testes com mocks devem ser complementados por validação em navegadores/WebViews reais.

```sh
npm ci
npm run check
```

[CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md) · [CODE_OF_CONDUCT](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) · [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md)

## Licença

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
