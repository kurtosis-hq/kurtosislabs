# Builds the shared responsive homepage and legacy shared styles.
import os, re, sys
sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)

CSS_SRC = open(os.path.join(HERE, 'styles.src.css'), encoding='utf-8').read()
HTML_SRC = open(os.path.join(HERE, 'index.src.html'), encoding='utf-8').read()


def to_units(css):
    # 24px -> calc(24 * var(--u)); "1px!" stays a real pixel (hairlines)
    css = css.replace('px!', 'PXKEEP')
    css = re.sub(r'(?<![\w.])(-?\d+(?:\.\d+)?)px', lambda m: 'calc(%s * var(--u))' % m.group(1), css)
    return css.replace('PXKEEP', 'px')


open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(HTML_SRC)
open(os.path.join(OUT, 'styles.css'), 'w', encoding='utf-8').write(to_units(CSS_SRC))
print('built index.html and styles.css')

# Home uses ordinary CSS units, without design-canvas scaling.
open(os.path.join(OUT, 'home.css'), 'w', encoding='utf-8').write(
    open(os.path.join(HERE, 'home.css'), encoding='utf-8').read())
# Keep old bookmarks working without maintaining another homepage.
open(os.path.join(OUT, 'mobile.html'), 'w', encoding='utf-8').write('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kurtosis Labs</title><link rel="canonical" href="index.html">
<script>location.replace('index.html' + location.search + location.hash);</script>
</head><body><a href="index.html">Continue to Kurtosis Labs</a></body></html>
''')
# Contact and Coming Soon still share these menu styles.
open(os.path.join(OUT, 'menu.css'), 'w', encoding='utf-8').write(to_units(open(os.path.join(HERE, 'menu.src.css'), encoding='utf-8').read()))

# Contact and Coming Soon resolve design units to ordinary CSS pixels.
C_CSS = os.path.join(HERE, 'contact.src.css')
if os.path.exists(C_CSS):
    open(os.path.join(OUT, 'contact.css'), 'w', encoding='utf-8').write(to_units(open(C_CSS, encoding='utf-8').read()))
    print('built contact.css')

from build_quick_view import build_quick_view
build_quick_view()
print('built the shared homepage, Contact and Coming Soon standalone previews')
