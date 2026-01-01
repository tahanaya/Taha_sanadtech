import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

interface LargeUserListProps {
    users: Record<number, string>;
    totalLines: number;
    loadMore: (startIndex: number, stopIndex: number) => void;
    loading: boolean;
}

export interface UserListHandle {
    scrollToItem: (index: number) => void;
}

// Browser scroll height limits vary (Chrome/Safari ~33M, Firefox ~17M).
// We cap the physical scroll height to a safe threshold (25M px) to avoid issues
// and implement a virtual "scroll mapping" for datasets larger than that.
const MAX_SCROLL_HEIGHT = 25_000_000;
const ITEM_HEIGHT = 25;

export const LargeUserList = forwardRef<UserListHandle, LargeUserListProps>(({ users, totalLines, loadMore, loading }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [startIndex, setStartIndex] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    // Calculate the 'Virtual' height of the content if we could allow it
    const realContentHeight = totalLines * ITEM_HEIGHT;

    // We cap the physical scrollable height to browser limit
    const ghostHeight = Math.min(realContentHeight, MAX_SCROLL_HEIGHT);
    const useFakeScroll = realContentHeight > MAX_SCROLL_HEIGHT;

    useImperativeHandle(ref, () => ({
        scrollToItem: (index: number) => {
            // Reverse mapping: Index -> Scroll Top
            if (!containerRef.current || viewportHeight === 0) return;

            if (useFakeScroll) {
                // Map index (0..total) to scroll (0..ghost - view)
                const pct = index / totalLines;
                const maxScroll = ghostHeight - viewportHeight;
                containerRef.current.scrollTop = pct * maxScroll;
            } else {
                containerRef.current.scrollTop = index * ITEM_HEIGHT;
            }
        }
    }));

    const handleScroll = () => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const clientHeight = containerRef.current.clientHeight;

        let newStartIndex = 0;

        if (useFakeScroll) {
            // Map Scroll (0 .. ghostHeight-clientHeight) -> Index (0 .. totalLines - visibleCount)
            const maxScroll = ghostHeight - clientHeight;
            const scrollPct = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

            const visibleCount = Math.ceil(clientHeight / ITEM_HEIGHT);
            const totalScrollableItems = Math.max(0, totalLines - visibleCount);

            newStartIndex = Math.floor(scrollPct * totalScrollableItems);
        } else {
            newStartIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        }

        setStartIndex(newStartIndex);

        // Trigger loads
        const visibleCount = Math.ceil(clientHeight / ITEM_HEIGHT);
        const buffer = 20;
        const checkStart = Math.max(0, newStartIndex - buffer);
        const checkEnd = Math.min(totalLines, newStartIndex + visibleCount + buffer);

        // Simple manual check
        let missingStart = -1;
        let missingEnd = -1;
        for (let i = checkStart; i <= checkEnd; i++) {
            if (!users[i]) {
                if (missingStart === -1) missingStart = i;
                missingEnd = i;
            }
        }

        if (missingStart !== -1 && !loading) {
            loadMore(missingStart, missingEnd);
        }
    };

    // Initial fetch check
    useEffect(() => {
        if (viewportHeight > 0) {
            handleScroll(); // Check if we need to load initial view
        }
    }, [viewportHeight, totalLines]);

    return (
        <AutoSizer onResize={({ height }: any) => setViewportHeight(height)}>
            {({ height, width }: any) => {
                // Number of items to render in the view
                const visibleCount = Math.ceil(height / ITEM_HEIGHT) + 2; // +buffer
                const items = [];

                for (let i = 0; i < visibleCount; i++) {
                    const index = startIndex + i;
                    if (index >= totalLines) break;

                    const user = users[index];
                    const style: React.CSSProperties = {
                        height: ITEM_HEIGHT,
                        width: '100%',
                        position: 'absolute',
                        top: i * ITEM_HEIGHT, // Relative to the sticky container
                    };

                    items.push(
                        <div key={index} style={style} className={`px-2 border-b border-gray-800 flex items-center ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'} text-gray-100 hover:bg-gray-800 transition-colors`}>
                            <span className="mr-3 text-gray-600 w-12 text-right font-mono text-xs opacity-50">#{index + 1}</span>
                            <span className="font-medium tracking-wide text-sm truncate">{user || 'Loading...'}</span>
                        </div>
                    );
                }

                return (
                    <div
                        ref={containerRef}
                        style={{ height, width, overflowY: 'auto', position: 'relative' }}
                        onScroll={handleScroll}
                    >
                        {/* Ghost Scrollbar */}
                        <div style={{ height: ghostHeight, width: 1, position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }} />

                        {/* Sticky Viewport for Items */}
                        <div style={{
                            position: 'sticky',
                            top: 0,
                            height: height,
                            width: '100%',
                            overflow: 'hidden'
                        }}>
                            {items}
                        </div>
                    </div>
                );
            }}
        </AutoSizer>
    );
});

LargeUserList.displayName = 'LargeUserList';
