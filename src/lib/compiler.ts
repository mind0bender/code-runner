export type LANGUAGES = "c" | "cpp" | "java" | "python" | "rust" | "js" | "ts";

export interface ICompiler<L extends string> {
  readonly language: L;
  readonly extension: string;
  path: string;
  isEnvironmentReady(): Promise<boolean>;
  compile(filepath: string): Promise<{ success: boolean; outputPath: string; stderr: string }>;
}

export class Compiler<L extends string> implements ICompiler<L> {
  constructor(
    public readonly language: L,
    public readonly extension: string,
    public path: string,
    private readonly checkArgs: string[] = ["--version"],
    private readonly isDirectExecution: boolean = false, // Flags languages that don't need a build step
  ) {}

  async isEnvironmentReady(): Promise<boolean> {
    try {
      const process = Bun.spawn([this.path, ...this.checkArgs]);
      const exitCode = await process.exited;
      return exitCode === 0;
    } catch (e) {
      return false;
    }
  }

  async compile(
    filepath: string,
  ): Promise<{ success: boolean; outputPath: string; stderr: string }> {
    try {
      if (this.isDirectExecution) {
        return { success: true, outputPath: filepath, stderr: "" };
      }

      const outputPath = filepath.replace(new RegExp(`\\.${this.extension}$`), "");
      const command = [this.path, filepath, "-o", outputPath];

      const process = Bun.spawn(command, { stderr: "pipe" });
      const exitCode = await process.exited;

      if (exitCode !== 0) {
        const stderr = await new Response(process.stderr).text();
        return { success: false, outputPath: "", stderr: stderr.trim() };
      }

      return { success: true, outputPath, stderr: "" };
    } catch (error) {
      return {
        success: false,
        outputPath: "",
        stderr: `Compilation error: ${(error as Error).message}`,
      };
    }
  }
}

export const compilers = {
  c: new Compiler<"c">("c", "c", "gcc", ["--version"]),
  cpp: new Compiler<"cpp">("cpp", "cpp", "g++", ["--version"]),
  java: new Compiler<"java">("java", "java", "java", ["-version"], true), // Changed path to "java" and set direct execution to true
  python: new Compiler<"python">("python", "py", "python3", ["--version"], true),
  rust: new Compiler<"rust">("rust", "rs", "rustc", ["--version"]),
  js: new Compiler<"js">("js", "js", "node", ["--version"], true),
  ts: new Compiler<"ts">("ts", "ts", "bun", ["--version"], true),
} satisfies { [K in LANGUAGES]: ICompiler<K> };

export default Compiler;
