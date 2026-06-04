export type LANGUAGES = "c" | "cpp" | "java" | "python" | "rust" | "js" | "ts";

export interface ICompiler {
  readonly language: LANGUAGES;
  path: string;
  isEnvironmentReady(): Promise<boolean>;
}

class BaseCompiler implements ICompiler {
  constructor(
    public readonly language: LANGUAGES,
    public path: string,
    private readonly checkArgs: string[] = ["--version"],
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
}

export const Compilers = {
  c: new BaseCompiler("c", "gcc", ["--version"]),
  cpp: new BaseCompiler("cpp", "g++", ["--version"]),
  java: new BaseCompiler("java", "javac", ["-version"]),
  python: new BaseCompiler("python", "python3", ["--version"]),
  rust: new BaseCompiler("rust", "rustc", ["--version"]),
  js: new BaseCompiler("js", "node", ["--version"]),
  ts: new BaseCompiler("ts", "tsc", ["--version"]),
} satisfies Record<LANGUAGES, ICompiler>;

export default Compilers;
