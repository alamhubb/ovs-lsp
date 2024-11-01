import com.intellij.execution.configurations.GeneralCommandLine
import java.io.BufferedReader
import java.io.InputStreamReader

fun main() {
    // 创建子进程
    val commandLine = GeneralCommandLine("npm.cmd", "exec", "ovs-lsp", "--stdio").apply {
        withParentEnvironmentType(GeneralCommandLine.ParentEnvironmentType.CONSOLE)  // 使用控制台环境
        withCharset(Charsets.UTF_8)
    }

    val process = commandLine.createProcess()

}