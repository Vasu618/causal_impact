"""Generate PNG favicons for the Causal Impact logo at multiple sizes.

Uses cairosvg to render the inline SVG at high resolution, then saves PNGs
suitable for favicons (32x32, 16x16), Apple touch icon (180x180), and
social/GitHub (512x512, 256x256).
"""

import os
import cairosvg

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

# SVG source — must match public/logo.svg exactly
# Standalone bar chart with trending line + arrow (no badge)
SVG = '''<svg width="512" height="512" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Causal Impact logo">
  <rect x="3.2" y="20.0" width="3.2" height="7" rx="0.6" fill="#16A34A"/>
  <rect x="8.8" y="17.0" width="3.2" height="10" rx="0.6" fill="#16A34A"/>
  <rect x="14.4" y="18.5" width="3.2" height="8.5" rx="0.6" fill="#16A34A"/>
  <rect x="20.0" y="14.0" width="3.2" height="13" rx="0.6" fill="#16A34A"/>
  <rect x="25.6" y="10.0" width="3.2" height="17" rx="0.6" fill="#16A34A"/>
  <path d="M 4.8 20.0 L 10.4 17.0 L 16.0 18.5 L 21.6 14.0 L 27.2 10.0 L 31.7 5.5" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M 31.7 5.5 L 27.8 6.4 L 29.0 9.6 Z" fill="#16A34A"/>
</svg>'''

SIZES = [
    ('favicon-16x16.png', 16),
    ('favicon-32x32.png', 32),
    ('favicon-48x48.png', 48),
    ('apple-touch-icon.png', 180),
    ('android-chrome-192x192.png', 192),
    ('android-chrome-512x512.png', 512),
    ('logo-256.png', 256),
    ('og-image.png', 512),  # Open Graph preview
]

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, size in SIZES:
        out_path = os.path.join(OUT_DIR, filename)
        cairosvg.svg2png(
            bytestring=SVG.encode('utf-8'),
            write_to=out_path,
            output_width=size,
            output_height=size,
        )
        print(f'  wrote {filename} ({size}x{size})')
    print(f'\nAll favicons generated in {OUT_DIR}')

if __name__ == '__main__':
    main()
