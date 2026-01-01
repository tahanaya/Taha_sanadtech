import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface UsersResponse {
    users: string[];
    meta: {
        totalLines: number;
    };
}

export interface AlphabetResponse {
    alphabetMap: Record<string, number>;
}

export const api = {
    getUsers: async (skip: number, limit: number) => {
        const response = await axios.get<UsersResponse>(`${API_URL}/users`, {
            params: { skip, limit }
        });
        return response.data;
    },
    getAlphabet: async () => {
        const response = await axios.get<AlphabetResponse>(`${API_URL}/alphabet`);
        return response.data;
    }
};
