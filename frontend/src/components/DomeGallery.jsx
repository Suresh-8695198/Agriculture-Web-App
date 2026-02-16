import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import './DomeGallery.css';

// Default Testimonial Data if none provided
const BASE_TESTIMONIALS = [
    { name: 'Ramesh Kumar', role: 'Farmer', quote: 'AgriConnect changed my life. Direct sales, no middlemen.', avatar: 'R' },
    { name: 'Suresh Patel', role: 'Supplier', quote: 'Best platform for selling equipment. Sales doubled!', avatar: 'S' },
    { name: 'Anita Desai', role: 'Consumer', quote: 'Fresh organic vegetables directly from farmers.', avatar: 'A' },
    { name: 'Vikram Singh', role: 'Farmer', quote: 'Weather insights help me plan my crops better.', avatar: 'V' },
    { name: 'Meera Reddy', role: 'Supplier', quote: 'Connecting with farmers has never been easier.', avatar: 'M' },
    { name: 'John Doe', role: 'Logistics', quote: 'Efficient tracking and management system.', avatar: 'J' },
    { name: 'Priya Sharma', role: 'Agronomist', quote: 'Excellent resource for modern farming techniques.', avatar: 'P' },
    { name: 'Rahul Verma', role: 'Trader', quote: 'Simplifies bulk purchasing processes significantly.', avatar: 'R' },
    { name: 'Kavita Gill', role: 'Farmer', quote: 'The community support is fantastic.', avatar: 'K' },
    { name: 'Amit Shah', role: 'Consumer', quote: 'Great quality produce every time.', avatar: 'A' },
    { name: 'Verified Farmer', role: 'Nagpur', quote: 'Increased my income by 30% in just two months.', avatar: 'F' },
    { name: 'Agri Supplier', role: 'Indore', quote: 'The best marketplace for agricultural inputs.', avatar: 'S' },
    { name: 'Happy User', role: 'Bhopal', quote: 'Very easy to use app, even for beginners.', avatar: 'U' },
    { name: 'Logistics Partner', role: 'Mumbai', quote: 'Timely payments and clear route planning.', avatar: 'L' },
    { name: 'Organic Buyer', role: 'Pune', quote: 'Love the traceability features for organic food.', avatar: 'B' },
    { name: 'Kisan Partner', role: 'Nashik', quote: 'Mandi prices are updated real-time, very helpful.', avatar: 'K' },
    { name: 'Equipment Seller', role: 'Rajkot', quote: 'Sold my tractor within a week!', avatar: 'E' },
    { name: 'Crop Advisor', role: 'Delhi', quote: 'The expert advice section is a game changer.', avatar: 'C' },
    { name: 'Retail Buyer', role: 'Bangalore', quote: 'Direct farm-to-table delivery is excellent.', avatar: 'R' },
    { name: 'Dairy Farmer', role: 'Anand', quote: 'Cattle feed procurement is so simple now.', avatar: 'D' },
];

// Generate N numbers of testimonials with numbered names and ratings
const DEFAULT_TESTIMONIALS = Array.from({ length: 300 }, (_, i) => {
    const base = BASE_TESTIMONIALS[i % BASE_TESTIMONIALS.length];
    return {
        ...base,
        name: `User ${i + 1}`, // "Name 1, Name 2..."
        rating: 3 + Math.floor(Math.random() * 3), // Random rating 3-5
        id: i
    };
});

