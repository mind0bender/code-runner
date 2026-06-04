import { DEFAULT_DIR } from "../utils/const";

export interface IWriter {
  writeCode(content: string, extension: string, directory?: string): Promise<string>;
}

export class Writer {
  static defaultDirectory: string = DEFAULT_DIR;

  static async writeCode(
    content: string,
    extension: string,
    directory: string = Writer.defaultDirectory,
  ): Promise<string> {
    try {
      const sanitizedExtension = extension.startsWith(".") ? extension : `.${extension}`;
      const randomName = crypto.randomUUID();
      const filename = `${directory}/${randomName}${sanitizedExtension}`;

      const bytesWritten = await Bun.write(filename, content);
      const expectedBytes = Buffer.byteLength(content, "utf-8");

      if (bytesWritten !== expectedBytes) {
        throw new Error(`Write mismatch: wrote ${bytesWritten} of ${expectedBytes} bytes`);
      }

      return filename;
    } catch (error) {
      throw new Error(`Failed to write code file: ${(error as Error).message}`);
    }
  }
}

export default Writer;
