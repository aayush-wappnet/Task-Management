import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@CurrentUser() user: any): Promise<Task[]> {
    return this.tasksService.findAll(user.id, user.role);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any
  ): Promise<Task> {
    return this.tasksService.findOne(id, user.id, user.role);
  }

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, user.id, user.role);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.tasksService.removeByUser(id, user.id, user.role);
  }
} 