import fs from "fs";

function getLocalTsdkPath() {
  let tsdkPath = "C:\\Users\\qinkaiyuan\\AppData\\Roaming\\npm\\node_modules\\typescript\\lib";
  return tsdkPath.replace(/\\/g, '/');
}

async function resolveWorkspaceTsdk(tsdk) {
  try {
    // 使用 fs.promises.stat 代替 fs.stat
    const stat = await fs.promises.stat(tsdk + '/typescript.js');
    console.log(stat);
    console.log(stat);
    console.log(stat.isFile());
  } catch (error) {
    console.error("Error:", error);
  }
}
// ts的地址  node_modules/typescript/lib'
// initializationOptions: {
//   typescript: {
//     tsdk: (await getTsdk(context))!.tsdk,
//   },
// },
resolveWorkspaceTsdk(getLocalTsdkPath());

/*
tsdk ? {
  tsdk: tsdk.path,
  version: tsdk.version,
  isWorkspacePath: false,
} : undefined;*/
