#include "cg_algorithms.h"
#include <math.h>
#include <stdlib.h>

int pf_push_point(PFPointBuffer *buffer, int x, int y) {
    if (buffer == 0 || buffer->points == 0 || buffer->count >= buffer->capacity) return 0;
    buffer->points[buffer->count].x = x;
    buffer->points[buffer->count].y = y;
    buffer->count++;
    return 1;
}

int pf_dda_line(int x0, int y0, int x1, int y1, PFPointBuffer *out) {
    int dx = x1 - x0, dy = y1 - y0;
    int steps = abs(dx) > abs(dy) ? abs(dx) : abs(dy);
    int i;
    if (out == 0) return 0;
    if (steps == 0) return pf_push_point(out, x0, y0);
    for (i = 0; i <= steps; ++i) {
        double t = (double)i / (double)steps;
        if (!pf_push_point(out, (int)lround(x0 + dx * t), (int)lround(y0 + dy * t))) return 0;
    }
    return 1;
}

int pf_bresenham_line(int x0, int y0, int x1, int y1, PFPointBuffer *out) {
    int dx = abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    int dy = -abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    int err = dx + dy;
    if (out == 0) return 0;
    for (;;) {
        int e2;
        if (!pf_push_point(out, x0, y0)) return 0;
        if (x0 == x1 && y0 == y1) break;
        e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return 1;
}

int pf_midpoint_circle(int cx, int cy, int radius, PFPointBuffer *out) {
    int x = 0, y = radius, d = 1 - radius;
    if (out == 0 || radius < 0) return 0;
    if (radius == 0) return pf_push_point(out, cx, cy);
    while (x <= y) {
        if (!pf_push_point(out, cx+x, cy+y) || !pf_push_point(out, cx-x, cy+y) ||
            !pf_push_point(out, cx+x, cy-y) || !pf_push_point(out, cx-x, cy-y) ||
            !pf_push_point(out, cx+y, cy+x) || !pf_push_point(out, cx-y, cy+x) ||
            !pf_push_point(out, cx+y, cy-x) || !pf_push_point(out, cx-y, cy-x)) return 0;
        ++x;
        if (d < 0) d += 2*x + 1;
        else { --y; d += 2*(x-y) + 1; }
    }
    return 1;
}

PFPoint pf_transform_point(double x, double y, double cx, double cy,
                           double angle_radians, int reflect_x) {
    double lx = x - cx, ly = y - cy;
    double c = cos(angle_radians), s = sin(angle_radians);
    PFPoint result;
    if (reflect_x) lx = -lx;
    result.x = (int)lround(cx + lx*c - ly*s);
    result.y = (int)lround(cy + lx*s + ly*c);
    return result;
}
