import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('src/users/users.service', () => ({
  UsersService: class UsersService { },
}), { virtual: true });
jest.mock('src/users/user.entity', () => ({ User: class User { } }), {
  virtual: true,
});
jest.mock(
  'src/users/dto/auth-credentials.dto',
  () => ({ AuthCredentialsDto: class AuthCredentialsDto { } }),
  { virtual: true },
);
jest.mock(
  'src/users/dto/auth-register.dto',
  () => ({ AuthRegisterDto: class AuthRegisterDto { } }),
  { virtual: true },
);

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    signUp: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('signUp should call authService.signUp with dto fields', async () => {
    const dto = {
      username: 'john',
      password: 'Passw0rd!',
      email: 'john@example.com',
    };
    const expected = { id: '1', ...dto };
    authService.signUp.mockResolvedValue(expected);

    await expect(controller.signUp(dto)).resolves.toEqual(expected);
    expect(authService.signUp).toHaveBeenCalledWith(
      dto.username,
      dto.password,
      dto.email,
    );
  });

  it('signIn should call authService.login with req.user', async () => {
    const req = { user: { id: '1', username: 'john' } };
    const expected = { access_token: 'token' };
    authService.login.mockResolvedValue(expected);

    await expect(controller.signIn(req)).resolves.toEqual(expected);
    expect(authService.login).toHaveBeenCalledWith(req.user);
  });

  it('logout should call req.logout and return its result', () => {
    const req = { logout: jest.fn().mockReturnValue('logged-out') };

    expect(controller.logout(req)).toBe('logged-out');
    expect(req.logout).toHaveBeenCalledTimes(1);
  });
});
