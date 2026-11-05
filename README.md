# Arraythis

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## App desktop (Wails)

O mesmo frontend roda como app nativo via [Wails v2](https://wails.io). O projeto Go fica em `desktop/`.

Pré-requisitos: Go e a CLI do Wails (`go install github.com/wailsapp/wails/v2/cmd/wails@v2.17.1`). Rode `wails doctor` para checar dependências.

```bash
cd desktop
wails dev     # janela nativa; recarrega sozinha ao salvar (ng build --watch)
wails build   # gera desktop/build/bin/ArrayThis.app (macOS) ou .exe (Windows)
```

- O `wails dev` **não** usa `ng serve`: o proxy do Wails para o dev server do Angular quebra o carregamento do `polyfills.js` (script `type="module"`) no WKWebView e a janela fica preta. Em vez disso, `npm run watch:desktop` recompila em `desktop/frontend/app` e o Wails serve esses arquivos direto do disco, como em produção.
- O build desktop usa `npm run build:desktop` (`ng build --configuration production,desktop`): sem service worker e com saída em `desktop/frontend/app`, que é embutida no binário.
- O diretório embutido **não** se chama `dist` de propósito: como `frontend:dir` aponta para a raiz, o Wails sobrescreveria um `frontend/dist` com o build web de `../dist`.
- Fontes e ícones são locais (`@fontsource/*`, `material-icons`), então o app funciona offline.
