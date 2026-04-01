import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  const jwtService = {
    verifyAsync: jest.fn(),
  };

  const createContext = (headers?: Record<string, string>) => {
    const request: any = { headers: headers ?? {} };
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };

    return { context, request };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new AuthGuard(jwtService as any)).toBeDefined();
  });

  it('should throw UnauthorizedException when token is missing', async () => {
    const guard = new AuthGuard(jwtService as any);
    const { context } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should attach payload to request.user when token is valid', async () => {
    const guard = new AuthGuard(jwtService as any);
    const payload = { sub: 'user-1', username: 'john' };
    jwtService.verifyAsync.mockResolvedValue(payload);
    const { context, request } = createContext({
      authorization: 'Bearer token-123',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token-123');
    expect(request.user).toEqual(payload);
  });

  it('should throw UnauthorizedException when token verification fails', async () => {
    const guard = new AuthGuard(jwtService as any);
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    const { context } = createContext({
      authorization: 'Bearer bad-token',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
