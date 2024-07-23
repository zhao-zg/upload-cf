addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 处理上传请求
  if (url.pathname == '/upload') {
    return new Response('File uploaded successfully', { status: 200 });
   // return handleUpload(request);
  }

  // 处理文件下载请求
  if (url.pathname.startsWith('/download/')) {
    return handleDownload(request);
  }
  // 处理静态文件请求
  if (url.pathname.startsWith('/')) {
    return event.respondWith(fetch(request));
  }
  // 处理其他请求
  return new Response('Invalid request', { status: 400 });
});
const handleUpload = async (request) => {
  const formData = await request.formData();
  const file = formData.get('file');

  // 检查文件是否上传
  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  // 获取 R2 存储桶信息
  const bucketName = 'sg-apk'; // 替换为你的 R2 存储桶名称
  const bucket = R2.getBucket(bucketName);

  // 生成文件名
  const fileName = file.name;

  // 上传文件到 R2
  try {
    // 上传文件到 R2
    await bucket.put(fileName, file, {
      contentType: file.type
    });

    return new Response('File uploaded successfully', { status: 200 });
  } catch (error) {
    if (error instanceof R2.NetworkError) {
      return new Response('Upload failed! Network error.', { status: 500 });
    } else {
      return new Response('Upload failed! Server error.', { status: 500 });
    }
  }
}

const handleDownload = async (request) => {
  const url = new URL(request.url);
  const fileName = url.pathname.slice('/download/'.length);

  // 获取 R2 存储桶信息
  const bucketName = 'sg-apk'; // 替换为你的 R2 存储桶名称
  const bucket = R2.getBucket(bucketName);

  // 从 R2 下载文件
  const object = await bucket.get(fileName);
  const body = object.body;

  // 返回下载响应
  return new Response(body, {
    headers: {
      'Content-Type': object.contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`
    }
  });
}
