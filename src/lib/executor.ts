import { DEFAULT_TIMEOUT_MS } from "../utils/const";

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
}

export interface ExecutionOptions {
  timeoutMs?: number;
  stdin?: string;
  maxOutputBytes?: number;
}

export class Executor {
  static defaultTimeoutMs: number = DEFAULT_TIMEOUT_MS;
  static defaultMaxOutputBytes: number = 512 * 1024;

  static async run(command: string[], options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const timeout = options.timeoutMs ?? Executor.defaultTimeoutMs;
    const inputData = options.stdin ?? "";
    const maxBytes = options.maxOutputBytes ?? Executor.defaultMaxOutputBytes;

    try {
      const process = Bun.spawn(command, {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
      });
      const startTime = performance.now();

      if (inputData) {
        process.stdin.write(inputData);
      }
      process.stdin.end();

      let timeoutId: Timer | undefined;
      const timeoutPromise = new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => {
          try {
            process.kill();
          } catch {}
          resolve(null);
        }, timeout);
      });

      const stdoutPromise = Executor.consumeStreamWithLimit(process.stdout, maxBytes);
      const stderrPromise = Executor.consumeStreamWithLimit(process.stderr, maxBytes);

      const exitedPromise = process.exited;
      const raceResult = await Promise.race([exitedPromise, timeoutPromise]);

      if (timeoutId) clearTimeout(timeoutId);

      const endTime = performance.now();
      const executionTimeMs = Math.round(endTime - startTime);

      const stdout = await stdoutPromise;
      const stderr = await stderrPromise;

      if (raceResult === null) {
        return {
          success: false,
          stdout: stdout.trim(),
          stderr: stderr ? stderr.trim() : `TLE: Time Limit Exceeded (${timeout}ms)`,
          exitCode: null,
          executionTimeMs,
        };
      }

      return {
        success: raceResult === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: raceResult,
        executionTimeMs,
      };
    } catch (error) {
      return {
        success: false,
        stdout: "",
        stderr: `Runtime System Error: ${(error as Error).message}`,
        exitCode: -1,
        executionTimeMs: 0,
      };
    }
  }

  private static async consumeStreamWithLimit(
    stream: ReadableStream,
    maxBytes: number,
  ): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
    let totalBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            result += decoder.decode(value.subarray(0, maxBytes - (totalBytes - value.byteLength)));
            result += "\n[OLE: Output Limit Exceeded]";
            break;
          }
          result += decoder.decode(value);
        }
      }
    } catch {
    } finally {
      reader.releaseLock();
    }

    return result;
  }
}

export default Executor;
