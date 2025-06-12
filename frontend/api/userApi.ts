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
  const response = await api.get('/users/profile');
  return response.data;
};

// Busca todos os usuários, com filtro de role se necessário
export const getUsers = async (roleFilter?: string) => {
  let url = '/users';
  if (roleFilter) {
    url += `?role=${roleFilter}`;
  }
  const response = await api.get(url);
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
