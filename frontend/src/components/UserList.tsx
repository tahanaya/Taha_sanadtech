import React, { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';

interface UserListProps {
    users: string[];
    hasMore: boolean;
    loadMore: (startIndex: number, stopIndex: number) => void;
    loading: boolean;
}

export interface UserListHandle {
    scrollToItem: (index: number) => void;
}

export const UserList = forwardRef<UserListHandle, UserListProps>(({ users, hasMore, loadMore, loading }, ref) => {
    const listRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
        scrollToItem: (index: number) => {
            listRef.current?.scrollToItem(index, 'start');
        }
    }));

    const onItemsRendered = useCallback(({ visibleStopIndex }: any) => {
        if (hasMore && !loading && visibleStopIndex >= users.length - 10) {
            loadMore(users.length, users.length + 50);
        }
    }, [users.length, hasMore, loading, loadMore]);

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        if (index >= users.length) {
            return <div style={style} className="flex items-center justify-center text-gray-400">Loading...</div>;
        }

        return (
            <div style={style} className={`px-4 py-2 border-b border-gray-700 flex items-center ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} text-white`}>
                <span className="mr-4 text-gray-500 w-16 text-right">#{index + 1}</span>
                <span className="font-medium">{users[index]}</span>
            </div>
        );
    };

    const itemCount = hasMore ? users.length + 1 : users.length;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <AutoSizer>
                {({ height, width }: { height: number; width: number }) => (
                    <List
                        ref={listRef}
                        height={height}
                        width={width}
                        itemCount={itemCount}
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
