import { Injectable } from '@nestjs/common';
import prisma from '../../prisma/prisma.client';

@Injectable()
export class WebhookRepository {
  async findActiveEndpoints(event: string) {
    return prisma.webhook_endpoints.findMany({
      where: { event, is_active: true },
    });
  }

  async create(data: { url: string; event: string; secret: string }) {
    return prisma.webhook_endpoints.create({ data });
  }

  async delete(id: number) {
    return prisma.webhook_endpoints.delete({ where: { id } });
  }

  async findAll() {
    return prisma.webhook_endpoints.findMany();
  }
}
