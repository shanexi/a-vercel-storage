import { put } from '@vercel/blob';

// 禁用 body parser 以接收原始二进制数据
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 从查询参数获取文件名
    const filename = req.query.filename;

    if (!filename) {
      return res.status(400).json({ error: 'Missing filename parameter' });
    }

    // 获取 Content-Type，如果没有则尝试从文件名推断
    const contentType = req.headers['content-type'] || 'application/octet-stream';

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
