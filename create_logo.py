#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import math

# Create high-resolution canvas
size = 2000
img = Image.new('RGB', (size, size), '#F5F5F5')
draw = ImageDraw.Draw(img)

# Load fonts
try:
    main_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/InstrumentSans-Bold.ttf', 80)
    subtitle_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/WorkSans-Bold.ttf', 28)
    mark_font = ImageFont.truetype('/Users/chaos/.config/opencode/skills/canvas-design/canvas-fonts/Tektur-Medium.ttf', 20)
except:
    main_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    mark_font = ImageFont.load_default()

# Color palette - subtle and sophisticated
colors = {
    'dark': '#1A1A1A',
    'accent': '#E8D5B7',
    'light': '#F5F5F5',
    'gradient1': '#2C3E50',
    'gradient2': '#8B7355',
    'trace1': '#34495E',
    'trace2': '#5D6D7E'
}

# Draw subtle background pattern - representing repetition and accumulation
for i in range(0, size, 80):
    for j in range(0, size, 80):
        # Small geometric marks suggesting effort over time
        alpha = 30 if (i + j) % 160 == 0 else 15
        draw.rectangle([i+70, j+70, i+74, j+74], fill=colors['trace2'])

# Create the main abstract logo - representing transformation through movement
center_x, center_y = size // 2, size // 2
logo_size = 400

# Draw concentric arcs representing progressive movement and layers of effort
for r in range(logo_size, 100, -60):
    start_angle = -30
    end_angle = 150
    bbox = [center_x - r, center_y - r, center_x + r, center_y + r]

    # Draw arc with varying thickness
    thickness = max(3, 12 - r//40)
    draw.arc(bbox, start_angle, end_angle, fill=colors['dark'], width=thickness)

    # Add subtle dots at arc endpoints suggesting trace points
    end_x = center_x + r * math.cos(math.radians(end_angle))
    end_y = center_y + r * math.sin(math.radians(end_angle))
    draw.ellipse([end_x-4, end_y-4, end_x+4, end_y+4], fill=colors['accent'])

# Draw central abstract form - the "imprint" of transformation
# Intersecting curves representing movement paths
for i in range(3):
    offset = i * 40
    points = []
    for angle in range(0, 361, 5):
        rad = math.radians(angle)
        # Parametric curve suggesting organic growth
        r = 100 + offset + 30 * math.sin(3 * rad) + 20 * math.cos(2 * rad)
        x = center_x + r * math.cos(rad)
        y = center_y + r * math.sin(rad)
        points.append((x, y))

    # Draw smooth curve
    if len(points) > 1:
        draw.line(points, fill=colors['gradient2'], width=max(2, 5-i))

# Add trace marks - small dots representing sweat/effort
trace_positions = [
    (center_x + 320, center_y - 120),
    (center_x + 340, center_y - 80),
    (center_x + 300, center_y - 160),
    (center_x - 280, center_y + 100),
    (center_x - 300, center_y + 140),
    (center_x - 250, center_y + 180),
]

for idx, (tx, ty) in enumerate(trace_positions):
    size_mark = 6 - idx//2
    alpha = 200
    color = colors['dark'] if idx < 3 else colors['trace1']
    draw.ellipse([tx-size_mark, ty-size_mark, tx+size_mark, ty+size_mark],
                 fill=color, outline=color)

# Brand name - positioned with precise spacing
brand_text = "塑迹"
text_bbox = draw.textbbox((0, 0), brand_text, font=main_font)
text_width = text_bbox[2] - text_bbox[0]
text_height = text_bbox[3] - text_bbox[1]

brand_x = center_x - text_width // 2
brand_y = center_y + 300
draw.text((brand_x, brand_y), brand_text, fill=colors['dark'], font=main_font)

# Slogan - minimal and integrated
slogan = "让每一滴汗水都有迹可循"
slogan_bbox = draw.textbbox((0, 0), slogan, font=subtitle_font)
slogan_width = slogan_bbox[2] - slogan_bbox[0]
slogan_x = center_x - slogan_width // 2
slogan_y = brand_y + 120

draw.text((slogan_x, slogan_y), slogan, fill=colors['trace1'], font=subtitle_font)

# Add systematic reference markers - suggesting this is a studied, mapped phenomenon
margin = 80
# Corner markers
marker_size = 20
draw.rectangle([margin, margin, margin+marker_size, margin+marker_size],
              outline=colors['trace1'], width=1)
draw.rectangle([size-margin-marker_size, size-margin-marker_size, size-margin, size-margin],
              outline=colors['trace1'], width=1)

# Add subtle coordinate-like markings
coord_labels = ['TR.001', 'TR.002', 'IMP.01', 'IMP.02']
coord_positions = [
    (margin+40, margin+40),
    (size-margin-140, size-margin-40),
    (margin+40, size-margin-40),
    (size-margin-140, margin+40)
]

for label, (cx, cy) in zip(coord_labels, coord_positions):
    draw.text((cx, cy), label, fill=colors['trace2'], font=mark_font)

# Add a subtle grid line suggesting systematic analysis
draw.line([center_x, brand_y - 50, center_x, brand_y - 40],
          fill=colors['trace2'], width=1)
draw.line([slogan_x - 30, slogan_y + 50, slogan_x - 20, slogan_y + 50],
          fill=colors['trace2'], width=1)

# Apply subtle blur to background pattern only (not main elements)
# This creates depth and focus on the main logo
img_with_depth = img.copy()
img_with_depth = img_with_depth.filter(ImageFilter.BoxBlur(radius=0.3))

# Ensure crisp text and main elements by redrawing them on top
draw = ImageDraw.Draw(img_with_depth)
draw.text((brand_x, brand_y), brand_text, fill=colors['dark'], font=main_font)
draw.text((slogan_x, slogan_y), slogan, fill=colors['trace1'], font=subtitle_font)

# Redraw main logo elements for crispness
for r in range(logo_size, 100, -60):
    start_angle = -30
    end_angle = 150
    bbox = [center_x - r, center_y - r, center_x + r, center_y + r]
    thickness = max(3, 12 - r//40)
    draw.arc(bbox, start_angle, end_angle, fill=colors['dark'], width=thickness)

    end_x = center_x + r * math.cos(math.radians(end_angle))
    end_y = center_y + r * math.sin(math.radians(end_angle))
    draw.ellipse([end_x-4, end_y-4, end_x+4, end_y+4], fill=colors['accent'])

for i in range(3):
    offset = i * 40
    points = []
    for angle in range(0, 361, 5):
        rad = math.radians(angle)
        r = 100 + offset + 30 * math.sin(3 * rad) + 20 * math.cos(2 * rad)
        x = center_x + r * math.cos(rad)
        y = center_y + r * math.sin(rad)
        points.append((x, y))
    if len(points) > 1:
        draw.line(points, fill=colors['gradient2'], width=max(2, 5-i))

# Redraw trace marks
for idx, (tx, ty) in enumerate(trace_positions):
    size_mark = 6 - idx//2
    color = colors['dark'] if idx < 3 else colors['trace1']
    draw.ellipse([tx-size_mark, ty-size_mark, tx+size_mark, ty+size_mark],
                 fill=color, outline=color)

# Save as PNG
img_with_depth.save('/Users/chaos/projects/openProject/sportsTools/suji-logo.png', 'PNG', dpi=(300, 300))

print("Logo created successfully: suji-logo.png")
