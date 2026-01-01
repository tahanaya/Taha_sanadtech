import React, { useCallback } from 'react';
// @ts-ignore
import { List } from 'react-window';
// @ts-ignore
import { AutoSizer } from 'react-virtualized-auto-sizer';

interface UserListProps {
    users: string[];
    hasMore: boolean;
    loadMore: (startIndex: number, stopIndex: number) => void;
    loading: boolean;
}

export const UserList: React.FC<UserListProps> = ({ users, hasMore, loadMore, loading }) => {

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
        <div style={{ flex: '1 1 auto', height: '100%' }}>
            <AutoSizer>
                {({ height, width }: { height: number; width: number }) => (
                    <List
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
};
