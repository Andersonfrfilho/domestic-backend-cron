import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { pushToTraceStack, runWithContext } from '@adatechnology/logger';
import { getPackageInfo } from '../utils/package-info.service';

@Injectable()
export class PackageContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { name, version } = getPackageInfo();
    const projectLabel = `${name}:${version}`;
    
    pushToTraceStack(projectLabel);
    
    res.on('finish', () => {
      // Stack será limpo automaticamente ao final da requisição
    });

    next();
  }
}
