"""Assemble the lab from src/ into index.html.  python3 build.py [--teacher]"""
import pathlib
S=pathlib.Path('src')
ORDER=['data.js','core.js','algos1.js','algos2.js','algos3.js','algos4.js','algos5.js','algos6.js','modules.js','pseudo.js','certs.js','tickets.js','anim.js','defs.js','motivation.js','app.js']
js='\n'.join((S/f).read_text() for f in ORDER)
html=(S/'shell.html').read_text()+'\n<script>\n'+js+'\n</script>\n'
import sys
if '--teacher' in sys.argv:   # private copy with exit-ticket answer keys; do not commit it
    pathlib.Path('graph-studio-lab.html').write_text(html)
    print('wrote graph-studio-lab.html (teacher copy)')
# standalone page for GitHub Pages / opening from disk (the artifact host adds this skeleton itself)
cut = html.index('<style>'); head_part, body_part = html[:cut], html[cut:]
standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              + head_part + '<script>window.GRAPHLAB_PUBLIC = true; /* public build: exit-ticket answer keys hidden */</script>\n<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>\n</head>\n<body>\n'
              + body_part + '</body>\n</html>\n')
pathlib.Path('index.html').write_text(standalone)
print('wrote index.html (public build, answer keys hidden)')
