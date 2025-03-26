import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllByUserId(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Task | null> {
    return this.taskRepository.findOne({ where: { id, userId } });
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: new Date(createTaskDto.dueDate),
      userId,
    });
    
    return this.taskRepository.save(task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const task = await this.findOne(id);
    
    if (!task) {
      return null;
    }

    if (updateTaskDto.dueDate) {
      updateTaskDto.dueDate = new Date(updateTaskDto.dueDate) as any;
    }

    Object.assign(task, updateTaskDto);
    
    return this.taskRepository.save(task);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
} 