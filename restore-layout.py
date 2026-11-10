from pathlib import Path
import re, subprocess

root = Path('kurtosis-website')
source = root / 'src/index.src.html'
html = source.read_text(encoding='utf-8')
original = subprocess.check_output(['git', '-c', 'core.fsmonitor=false', 'show', '03b4370:kurtosis-website/index.html']).decode('utf-8')

def div_at(text, pattern):
    match = re.search(pattern, text)
    assert match, pattern
    start = match.start()
    depth = 0
    for token in re.finditer(r'</?div\b[^>]*>', text[start:]):
        depth += -1 if token.group().startswith('</') else 1
        if depth == 0:
            return text[start:start+token.end()]
    raise ValueError(pattern)

def replace_div(pattern, replacement):
    global html
    block = div_at(html, pattern)
    html = html.replace(block, replacement, 1)

labels = ['Layers hide what you own', 'A good month can hide a problem', 'Things change while you sleep']
controls = '<div class="rate-bar" role="group" aria-label="Why returns need explaining"><i class="rate-bar-fill" aria-hidden="true"></i>'
for i, label in enumerate(labels):
    controls += f'<button type="button" data-rate="{i}" aria-label="{i+1:02}: {label}" aria-pressed="{str(i == 0).lower()}"></button>'
controls += '</div>'
replace_div(r'<div class="rate-controls"', controls)
for i in range(3):
    html = re.sub(r'(<div class="rate-step[^>]+data-i="'+str(i)+r'"[^>]*>)', r'\1<p class="ap-num">'+f'{i+1:02}</p>', html)
bar = div_at(html, r'<div class="rate-bar"')
html = html.replace(bar, '').replace('<div class="rate-steps">', '<div class="rate-steps">'+bar)
html = html.replace('class="btn btn-navy"', 'class="btn btn-navy btn-sq"')

products = [
    ('ratings', 'Kurtosis Ratings', 'Ratings peels back each layer to show what you actually own, what could make you lose money and how you’d get your money out. After you invest, it keeps checking and tells you why the value went up or down.', 'ratings/', 'Discover Ratings'),
    ('horizon', 'Kurtosis Horizon', 'Tell Horizon the date you need your cash. It helps you pick investments that pay out before that date, so your money isn’t stuck when you need it.', 'contact.html', 'Explore Horizon')
]
cards = '<div id="prod-left" class="prod-col">'
for i, (slug, name, copy, href, cta) in enumerate(products):
    icon = '<div class="p-icon" aria-hidden="true">'
    if i == 0:
        icon += ''.join(f'<img src="assets/layer.svg" alt="" class="layer {layer}">' for layer in ['l3', 'l2', 'l1'])
    else:
        icon += '<img src="assets/horizon-icon.svg" alt="">'
    icon += '</div>'
    cards += f'''<article class="prod-card{' is-open' if i == 0 else ''}" data-i="{i}">
      {icon}<h3 class="t-h3"><button class="product-toggle" type="button" aria-expanded="{str(i == 0).lower()}" aria-controls="{slug}-copy {slug}-preview">{name}</button></h3>
      <div id="{slug}-copy" class="pc-full"{' aria-hidden="true" inert' if i else ''}><p class="t-body">{copy}</p><a href="{href}" class="btn btn-ink">{cta}</a></div>
    </article>'''
cards += '</div>'
replace_div(r'<div id="prod-left"', cards)

def artwork(pattern, name, width, height):
    block = div_at(original, pattern)
    inside = block[block.index('>')+1:-6]
    return f'<div class="p-card clip diagram-card {name}"'+(' id="exit-card"' if name == 'checks' else '')+f' style="--art-width:{width};aspect-ratio:{width}/{height}"><div class="preview-art">{inside}</div></div>'

ratings = '<div id="ratings-preview" class="prod-pane is-on" data-i="0">'
ratings += artwork(r'<div class="abs p-card clip"[^>]*left:calc\(608', 'dependencies',658,382)
ratings += artwork(r'<div class="abs p-card clip"[^>]*left:calc\(607', 'live-updates',322,304)
ratings += artwork(r'<div id="exit-card"', 'checks',323,304)
ratings += '</div>'
replace_div(r'<div id="ratings-preview"', ratings)

replace_div(r'<div class="cycle-controls"', '')
html = html.replace('<div id="cycle" class="cycle" aria-hidden="true">', '<div id="cycle" class="cycle">')
for i, label in enumerate(['Cycle Starts','Transition','Near Date','Target Date']):
    html = html.replace(f'<span class="cy-lab">{label}</span>', f'<button type="button" class="cy-lab" data-cycle="{i}" aria-pressed="{str(i==0).lower()}">{label}</button>')
html = html.replace('<div class="cy-nav">','<div class="cy-nav" role="group" aria-label="Capital planning stage">')
html = html.replace('    </div>\n  </section>\n\n  <section class="alloc-photo', '    </div>\n    <div class="prod-dots" aria-hidden="true"><i class="is-on"></i><i></i></div>\n  </section>\n\n  <section class="alloc-photo')

panels = '<div id="alloc-panels" class="alloc-panels">'
for i,(slug,short,title,copy) in enumerate([
    ('method','Published','Published method','Our Russian Doll method looks through each token to the assets, protocols and exit routes behind it.'),
    ('evidence','Dated','Dated evidence','Every finding shows its source, its date and what is still unverified.'),
    ('conflicts','Disclosed','Conflicts on the table','We run our own strategies and test our ratings on them. We also publish our exposures.')
]):
    panels += f'''<div class="ap-panel {'is-open' if i==0 else 'is-shut'}" data-i="{i}">
      <button class="ap-tab" type="button" aria-label="Show {title.lower()}" aria-expanded="{str(i==0).lower()}" aria-controls="{slug}-detail"></button>
      <p class="ap-num ap-num-shut" aria-hidden="true">{i+1:02}</p><p class="ap-title ap-title-shut" aria-hidden="true">{short}</p>
      <div id="{slug}-detail" class="ap-body"{' aria-hidden="true"' if i else ''}><p class="ap-num">{i+1:02}</p><h3 class="ap-title">{title}</h3><p class="t-body">{copy}</p></div>
    </div>'''
panels += '</div>'
replace_div(r'<div id="alloc-panels"', panels)
html = html.replace('?v=responsive-1', '?v=restored-2')
source.write_text(html, encoding='utf-8')
