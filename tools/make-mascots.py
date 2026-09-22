#!/usr/bin/env python3
"""Regenerate assets/mascots/.

Expression lives entirely in the eyes; the body of each character is fixed.
Adding a mood means adding a branch to eyes(), not redrawing anyone.

    python3 tools/make-mascots.py

Not part of the site build — the site has no build step. This exists so the
set stays reproducible, because the SVGs cannot be edited back into a design.
"""
import os, sys

ACC="#e5825a"; ACC_D="#c9502a"; RUST="#a8451f"; INK="#221c15"
PAPER="#f6f1e3"; BONE="#d2c8be"; STEEL="#c9c1b8"; RULE="#cfc3a4"

EXPRESSIONS=["neutral","happy","curious","wide","wink","sleepy","cross"]

def defs(uid,a,b):
    """soft dome shading, light from the upper left"""
    return (f'<radialGradient id="g{uid}" cx="34%" cy="26%" r="78%">'
            f'<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/>'
            f'</radialGradient>')

def eyes(kind,lx,rx,y,s=1.0,col=INK,tilt=8):
    w,h=15*s,33*s
    def cap(x,t):
        return (f'<rect x="{x-w/2:.1f}" y="{y-h/2:.1f}" width="{w:.1f}" height="{h:.1f}" '
                f'rx="{w/2:.1f}" fill="{col}" transform="rotate({t} {x} {y})"/>')
    def arc(x,t=0):
        r=14*s
        return (f'<path d="M {x-r} {y+r*0.30} A {r} {r} 0 0 1 {x+r} {y+r*0.30}" fill="none" '
                f'stroke="{col}" stroke-width="{7*s:.1f}" stroke-linecap="round" '
                f'transform="rotate({t} {x} {y})"/>')
    def dot(x,rr): return f'<circle cx="{x}" cy="{y}" r="{rr*s:.1f}" fill="{col}"/>'
    def line(x,t=0):
        ww=26*s
        return (f'<path d="M {x-ww/2} {y} L {x+ww/2} {y}" stroke="{col}" '
                f'stroke-width="{7*s:.1f}" stroke-linecap="round" transform="rotate({t} {x} {y})"/>')
    if kind=="happy":   return arc(lx)+arc(rx)
    # sleepy tilts the OUTER ends down. Tilt them inner-ends-down and it reads
    # as anger, not rest — that shipped wrong once.
    if kind=="sleepy":  return line(lx,-9)+line(rx,9)
    if kind=="cross":   return line(lx,11)+line(rx,-11)
    if kind=="wide":    return dot(lx,13)+dot(rx,13)
    if kind=="wink":    return arc(lx)+cap(rx,tilt)
    if kind=="curious": return cap(lx,-tilt)+dot(rx,11)
    return cap(lx,-tilt)+cap(rx,tilt)

def brow(lx,rx,y,col,w=30,h=8,tilt=11,s=1.0):
    """the single biggest lever against 'too cute'"""
    def b(x,t):
        return (f'<rect x="{x-w*s/2:.1f}" y="{y-h*s/2:.1f}" width="{w*s:.1f}" '
                f'height="{h*s:.1f}" rx="{h*s/2:.1f}" fill="{col}" '
                f'transform="rotate({t} {x} {y})"/>')
    return b(lx,-tilt)+b(rx,tilt)

