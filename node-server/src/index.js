#!/usr/bin/env node

// foo.js
const { stdin, stdout } = require('process');

// 监听标准输入
stdin.on('data', (data) => {
    const request = data.toString().trim(); // 转换为字符串并去掉首尾空白
    console.log(`接收到请求: ${request}`); // 打印接收到的请求

    // 处理请求并生成响应
    const response = handleRequest(request);

    // 将响应发送到标准输出
    stdout.write(`${response}\n`);
});

// 模拟请求处理函数
function handleRequest(request) {
    // 根据请求内容生成响应
    if (request === 'hello') {
        return 'Hello from foo!';
    } else {
        return `处理完毕: ${request}`;
    }
}

// 处理错误
stdin.on('error', (err) => {
    console.error(`标准输入错误: ${err.message}`);
});
