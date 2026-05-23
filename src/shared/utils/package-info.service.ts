import { readFileSync } from 'fs';
import { join } from 'path';

export interface PackageInfo {
  name: string;
  version: string;
}

export function getPackageInfo(): PackageInfo {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
    };
  } catch (error) {
    console.warn('Could not read package.json, using defaults', error);
    return {
      name: 'unknown',
      version: '0.0.0',
    };
  }
}
