# Ícone do ArrayThis

Conceito: uma lista (linhas) vira um array (`[ ⋮ ]`).

| Arquivo | Uso |
|---|---|
| `arraythis-icon.svg` | Ícone completo no grid do macOS (tile de 824px em canvas 1024, com sombra). App desktop e ícones `any` do PWA. |
| `arraythis-icon-small.svg` | Só o glifo do array, mais grosso. Para tamanhos pequenos (16–48px). |
| `arraythis-icon-maskable.svg` | Fundo cheio, sem cantos/sombra: o sistema aplica a própria máscara (PWA `maskable`, Apple touch icon). |
| `arraythis-icon-favicon.svg` | Glifo pequeno ocupando o canvas inteiro, para o `favicon.ico`. |

## Regenerar

```bash
python3 design/icon/generate.py     # SVGs a partir do generate.py
node design/icon/render.mjs         # PNGs + favicon.ico (precisa do Playwright com Chromium)
```

Saídas: `desktop/build/appicon.png`, `src/assets/icons/*.png`, `src/favicon.ico`.
