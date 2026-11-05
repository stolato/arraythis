"""Generates the ArrayThis icon SVGs (concept C: list -> array).

  arraythis-icon.svg        full icon, macOS tile (used >= 64px)
  arraythis-icon-small.svg  simplified array-only glyph for 16-48px
  arraythis-icon-maskable.svg  full-bleed background for PWA "maskable" / Apple touch
  arraythis-icon-favicon.svg   small glyph filling the canvas, for favicon.ico

Render to PNG with render.mjs (see README in this folder).
"""

BG = '''<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#232329"/><stop offset="1" stop-color="#0c0c0e"/></linearGradient>
  <linearGradient id="ind" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#a5b4fc"/></linearGradient>
  <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/></linearGradient>'''

FULL = '''
  <g stroke="#9f9fa8" stroke-width="44" stroke-linecap="round">
    <line x1="228" y1="400" x2="388" y2="400"/>
    <line x1="228" y1="512" x2="348" y2="512"/>
    <line x1="228" y1="624" x2="368" y2="624"/>
  </g>
  <path d="M 428 512 H 522 M 488 474 L 528 512 L 488 550" fill="none" stroke="#d4d4d8"
        stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="none" stroke="url(#ind)" stroke-width="46" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 642 336 H 590 V 688 H 642"/>
    <path d="M 744 336 H 796 V 688 H 744"/>
  </g>
  <g fill="#c4b5fd"><circle cx="693" cy="428" r="24"/><circle cx="693" cy="512" r="24"/><circle cx="693" cy="596" r="24"/></g>'''

# Small sizes: only the array glyph, bigger and heavier so it survives 16px
SMALL = '''
  <g fill="none" stroke="url(#ind)" stroke-width="84" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 430 270 H 330 V 754 H 430"/>
    <path d="M 594 270 H 694 V 754 H 594"/>
  </g>
  <g fill="#c4b5fd"><circle cx="512" cy="372" r="50"/><circle cx="512" cy="512" r="50"/><circle cx="512" cy="652" r="50"/></g>'''


def tile(content):
    """macOS grid: 824px rounded tile centered in a 1024 canvas, with drop shadow."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  {BG}
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000" flood-opacity="0.35"/></filter>
  <clipPath id="tile"><rect x="100" y="100" width="824" height="824" rx="185"/></clipPath>
</defs>
<g filter="url(#shadow)"><rect x="100" y="100" width="824" height="824" rx="185" fill="url(#bg)"/></g>
<rect x="100" y="100" width="824" height="412" fill="url(#shine)" clip-path="url(#tile)"/>
<rect x="101" y="101" width="822" height="822" rx="184" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="2"/>
{content}
</svg>
'''


def full_bleed(content):
    """Maskable / Apple touch: background fills the canvas (the OS applies its own mask).
    Content already fits the maskable safe zone (circle of radius 40% around the center)."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  {BG}
</defs>
<rect width="1024" height="1024" fill="url(#bg)"/>
{content}
</svg>
'''


def favicon(content):
    """Favicon: no macOS margin/shadow, the rounded tile fills the whole canvas."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  {BG}
</defs>
<rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
<g transform="translate(512 512) scale(1.12) translate(-512 -512)">{content}</g>
</svg>
'''


if __name__ == "__main__":
    for name, svg in [
        ("arraythis-icon.svg", tile(FULL)),
        ("arraythis-icon-small.svg", tile(SMALL)),
        ("arraythis-icon-maskable.svg", full_bleed(FULL)),
        ("arraythis-icon-favicon.svg", favicon(SMALL)),
    ]:
        with open(name, "w") as f:
            f.write(svg)
        print("wrote", name)
