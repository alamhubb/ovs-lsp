#!/usr/bin/env node

const { stdin, stdout } = require('process');
const fs = require('fs');
const path = require('path');

// 定义文件路径
const filePath = path.join(__dirname, 'temp666.txt');

// 启动时清空文件
try {
    fs.writeFileSync(filePath, '执行了', 'utf8');
    console.log('文件已清空');
} catch (err) {
    console.error('清空文件时出错:', err);
}

// 监听标准输入
stdin.on('data', (data) => {
    const request = data.toString().trim();
    console.log(`接收到请求: ${request}`);

    // 将请求写入文件
    try {
        // 追加模式写入文件
        fs.appendFileSync(filePath, `${request}\n`, 'utf8');
        console.log('内容已写入文件');
    } catch (err) {
        console.error('写入文件时出错:', err);
    }

    // 处理请求并生成响应
    const response = handleRequest(request);
    stdout.write(`${response}\n`);
});

function handleRequest(request) {
    if (request === 'hello') {
        return 'Hello from foo!';
    } else {
        return `处理完毕: ${request}`;
    }
}

// 错误处理
stdin.on('error', (err) => {
    console.error(`标准输入错误: ${err.message}`);
});

// 进程退出时的清理工作
process.on('exit', () => {
    console.log('程序退出');
});

// 处理意外错误
process.on('uncaughtException', (err) => {
    console.error('未捕获的错误:', err);
});