# ferecord 主站

原生 HTML/CSS/JavaScript 作品墙，Three.js 增强背景，Blender 制作云团。直接部署 `public/`，包含打包后的模块、GLB 和图片；产品内容与入口可在 3D 不可用时正常展示。

## 预览

在仓库根目录运行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory sites/main/public
```

打开 <http://127.0.0.1:4173/>。默认白昼，页脚可切换蓝调和暂停漂浮。

## 修改背景

在本目录运行：

```sh
npm ci
npm run build:scene
npm run check
```

- `src/universe-scene.js`：真实 3D 道具、星轨、鼠标视差、场景联动、渲染生命周期。
- `public/home.js`：懒加载背景、主题、统一暂停、作品卡交互与星星反馈。
- `public/styles.css`：静态首页、白昼/蓝调、响应式布局、低动态样式。
- `public/assets/universe-scene.js`：esbuild 打包的浏览器模块，修改源文件后一起更新。

依赖由锁文件固定：Three.js 0.187.0、esbuild 0.28.2。无需 React、Vite 或运行时 CDN。Makers 仍只发布已有静态产物，不要求在服务器上安装 Blender。

打包产物保留 Three.js 原有 GLSL 模板字符串中的空白；`.gitattributes` 仅将该生成文件标记为不检查空白，避免改写着色器字符串。源码仍正常执行 Git 空白检查。

## 重建云团

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/create-cloud.py -- --output public/assets/soft-cloud.glb
```

脚本用体素融合生成一体云团、减面和平滑着色，再导出标准 GLB。当前在本机 Blender 5.4.0 Alpha 成功运行；制作环境与浏览器运行环境相互独立，发布使用生成好的模型。其他 Blender 版本需重新验证导出。

设计与验证记录见 [动态首页方案](../../docs/homepage-3d-2026-11-17.md)。
