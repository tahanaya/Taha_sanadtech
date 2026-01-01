import React, { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
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

    useImperativeHandle(ref, () => ({
        scrollToItem: (index: number) => {
            listRef.current?.scrollToItem(index, 'start');
        }
    }));

    const onItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: any) => {
        // Simple check: if the first or last visible item is missing, load the range.
        // We can optimize to check specifically which chunk is missing.
        let missingStart = -1;
        let missingEnd = -1;

        for (let i = visibleStartIndex; i <= visibleStopIndex; i++) {
            if (!users[i]) {
                if (missingStart === -1) missingStart = i;
                missingEnd = i;
            }
        }

        if (missingStart !== -1 && !loading) {
            // Buffer the request a bit
            const buffer = 20;
            const start = Math.max(0, missingStart - buffer);
            const end = Math.min(totalLines, missingEnd + buffer);
            loadMore(start, end);
        }
    }, [users, totalLines, loading, loadMore]);

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
            <div style={style} className={`px-4 py-2 border-b border-gray-800 flex items-center ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'} text-gray-100 hover:bg-gray-800 transition-colors`}>
                <span className="mr-4 text-gray-500 w-16 text-right font-mono text-sm opacity-50">#{index + 1}</span>
                <span className="font-medium tracking-wide">{user}</span>
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
                        itemSize={50}
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
