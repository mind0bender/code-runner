import { Compilers, type LANGUAGES } from "./compiler";

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
}

export interface ExecutionOptions {
  timeoutMs?: number;
  args?: string[];
}

export class Executor {
  static defaultTimeoutMs: number = 5000;

  static async run(
    language: LANGUAGES,
    filepath: string,
    options: ExecutionOptions = {},
  ): Promise<ExecutionResult> {
    const compiler = Compilers[language];
    if (!compiler) {
      throw new Error(`Unsupported language executor requested: ${language}`);
    }

    const timeout = options.timeoutMs ?? Executor.defaultTimeoutMs;
    const runArgs = options.args ?? [];

    const command = [compiler.path, filepath, ...runArgs];
    const startTime = performance.now();

    try {
      const process = Bun.spawn(command, {
        stdout: "pipe",
        stderr: "pipe",
      });

      const timeoutPromise = new Promise<null>(
        (resolve: (value: null) => void): NodeJS.Timeout =>
          setTimeout((): void => {
            try {
              process.kill();
            } catch {}
            resolve(null);
          }, timeout),
      );

      const exitedPromise = process.exited;
      const raceResult = await Promise.race([exitedPromise, timeoutPromise]);
      const endTime = performance.now();
      const executionTimeMs = Math.round(endTime - startTime);

      if (raceResult === null) {
        return {
          success: false,
          stdout: "",
          stderr: `TLE: Time Limit Exceeded (${timeout}ms)`,
          exitCode: null,
          executionTimeMs,
        };
      }

      const stdout = await new Response(process.stdout).text();
      const stderr = await new Response(process.stderr).text();

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
}

export default Executor;
