const { spawn } = require('child_process');
const readline = require('readline');

// 创建子进程
const fooProcess = spawn('npx', ['ovs-lsp'], {
    stdio: 'pipe',
    shell: true
});

// 创建命令行接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 错误处理
fooProcess.on('error', (err) => {
    console.error('Failed to start subprocess:', err);
});

// 监听子进程输出
fooProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
});

fooProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

fooProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    rl.close();
});

// 处理用户输入
rl.on('line', (input) => {
    // 发送输入到子进程
    fooProcess.stdin.write(input + '\n');
});

// 处理程序退出
process.on('exit', () => {
    fooProcess.kill();
    rl.close();
});

// 处理 Ctrl+C
process.on('SIGINT', () => {
    fooProcess.kill();
    rl.close();
    process.exit();
});