# ── the refined three ────────────────────────────────────────────────────
def ember(ex="neutral"):
    """No side limbs: low wings read as crab claws. Horns root at the crown,
    because wide triangles on the sides of a dome read as ears."""
    return f'''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>{defs("e",ACC,"#b85830")}</defs>
<path d="M88 50 C80 34 66 18 48 8 C56 28 68 44 78 58 Z" fill="{INK}"/>
<path d="M112 50 C120 34 134 18 152 8 C144 28 132 44 122 58 Z" fill="{INK}"/>
<path d="M44 108 C30 106 20 110 12 118 C26 118 36 122 46 126 Z" fill="{ACC_D}"/>
<path d="M156 108 C170 106 180 110 188 118 C174 118 164 122 154 126 Z" fill="{ACC_D}"/>
<path d="M100 44 C140 44 162 68 162 104 C162 136 142 158 100 158
         C58 158 38 136 38 104 C38 68 60 44 100 44 Z" fill="url(#ge)"/>
<path d="M56 132 C70 150 84 158 100 158 C116 158 130 150 144 132
         C140 152 124 164 100 164 C76 164 60 152 56 132 Z" fill="{ACC_D}" opacity=".9"/>
<path d="M44 86 C64 74 136 74 156 86 L156 98 C136 88 64 88 44 98 Z" fill="{ACC_D}" opacity=".55"/>
{brow(76,124,88,INK,32,9)}
{eyes(ex,76,124,111,.95)}
</svg>'''

def tin(ex="neutral"):
    """A pale dome with one dark band across it is a bandage. Keel, brow ridge
    and nasal bar break the band into pieces so it reads as a bascinet."""
    holes="".join(f'<circle cx="{118+i*8}" cy="{128+(i%2)*7}" r="2.4" fill="{INK}" opacity=".55"/>'
                  for i in range(4))
    rivets="".join(f'<circle cx="{62+i*19}" cy="160" r="2.6" fill="#7d7264" opacity=".8"/>'
                   for i in range(5))
    return f'''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>{defs("t",STEEL,"#8b7f71")}{defs("tp",ACC,"#c9502a")}</defs>
<path d="M100 4 C92 18 88 28 90 40 L110 40 C112 28 108 18 100 4 Z" fill="url(#gtp)"/>
<ellipse cx="100" cy="40" rx="13" ry="5" fill="#a89b8c"/>
<path d="M100 26 C128 30 146 56 146 92 L146 120 C146 148 126 164 100 164
         C74 164 54 148 54 120 L54 92 C54 56 72 30 100 26 Z" fill="url(#gt)"/>
<path d="M100 26 C104 60 104 130 100 164" stroke="#efe8df" stroke-width="3.5" fill="none" opacity=".45"/>
<path d="M54 86 C70 72 130 72 146 86 L146 96 C130 84 70 84 54 96 Z" fill="#6f6557"/>
<path d="M58 104 C74 96 126 96 142 104 L142 116 C126 110 74 110 58 116 Z" fill="{INK}"/>
<path d="M100 116 L100 150" stroke="#6f6557" stroke-width="7" stroke-linecap="round"/>
{holes}
<path d="M56 148 C74 140 126 140 144 148 L150 166 C128 156 72 156 50 166 Z" fill="#a89b8c"/>
{rivets}
{eyes(ex,80,120,110,.52,PAPER,6)}
</svg>'''

def slip(ex="neutral"):
    """Rules across the face read as wrapping, so the printed block sits above
    it. Narrow, because receipts are narrow — wide reads as a paper bag."""
    top="".join(f'<path d="M{57+i*11} 26 l5.5 -9 5.5 9 Z" fill="{PAPER}"/>' for i in range(8))
    rules="".join(f'<rect x="{70+i*3}" y="{52+i*10}" width="{60-i*18}" height="4" rx="2" '
                  f'fill="{RULE}" opacity=".95"/>' for i in range(2))
    return f'''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>{defs("s",PAPER,"#d9cdb2")}
<linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#c9bda3"/><stop offset="1" stop-color="{PAPER}"/></linearGradient></defs>
<g transform="rotate(-6 100 100)">
{top}
<path d="M56 26 L144 26 L144 146 C126 144 118 156 100 156 C82 156 74 144 56 146 Z" fill="url(#gs)"/>
<rect x="70" y="38" width="60" height="7" rx="3.5" fill="{RUST}" opacity=".85"/>
{rules}
<path d="M56 144 C74 142 82 154 100 154 C118 154 126 142 144 144
         C148 170 126 182 100 182 C74 182 52 170 56 144 Z" fill="url(#roll)"/>
<path d="M56 144 C74 142 82 154 100 154 C118 154 126 142 144 144" stroke="#a89876"
      stroke-width="3" fill="none" opacity=".85"/>
<ellipse cx="100" cy="170" rx="36" ry="9" fill="#c2b599" opacity=".5"/>
{eyes(ex,82,118,94,.95)}
</g>
</svg>'''

