import Writer from "./lib/writer";

const fn = await Writer.writeCode("console.log('Hello, World!');", "js");
console.log({ fn });
