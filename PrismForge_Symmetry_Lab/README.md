# PrismForge: Symmetry Lab

A Computer Graphics mini-project for interactive kaleidoscope art, with C implementations of classic rasterization algorithms.

## Features
- Interactive drawing with dihedral-style rotation and reflection symmetry
- Symmetry sectors 2–16, brush size, opacity, color palette
- Undo, clear, background inversion, PNG export, fullscreen
- Demo mode and optional drawing tones
- Polygon/star stamp tools, spiral generator, fractal triangle generator
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
- `c_core/cg_algorithms.c` — C algorithm implementations
- `c_core/cg_algorithms.h` — public declarations
- `c_core/demo.c` — terminal test/demo of C algorithms
