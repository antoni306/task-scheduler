import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';

jest.mock('./task.entity', () => ({ Task: class Task { } }));
jest.mock('src/auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard { },
}), { virtual: true });

describe('TasksController', () => {
  let controller: TasksController;
  const tasksService = {
    createTask: jest.fn(),
    getTask: jest.fn(),
    getTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createTask should delegate to service with user id from request', async () => {
    const dto: any = {
      title: 'Task',
      description: 'Desc',
      dueDate: new Date('2026-05-01'),
    };
    const req: any = { user: { sub: 'user-1' } };
    const created: any = {
      id: 'task-1',
      ...dto,
      taskStatus: TaskStatus.OPEN,
      user: { id: 'user-1' },
    };
    tasksService.createTask.mockResolvedValue(created);

    await expect(controller.createTask(dto, req)).resolves.toEqual(created);
    expect(tasksService.createTask).toHaveBeenCalledWith(
      dto.title,
      dto.description,
      dto.dueDate,
      'user-1',
    );
  });

  it('getTask should delegate to service with id and user id', async () => {
    const req: any = { user: { sub: 'user-1' } };
    const task: any = { id: 'task-1' };
    tasksService.getTask.mockResolvedValue(task);

    await expect(controller.getTask('task-1', req)).resolves.toEqual(task);
    expect(tasksService.getTask).toHaveBeenCalledWith('task-1', 'user-1');
  });

  it('getTasks should pass filters and user id to service', async () => {
    const req: any = { user: { sub: 'user-1' } };
    const filters: any = { title: 'abc' };
    const result: any[] = [{ id: 'task-1' }];
    tasksService.getTasks.mockResolvedValue(result);

    await expect(controller.getTasks(filters, req)).resolves.toEqual(result);
    expect(tasksService.getTasks).toHaveBeenCalledWith('user-1', filters);
  });

  it('updateTask should delegate to service', async () => {
    const req: any = { user: { sub: 'user-1' } };
    const updateDto: any = { taskStatus: TaskStatus.COMPLETED };
    const result: any = { affected: 1 };
    tasksService.updateTask.mockResolvedValue(result);

    await expect(controller.updateTask('task-1', updateDto, req)).resolves.toEqual(
      result,
    );
    expect(tasksService.updateTask).toHaveBeenCalledWith(
      'task-1',
      updateDto,
      'user-1',
    );
  });

  it('deleteTask should delegate to service', async () => {
    const req: any = { user: { sub: 'user-1' } };
    const result: any = { affected: 1 };
    tasksService.deleteTask.mockResolvedValue(result);

    await expect(controller.deleteTask('task-1', req)).resolves.toEqual(result);
    expect(tasksService.deleteTask).toHaveBeenCalledWith('task-1', 'user-1');
  });
});
