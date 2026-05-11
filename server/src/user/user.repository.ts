import { Injectable } from '@nestjs/common';
import { Roles } from '../../prisma/generated/prisma/enums';
import prisma from '../../prisma/prisma.client';

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Roles;
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
        role: data.role,
        description: data.description ?? '',
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
  }

  async findUserById(id: number) {
    return prisma.users.findUnique({ where: { id } });
  }

  async getUsers() {
    return prisma.users.findMany({ orderBy: { created_at: 'asc' } });
  }

  async updateUser(id: number, data: { name?: string; description?: string }) {
    return prisma.users.update({ where: { id }, data });
  }
}