const DEFAULTS = {
    maxVerticalRotationDeg: 20,
    dragSensitivity: 15,
    enlargeTransitionMs: 300,
    segments: 14 // Balanced for size and spacing
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
    const a = (((deg + 180) % 360) + 360) % 360;
    return a - 180;
};
const getDataNumber = (el, name, fallback) => {
    const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
    const n = attr == null ? NaN : parseFloat(attr);
    return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
    // We use indices here.
    // CSS rot-y is (360/seg)/2. So offset-x increment of 2 = 1 segment width.
    const coords = [];

    // Limit rows to +/- 4 units (at seg=16, 1 unit = 11.25 deg)
    // 4 units = 45 degrees tilt. Perfect for readability.
    const rowIndices = [-4, -2, 0, 2, 4];

    rowIndices.forEach((yIndex, rIdx) => {
        // Horizontal columns - 2.0 increment = 1 full segment width
        for (let xIdx = 0; xIdx < seg * 2; xIdx += 2) {
            // Offset every other row for brick pattern
            const finalX = (rIdx % 2 === 1) ? (xIdx + 1) : xIdx;

            // set sizeX and sizeY to 1.7
            // This restores enough safety gap to prevent overlapping at the poles
            // while still keeping the cards large and prominent.
            coords.push({
                x: finalX,
                y: yIndex,
                sizeX: 1.7,
                sizeY: 1.7
            });
        }
    });

    const totalSlots = coords.length;
    // Fill slots
    const fedItems = Array.from({ length: totalSlots }, (_, i) => pool[i % pool.length]);

    // Randomize slightly to avoid pattern artifacts in data
    // fedItems.sort(() => Math.random() - 0.5);

    return coords.map((c, i) => ({
        ...c,
        data: fedItems[i]
    }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
    const unit = 360 / segments / 2;
    const rotateY = unit * (offsetX + (sizeX - 1) / 2);
    const rotateX = unit * (offsetY - (sizeY - 1) / 2);
    return { rotateX, rotateY };
}

export default function DomeGallery({
    items: userItems = DEFAULT_TESTIMONIALS,
    fit = 0.65, // Adjusted zoom
    fitBasis = 'auto',
    minRadius = 600,
    maxRadius = Infinity,
    padFactor = 0.25,
    overlayBlurColor = 'transparent',
    maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
    dragSensitivity = DEFAULTS.dragSensitivity,
    enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
    segments = DEFAULTS.segments,
    dragDampening = 2,
    grayscale = false
}) {
    const rootRef = useRef(null);
    const mainRef = useRef(null);
    const sphereRef = useRef(null);
    const startPosRef = useRef(null);
    const rotationRef = useRef({ x: 0, y: 0 });
    const startRotRef = useRef({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const movedRef = useRef(false);
    const inertiaRAF = useRef(null);

    const items = useMemo(() => buildItems(userItems, segments), [userItems, segments]);

    const applyTransform = (xDeg, yDeg) => {
        const el = sphereRef.current;
        if (el) {
            el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
        }
    };

    const lockedRadiusRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0].contentRect;
            const w = Math.max(1, cr.width),
                h = Math.max(1, cr.height);
            const minDim = Math.min(w, h),
                maxDim = Math.max(w, h),
                aspect = w / h;
            let basis;
            switch (fitBasis) {
                case 'min': basis = minDim; break;
                case 'max': basis = maxDim; break;
                case 'width': basis = w; break;
                case 'height': basis = h; break;
                default: basis = aspect >= 1.3 ? w : minDim;
            }
            let radius = basis * fit;
            radius = clamp(radius, minRadius, maxRadius);
            lockedRadiusRef.current = Math.round(radius);

            root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
            root.style.setProperty('--overlay-blur-color', overlayBlurColor);
            root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
            applyTransform(rotationRef.current.x, rotationRef.current.y);
        });
        ro.observe(root);
        return () => ro.disconnect();
    }, [fit, fitBasis, minRadius, maxRadius, overlayBlurColor, grayscale]);

    useEffect(() => {
        applyTransform(rotationRef.current.x, rotationRef.current.y);
    }, []);

    const autoRotateSpeed = 0.05; // Slow text crawl speed
    const autoRotateRAF = useRef(null);

    const autoRotateLoop = useCallback(() => {
        if (!draggingRef.current && !inertiaRAF.current) {
            const nextY = wrapAngleSigned(rotationRef.current.y + autoRotateSpeed);
            rotationRef.current.y = nextY;
            applyTransform(rotationRef.current.x, nextY);
        }
        autoRotateRAF.current = requestAnimationFrame(autoRotateLoop);
    }, []);

    useEffect(() => {
        autoRotateRAF.current = requestAnimationFrame(autoRotateLoop);
        return () => {
            if (autoRotateRAF.current) cancelAnimationFrame(autoRotateRAF.current);
        };
    }, [autoRotateLoop]);

    const stopInertia = useCallback(() => {
        if (inertiaRAF.current) {
            cancelAnimationFrame(inertiaRAF.current);
            inertiaRAF.current = null;
        }
    }, []);

    const startInertia = useCallback(
        (vx, vy) => {
            const MAX_V = 1.4;
            let vX = clamp(vx, -MAX_V, MAX_V) * 80;
            let vY = clamp(vy, -MAX_V, MAX_V) * 80;
            let frames = 0;
            const d = clamp(dragDampening ?? 0.6, 0, 1);
            const frictionMul = 0.94 + 0.055 * d;
            const stopThreshold = 0.015 - 0.01 * d;
            const step = () => {
                vX *= frictionMul;
                vY *= frictionMul;
                if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
                    inertiaRAF.current = null;
                    return;
                }
                const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
                const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
                rotationRef.current = { x: nextX, y: nextY };
                applyTransform(nextX, nextY);
                inertiaRAF.current = requestAnimationFrame(step);
            };
            stopInertia();
            inertiaRAF.current = requestAnimationFrame(step);
        },
        [dragDampening, maxVerticalRotationDeg, stopInertia]
    );

    useGesture(
        {
            onDragStart: ({ event }) => {
                stopInertia();
                const evt = event;
                draggingRef.current = true;
                movedRef.current = false;
                startRotRef.current = { ...rotationRef.current };
                startPosRef.current = { x: evt.clientX, y: evt.clientY };
                document.body.style.cursor = 'grabbing';
            },
            onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
                if (!draggingRef.current || !startPosRef.current) return;
                const evt = event;
                const dxTotal = evt.clientX - startPosRef.current.x;
                const dyTotal = evt.clientY - startPosRef.current.y;
                if (!movedRef.current) {
                    const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
                    if (dist2 > 16) movedRef.current = true;
                }

                const nextX = clamp(
                    startRotRef.current.x - dyTotal / dragSensitivity,
                    -maxVerticalRotationDeg,
                    maxVerticalRotationDeg
                );
                const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);

                rotationRef.current = { x: nextX, y: nextY };
                applyTransform(nextX, nextY);

                if (last) {
                    draggingRef.current = false;
                    document.body.style.cursor = 'grab';
                    let [vMagX, vMagY] = velocity;
                    const [dirX, dirY] = direction;
                    let vx = vMagX * dirX;
                    let vy = vMagY * dirY;
                    // Simple fling logic
                    if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) startInertia(vx, vy);
                }
            }
        },
        { target: mainRef, eventOptions: { passive: true } }
    );

    return (
        <div
            ref={rootRef}
            className="sphere-root"
            style={{
                cursor: 'grab',
                ['--segments-x']: segments,
                ['--segments-y']: segments,
                ['--overlay-blur-color']: overlayBlurColor,
                ['--image-filter']: grayscale ? 'grayscale(1)' : 'none'
            }}
        >
            <main ref={mainRef} className="sphere-main">
                <div className="stage">
                    <div ref={sphereRef} className="sphere">
                        {items.map((it, i) => (
                            <div
                                key={`${it.x},${it.y},${i}`}
                                className="item"
                                style={{
                                    ['--offset-x']: it.x,
                                    ['--offset-y']: it.y,
                                    ['--item-size-x']: it.sizeX,
                                    ['--item-size-y']: it.sizeY
                                }}
                            >
                                <div className="item__image">
                                    {/* Card Content */}
                                    <div className="t-dome-card">
                                        <div className="t-dome-header">
                                            <div className="t-dome-avatar" style={{ backgroundColor: ['#2E7D32', '#1976D2', '#D84315', '#F9A825'][i % 4] }}>
                                                {it.data.avatar || it.data.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4>{it.data.name}</h4>
                                                <span>{it.data.role}</span>
                                                <div className="t-dome-stars">
                                                    {Array(5).fill(0).map((_, i) => (
                                                        <span key={i} style={{ color: i < (it.data.rating || 5) ? '#FFA000' : '#E0E0E0' }}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="t-dome-quote">"{it.data.quote}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="edge-fade edge-fade--top" />
                <div className="edge-fade edge-fade--bottom" />
            </main>
        </div>
    );
}
