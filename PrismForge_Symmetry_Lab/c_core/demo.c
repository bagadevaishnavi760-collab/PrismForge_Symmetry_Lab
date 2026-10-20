#include <stdio.h>
#include "cg_algorithms.h"

int main(void) {
    PFPoint points[2048];
    PFPointBuffer buffer = { points, 2048, 0 };
    int i;
    puts("PrismForge C Graphics Algorithm Demo");
    if (!pf_bresenham_line(2, 2, 12, 7, &buffer)) {
        puts("Line buffer too small."); return 1;
    }
    printf("Bresenham line (2,2) -> (12,7): %d pixels\n", buffer.count);
    for (i = 0; i < buffer.count; ++i)
        printf("(%d,%d)%s", points[i].x, points[i].y, (i % 6 == 5) ? "\n" : " ");
    buffer.count = 0;
    if (!pf_midpoint_circle(10, 10, 5, &buffer)) {
        puts("Circle buffer too small."); return 1;
    }
    printf("\nMidpoint circle centered at (10,10), radius 5: %d plotted points\n", buffer.count);
    buffer.count = 0;
    if (!pf_dda_line(0, 0, 5, 3, &buffer)) {
        puts("DDA buffer too small."); return 1;
    }
    printf("DDA line (0,0) -> (5,3): %d pixels\n", buffer.count);
    return 0;
}
