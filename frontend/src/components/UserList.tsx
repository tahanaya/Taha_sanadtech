import React, { useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';

interface UserListProps {
    users: Record<number, string>;
    totalLines: number;
    loadMore: (startIndex: number, stopIndex: number) => void;
    loading: boolean;
}

export interface UserListHandle {
    scrollToItem: (index: number) => void;
}

export const UserList = forwardRef<UserListHandle, UserListProps>(({ users, totalLines, loadMore, loading }, ref) => {
    const listRef = useRef<any>(null);
    const visibleRangeRef = useRef<{ start: number, stop: number } | null>(null);

    useImperativeHandle(ref, () => ({
        scrollToItem: (index: number) => {
            listRef.current?.scrollToItem(index, 'start');
        }
    }));

    const checkAndLoad = useCallback((start: number, stop: number) => {
        let missingStart = -1;
        let missingEnd = -1;

        for (let i = start; i <= stop; i++) {
            if (!users[i]) {
                if (missingStart === -1) missingStart = i;
                missingEnd = i;
            }
        }

        if (missingStart !== -1) {
            const buffer = 20;
            const reqStart = Math.max(0, missingStart - buffer);
            const reqEnd = Math.min(totalLines, missingEnd + buffer);
            loadMore(reqStart, reqEnd);
        }
    }, [users, totalLines, loadMore]);

    const onItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
        visibleRangeRef.current = { start: visibleStartIndex, stop: visibleStopIndex };
        if (!loading) {
            checkAndLoad(visibleStartIndex, visibleStopIndex);
        }
    }, [loading, checkAndLoad]);

    // Retry loading when loading finishes, if we still have gaps
    useEffect(() => {
        if (!loading && visibleRangeRef.current) {
            checkAndLoad(visibleRangeRef.current.start, visibleRangeRef.current.stop);
        }
    }, [loading, checkAndLoad]);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const user = users[index];

        if (!user) {
            return (
                <div style={style} className="flex items-center justify-center text-gray-800 bg-gray-950 border-b border-gray-900 animate-pulse">
                    <span className="text-xs">Loading...</span>
                </div>
            );
        }

        return (
            <div style={style} className={`px-2 border-b border-gray-800 flex items-center ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'} text-gray-100 hover:bg-gray-800 transition-colors`}>
                <span className="mr-3 text-gray-600 w-12 text-right font-mono text-xs opacity-50">#{index + 1}</span>
                <span className="font-medium tracking-wide text-sm truncate">{user}</span>
            </div>
        );
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <AutoSizer>
                {({ height, width }: { height: number; width: number }) => (
                    <List
                        ref={listRef}
                        height={height}
                        width={width}
                        itemCount={totalLines}
                        itemSize={25}
                        onItemsRendered={onItemsRendered}
                    >
                        {Row}
                    </List>
                )}
            </AutoSizer>
        </div>
    );
});

UserList.displayName = 'UserList';
