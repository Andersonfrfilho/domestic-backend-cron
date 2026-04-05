import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'stream';

import { StorageProviderInterface, UploadFileParams } from './storage.interface';

@Injectable()
export class MinioStorageProvider implements StorageProviderInterface, OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      endPoint: configService.get('STORAGE_MINIO_ENDPOINT', 'localhost'),
      port: configService.get<number>('STORAGE_MINIO_PORT', 9000),
      useSSL: configService.get<boolean>('STORAGE_MINIO_USE_SSL', false),
      accessKey: configService.get('STORAGE_MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: configService.get('STORAGE_MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    const bucket = this.configService.get('STORAGE_MINIO_BUCKET', 'documents');
    await this.ensureBucket(bucket);
  }

  async upload(params: UploadFileParams): Promise<string> {
    await this.client.putObject(
      params.bucket,
      params.objectName,
      params.stream,
      params.size,
      { 'Content-Type': params.contentType },
    );
    return params.objectName;
  }

  async getSignedUrl(bucket: string, objectName: string, expirySeconds: number): Promise<string> {
    return this.client.presignedGetObject(bucket, objectName, expirySeconds);
  }

  async delete(bucket: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucket, objectName);
  }

  async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, 'us-east-1');
    }
  }
}
