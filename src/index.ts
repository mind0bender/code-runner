import Compilers, { type LANGUAGES } from "./utils/compiler";

for (const key of Object.keys(Compilers) as LANGUAGES[]) {
  const isReady = await Compilers[key].isEnvironmentReady();
  console.log(`${key}: ${isReady}`);
}
