# Bezier Rope Simulation

An interactive 2D Bezier curve visualization with spring-damping physics simulation. Control a flexible rope with your mouse and watch it animate in real-time with responsive physics parameters.

## Features

 **Interactive Physics**
- Real-time spring-damping simulation
- Adjustable spring constant and damping
- Smooth control point animation

 **Navigation & Control**
- Pan with Space + drag or middle-mouse drag
- Zoom with Ctrl + mouse wheel (0.5x to 10x)
- Double-click canvas to place rope targets
- Reset view and reset points buttons

 **Visualization**
- Real-time Bezier curve rendering
- Tangent vector display
- Control point indicators
- Live coordinate display (screen & world coords)
- FPS counter
- Responsive canvas sizing

## How to Use

### Opening the Project
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

### Interactive Controls

| Control | Action |
|---------|--------|
| **Mouse Move** | Follow mouse to control rope shape |
| **Space + Drag** | Pan the view around the canvas |
| **Ctrl + Scroll** | Zoom in/out smoothly |
| **Middle Mouse Drag** | Alternative pan method |
| **Double-Click** | Set rope target position at click location |
| **Zoom Slider** | Manual zoom control (1x to 10x) |
| **Reset View** | Return to default zoom and pan position |
| **Reset Points** | Reinitialize rope control points |

### Control Panel (Right Side)

**Show Tangents** - Toggle tangent vector visualization
**Show Points** - Toggle control point visibility
**Spring** - Adjust spring constant (2-20, higher = stiffer)
**Damping** - Adjust damping coefficient (1-10, higher = more damped)
**Zoom** - Manual zoom slider
**Show Coords** - Toggle coordinate display overlay
**Show FPS** - Toggle frame rate counter

## Physics Parameters

### Spring Constant (2-20)
Controls how quickly the rope returns to equilibrium.
- Low value (2-5): Loose, bouncy rope
- Medium value (8-12): Balanced, realistic spring
- High value (15-20): Stiff, snappy rope

### Damping (1-10)
Controls energy dissipation and oscillation decay.
- Low value (1-3): Bouncy, oscillatory motion
- Medium value (4-6): Smooth, natural motion
- High value (7-10): Heavily damped, slow settling

## File Structure

```
flameapp/
├── index.html          # Main HTML file with UI layout
├── script.js           # Physics engine and rendering logic
└── README.md           # This file
```

## Technical Details

### Coordinate System
- **Screen coordinates**: Canvas pixel positions (0,0 at top-left)
- **World coordinates**: Transformed coordinates accounting for pan and zoom
- Coordinate conversion handles zoom and pan transformations automatically

### Bezier Curve Math
Uses cubic Bezier curves with 4 control points (P0, P1, P2, P3):
- P0, P3: Fixed endpoints
- P1, P2: Spring-damped control points following mouse input
- Curve rendered with 101 subdivisions for smooth rendering

### Physics Engine
- Spring force: F = -k × displacement
- Damping force: F = -c × velocity
- Acceleration: a = springForce + dampingForce
- Integration: Semi-implicit Euler (dt-capped at 0.03s)

## Browser Compatibility

Works on all modern browsers supporting:
- HTML5 Canvas
- ES6 JavaScript
- Pointer events
- Wheel events

## Tips for Best Experience

1. **Explore the physics** - Adjust spring and damping sliders while moving the mouse to feel different rope behaviors
2. **Use double-click placement** - Quickly position the rope target without dragging
3. **Zoom in for details** - Use Ctrl+wheel to zoom in and see precise coordinates
4. **Toggle visualizations** - Turn on coordinates and tangents to understand the curve structure
5. **Pan and zoom together** - Combine Space+drag with Ctrl+wheel for smooth exploration

## Performance

- Optimized for 60 FPS on most devices
- Adaptive line widths and point sizes based on canvas resolution
- Efficient Bezier calculation using direct mathematical formulas
- No external dependencies (pure vanilla JavaScript)

## Future Enhancements

Potential features for expansion:
- 3D visualization with Three.js
- Multi-curve comparison
- Curve length and curvature calculation
- Animation recording and playback
- Preset physics configurations
- Touch gesture support for mobile

---

**Enjoy playing with physics!** 

