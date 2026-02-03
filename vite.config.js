import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

// ==============================
// 🔧 基础路径常量
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_DIR = resolve(__dirname, "src/js");
const OUT_DIR = resolve(__dirname, "templates/assets/js");
const LIB_DIR = resolve(SRC_DIR, "lib");

// ==============================
// 🧩 插件封装
// ==============================

// 开发模式下自动复制 main.js 与 lib 文件
function haloDevAutoCopyPlugin(outDir) {
  return {
    name: "halo-dev-auto-copy",
    handleHotUpdate({ file }) {
      const normalized = file.replace(/\\/g, "/");
      if (!normalized.includes("/src/js/")) return;

      const relative = normalized.split("/src/js/")[1];
      const target = resolve(outDir, relative);

      fs.mkdirSync(resolve(target, ".."), { recursive: true });
      fs.copyFileSync(file, target);
      console.log(`📁 [dev-copy] ${relative} -> ${target}`);
    },
  };
}

// 构建完成输出日志
function haloBuildLogPlugin(outDir) {
  return {
    name: "halo-build-log",
    closeBundle() {
      console.log("\n✅ Halo JS 构建完成！");
      console.log(`📦 输出目录：${outDir}\n`);
    },
  };
}

// ==============================
// 🚀 主配置
// ==============================
export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  
  // 修复 Windows 路径问题，确保 glob 模式使用正斜杠
  const libDirNormalized = LIB_DIR.replace(/\\/g, "/");
  
  // 只有当 lib 目录存在且不为空时才添加复制任务
  let copyTargets = [];
  if (fs.existsSync(LIB_DIR)) {
      const files = fs.readdirSync(LIB_DIR);
      if (files.length > 0) {
          copyTargets = [{ 
              src: libDirNormalized + "/*", 
              dest: "." 
          }];
      }
  }

  return {
    publicDir: false,
    server: {
      watch: {
        ignored: ["!**/src/js/**"],
      },
    },
    build: {
      outDir: OUT_DIR,
      emptyOutDir: false,
      minify: isBuild ? "terser" : false, // 构建模式使用 terser
      terserOptions: {
        compress: false, // 不压缩
        mangle: false, // 不混淆变量名
        format: {
          comments: false, // 删除注释
          beautify: false, // 输出一行
        },
      },
      rollupOptions: {
        treeshake: false,
        input: resolve(SRC_DIR, "main.js"),
        output: {
          entryFileNames: "main.js",
          assetFileNames: "[name].[ext]",
        },
      },
    },
    plugins: [
        // 仅当有复制目标时才启用插件
        copyTargets.length > 0 ? viteStaticCopy({ targets: copyTargets }) : null, 
        !isBuild && haloDevAutoCopyPlugin(OUT_DIR), 
        haloBuildLogPlugin(OUT_DIR)
    ].filter(Boolean),
  };
});
