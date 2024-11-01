import com.intellij.execution.configurations.GeneralCommandLine
import java.io.BufferedReader
import java.io.InputStreamReader

fun main() {
    // 创建子进程
    val commandLine = GeneralCommandLine("npx", "ovs-lsp").apply {
        withCharset(Charsets.UTF_8)
        withRedirectErrorStream(true)  // 对应 stdio: 'pipe'
    }

    val process = commandLine.createProcess()

    // 创建命令行接口
    val reader = BufferedReader(InputStreamReader(System.`in`))

    // 监听进程输出
    Thread {
        val processReader = BufferedReader(InputStreamReader(process.inputStream))
        try {
            var line: String?
            while (processReader.readLine().also { line = it } != null) {
                println(line)
            }
        } catch (e: Exception) {
            System.err.println("Error reading process output: ${e.message}")
        }
    }.start()

    try {
        println("Ready. Enter commands (type 'exit' to quit):")

        // 处理用户输入
        while (true) {
            print("> ")
            System.out.flush()

            val input = reader.readLine() ?: break

            if (input.equals("exit", ignoreCase = true)) {
                break
            }

            // 发送输入到子进程
            process.outputStream.write("$input\n".toByteArray())
            process.outputStream.flush()
        }
    } catch (e: Exception) {
        System.err.println("Error: ${e.message}")
    } finally {
        reader.close()
        process.destroy()
    }
}