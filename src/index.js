#!/usr/bin/env node

import cac from "cac";
import { promises as fs } from 'fs';
import path from 'path';

// 设置文件路径
const filePath = path.join(process.cwd(), 'temp.txt');


const cli = cac('ovs-lsp');

// 定义一个处理默认情况下的命令，防止未匹配的文件名问题
cli
    .command('*', 'Catch-all command to handle unmatched commands')
    .action((command) => {
        console.log(`Unrecognized command: ${command}`);
        cli.help(); // 显示帮助信息
    });

cli
    .command('echo <message>', 'Output the message provided')
    .action(async (message) => {
        try {
            // 检查文件是否存在
            await fs.access(filePath).then(() => {
                // 存在则删除
                return fs.unlink(filePath);
            }).catch(() => {
                // 文件不存在，无需删除
                console.log('文件不存在，无需删除');
            });

            // 创建并写入内容
            const content = '这是写入 temp.txt 的内容';
            await fs.writeFile(filePath, message, 'utf8');
            console.log('已创建并写入内容到 temp.txt');

        } catch (error) {
            console.error('处理文件时出错:', error);
        }
    });

cli.help();
cli.parse();
