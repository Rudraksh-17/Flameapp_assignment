
const canvas = document.getElementById("bezierCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
}window.addEventListener("resize", () => {
    resizeCanvas();
    initControlPoints();
});
requestAnimationFrame(() => {
    resizeCanvas();
    initControlPoints();
});

const showTangentsCheckbox = document.getElementById("showTangents");
const showPointsCheckbox   = document.getElementById("showPoints");
const showFPSCheckbox      = document.getElementById("showFPS");
const showCoordsCheckbox   = document.getElementById("showCoords");
const zoomSlider           = document.getElementById("zoomSlider");
const springSlider         = document.getElementById("springSlider");
const dampingSlider        = document.getElementById("dampingSlider");
const resetBtn             = document.getElementById("resetBtn");
const resetViewBtn         = document.getElementById("resetViewBtn");
const fpsDisplay           = document.getElementById("fpsDisplay");
const coordsDisplay        = document.getElementById("coordsDisplay");
const shortcutsDisplay     = document.getElementById("shortcutsDisplay");


let fpsSmooth = 60;


let zoomLevel = 1;
let panX = 0;
let panY = 0;
let initialZoom = 1;
let initialPanX = 0;
let initialPanY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let startPointerX = 0;
let startPointerY = 0;
let spaceDown = false;


if (showFPSCheckbox) {
    fpsDisplay.style.display = showFPSCheckbox.checked ? 'block' : 'none';
    showFPSCheckbox.addEventListener('change', () => {
        fpsDisplay.style.display = showFPSCheckbox.checked ? 'block' : 'none';
    });
} else {
    fpsDisplay.style.display = 'block';
}

if (showCoordsCheckbox) {
    coordsDisplay.style.display = showCoordsCheckbox.checked ? 'block' : 'none';
    showCoordsCheckbox.addEventListener('change', () => {
        coordsDisplay.style.display = showCoordsCheckbox.checked ? 'block' : 'none';
    });
}

zoomSlider.addEventListener('input', (e) => {
    zoomLevel = parseFloat(e.target.value);
});

if (resetViewBtn) {
    resetViewBtn.addEventListener('click', () => {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        zoomSlider.value = 1;
    });
}
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        resizeCanvas();
        initControlPoints();
    });
}
function screenToWorld(sx, sy) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    return {
        x: ((sx - cx - panX) / zoomLevel) + cx,
        y: ((sy - cy - panY) / zoomLevel) + cy
    };
}
function visibleWorldBounds() {
    const tl = screenToWorld(0, 0);
    const br = screenToWorld(canvas.width, canvas.height);
    return { minX: tl.x, minY: tl.y, maxX: br.x, maxY: br.y };
}


window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { spaceDown = true; e.preventDefault(); }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') { spaceDown = false; }
});

canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', (e) => {
    if (e.button === 1 || spaceDown) {
        isPanning = true;
        startPanX = panX;
        startPanY = panY;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    }
});
canvas.addEventListener('pointerup', (e) => {
    if (isPanning) {
        isPanning = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    }
});
canvas.addEventListener('pointermove', (e) => {
    if (isPanning) {
        const dx = e.clientX - startPointerX;
        const dy = e.clientY - startPointerY;
        panX = startPanX + dx;
        panY = startPanY + dy;
        return; 
    }
    
});
function vec(x, y) { return { x, y }; }
function add(a, b) { return vec(a.x + b.x, a.y + b.y); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y); }
function mul(a, s) { return vec(a.x * s, a.y * s); }
function len(a)    { return Math.hypot(a.x, a.y); }
function norm(a) {
    const L = len(a);
    return L === 0 ? vec(0, 0) : vec(a.x / L, a.y / L);
}

class SpringPoint {
    constructor(x, y) {
        this.pos = vec(x, y);
        this.vel = vec(0, 0);
        this.target = vec(x, y);
    }

    update(dt, k, damping) {
        const displacement = sub(this.pos, this.target);
        const springForce  = mul(displacement, -k);
        const dampingForce = mul(this.vel, -damping);
        const acc = add(springForce, dampingForce);

        this.vel = add(this.vel, mul(acc, dt));
        this.pos = add(this.pos, mul(this.vel, dt));
    }

    reset(x, y) {
        this.pos = vec(x, y);
        this.target = vec(x, y);
        this.vel = vec(0, 0);
    }
}

let P0, P1, P2, P3;

function initControlPoints() {
    const w = canvas.width;
    const h = canvas.height;

    P0 = vec(w * 0.15, h * 0.5);
    P3 = vec(w * 0.85, h * 0.5);

    P1 = new SpringPoint(w * 0.4, h * 0.4);
    P2 = new SpringPoint(w * 0.6, h * 0.6);
}
function bezierPoint(t, P0, P1, P2, P3) {
    const u = 1 - t;
    return vec(
        u*u*u * P0.x + 3*u*u*t * P1.x + 3*u*t*t * P2.x + t*t*t * P3.x,
        u*u*u * P0.y + 3*u*u*t * P1.y + 3*u*t*t * P2.y + t*t*t * P3.y
    );
}

function bezierTangent(t, P0, P1, P2, P3) {
    const u = 1 - t;
    return vec(
        3*u*u*(P1.x-P0.x) + 6*u*t*(P2.x-P1.x) + 3*t*t*(P3.x-P2.x),
        3*u*u*(P1.y-P0.y) + 6*u*t*(P2.y-P1.y) + 3*t*t*(P3.y-P2.y)
    );
}

