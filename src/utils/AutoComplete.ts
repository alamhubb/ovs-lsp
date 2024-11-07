import FlexSearch from 'flexsearch'
import path from "node:path";

interface CompletionItem {
    label: string;          // 显示文本
    kind: CompletionKind;   // 类型(关键字、函数等)
    filePath?: string;      // 文件路径
    weight?: number;        // 权重
    detail?: string;        // 详细信息
}

enum CompletionKind {
    Keyword,
    Function,
    Variable,
    Class,
    Property
}

class CompletionProvider {
    private index: any;
    private items: Map<string, CompletionItem>;
    private currentFilePath: string = '';

    constructor() {
        // 配置 FlexSearch
        this.index = new FlexSearch.Index({
            preset: 'score',    // 使用评分模式
            tokenize: 'full',   // 完整分词
            resolution: 9,      // 最高精度
            // depth: 3,          // 支持部分匹配
            boost: () => 2           // 提高精确匹配的权重
        });

        this.items = new Map();
    }

    // 添加提示项
    addItem(item: CompletionItem) {
        const id = this.generateId(item);
        this.items.set(id, item);

        // 索引多个字段
        this.index.add(id, [
            item.label,                    // 完整标识符
            item.label.toLowerCase(),      // 小写形式
            this.splitCamelCase(item.label) // 驼峰分词
        ].join(' '));
    }

    // 设置当前文件
    setCurrentFile(filePath: string) {
        this.currentFilePath = filePath;
    }

    // 获取提示
    suggest(input: string, limit: number = 10): CompletionItem[] {
        if (!input) return [];

        // 执行搜索
        const results = this.index.search(input, {
            limit: limit * 2,  // 搜索更多结果用于排序
            suggest: true     // 启用建议模式
        });

        // 获取完整的提示项
        const items = results
            .map(id => this.items.get(id))
            .filter(Boolean) as CompletionItem[];

        // 排序
        return this.rankItems(items, input).slice(0, limit);
    }

    private rankItems(items: CompletionItem[], input: string): CompletionItem[] {
        const inputLower = input.toLowerCase();

        return items.sort((a, b) => {
            // 1. 完全匹配优先
            const aExact = a.label.toLowerCase() === inputLower;
            const bExact = b.label.toLowerCase() === inputLower;
            if (aExact !== bExact) return aExact ? -1 : 1;

            // 2. 前缀匹配优先
            const aPrefix = a.label.toLowerCase().startsWith(inputLower);
            const bPrefix = b.label.toLowerCase().startsWith(inputLower);
            if (aPrefix !== bPrefix) return aPrefix ? -1 : 1;

            // 3. 匹配字符数量
            const aMatches = this.countMatches(a.label, input);
            const bMatches = this.countMatches(b.label, input);
            if (aMatches !== bMatches) return bMatches - aMatches;

            // 4. 文件位置优先级
            const aFileScore = this.getFileScore(a.filePath);
            const bFileScore = this.getFileScore(b.filePath);
            if (aFileScore !== bFileScore) return bFileScore - aFileScore;

            // 5. 项目类型优先级
            return this.getKindScore(b.kind) - this.getKindScore(a.kind);
        });
    }

    private countMatches(str: string, input: string): number {
        let count = 0;
        let pos = 0;
        const strLower = str.toLowerCase();
        const inputLower = input.toLowerCase();

        for (const char of inputLower) {
            const index = strLower.indexOf(char, pos);
            if (index === -1) break;
            count++;
            pos = index + 1;
        }

        return count;
    }

    private getFileScore(filePath?: string): number {
        if (!filePath || !this.currentFilePath) return 0;

        // 同文件最高优先级
        if (filePath === this.currentFilePath) return 100;

        // 同目录次高优先级
        const currentDir = path.dirname(this.currentFilePath);
        if (filePath.startsWith(currentDir)) return 80;

        // 根据目录层级计算优先级
        const relativePath = path.relative(this.currentFilePath, filePath);
        const depth = relativePath.split(path.sep).length;
        return Math.max(50 - depth * 10, 0);
    }

    private getKindScore(kind: CompletionKind): number {
        switch (kind) {
            case CompletionKind.Keyword:
                return 100;
            case CompletionKind.Function:
                return 90;
            case CompletionKind.Class:
                return 80;
            case CompletionKind.Property:
                return 70;
            case CompletionKind.Variable:
                return 60;
            default:
                return 0;
        }
    }

    private generateId(item: CompletionItem): string {
        return `${item.kind}_${item.label}_${item.filePath || ''}`;
    }

    private splitCamelCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    }
}

// 使用示例
const provider = new CompletionProvider();

// 添加一些提示项
provider.addItem({
    label: 'function',
    kind: CompletionKind.Keyword,
    weight: 100
});

provider.addItem({
    label: 'useState',
    kind: CompletionKind.Function,
    filePath: '/src/hooks.ts',
    detail: 'React Hook'
});

provider.addItem({
    label: 'useEffect',
    kind: CompletionKind.Function,
    filePath: '/src/hooks.ts',
    detail: 'React Hook'
});

// 设置当前文件
provider.setCurrentFile('/src/components/MyComponent.tsx');

// 获取提示
console.log(provider.suggest('use'));  // 匹配 useState, useEffect
console.log(provider.suggest('func')); // 匹配 function
