#ifndef PRISMFORGE_CG_ALGORITHMS_H
#define PRISMFORGE_CG_ALGORITHMS_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int x;
    int y;
} PFPoint;

typedef struct {
    PFPoint *points;
    int capacity;
    int count;
} PFPointBuffer;

/* Appends a point if the buffer has space. Returns 1 on success, 0 otherwise. */
int pf_push_point(PFPointBuffer *buffer, int x, int y);

/* DDA line rasterization: appends integer pixel coordinates from start to end. */
int pf_dda_line(int x0, int y0, int x1, int y1, PFPointBuffer *out);

/* Integer Bresenham line rasterization, supporting all octants. */
int pf_bresenham_line(int x0, int y0, int x1, int y1, PFPointBuffer *out);

/* Midpoint circle: appends the eight-way symmetric circle points. */
int pf_midpoint_circle(int cx, int cy, int radius, PFPointBuffer *out);

/* Translate a point around (cx,cy), rotate by radians, optionally reflect local X. */
PFPoint pf_transform_point(double x, double y, double cx, double cy,
                           double angle_radians, int reflect_x);

#ifdef __cplusplus
}
#endif
#endif
