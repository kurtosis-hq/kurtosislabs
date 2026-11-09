# Builds index.html and styles.css from the Figma measurements.
# Every size below is in Figma pixels on the 1440-px-wide design. Positions are page
# coordinates: Figma x minus 1675, Figma y plus 25 (the page frame's top-left corner).
# styles.css converts each one into a share of the screen width, so the whole page
# scales as one piece and every ratio from Figma is kept.
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
DESIGN_W = 1440
X0 = 0  # positions are already page coordinates

CSS_SRC = open(os.path.join(HERE, 'styles.src.css')).read()
HTML_SRC = open(os.path.join(HERE, 'index.src.html')).read()


def to_units(css):
    # 24px -> calc(24 * var(--u)); "1px!" stays a real pixel (hairlines)
    css = css.replace('px!', 'PXKEEP')
    css = re.sub(r'(?<![\w.])(-?\d+(?:\.\d+)?)px', lambda m: 'calc(%s * var(--u))' % m.group(1), css)
    return css.replace('PXKEEP', 'px')


def box(x, y, w=None, h=None):
    # inline position for an element placed at Figma coordinates
    s = 'left:%spx;top:%spx;' % (round(x - X0, 2), y)
    if w is not None: s += 'width:%spx;' % w
    if h is not None: s += 'height:%spx;' % h
    return s


def place(m):
    args = [float(a) if '.' in a else int(a) for a in m.group(1).split(',')]
    return 'style="%s"' % to_units(box(*args))



html = re.sub(r'\{\{at ([\d.,\-]+)\}\}', place, HTML_SRC)
html = re.sub(r'\{\{px ([^}]*)\}\}', lambda m: 'style="%s"' % to_units(m.group(1)), html)
open(os.path.join(OUT, 'index.html'), 'w').write(html)
open(os.path.join(OUT, 'styles.css'), 'w').write(to_units(CSS_SRC))
print('built index.html and styles.css')

# Mobile page (Figma page "Mobile view", 375 px wide): same Figma-pixel units, scaled from 375 px in mobile.css.
# It shares styles.css, the assets and the animation scripts with the desktop page.
M_HTML = os.path.join(HERE, 'mobile.src.html')
if os.path.exists(M_HTML):
    mh = re.sub(r'\{\{at ([\d.,\-]+)\}\}', place, open(M_HTML).read())
    mh = re.sub(r'\{\{px ([^}]*)\}\}', lambda m: 'style="%s"' % to_units(m.group(1)), mh)
    open(os.path.join(OUT, 'mobile.html'), 'w').write(mh)
    open(os.path.join(OUT, 'mobile.css'), 'w').write(to_units(open(os.path.join(HERE, 'mobile.src.css')).read()))
    print('built mobile.html and mobile.css')

# Contact page stylesheet: same Figma-pixel units, scaled by --u set in the file itself
C_CSS = os.path.join(HERE, 'contact.src.css')
if os.path.exists(C_CSS):
    open(os.path.join(OUT, 'contact.css'), 'w').write(to_units(open(C_CSS).read()))
    print('built contact.css')