# ── earlier explorations, kept for the record, not carried forward ───────
def coil(ex="neutral"):
    spines="".join(f'<path d="M{100+i*15-30} {44-abs(i-2)*3} l8 -20 l8 20 Z" fill="{ACC_D}"/>'
                   for i in range(5))
    return f'''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>{defs("c",ACC,"#c9633c")}</defs>
<path d="M100 120 C142 124 168 142 164 162 C160 180 134 186 116 176"
      fill="none" stroke="{ACC_D}" stroke-width="34" stroke-linecap="round"/>
<path d="M100 120 C142 124 168 142 164 162 C160 180 134 186 116 176"
      fill="none" stroke="url(#gc)" stroke-width="25" stroke-linecap="round"/>
<path d="M118 178 l22 -6 -4 16 Z" fill="{ACC_D}"/>
{spines}
<ellipse cx="100" cy="86" rx="54" ry="48" fill="url(#gc)"/>
<path d="M46 74 C30 68 22 58 20 48 C34 54 44 62 50 70 Z" fill="{ACC_D}"/>
<path d="M154 74 C170 68 178 58 180 48 C166 54 156 62 150 70 Z" fill="{ACC_D}"/>
<ellipse cx="100" cy="116" rx="26" ry="12" fill="{PAPER}" opacity=".15"/>
<circle cx="70" cy="100" r="7" fill="{ACC_D}" opacity=".45"/>
<circle cx="130" cy="100" r="7" fill="{ACC_D}" opacity=".45"/>
{eyes(ex,82,118,80,.92)}
</svg>'''

def leo(ex="neutral"):
    import math
    lobes="".join(
      f'<circle cx="{100+58*math.cos(math.radians(a)):.1f}" '
      f'cy="{106+58*math.sin(math.radians(a)):.1f}" r="19" fill="{RUST}"/>'
      for a in range(0,360,26))
    return f'''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<defs>{defs("l","#fdf8ec","#d8ccb2")}{defs("lm","#c25428",RUST)}</defs>
{lobes}
<circle cx="100" cy="106" r="60" fill="url(#glm)" opacity=".7"/>
<circle cx="66" cy="62" r="18" fill="{RUST}"/><circle cx="134" cy="62" r="18" fill="{RUST}"/>
<circle cx="66" cy="62" r="9.5" fill="#e0a487"/><circle cx="134" cy="62" r="9.5" fill="#e0a487"/>
<circle cx="100" cy="106" r="48" fill="url(#gl)"/>
<ellipse cx="88" cy="128" rx="14" ry="10.5" fill="#efe3cd"/>
<ellipse cx="112" cy="128" rx="14" ry="10.5" fill="#efe3cd"/>
<path d="M100 117 l7.5 7 -7.5 7 -7.5 -7 Z" fill="{INK}"/>
{eyes(ex,82,118,100,.92)}
</svg>'''

REFINED  = {"ember":ember, "tin":tin, "slip":slip}
EXPLORED = {"coil":coil, "leo":leo}

def main():
    root=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                      "assets","mascots")
    n=0
    for sub,chars in (("",REFINED),("explorations",EXPLORED)):
        d=os.path.join(root,sub) if sub else root
        os.makedirs(d,exist_ok=True)
        for name,fn in chars.items():
            for ex in EXPRESSIONS:
                with open(os.path.join(d,f"{name}-{ex}.svg"),"w") as f:
                    f.write(fn(ex))
                n+=1
    print(f"wrote {n} svg files under assets/mascots/")

if __name__=="__main__":
    main()
