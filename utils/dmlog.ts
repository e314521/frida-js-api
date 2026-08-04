
import Java from "frida-java-bridge";
export class DMLog {
    static bDebug: boolean = true;

    static d(tag: string, str: string) {
        if (this.bDebug) {
            DMLog.log_(console.log, 'DEBUG', tag, str);
        }
    }

    static i(tag: string, str: string) {
        DMLog.log_(console.log, 'INFO', tag, str);
    }

    static w(tag: string, str: string) {
        DMLog.log_(console.warn, 'WARN', tag, str);
    }

    static e(tag: string, str: string) {
        DMLog.log_(console.error, 'ERROR', tag, str);
    }

    static log_(logfunc: (message?: any, ...optionalParams: any[]) => void, leval: string, tag: string, str: string) {
        let threadName = "";
        if (Java.available) {
            Java.perform(() => {
                const Thread = Java.use('java.lang.Thread');
                threadName = `[${Thread.currentThread().getName()}]`;
            });
        }
        logfunc(`[${leval}][${new Date().toLocaleString('zh-CN')}][PID:${Process.id}]${threadName}[${Process.getCurrentThreadId()}][${tag}]: ${str}`);
    }

    static send(tag: string, content: string) {
        let tid = Process.getCurrentThreadId();
        send(JSON.stringify({
            tid: tid,
            status: 'msg',
            tag: tag,
            content: content
        }));
    }
    static logcat() {
        var Log: any = null;
        var TAG = "FridaRedirect";

        // 拦截重写全局 console.log
        var oldLog = console.log;
        console.log = function () {
            // 先调用原有的控制台打印
            oldLog.apply(console, arguments as any);

            // 尝试转换为字符串
            var message = Array.prototype.slice.call(arguments).join(' ');

            // 异步或延迟获取 Java 环境，避免阻塞或未附加成功时崩溃
            if (Java.available) {
                Java.perform(function () {
                    if (!Log) {
                        Log = Java.use("android.util.Log");
                    }
                    Log.d(TAG, message);
                });
            }
        };
    }
}