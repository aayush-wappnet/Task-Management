import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAll(userId: number, userRole: UserRole): Promise<Task[]> {
    // Admin users can see all tasks
    if (userRole === UserRole.ADMIN) {
      return this.tasksRepository.findAll();
    }
    
    // Regular users can only see their own tasks
    return this.tasksRepository.findAllByUserId(userId);
  }

  async findOne(id: number, userId: number, userRole: UserRole): Promise<Task> {
    const task = await this.tasksRepository.findOne(id);
    
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    
    // Check if user has permission to access this task
    if (userRole !== UserRole.ADMIN && task.userId !== userId) {
      throw new ForbiddenException(`You don't have permission to access this task`);
    }
    
    return task;
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    return this.tasksRepository.create(createTaskDto, userId);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number, userRole: UserRole): Promise<Task> {
    // First check if the task exists and if the user has permission to access it
    await this.findOne(id, userId, userRole);
    
    const updatedTask = await this.tasksRepository.update(id, updateTaskDto);
    
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    
    return updatedTask;
  }

  async remove(id: number): Promise<void> {
    const result = await this.tasksRepository.remove(id);
    
    if (!result) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async removeByUser(id: number, userId: number, userRole: UserRole): Promise<void> {
    // If user is admin, they can delete any task
    if (userRole === UserRole.ADMIN) {
      return this.remove(id);
    }
    
    // For regular users, check if the task belongs to them
    const task = await this.tasksRepository.findByIdAndUserId(id, userId);
    
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found or you don't have permission to delete it`);
    }
    
    const result = await this.tasksRepository.remove(id);
    
    if (!result) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
} 