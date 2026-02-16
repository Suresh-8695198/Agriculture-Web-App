import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

const GridMotion = ({ items = [], gradientColor = 'black' }) => {
    const gridRef = useRef(null);
    const rowRefs = useRef([]);

    // Default items if none provided
    const totalItems = 28;
    const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
    const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

    useEffect(() => {
        const ctx = gsap.context(() => {
            rowRefs.current.forEach((row, index) => {
                if (!row) return;

                // Clone children for seamless loop if not already cloned (simple check, or just rely on render)
                // Actually, we'll handle cloning in the render phase for simplicity.

                const direction = index % 2 === 0 ? -1 : 1; // Alternate direction
                const duration = 40 + index * 10; // Slower speed (increased from 20 + index * 5)

                // Get the total width of the content. 
                // Since we are moving to CSS based marquee or GSAP marquee, we need to know the width.
                // A simple way is to animate xPercent.
                // If we have 2 sets of items, moving -50% (of total width) is one loop.

                gsap.to(row, {
                    xPercent: direction === -1 ? -50 : 0,
                    startAt: { xPercent: direction === -1 ? 0 : -50 },
                    duration: duration,
                    ease: "none",
                    repeat: -1
                });
            });
        }, gridRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="noscroll loading" ref={gridRef}>
            <section
                className="intro"
                style={{
                    background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
                }}
            >
                <div className="gridMotion-container">
                    {[...Array(4)].map((_, rowIndex) => {
                        // Get items for this row (7 items)
                        const rowItems = combinedItems.slice(rowIndex * 7, (rowIndex + 1) * 7);
                        // Double them for the loop
                        const loopItems = [...rowItems, ...rowItems];

                        return (
                            <div key={rowIndex} className="row" ref={el => (rowRefs.current[rowIndex] = el)}>
                                {loopItems.map((content, itemIndex) => (
                                    <div key={itemIndex} className="row__item">
                                        <div className="row__item-inner">
                                            {typeof content === 'string' && content.startsWith('http') ? (
                                                <div
                                                    className="row__item-img"
                                                    style={{
                                                        backgroundImage: `url(${content})`
                                                    }}
                                                ></div>
                                            ) : (
                                                <div className="row__item-content">{content}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
                <div className="fullview"></div>
            </section>
        </div>
    );
};

export default GridMotion;
