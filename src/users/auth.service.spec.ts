import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers: User[] = users.filter(
          (user) => user.email === email,
        );
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');
    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signup with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf')
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unuses email', async () => {
    await expect(
      service.signin('asdfasghfd@ahs.com', 'asdasf'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdf')
    await expect(service.signin('asdf@asdf.com', 'wrongpass')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'ajgdjha');

    const user = await service.signin('asdf@asdf.com', 'ajgdjha');
    expect(user).toBeDefined();
  });
});
