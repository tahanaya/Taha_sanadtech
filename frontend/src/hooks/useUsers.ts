import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../services/api';

export const useUsers = (initialSkip = 0, initialLimit = 50) => {
    const [users, setUsers] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(false);
    const [totalLines, setTotalLines] = useState(0);
    const loadingRef = useRef(false);

    const fetchUsers = useCallback(async (skip: number, limit: number) => {
        if (loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);

            const data = await api.getUsers(skip, limit);

            setTotalLines(data.meta.totalLines);

            setUsers(prev => {
                const next = { ...prev };
                data.users.forEach((user, i) => {
                    next[skip + i] = user;
                });
                return next;
            });

        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback((start: number, end: number) => {
        if (totalLines > 0 && start >= totalLines) return;
        const limit = end - start;
        fetchUsers(start, limit);
    }, [fetchUsers, totalLines]);

    // Initial load
    useEffect(() => {
        fetchUsers(initialSkip, initialLimit);
    }, [fetchUsers, initialSkip, initialLimit]);

    return { users, totalLines, loading, loadMore };
};
