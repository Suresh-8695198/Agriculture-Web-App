
import React from 'react';

export const SketchArrow = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10,50 Q30,20 50,50 T90,50" />
        <path d="M70,35 L90,50 L75,65" />
        <path d="M12,52 Q32,22 52,52 T92,52" opacity="0.5" strokeWidth="1" />
    </svg>
);

export const SketchWaveArrow = ({ className, style }) => (
    <svg
        viewBox="0 0 100 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Main Wave Path */}
        <path d="M5,32 Q15,12 25,32 T45,32 T65,32 T85,32" />

        {/* Dynamic Arrowhead (Organic Flick) */}
        <path d="M78,22 L88,32 L75,45" />
        <path d="M80,25 L88,32" opacity="0.6" strokeWidth="2" /> {/* Extra stroke for "inked" feel */}

        {/* Decorative Shadow Stroke */}
        <path d="M8,35 Q18,15 28,35 T48,35 T68,35 T88,35" opacity="0.3" strokeWidth="1.5" />
    </svg>
);

export const SketchSpring = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20,90 C10,90 10,70 20,70 C30,70 30,90 40,90 C50,90 50,70 60,70 C70,70 70,90 80,90 C90,90 90,70 80,50 L50,10" />
    </svg>
);

export const SketchStar = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50,10 L65,40 L95,45 L70,68 L80,95 L50,80 L20,95 L30,68 L5,45 L35,40 Z" />
        <path d="M52,15 L66,42 L92,46 L71,69 L81,92 L52,78" opacity="0.3" />
    </svg>
);

export const SketchPlant = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50,95 Q50,50 80,30" />
        <path d="M50,95 Q50,50 20,30" />
        <path d="M50,50 L50,20" />
        <path d="M50,20 Q65,5 80,20 Q65,35 50,20" />
        <path d="M50,20 Q35,5 20,20 Q35,35 50,20" />
        <path d="M55,90 L65,85" />
        <path d="M45,90 L35,85" />
    </svg>
);

export const SketchFarmer = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Background Decorative Circle - Pro Look */}
        <circle cx="50" cy="50" r="45" opacity="0.05" fill="currentColor" stroke="none" />

        {/* Cowboy Hat - Professional Silhouette */}
        <path d="M25,42 Q50,30 75,42" strokeWidth="3" /> {/* Brim Top */}
        <path d="M20,45 Q50,38 80,45 L85,48 H15 L20,45 Z" fill="currentColor" opacity="0.1" /> {/* Brim Fill */}
        <path d="M20,45 Q50,38 80,45" strokeWidth="3" /> {/* Brim Bottom */}
        <path d="M35,42 V30 Q50,20 65,30 V42" strokeWidth="3" /> {/* Crown */}
        <path d="M45,28 Q50,25 55,28" opacity="0.5" /> {/* Crown Crease */}

        {/* Professional Face/Head */}
        <path d="M38,55 Q38,75 50,75 Q62,75 62,55" strokeWidth="2.5" /> {/* Jawline */}
        <path d="M44,55 Q50,58 56,55" opacity="0.6" /> {/* Eyes/Brow Line */}
        <path d="M47,65 Q50,67 53,65" strokeWidth="1.5" /> {/* Mouth/Grit */}

        {/* Shoulders & Shirt - Pro Farmer Attire */}
        <path d="M25,90 Q25,80 35,75 L45,75 M65,75 Q75,80 75,90" strokeWidth="2.5" />
        <path d="M45,75 L50,85 L55,75" strokeWidth="2" /> {/* Collar/V-neck detail */}
        <path d="M50,85 V95" opacity="0.4" /> {/* Shirt line */}

        {/* Subtle Accents */}
        <path d="M68,58 L78,50" opacity="0.3" strokeWidth="1" /> {/* Hint of a stalk or tool */}
    </svg>
);

export const SketchCircle = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50,10 C75,10 95,30 90,55 C85,80 60,95 35,90 C15,85 5,60 15,35 C25,15 45,5 55,12" />
    </svg>
);

export const SketchBulb = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Bulb shape */}
        <path d="M35,65 Q20,40 35,25 Q50,10 65,25 Q80,40 65,65" />
        <path d="M35,65 L38,80 L62,80 L65,65" />
        {/* Screw bottom */}
        <path d="M40,80 L40,85 L60,85 L60,80" />
        <path d="M42,85 L44,90 L56,90 L58,85" />
        {/* Rays */}
        <path d="M50,10 L50,5" />
        <path d="M20,30 L15,25" />
        <path d="M80,30 L85,25" />
        {/* Filament */}
        <path d="M45,65 L45,50 L55,50 L55,65" strokeWidth="1" />
    </svg>
);

