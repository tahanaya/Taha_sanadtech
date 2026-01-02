const API_BASE_URL = 'http://localhost:3000';

export interface AlphabetMap {
  [key: string]: number;
}

export interface UserMeta {
  totalLines: number;
  skip: number;
  limit: number;
}

export interface UsersResponse {
  users: string[];
  meta: UserMeta;
}

export const fetchAlphabet = async (): Promise<AlphabetMap> => {
  const response = await fetch(`${API_BASE_URL}/alphabet`);
  if (!response.ok) throw new Error('Failed to fetch alphabet');
  const data = await response.json();
  return data.alphabetMap;
};

export const fetchUsers = async (skip: number, limit: number = 50): Promise<UsersResponse> => {
  const response = await fetch(`${API_BASE_URL}/users?skip=${skip}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};