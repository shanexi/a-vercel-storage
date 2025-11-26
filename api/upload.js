import { put } from '@vercel/blob';

// 禁用 body parser 以接收原始二进制数据
export const config = {
  api: {
    bodyParser: false,
  },
};

// 根据 MIME 类型获取文件扩展名
function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/json': '.json',
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/zip': '.zip',
    'video/mp4': '.mp4',
    'audio/mpeg': '.mp3',
  };

  return mimeMap[mimeType.toLowerCase()] || '';
}

export default async function handler(req, res) {
  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取 Content-Type
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    // 从查询参数获取文件名，如果没有则自动生成
    let filename = req.query.filename;

    if (!filename) {
      // 自动生成文件名：时间戳 + 扩展名
      const timestamp = Date.now();
      const ext = getExtensionFromMimeType(contentType);
      filename = `upload-${timestamp}${ext}`;
    }

    // 直接使用 req 作为流传给 put 方法
    // Vercel Blob 的 put 方法支持 Request 对象
    const blob = await put(filename, req, {
      access: 'public',
      addRandomSuffix: true, // 添加随机后缀防止文件名冲突
      contentType: contentType, // 指定文件的 MIME 类型
    });

    // 返回上传结果
    return res.status(200).json({
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}
