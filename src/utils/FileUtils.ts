import * as fs from 'fs'
import * as path from 'path'
import {fileURLToPath} from "url";

export class FileUtil {
    static getAllFiles(dirPathUrl: string, extensions: string[] = ['.js', '.ts', '.ovs']): string[] {
        let results: string[] = []
        try {
            const dirPath = dirPathUrl.startsWith('file://')
                ? fileURLToPath(dirPathUrl)
                : dirPathUrl
            const files = fs.readdirSync(dirPath)

            for (const file of files) {
                const filePath = path.join(dirPath, file)
                const stat = fs.statSync(filePath)

                if (stat.isDirectory()) {
                    // 递归获取子目录的文件
                    results = results.concat(this.getAllFiles(filePath, extensions))
                } else {
                    // 检查文件扩展名
                    const ext = path.extname(file)
                    if (extensions.includes(ext)) {
                        results.push(filePath)
                    }
                }
            }
        } catch (error) {
            console.error('Error reading directory:', error)
        }

        return results
    }
}

const a = FileUtil.getAllFiles('file:///c%3A/Users/qinkaiyuan/IdeaProjects/testovsplg1')

console.log(a)
