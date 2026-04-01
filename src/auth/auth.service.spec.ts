import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('src/users/users.service', () => ({
  UsersService: class UsersService { },
}), { virtual: true });
jest.mock('src/users/user.entity', () => ({ User: class User { } }), {
  virtual: true,
});

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    getUserByUsername: jest.fn(),
    checkPassword: jest.fn(),
    createUser: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login should sign payload and return access token', async () => {
    const user: any = { id: 'user-1', username: 'john' };
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(service.login(user)).resolves.toEqual({
      access_token: 'jwt-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      username: 'john',
    });
  });

  it('validateUser should return user when password is correct', async () => {
    const user: any = { id: 'u1', username: 'john', password: 'hashed' };
    usersService.getUserByUsername.mockResolvedValue(user);
    usersService.checkPassword.mockResolvedValue(true);

    await expect(service.validateUser('john', 'Passw0rd!')).resolves.toEqual(user);
    expect(usersService.getUserByUsername).toHaveBeenCalledWith('john');
    expect(usersService.checkPassword).toHaveBeenCalledWith('Passw0rd!', 'hashed');
  });

  it('validateUser should throw UnauthorizedException when password is wrong', async () => {
    const user: any = { id: 'u1', username: 'john', password: 'hashed' };
    usersService.getUserByUsername.mockResolvedValue(user);
    usersService.checkPassword.mockResolvedValue(false);

    await expect(service.validateUser('john', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('signUp should delegate to usersService.createUser', async () => {
    const created: any = { id: 'u1', username: 'john', email: 'john@example.com' };
    usersService.createUser.mockResolvedValue(created);

    await expect(
      service.signUp('john', 'Passw0rd!', 'john@example.com'),
    ).resolves.toEqual(created);
    expect(usersService.createUser).toHaveBeenCalledWith(
      'john',
      'Passw0rd!',
      'john@example.com',
    );
  });
});
