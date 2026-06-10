import Compiler from "./compiler";
import Executor from "./executor";
import Writer from "./writer";

export type JudgeVerdict = "SUCCESS" | "CE" | "TLE" | "RE" | "SYSTEM_ERROR";

export interface RunnerResult {
  verdict: JudgeVerdict;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number;
}

export interface RunnerOptions {
  timeoutMs?: number;
  stdin?: string;
  maxOutputBytes?: number;
}

export class Runner {
  static async run(
    compiler: Compiler<string>,
    code: string,
    options: RunnerOptions = {},
  ): Promise<RunnerResult> {
    const language = compiler.language.toLowerCase();
    try {
      const isEnvReady = await compiler.isEnvironmentReady();
      if (!isEnvReady) {
        return {
          verdict: "SYSTEM_ERROR",
          stdout: "",
          stderr: `Compiler/Runtime environment for ${language} is not configured or accessible in system PATH.`,
          exitCode: -1,
          executionTimeMs: 0,
        };
      }

      const filepath = await Writer.writeCode(code, compiler.extension);

      const compilation = await compiler.compile(filepath);
      if (!compilation.success) {
        return {
          verdict: "CE",
          stdout: "",
          stderr: compilation.stderr,
          exitCode: -1,
          executionTimeMs: 0,
        };
      }

      let executionCommand: string[] = [];
      if (language === "python" || language === "js" || language === "ts" || language === "java") {
        executionCommand = [compiler.path, compilation.outputPath];
      } else {
        executionCommand = [compilation.outputPath];
      }

      const execution = await Executor.run(executionCommand, {
        timeoutMs: options.timeoutMs,
        stdin: options.stdin,
        maxOutputBytes: options.maxOutputBytes,
      });

      let verdict: JudgeVerdict = "SUCCESS";
      if (execution.exitCode === null) {
        verdict = "TLE";
      } else if (!execution.success) {
        verdict = "RE";
      }

      return {
        verdict,
        stdout: execution.stdout,
        stderr: execution.stderr,
        exitCode: execution.exitCode,
        executionTimeMs: execution.executionTimeMs,
      };
    } catch (error) {
      return {
        verdict: "SYSTEM_ERROR",
        stdout: "",
        stderr: `Pipeline Failure: ${(error as Error).message}`,
        exitCode: -1,
        executionTimeMs: 0,
      };
    }
  }
}

export default Runner;