canvas.addEventListener('pointermove', (e) => {
    if (isPanning) return; 

    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    
    lastMouseX = sx;
    lastMouseY = sy;
    
    const world = screenToWorld(sx, sy);
    
    const offsetXWorld = Math.max(20 / zoomLevel, (canvas.width * 0.08) / zoomLevel);
    const offsetYWorld = Math.max(20 / zoomLevel, (canvas.height * 0.10) / zoomLevel);
    
    const bounds = visibleWorldBounds();
    const marginWorld = 30 / zoomLevel;

    const p1x = Math.max(bounds.minX + marginWorld, Math.min(bounds.maxX - marginWorld, world.x - offsetXWorld));
    const p1y = Math.max(bounds.minY + marginWorld, Math.min(bounds.maxY - marginWorld, world.y - offsetYWorld));
    const p2x = Math.max(bounds.minX + marginWorld, Math.min(bounds.maxX - marginWorld, world.x + offsetXWorld));
    const p2y = Math.max(bounds.minY + marginWorld, Math.min(bounds.maxY - marginWorld, world.y + offsetYWorld));

    P1.target = vec(p1x, p1y);
    P2.target = vec(p2x, p2y);
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const world = screenToWorld(sx, sy);

    
    const offsetXWorld = Math.max(20 / zoomLevel, (canvas.width * 0.08) / zoomLevel);
    const offsetYWorld = Math.max(20 / zoomLevel, (canvas.height * 0.10) / zoomLevel);

    P1.target = vec(world.x - offsetXWorld, world.y - offsetYWorld);
    P2.target = vec(world.x + offsetXWorld, world.y + offsetYWorld);
});


canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.5, Math.min(10, zoomLevel * zoomDelta));
        
        zoomSlider.value = newZoom;
        zoomLevel = newZoom;
    }
});

function drawCurve() {
    const baseLineWidth = Math.max(2, Math.min(canvas.width, canvas.height) * 0.004);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = baseLineWidth;
    ctx.beginPath();

    let first = true;
    for (let t = 0; t <= 1; t += 0.01) {
        const p = bezierPoint(t, P0, P1.pos, P2.pos, P3);
        if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    ctx.stroke();
}

function drawCoordinates() {
    if (!showCoordsCheckbox.checked) return;
    
    ctx.fillStyle = "#0f0";
    ctx.font = Math.max(10, 12 * zoomLevel) + "px monospace";
    ctx.textBaseline = "top";

    const points = [
        { pos: P0, label: "P0" },
        { pos: P1.pos, label: "P1" },
        { pos: P2.pos, label: "P2" },
        { pos: P3, label: "P3" }
    ];

    for (const pt of points) {
        const label = `${pt.label}(${Math.round(pt.pos.x)},${Math.round(pt.pos.y)})`;
        ctx.fillText(label, pt.pos.x + 15, pt.pos.y - 20);
    }
    
    coordsDisplay.innerHTML = 
        `Mouse: (${Math.round(lastMouseX)}, ${Math.round(lastMouseY)})<br>` +
        `P1: (${Math.round(P1.pos.x)}, ${Math.round(P1.pos.y)})<br>` +
        `P2: (${Math.round(P2.pos.x)}, ${Math.round(P2.pos.y)})`;
}

function drawTangents() {
    if (!showTangentsCheckbox.checked) return;

    const baseLineWidth = Math.max(1.5, Math.min(canvas.width, canvas.height) * 0.003);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = baseLineWidth;

    for (let t = 0; t <= 1; t += 0.05) {
        const p = bezierPoint(t, P0, P1.pos, P2.pos, P3);
        const tan = norm(bezierTangent(t, P0, P1.pos, P2.pos, P3));

        const L = Math.max(15, canvas.width * 0.03);
        ctx.beginPath();
        ctx.moveTo(p.x - tan.x * L, p.y - tan.y * L);
        ctx.lineTo(p.x + tan.x * L, p.y + tan.y * L);
        ctx.stroke();
    }
}

function drawPoints() {
    if (!showPointsCheckbox.checked) return;

    const baseRadius = Math.max(4, Math.min(canvas.width, canvas.height) * 0.01);

    function circle(p, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    circle(P0, baseRadius, "#22d3ee");
    circle(P3, baseRadius, "#22d3ee");
    circle(P1.pos, baseRadius * 1.3, "#fb923c");
    circle(P2.pos, baseRadius * 1.3, "#fb923c");
}

let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    dt = Math.min(dt, 0.03);

    const k = parseFloat(springSlider.value);
    const damping = parseFloat(dampingSlider.value);

    P1.update(dt, k, damping);
    P2.update(dt, k, damping);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX + panX, centerY + panY);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-centerX, -centerY);

    drawCurve();
    drawTangents();
    drawPoints();
    drawCoordinates();

    ctx.restore();
    
    const fpsInstant = dt > 0 ? 1 / dt : 0;
    fpsSmooth = fpsSmooth * 0.9 + fpsInstant * 0.1;
    if (typeof showFPSCheckbox !== 'undefined' && showFPSCheckbox.checked) {
        fpsDisplay.textContent = 'FPS: ' + Math.round(fpsSmooth);
    }
}

requestAnimationFrame(animate);

resetBtn.addEventListener("click", () => {
    resizeCanvas();
    initControlPoints();
});

