#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import math

# Create museum-quality high-resolution canvas
size = 2000
img = Image.new('RGB', (size, size), '#FFFFFF')
draw = ImageDraw.Draw(img)

# Load fonts
try:
    main_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf', 72)
    subtitle_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/WorkSans-Bold.ttf', 26)
    mark_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/Jura-Medium.ttf', 18)
except:
    main_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    mark_font = ImageFont.load_default()

# Refined color palette - sophisticated monochrome with one accent
colors = {
    'dark': '#0F0F0F',
    'accent': '#C4A06A',
    'medium': '#4A4A4A',
    'light': '#F8F8F8'
}

# Center positioning with mathematical precision
center_x, center_y = size // 2, size // 2

# Main abstract mark - pure geometric expression of movement and accumulation
# Three intersecting arcs representing progressive layers of effort
base_radius = 280
arc_width = 8

for i in range(3):
    radius = base_radius - (i * 70)
    start_angle = -25
    end_angle = 145
    bbox = [center_x - radius, center_y - radius,
            center_x + radius, center_y + radius]

    draw.arc(bbox, start_angle, end_angle,
             fill=colors['dark'], width=arc_width)

    # Single precision dot at arc end - the trace mark
    end_rad = math.radians(end_angle)
    dot_x = center_x + radius * math.cos(end_rad)
    dot_y = center_y + radius * math.sin(end_rad)
    dot_size = 7 - i
    draw.ellipse([dot_x-dot_size, dot_y-dot_size, dot_x+dot_size, dot_y+dot_size],
                 fill=colors['accent'], outline=None)

# Central form - the imprint: a single, precise curve suggesting transformation
curve_points = []
for angle in range(0, 361, 2):
    rad = math.radians(angle)
    # Elegant parametric curve
    r = 110 + 25 * math.sin(2 * rad) + 15 * math.cos(3 * rad)
    x = center_x + r * math.cos(rad)
    y = center_y + r * math.sin(rad)
    curve_points.append((x, y))

if len(curve_points) > 1:
    draw.line(curve_points, fill=colors['medium'], width=4)

# Sweat/effort trace marks - minimal, intentional dots
trace_dots = [
    (center_x + 240, center_y - 90),
    (center_x + 255, center_y - 65),
    (center_x + 260, center_y - 40),
]

for i, (tx, ty) in enumerate(trace_dots):
    size = 5 - i
    alpha_color = colors['dark'] if i < 2 else colors['medium']
    draw.ellipse([tx-size, ty-size, tx+size, ty+size],
                 fill=alpha_color, outline=None)

# Typography - perfectly spaced, integrated composition
brand_text = "塑迹"
text_bbox = draw.textbbox((0, 0), brand_text, font=main_font)
text_width = text_bbox[2] - text_bbox[0]

brand_x = center_x - text_width // 2
brand_y = center_y + 360
draw.text((brand_x, brand_y), brand_text, fill=colors['dark'], font=main_font)

# Slogan - minimal, positioned with generous spacing
slogan = "让每一滴汗水都有迹可循"
slogan_bbox = draw.textbbox((0, 0), slogan, font=subtitle_font)
slogan_width = slogan_bbox[2] - slogan_bbox[0]
slogan_x = center_x - slogan_width // 2
slogan_y = brand_y + 110

draw.text((slogan_x, slogan_y), slogan, fill=colors['medium'], font=subtitle_font)

# Systematic reference markers - suggesting rigorous documentation
# Minimal, precise corner marks
margin = 100
mark_length = 15
draw.line([margin, margin, margin+mark_length, margin], fill=colors['light'], width=1)
draw.line([margin, margin, margin, margin+mark_length], fill=colors['light'], width=1)
draw.line([size-margin-mark_length, size-margin, size-margin, size-margin], fill=colors['light'], width=1)
draw.line([size-margin, size-margin-mark_length, size-margin, size-margin], fill=colors['light'], width=1)

# Reference codes - whisper-quiet
draw.text((margin+30, margin+25), 'IMP.TRK.01', fill=colors['light'], font=mark_font)
draw.text((size-margin-120, size-margin-30), 'SEQ.245', fill=colors['light'], font=mark_font)

# Single horizontal accent line - suggests measurement, analysis
line_y = slogan_y + 60
draw.line([slogan_x - 20, line_y, slogan_x + slogan_width + 20, line_y],
          fill=colors['light'], width=1)

# Subtle background texture - extremely minimal, adds depth without distraction
# A few sparse dots suggesting the process of accumulation
bg_dots = [
    (200, 300), (400, 200), (600, 450),
    (1600, 300), (1400, 400), (1800, 500),
    (300, 1600), (500, 1700), (700, 1500),
    (1500, 1600), (1700, 1500), (1800, 1700)
]

for bx, by in bg_dots:
    draw.ellipse([bx-1, by-1, bx+1, by+1], fill=colors['light'], outline=None)

# Save as pristine PNG
img.save('/Users/chaos/projects/openProject/sportsTools/suji-logo-refined.png', 'PNG', dpi=(300, 300))

print("Refined logo created: suji-logo-refined.png")
