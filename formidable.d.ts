// formidable.d.ts
declare module 'formidable' {
  import * as http from 'http';

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
    [key: string]: any;
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface IncomingFormOptions {
    uploadDir?: string;
    keepExtensions?: boolean;
    multiples?: boolean;
    maxFileSize?: number;
    maxFieldsSize?: number;
    maxFields?: number;
    hash?: boolean | 'md5' | 'sha1';
    filter?(part: any): boolean;
  }

  export class IncomingForm {
    constructor(options?: IncomingFormOptions);
    parse(
      req: http.IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  }
}
