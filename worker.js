addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 检查请求方法
  if (request.method === 'POST') {
    // 处理文件上传
    handleFileUpload(request).then(response => {
      event.respondWith(response);
    }).catch(error => {
      event.respondWith(new Response(JSON.stringify({ error: error.message }), {
        status: 500
      }));
    });
  } else {
    // 处理前端请求
    event.respondWith(new Response(generateHTML(), {
      headers: {
        'Content-Type': 'text/html'
      }
    }));
  }
});

async function handleFileUpload(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  // 检查文件类型
  if (!file || !file.type) {
    return new Response('Invalid file', { status: 400 });
  }

  // 获取 R2 存储桶名称和密钥
  const bucketName = 'sg-apk'; // 替换为您的 R2 存储桶名称

  // 创建 R2 对象
  const r2 = new R2({
    bucket: bucketName
  });

  // 上传文件到 R2
  const response = await r2.put(file.name, file, {
    contentType: file.type
  });

  // 返回响应
  return new Response(JSON.stringify({ message: 'File uploaded successfully' }), {
    status: 200
  });
}

// 生成前端 HTML
function generateHTML() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>R2 Upload</title>
    </head>
    <body>
      <h1>Upload File</h1>
      <form method="POST" enctype="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </form>
    </body>
    </html>
  `;
}
