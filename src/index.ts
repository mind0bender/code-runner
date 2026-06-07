import Writer from "./lib/writer";
import Compiler, { compilers } from "./lib/compiler";
import Executor from "./lib/executor";
import Runner from "./lib/runner";

export { Writer, Compiler, Executor, Runner, compilers };

// const code = `
// console.log({username: "m0b"});
// `;
// const result = await Runner.runSubmission(compilers["ts"], code, {
//   timeoutMs: 5000,
// });
// console.log("Runner result:", result);

// const result = await Runner.runSubmission("js", code, {
//   timeoutMs: 2000,
// });
// console.log("Runner result:", result);

//   "cpp",
// );
// console.log("Source code written to:", source);
//
// console.log("Checking compiler environments...");
// const ready: boolean = await compilers.cpp.isEnvironmentReady();
// if (!ready) {
//   throw new Error(
//     "C++ compiler environment is not ready. Please ensure g++ is installed and accessible in the PATH.",
//   );
// }
// console.log("C++ compiler environment is ready. Proceeding with compilation...");
// const out = await compilers.cpp.compile(source);
//
// console.log("Compilation output:", out);
//
// console.log("Executing source code...");
// const input: string = `5
// 1 1
// 3 1
// 7 0
// 5 9
// 51 49`;
// import { compilers } from "./lib/compiler";
// import Executor from "./lib/executor";
// import Writer from "./lib/writer";
//
// console.log("Initializing code writer...");
// const source = await Writer.writeCode(
//
//
// const result = await Executor.run([out.outputPath], {
//   timeoutMs: 5000,
//   stdin: input,
// });
// console.log("Execution result:", result);
//
// function getObjectSizeInBytes(obj: any): number {
//   const seen = new WeakSet();
//
//   function sizeOf(value: any): number {
//     if (value === null || value === undefined) return 0;
//
//     switch (typeof value) {
//       case "string":
//         return value.length * 2;
//       case "number":
//         return 8;
//       case "boolean":
//         return 4;
//       case "object":
//         // Handle circular references to prevent infinite loops
//         if (seen.has(value)) return 0;
//         seen.add(value);
//
//         let bytes = 0;
//         for (const key in value) {
//           if (Object.prototype.hasOwnProperty.call(value, key)) {
//             bytes += key.length * 2; // Key size
//             bytes += sizeOf(value[key]); // Value size
//           }
//         }
//         return bytes;
//       default:
//         return 0;
//     }
//   }
//
//   return sizeOf(obj);
// }
//
// console.log(`${getObjectSizeInBytes(result)} bytes`); // Output: ~22 bytes