export const SketchTractor = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Rear Wheel */}
        <circle cx="75" cy="75" r="15" />
        <circle cx="75" cy="75" r="5" />
        {/* Front Wheel */}
        <circle cx="25" cy="80" r="10" />
        <circle cx="25" cy="80" r="3" />
        {/* Chassis */}
        <path d="M25,80 L75,75" />
        <path d="M35,60 L80,55" />
        {/* Engine/Cabin */}
        <path d="M30,60 L30,45 L55,45 L55,70" />
        <path d="M55,45 L80,35 L85,55 L75,60" /> {/* Hood */}
        <path d="M40,30 L40,45" /> {/* Exhaust */}
        <path d="M35,30 L45,30" />
        {/* Driver Seat/Window */}
        <path d="M55,45 L55,35 L30,45" />
        <path d="M85,55 L90,58" /> {/* Light */}
    </svg>
);

export const SketchDrone = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Central Body */}
        <ellipse cx="50" cy="50" rx="15" ry="10" />
        <path d="M45,50 L55,50" opacity="0.5" />

        {/* Arms */}
        <path d="M38,42 L20,30" />
        <path d="M62,42 L80,30" />
        <path d="M38,58 L20,70" />
        <path d="M62,58 L80,70" />

        {/* Propellers */}
        <ellipse cx="20" cy="30" rx="12" ry="4" strokeWidth="1.5" />
        <ellipse cx="80" cy="30" rx="12" ry="4" strokeWidth="1.5" />
        <ellipse cx="20" cy="70" rx="12" ry="4" strokeWidth="1.5" />
        <ellipse cx="80" cy="70" rx="12" ry="4" strokeWidth="1.5" />

        {/* Camera/Sensor */}
        <path d="M45,60 L50,65 L55,60" />
        <circle cx="50" cy="65" r="2" fill="currentColor" />
    </svg>
);

export const SketchChart = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Axes */}
        <path d="M15,15 L15,85 L90,85" />

        {/* Line Chart */}
        <path d="M15,75 Q30,70 40,55 T65,45 T85,25" />
        <circle cx="40" cy="55" r="3" fill="currentColor" stroke="none" />
        <circle cx="65" cy="45" r="3" fill="currentColor" stroke="none" />
        <circle cx="85" cy="25" r="3" fill="currentColor" stroke="none" />

        {/* Bar Chart overlay hint */}
        <path d="M25,85 L25,60" opacity="0.3" />
        <path d="M50,85 L50,50" opacity="0.3" />
        <path d="M75,85 L75,35" opacity="0.3" />

        {/* Arrow at top */}
        <path d="M80,25 L85,25 L85,30" />
    </svg>
);

export const SketchLocation = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Pin Shape */}
        <path d="M50,15 C30,15 20,35 20,45 C20,65 50,95 50,95 C50,95 80,65 80,45 C80,35 70,15 50,15 Z" />
        <circle cx="50" cy="40" r="10" />

        {/* Map lines */}
        <path d="M10,80 L35,65" opacity="0.5" />
        <path d="M90,80 L65,65" opacity="0.5" />
        <path d="M15,25 L25,35" opacity="0.3" />
    </svg>
);

export const SketchMobile = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Phone Body */}
        <rect x="25" y="10" width="50" height="80" rx="8" />

        {/* Screen Content */}
        <path d="M35,25 L65,25" />
        <path d="M35,35 L65,35" />
        <path d="M35,45 L50,45" />

        {/* Graph on screen */}
        <path d="M35,65 L45,55 L55,60 L65,50" />

        {/* Home Button */}
        <circle cx="50" cy="82" r="3" />
    </svg>
);

export const SketchBasket = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Basket Body */}
        <path d="M20,35 L80,35 L70,85 L30,85 Z" />
        {/* Weave lines */}
        <path d="M25,50 L75,50" opacity="0.5" />
        <path d="M28,65 L72,65" opacity="0.5" />
        <path d="M40,35 L45,85" opacity="0.5" />
        <path d="M60,35 L55,85" opacity="0.5" />

        {/* Handle */}
        <path d="M20,35 C20,10 80,10 80,35" />

        {/* Produce sticking out */}
        <circle cx="40" cy="30" r="8" />
        <circle cx="60" cy="30" r="8" />
        <path d="M35,25 L35,15" strokeWidth="2" />
        <path d="M65,25 L65,15" strokeWidth="2" />
    </svg>
);

