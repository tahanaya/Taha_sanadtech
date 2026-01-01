import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useAlphabet = () => {
    const [alphabetMap, setAlphabetMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getAlphabet()
            .then(data => {
                setAlphabetMap(data.alphabetMap);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    return { alphabetMap, loading };
};
