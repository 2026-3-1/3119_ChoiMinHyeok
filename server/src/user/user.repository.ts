import { Injectable } from '@nestjs/common';
import prisma from '../../prisma/prisma.client';
import { Roles } from '../../prisma/generated/prisma/enums';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roles: Roles;
  description?: string;
};

@Injectable()
export class UserRepository {
  async createUser(data: CreateUserInput) {
    return prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        roles: data.roles,
        description: data.description ?? '',
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserById(id: number) {
    return prisma.users.findUnique({
      where: {
        id,
      },
    });
  }

  async getUsers() {
    return prisma.users.findMany({
      orderBy: {
        created_at: 'asc',
      },
    });
  }
}
