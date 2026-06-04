export type LANGUAGES = "c" | "cpp" | "java" | "python" | "rust" | "js" | "ts";

export interface ICompiler<L extends LANGUAGES = LANGUAGES> {
  readonly language: L;
  path: string;
  isEnvironmentReady(): Promise<boolean>;
}

class BaseCompiler<L extends LANGUAGES> implements ICompiler<L> {
  constructor(
    public readonly language: L,
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
  c: new BaseCompiler<"c">("c", "gcc", ["--version"]),
  cpp: new BaseCompiler<"cpp">("cpp", "g++", ["--version"]),
  java: new BaseCompiler<"java">("java", "javac", ["-version"]),
  python: new BaseCompiler<"python">("python", "python3", ["--version"]),
  rust: new BaseCompiler<"rust">("rust", "rustc", ["--version"]),
  js: new BaseCompiler<"js">("js", "node", ["--version"]),
  ts: new BaseCompiler<"ts">("ts", "tsc", ["--version"]),
} satisfies { [K in LANGUAGES]: ICompiler<K> };

export default Compilers;
