# Vercel Blob 文件上传 API

这是一个极简的 Vercel Serverless Function，用于将文件上传到 Vercel Blob Storage。适合在 n8n 等自动化工具中使用。

## 项目结构

```
.
├── api/
│   └── upload.js          # 上传 API endpoint
├── package.json           # 依赖配置
├── .env.example          # 环境变量示例
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

在 Vercel Dashboard 创建 Blob Storage 后，将生成的 token 填入 `.env`：

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

### 3. 本地测试

```bash
npm run dev
```

服务会运行在 `http://localhost:3000`

### 4. 部署到 Vercel

```bash
vercel
```

或者通过 Vercel Dashboard 连接 GitHub 仓库自动部署。

## API 使用说明

### 端点

```
POST https://your-app.vercel.app/api/upload?filename=myfile.pdf
```

### 请求参数

- **Query 参数**：
  - `filename` (可选): 文件名，例如 `documents/report.pdf`
    - 如果不提供，会自动生成文件名：`upload-{timestamp}{ext}`
    - 扩展名根据 Content-Type 自动添加

- **Headers**：
  - `Content-Type`: 文件的 MIME 类型（如 `image/jpeg`, `application/pdf`）

- **Body**：二进制文件内容

### 响应示例

成功（200）：
```json
{
  "success": true,
  "url": "https://xxx.public.blob.vercel-storage.com/documents/report-abc123.pdf",
  "downloadUrl": "https://xxx.public.blob.vercel-storage.com/documents/report-abc123.pdf?download=1",
  "pathname": "documents/report-abc123.pdf",
  "contentType": "application/pdf"
}
```

失败（400/500）：
```json
{
  "error": "Upload failed",
  "message": "错误详情"
}
```

## 在 n8n 中使用

### HTTP Request Node 配置

1. **Method**: `POST`
2. **URL**:
   - 带文件名: `https://your-app.vercel.app/api/upload?filename=myfile.pdf`
   - 自动生成: `https://your-app.vercel.app/api/upload`
3. **Headers**: 添加 `Content-Type` (如 `image/jpeg`)
4. **Body Content Type**: `Binary`
5. **Binary Property**: `data` (或你的文件数据字段名)

### 示例工作流

```
[触发器] → [HTTP Request Node]
              ↓
        上传文件到 Vercel Blob
              ↓
        返回文件 URL
```

### n8n 表达式示例

动态文件名：
```
https://your-app.vercel.app/api/upload?filename={{ $json.filename }}
```

自动生成文件名（更简单）：
```
https://your-app.vercel.app/api/upload
```

## 功能特性

- ✅ 支持最大 5MB 文件上传
- ✅ **文件名可选**：不提供自动生成，提供则使用自定义名称
- ✅ 自动添加随机后缀防止文件名冲突
- ✅ 根据 Content-Type 自动检测文件扩展名
- ✅ 正确的 Content-Type 存储（图片在浏览器中直接显示）
- ✅ **CORS 支持**：可从任何来源跨域调用
- ✅ 返回公开访问 URL 和下载 URL
- ✅ 极简代码，易于维护

## 测试上传

### 方式 1：自动生成文件名

```bash
# 上传文本
curl -X POST \
  "https://your-app.vercel.app/api/upload" \
  -H "Content-Type: text/plain" \
  --data-binary "Hello World"

# 上传图片
curl -X POST \
  "https://your-app.vercel.app/api/upload" \
  -H "Content-Type: image/jpeg" \
  --data-binary @./local-image.jpg
```

### 方式 2：自定义文件名

```bash
# 上传文本
curl -X POST \
  "https://your-app.vercel.app/api/upload?filename=test.txt" \
  -H "Content-Type: text/plain" \
  --data-binary "Hello World"

# 上传图片
curl -X POST \
  "https://your-app.vercel.app/api/upload?filename=my-photo.jpg" \
  -H "Content-Type: image/jpeg" \
  --data-binary @./local-image.jpg
```

## 注意事项

1. **文件大小限制**：Vercel Serverless Function 请求体最大 4.5MB，超过需要使用 Edge Function（最大 ~50MB）
2. **Token 安全**：永远不要在客户端暴露 `BLOB_READ_WRITE_TOKEN`
3. **文件命名**：建议使用路径格式组织文件，如 `uploads/2024/file.pdf`

## 扩展功能

如需添加认证、文件类型验证等功能，可以修改 `api/upload.js`：

```javascript
// 示例：添加简单的 API Key 验证
const apiKey = req.headers['x-api-key'];
if (apiKey !== process.env.API_KEY) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// 示例：限制文件类型
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(req.headers['content-type'])) {
  return res.status(400).json({ error: 'File type not allowed' });
}
```

## 许可证

MIT
