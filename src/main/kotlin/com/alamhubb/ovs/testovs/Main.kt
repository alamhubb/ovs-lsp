import com.intellij.execution.configurations.GeneralCommandLine

fun main() {
    println("hello world")
    try {
        val commandLine = GeneralCommandLine("npm.cmd", "exec", "ovs-lsp", "--stdio")
        val process = commandLine.createProcess()

// 获取标准输入和输出流
        val outputStream = process.outputStream
        val inputStream = process.inputStream

// 向服务器发送请求
        outputStream.write("请求数据\n".toByteArray())
        outputStream.flush()

// 读取服务器的响应
        val response = inputStream.bufferedReader().readLine()
        println("服务器响应: $response")

// 处理完毕后，关闭进程
        process.waitFor()
    } catch (e: Exception) {
        println(e.message)
    }
}