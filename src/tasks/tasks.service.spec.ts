import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';

jest.mock('src/users/user.entity', () => ({ User: class User { } }), {
  virtual: true,
});

describe('TasksService', () => {
  let service: TasksService;
  const repository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    createQueryBuilder: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createTask should save new task with OPEN status and user relation', async () => {
    const dueDate = new Date('2026-06-01');
    const saved: any = { id: 'task-1' };
    repository.save.mockResolvedValue(saved);

    await expect(
      service.createTask('Title', 'Description', dueDate, 'user-1'),
    ).resolves.toEqual(saved);
    expect(repository.save).toHaveBeenCalledWith({
      title: 'Title',
      description: 'Description',
      dueDate,
      taskStatus: TaskStatus.OPEN,
      user: { id: 'user-1' },
    });
  });

  it('getTask should return task when found', async () => {
    const task: any = { id: 'task-1' };
    repository.findOneBy.mockResolvedValue(task);

    await expect(service.getTask('task-1', 'user-1')).resolves.toEqual(task);
    expect(repository.findOneBy).toHaveBeenCalledWith({
      id: 'task-1',
      user: { id: 'user-1' },
    });
  });

  it('getTask should throw NotFoundException when task is missing', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.getTask('missing', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getTasks should build query with all filters and return tasks', async () => {
    const result = [{ id: 'task-1' }];
    const andWhere = jest.fn();
    const getMany = jest.fn().mockResolvedValue(result);
    const query: any = { andWhere, getMany };
    repository.createQueryBuilder.mockReturnValue(query);
    const filters: any = {
      title: 'Title',
      description: 'Desc',
      dueDate: '2026-06-10',
      taskStatus: TaskStatus.IN_PROGRESS,
    };

    await expect(service.getTasks('user-1', filters)).resolves.toEqual(result);
    expect(repository.createQueryBuilder).toHaveBeenCalledWith('task');
    expect(andWhere).toHaveBeenNthCalledWith(1, { user: { id: 'user-1' } });
    expect(andWhere).toHaveBeenNthCalledWith(
      2,
      '(LOWER(task.title) ILIKE :search) ',
      { search: '%Title%' },
    );
    expect(andWhere).toHaveBeenNthCalledWith(
      3,
      '(LOWER(task.description) ILIKE :searchDesc) ',
      { searchDesc: '%Desc%' },
    );
    expect(andWhere).toHaveBeenNthCalledWith(
      4,
      'DATE(task.dueDate) <= :date',
      { date: '2026-06-10' },
    );
    expect(andWhere).toHaveBeenNthCalledWith(
      5,
      'task.taskStatus = :status',
      { status: TaskStatus.IN_PROGRESS },
    );
    expect(getMany).toHaveBeenCalledTimes(1);
  });

  it('updateTask should return update result when affected > 0', async () => {
    const updateResult: any = { affected: 1 };
    repository.update.mockResolvedValue(updateResult);
    const dto: any = { title: 'Updated' };

    await expect(service.updateTask('task-1', dto, 'user-1')).resolves.toEqual(
      updateResult,
    );
    expect(repository.update).toHaveBeenCalledWith(
      { id: 'task-1', user: { id: 'user-1' } },
      dto,
    );
  });

  it('updateTask should throw NotFoundException when affected = 0', async () => {
    repository.update.mockResolvedValue({ affected: 0 });

    await expect(
      service.updateTask('missing', { title: 'x' } as any, 'user-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deleteTask should return delete result when affected > 0', async () => {
    const deleteResult: any = { affected: 1 };
    repository.delete.mockResolvedValue(deleteResult);

    await expect(service.deleteTask('task-1', 'user-1')).resolves.toEqual(
      deleteResult,
    );
    expect(repository.delete).toHaveBeenCalledWith({
      id: 'task-1',
      user: { id: 'user-1' },
    });
  });

  it('deleteTask should throw NotFoundException when affected = 0', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.deleteTask('missing', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
