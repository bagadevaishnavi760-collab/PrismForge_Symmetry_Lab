# PrismForge: Symmetry Lab

A Computer Graphics mini-project for interactive kaleidoscope art, with C implementations of classic rasterization algorithms.

## Features
- Live kaleidoscope toggle with rotational and optional mirror symmetry (4, 6, 8, 12, 16, 24, or 36 sectors), rotation, and hideable guides
- Brush size, opacity, eraser, six named color palettes, custom/background colors, and gradient strokes
- Normal, Glow, Neon, and Light Trail brush styles with adjustable effect intensity and trail length; effects can be reset or cleared from existing strokes
- Colouring Book with four immediately previewable, selectable vector mandalas (Floral, Lotus, Geometric Star, and Petal Wheel), independent region fills, palette/custom colours, eraser, undo/redo, reset, and PNG export
- My Gallery with local thumbnails, preview, editable titles, duplicate/delete, reopen, PNG export, and JSON backup/import
- Ten-level mandala complexity with randomize/reset generation controls
- Undo, redo, confirmed clear, background inversion, high-resolution PNG export, fullscreen, and distraction-free mindful mode with an optional timer
- Demo mode and optional drawing tones
- Polygon/star stamp tools, spiral generator, fractal triangle generator
- Editable mandala generator and Lotus, Floral Bloom, Geometric Star, Galaxy, and Traditional-Inspired Mandala presets
- Ring layer builder with visibility, removal, radius, spacing, rotation, shape, size, and fill controls
- Save and reopen editable drawings as PrismForge JSON project files
- CG Algorithm Explorer panel
- C source implementations of DDA, Bresenham line, midpoint circle, and point transformation

## Run in VS Code (Windows)
1. Install Python 3.10 or newer.
2. Open this folder in VS Code.
3. Open Terminal and run:
   ```powershell
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   python app.py
   ```
4. Visit http://127.0.0.1:5000 if the browser does not open.

## About the C algorithms
The C implementations are in `c_core/cg_algorithms.c` with declarations in `c_core/cg_algorithms.h`. The web interface uses JavaScript Canvas for low-latency interactive drawing; the C functions are provided as actual, separately compilable algorithm implementations for your CG submission and viva.

Mandala strokes, generated ring layers, palettes, colouring regions, effects, and drawing settings run in the browser using JavaScript Canvas. Use **Save JSON** and **Open JSON** in Draw to save or reopen an editable project; **My Gallery** stores projects in this browser's local storage and does not provide cloud sync. **High-res PNG** exports the artwork without symmetry guides. The C algorithm demo remains a separate terminal module and is not called by the browser canvas.

The studio sidebar groups tools into **Draw**, **Kaleidoscope**, **Colouring Book**, **My Gallery**, and **Generate** tabs. Light Trail is a static tapered stroke, so it does not create a recurring animation loop.

If GCC is installed, compile the C file as an object:
```bash
gcc -Wall -Wextra -std=c11 -c c_core/cg_algorithms.c -o cg_algorithms.o
```
Or compile and run the small test program:
```bash
gcc -Wall -Wextra -std=c11 c_core/cg_algorithms.c c_core/demo.c -lm -o cg_demo
./cg_demo
```
On Windows, run `.\cg_demo.exe` after compilation.

## Project layout
- `app.py` — local web server
- `templates/index.html` — UI and interactive graphics
- `static/mandala-studio.js` — integrated canvas studio panels, effects, colouring templates, and local gallery
- `c_core/cg_algorithms.c` — C algorithm implementations
- `c_core/cg_algorithms.h` — public declarations
- `c_core/demo.c` — terminal test/demo of C algorithms
