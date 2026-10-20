"""PrismForge: Symmetry Lab — local Flask launcher."""
from flask import Flask, render_template, jsonify
from pathlib import Path
import subprocess
import webbrowser
from threading import Timer

ROOT = Path(__file__).resolve().parent
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "project": "PrismForge: Symmetry Lab"})

@app.route("/api/algorithms")
def algorithms():
    return jsonify({
        "implemented_in_c": [
            {"name": "DDA line rasterization", "file": "c_core/cg_algorithms.c", "function": "pf_dda_line"},
            {"name": "Bresenham line rasterization", "file": "c_core/cg_algorithms.c", "function": "pf_bresenham_line"},
            {"name": "Midpoint circle rasterization", "file": "c_core/cg_algorithms.c", "function": "pf_midpoint_circle"},
            {"name": "2D rotation and reflection helpers", "file": "c_core/cg_algorithms.c", "function": "pf_transform_point"}
        ],
        "note": "The C source is included for study and compilation. The interactive browser canvas uses equivalent JavaScript transformations for responsive pointer drawing."
    })

if __name__ == "__main__":
    print("\\nPrismForge: Symmetry Lab")
    print("Open http://127.0.0.1:5000")
    Timer(1.0, lambda: webbrowser.open("http://127.0.0.1:5000")).start()
    app.run(host="127.0.0.1", port=5000, debug=False)
