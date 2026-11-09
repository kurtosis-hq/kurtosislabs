# Makes the static Ratings export work wherever the website is placed (site root, a sub-folder, or the
# claude.ai preview), not only at the top of a domain. Run from the website folder after copying in a new
# Ratings build:   python3 src/ratings_fix.py
#
# Next.js writes every path from the top of the domain ("/ratings-static/...", "/ratings/compare/"). This:
#  1. makes those paths relative (scripts, styles, fonts, chunk lists, links) in the HTML, payload and JS files
#  2. sends the Kurtosis logo back to the landing page (index.html, or the preview's own landing frame)
#  3. scales the Ratings pages with the window exactly as the landing page does (designed at 1440 px wide;
#     phones below 520 px at 375 px), so text and boxes keep the same size as on the rest of the site
#  4. applies the saved light/dark theme and its page colour before anything is drawn, so moving between
#     Ratings pages never flashes white in dark mode
#  5. adds a first script to each Ratings page that finds the site's own folder, sets <base> to it, and sends
#     any remaining "/ratings/..." or "/contact.html" link click to the same page inside that folder.
# Safe to run more than once.
import glob, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
MARK = '<!--kl-root-->'
OLD = re.compile(r'<!--kl-root--><script>.*?</script>', re.S)
HEAD_SCRIPT = MARK + '''<script>(function(){
var p=location.pathname,i=p.indexOf('/ratings/'),root=i>=0?p.slice(0,i+1):'/';
window.__KL_ROOT=root;document.write('<base href="'+root+'">');
try{if(document.referrer.indexOf('/ratings/')<0)sessionStorage.removeItem('kurtosis-theme');if(sessionStorage.getItem('kurtosis-theme')==='dark')document.documentElement.dataset.theme='dark';}catch(x){}
document.write('<style>html{background:#f4f9fd}html[data-theme="dark"]{background:#070f1f;color-scheme:dark}</style>');
var de=document.documentElement;function fit(){var w=window.innerWidth;de.style.zoom=String(w<520?w/375:w/1440);}fit();window.addEventListener('resize',fit);
document.addEventListener('click',function(e){
var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
var h=a.getAttribute('href');if(!h||h.charAt(0)==='#'||/^[a-z]+:/i.test(h)||h.charAt(1)==='/')return;
if(h==='/'||h==='index.html'){e.preventDefault();e.stopImmediatePropagation();   // the logo: back to the landing page
if(window.parent!==window){try{window.parent.postMessage({kl:'home',hash:''},'*');return;}catch(x){}}
location.href=root+'index.html';return;}
var u=h.charAt(0)==='/'?root+h.slice(1):a.href;if(u.split('#')[0]===location.href.split('#')[0]&&u.indexOf('#')>=0)return;
e.preventDefault();e.stopImmediatePropagation();
if(e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')window.open(u,'_blank');else location.href=u;
},true);})();</script>'''

def fix_text(s):
    s = s.replace('/ratings-static/', 'ratings-static/')
    s = re.sub(r'(["\'(])/assets/tok-', r'\1assets/tok-', s)       # token logos (public/assets in the Next app)
    return s

n = 0
for f in glob.glob(os.path.join(SITE, 'ratings', '**', '*.html'), recursive=True):
    s = open(f, encoding='utf-8').read()
    s = fix_text(s)
    s = re.sub(r'href="/(ratings|contact\.html|favicon\.ico)', r'href="\1', s)
    s = OLD.sub('', s)
    s = s.replace('<head>', '<head>' + HEAD_SCRIPT, 1)
    open(f, 'w', encoding='utf-8').write(s); n += 1
for f in glob.glob(os.path.join(SITE, 'ratings', '**', '*.txt'), recursive=True) + glob.glob(os.path.join(SITE, 'ratings-static', '**', '*.js'), recursive=True):
    s = open(f, encoding='utf-8').read()
    t = fix_text(s).replace('�', '\\uFFFD') if f.endswith('.js') else fix_text(s)
    if t != s: open(f, 'w', encoding='utf-8').write(t)
# Breakpoints: the pages are scaled so a desktop window (520 px and up) always lays out like the 1440 px design,
# and a phone like the 375 px one. Tailwind's 640/768/1024/1280 px breakpoints therefore switch on at 520 px,
# and 1536 px never applies.
for f in glob.glob(os.path.join(SITE, 'ratings-static', '**', '*.css'), recursive=True):
    s = open(f, encoding='utf-8').read()
    t = re.sub(r'\(min-width:(40|48|64|80)rem\)', '(min-width:520px)', s)
    t = t.replace('(min-width:96rem)', '(min-width:99999px)')
    if t != s: open(f, 'w', encoding='utf-8').write(t)
print('fixed', n, 'Ratings pages')
