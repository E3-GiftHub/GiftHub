// formidable.d.ts
declare module 'formidable' {
  import type * as http from 'http';

  export type Fields = Record<string, string | string[]>;

  export interface File {
    filepath: string;
    originalFilename?: string;
    mimetype?: string;
    size?: number;
    [key: string]: never;
  }

  export type Files = Record<string, File | File[]>;

  export interface IncomingFormOptions {
    uploadDir?: string;
    keepExtensions?: boolean;
    multiples?: boolean;
    maxFileSize?: number;
    maxFieldsSize?: number;
    maxFields?: number;
    hash?: boolean | 'md5' | 'sha1';
    filter?(part: never): boolean;
  }

  export class IncomingForm {
    constructor(options?: IncomingFormOptions);
    parse(
      req: http.IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  }
}
