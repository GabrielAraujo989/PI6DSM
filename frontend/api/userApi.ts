import api from './axios';

// Adicionar definição para CreateUserDto
interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  photoUrl?: string;
  birthDate?: string;
  cpf?: string;
}

export const getProfile = async () => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, updateData: Partial<CreateUserDto>) => {
  const response = await api.patch(`/users/${id}`, updateData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
