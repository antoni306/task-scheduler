import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('src/users/user.entity', () => ({ User: class User { } }), {
  virtual: true,
});

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUser should return user when found', async () => {
    const user: any = { id: 'u1', username: 'john' };
    repository.findOneBy.mockResolvedValue(user);

    await expect(service.getUser('u1')).resolves.toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'u1' });
  });

  it('getUser should throw NotFoundException when user does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.getUser('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getUserByUsername should return user when found', async () => {
    const user: any = { id: 'u1', username: 'john' };
    repository.findOneBy.mockResolvedValue(user);

    await expect(service.getUserByUsername('john')).resolves.toEqual(user);
    expect(repository.findOneBy).toHaveBeenCalledWith({ username: 'john' });
  });

  it('getUserByUsername should throw NotFoundException when missing', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.getUserByUsername('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checkPassword should delegate to bcrypt.compare', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(service.checkPassword('Passw0rd!', 'hashed')).resolves.toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('Passw0rd!', 'hashed');
  });

  it('createUser should hash password and save user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
    const saved: any = { id: 'u1', username: 'john', email: 'john@example.com' };
    repository.save.mockResolvedValue(saved);

    await expect(
      service.createUser('john', 'Passw0rd!', 'john@example.com'),
    ).resolves.toEqual(saved);
    expect(bcrypt.hash).toHaveBeenCalledWith('Passw0rd!', 10);
    expect(repository.save).toHaveBeenCalledWith({
      username: 'john',
      password: 'hashed-pass',
      email: 'john@example.com',
    });
  });
});
