import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly dir = path.join(process.cwd(), 'uploads', 'attachments');

  onModuleInit() {
    fs.mkdirSync(this.dir, { recursive: true });
  }

  // S3 migration: replace with s3.putObject(key, buffer)
  async save(buffer: Buffer, originalName: string): Promise<string> {
    const ext = path.extname(originalName);
    const storedName = `${crypto.randomUUID()}${ext}`;
    await fs.promises.writeFile(path.join(this.dir, storedName), buffer);
    return storedName;
  }

  // S3 migration: replace with s3.deleteObject(storedName)
  async remove(storedName: string): Promise<void> {
    await fs.promises.unlink(path.join(this.dir, storedName)).catch(() => {});
  }

  // S3 migration: replace with s3.getObject(storedName).createReadStream()
  createReadStream(storedName: string) {
    return fs.createReadStream(path.join(this.dir, storedName));
  }
}
