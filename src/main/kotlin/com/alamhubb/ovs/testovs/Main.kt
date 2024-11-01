import com.intellij.execution.configurations.GeneralCommandLine
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.system.exitProcess

fun main() {
    val isRunning = AtomicBoolean(true)

    // 创建进程，模仿 Node.js 的配置
    val commandLine = GeneralCommandLine().apply {
        // 在 Windows 上使用 cmd /c，在 Unix 上使用 sh -c
        if (System.getProperty("os.name").lowercase().contains("windows")) {
            exePath = "cmd"
            addParameters("/c", "npx ovs-lsp")
        } else {
            exePath = "sh"
            addParameters("-c", "npx ovs-lsp")
        }
        withCharset(Charsets.UTF_8)
        withRedirectErrorStream(true)
    }

    println("Starting server...")

    val process = try {
        commandLine.createProcess()
    } catch (e: Exception) {
        System.err.println("Failed to start subprocess: ${e.message}")
        exitProcess(1)
    }

    // 监听进程输出
    Thread {
        val reader = BufferedReader(InputStreamReader(process.inputStream))
        try {
            var line: String?
            while (isRunning.get() && reader.readLine().also { line = it } != null) {
                println(line)
            }
        } catch (e: Exception) {
            if (isRunning.get()) {
                System.err.println("Error reading output: ${e.message}")
            }
        }
    }.start()

    println("Ready. Enter commands (type 'exit' to quit):")

    // 读取用户输入
    val reader = BufferedReader(InputStreamReader(System.`in`))
    try {
        while (isRunning.get() && process.isAlive) {
            print("> ")
            System.out.flush()

            val input = reader.readLine()
            when {
                input == null -> break
                input.equals("exit", ignoreCase = true) -> {
                    isRunning.set(false)
                    break
                }
                input.isNotEmpty() -> {
                    try {
                        process.outputStream.write("$input\n".toByteArray(Charsets.UTF_8))
                        process.outputStream.flush()
                    } catch (e: Exception) {
                        System.err.println("Failed to send input: ${e.message}")
                        break
                    }
                }
            }
        }
    } catch (e: Exception) {
        System.err.println("Error reading input: ${e.message}")
    } finally {
        isRunning.set(false)
        if (process.isAlive) {
            process.destroyForcibly()
        }
        exitProcess(0)
    }
}