export const SketchShield = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Shield Shape */}
        <path d="M50,15 L80,25 V50 C80,70 50,90 50,90 C50,90 20,70 20,50 V25 Z" />

        {/* Checkmark */}
        <path d="M35,50 L45,60 L65,40" strokeWidth="3" />

        {/* Shine */}
        <path d="M30,30 L40,30" opacity="0.3" />
    </svg>
);

export const SketchHandshake = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20,60 L40,60 C45,60 50,55 50,50 C50,45 45,40 40,40 L30,40" />
        <path d="M80,60 L60,60 C55,60 50,55 50,50 C50,45 55,40 60,40 L70,40" />
        <path d="M35,65 L35,75 M65,65 L65,75" opacity="0.5" />
        <path d="M45,45 Q50,30 55,45" />
    </svg>
);

export const SketchWallet = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20,30 H80 V80 H20 Z" />
        <path d="M80,45 H65 C60,45 55,50 55,55 C55,60 60,65 65,65 H80" />
        <circle cx="70" cy="55" r="2" fill="currentColor" />
        <path d="M25,35 H75" opacity="0.3" />
    </svg>
);

export const SketchLeafPulse = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20,70 L35,70 L40,50 L50,85 L60,15 L65,70 L80,70" />
        <path d="M20,30 Q40,10 60,30 Q40,50 20,30" opacity="0.4" />
        <path d="M20,30 L60,30" opacity="0.2" />
    </svg>
);

export const SketchCloudPulse = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M25,65 C15,65 15,45 25,45 C25,25 55,25 55,35 C65,35 75,45 75,55 C75,65 65,75 50,75 C35,75 25,65 25,65" />
        <path d="M30,85 L35,80 M50,85 L55,80 M70,85 L75,80" opacity="0.6" strokeWidth="2" />
        <path d="M30,45 Q40,40 50,45" opacity="0.4" />
    </svg>
);

export const SketchSoil = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10,80 Q50,70 90,80" />
        <path d="M20,80 V60 Q35,50 50,60 Q65,70 80,60 V80" />
        <path d="M40,65 L40,40 Q50,30 60,40 L60,65" />
        <path d="M45,40 L55,40" />
        <path d="M30,75 L70,75" opacity="0.3" />
    </svg>
);

export const SketchAnalysis = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20,20 H80 V80 H20 Z" />
        <path d="M30,40 Q50,20 70,40" />
        <path d="M30,60 Q50,40 70,60" />
        <path d="M30,35 L70,35 M30,55 L70,55" opacity="0.3" />
        <circle cx="50" cy="50" r="15" opacity="0.2" />
        <path d="M60,60 L85,85" strokeWidth="4" />
    </svg>
);

export const SketchScribble = ({ className, style }) => (
    <svg
        viewBox="0 0 100 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5,20 Q15,5 25,20 T45,20 T65,20 T85,20 T95,5" />
        <path d="M10,25 Q20,10 30,25 T50,25 T70,25 T90,25" opacity="0.3" />
    </svg>
);

export const SketchLoop = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M50,10 C80,10 90,40 70,60 C50,80 20,70 10,40 C0,10 30,0 50,10 Z" />
        <path d="M55,15 C75,15 85,35 70,50" opacity="0.4" />
    </svg>
);


export const SketchQuote = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* First Quote Mark */}
        <path d="M20,40 Q25,20 40,20 L40,45 Q40,60 25,60" fill="currentColor" fillOpacity="0.2" />
        <path d="M20,40 Q25,20 40,20 L40,45 Q40,60 25,60" />
        <path d="M30,30 Q35,25 40,30" opacity="0.5" />

        {/* Second Quote Mark */}
        <path d="M50,40 Q55,20 70,20 L70,45 Q70,60 55,60" fill="currentColor" fillOpacity="0.2" />
        <path d="M50,40 Q55,20 70,20 L70,45 Q70,60 55,60" />
        <path d="M60,30 Q65,25 70,30" opacity="0.5" />
    </svg>
);

export const SketchCurvyArrow = ({ className, style }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Curvy Tail */}
        <path d="M80,10 C70,10 60,20 60,40 C60,60 75,70 90,80" />
        {/* Arrow Head */}
        <path d="M82,75 L90,80 L88,70" />
        {/* Shadow/Double Stroke */}
        <path d="M82,12 C72,12 62,22 62,42 C62,62 77,72 92,82" opacity="0.3" strokeWidth="1.5" />
    </svg>
);
