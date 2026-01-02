import { useState, useEffect } from 'react';
import { fetchAlphabet, AlphabetMap } from '../services/api';

export const useAlphabet = () => {
  const [alphabet, setAlphabet] = useState<AlphabetMap>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAlphabet()
      .then((data: AlphabetMap) => {
        setAlphabet(data);
      })
      .catch((err: Error) => {
        console.error('Error fetching alphabet:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { alphabet, loading };
};