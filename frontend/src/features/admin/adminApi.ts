import axiosInstance from '../../api/axiosConfig';
import { User } from '../auth/types';
import { Task } from '../tasks/types';

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    console.log('Fetching all users');
    const response = await axiosInstance.get<User[]>('/users');
    console.log('Fetched users:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw new Error('Failed to fetch users');
  }
};

export const fetchUserById = async (id: number): Promise<User> => {
  try {
    console.log(`Fetching user with id ${id}`);
    const response = await axiosInstance.get<User>(`/users/${id}`);
    console.log(`Fetched user ${id}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching user ${id}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch user: ${error.response?.data?.message || error.message}`);
  }
};

export const fetchUserTasks = async (userId: number): Promise<Task[]> => {
  try {
    console.log(`Fetching tasks for user ${userId}`);
    // Since we're logged in as admin, we get all tasks but need to filter by userId
    const response = await axiosInstance.get<Task[]>('/tasks');
    const userTasks = response.data.filter(task => task.userId === userId);
    console.log(`Fetched tasks for user ${userId}:`, userTasks);
    return userTasks;
  } catch (error: any) {
    console.error(`Error fetching tasks for user ${userId}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch user tasks: ${error.response?.data?.message || error.message}`);
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    console.log(`Deleting user ${id}`);
    await axiosInstance.delete(`/users/${id}`);
    console.log(`Deleted user ${id} successfully`);
  } catch (error: any) {
    console.error(`Error deleting user ${id}:`, error.response?.data || error.message);
    throw new Error(`Failed to delete user: ${error.response?.data?.message || error.message}`);
  }
}; 