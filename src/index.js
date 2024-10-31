#!/usr/bin/env node

import cac from "cac";

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
    .action((message) => {
        console.log(`Output: ${message}`);
    });

cli.help();
cli.parse();
