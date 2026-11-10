"""Generate the existing standalone preview from the same responsive homepage."""
from pathlib import Path
import base64
import json
import mimetypes
import re

ROOT = Path(__file__).resolve().parents[1]


def build_quick_view():
    def data_uri(name):
        mime = mimetypes.guess_type(name)[0] or 'application/octet-stream'
        return 'data:' + mime + ';base64,' + base64.b64encode((ROOT / name).read_bytes()).decode()

    html = (ROOT / 'index.html').read_text(encoding='utf-8')

    def stylesheet(match):
        css = (ROOT / match[1]).read_text(encoding='utf-8')
        css = re.sub(r"url\(['\"]?(assets/[^)'\"]+)['\"]?\)", lambda m: 'url("' + data_uri(m[1]) + '")', css)
        return '<style>' + css + '</style>'

    html = re.sub(r'<link rel="stylesheet" href="([^":]+)">', stylesheet, html)
    html = re.sub(r'src="(assets/[^"]+)"', lambda m: 'src="' + data_uri(m[1]) + '"', html)
    assets = ['assets/skyline-night.jpg', 'assets/skyline-dusk.jpg']
    assets += ['assets/tokens/logo_%02d.png' % i for i in range(1, 36)]
    asset_map = '<script>window.__KL_ASSETS=' + json.dumps({a: data_uri(a) for a in assets}) + ';</script>'
    html = html.replace('</head>', asset_map + '\n</head>')

    def script(match):
        js = (ROOT / match[1].split('?')[0]).read_text(encoding='utf-8')
        js = js.replace('img.src = src;', 'img.src = window.__KL_ASSETS[src] || src;')
        return '<script>' + js.replace('</script', '<\\/script') + '</script>'

    html = re.sub(r'<script src="([^"\n]+)"></script>', script, html)
    html = html.replace('href="contact.html"', 'href="Kurtosis-Labs-Contact.html"')
    html = html.replace('href="coming-soon.html"', 'href="Kurtosis-Labs-Coming-Soon.html"')
    html = html.replace('href="ratings/"', 'href="../ratings/"')
    (ROOT / 'quick-view/Kurtosis-Labs-Website.html').write_text(html, encoding='utf-8')
    (ROOT / 'quick-view/Kurtosis-Labs-Website-Mobile.html').write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kurtosis Labs</title><script>location.replace('Kurtosis-Labs-Website.html'+location.search+location.hash);</script>
</head><body><a href="Kurtosis-Labs-Website.html">Continue to Kurtosis Labs</a></body></html>''', encoding='utf-8')


if __name__ == '__main__':
    build_quick_view()
