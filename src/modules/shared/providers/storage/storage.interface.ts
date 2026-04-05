import { Readable } from 'stream';

export interface UploadFileParams {
  bucket: string;
  objectName: string;
  stream: Readable;
  size: number;
  contentType: string;
}

export interface StorageProviderInterface {
  upload(params: UploadFileParams): Promise<string>;
  getSignedUrl(bucket: string, objectName: string, expirySeconds: number): Promise<string>;
  delete(bucket: string, objectName: string): Promise<void>;
  ensureBucket(bucket: string): Promise<void>;
}
