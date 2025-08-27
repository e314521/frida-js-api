
import Java from "frida-java-bridge";

function isProbablyUtf8(buffer) {
    const BufferCls = buffer.class;
    const Character = Java.use("java.lang.Character");

    const prefix = BufferCls.$new();
    const byteCount = Math.min(buffer.size(), 64);
    buffer.copyTo(prefix, 0, byteCount);

    for (let i = 0; i < 16; i++) {
        if (prefix.exhausted()) break;

        const codePoint = prefix.readUtf8CodePoint();
        if (Character.isISOControl(codePoint) &&
            !Character.isWhitespace(codePoint)) {
            return false;
        }
    }

    return true;
}


function hookInterceptor(name, buffName, gzipName) {
    Java.perform(function () {
        //console.log("VERSION:", Java.use("okhttp3.OkHttp").VERSION.value)

        const CallServerInterceptor = Java.use(name);
        const BufferCls = Java.use(buffName)
        const GzipSource = Java.use(gzipName);
        //const ByteBuffer = Java.use("java.nio.ByteBuffer")
        //const String = Java.use("java.lang.String");xe2
        var Charset = Java.use("java.nio.charset.Charset")
        var utf8Charset = Charset.forName("UTF-8")
        var BufferClsToString = null
        for (const method of BufferCls.class.getMethods()) {
            const params = method.getParameterTypes();
            if (params.length == 1 && params[0].getName() === "java.nio.charset.Charset") {
                BufferClsToString = method;
                break;
            }
        }
        if (!BufferClsToString) {
            console.log("没有找到BufferClsToString");
            return;
        }
        //console.log(defChatset) 
        //console.log(utf8Charset)
        //BufferClsToString.overload('int', 'java.lang.String')
        //console.log(BufferClsToString.overload());
        /*const RequestBody = Java.use("okhttp3.RequestBody")
        RequestBody.class.getMethods().forEach(method => {
            if (method.getName() === "writeTo") {
                const params = method.getParameterTypes();
                console.log("参数类型:", Java.use(params[0].getName()).$new()); // 输出如"okio.BufferedSink"
            }
        });*/

        //console.log(CallServerInterceptor);
        //const BufferCls = Java.use("okio.Buffer");
        //const GzipSource = Java.use("okio.GzipSource");
        // const Utf8Kt = Java.use("okhttp3.logging.Utf8Kt");
        //const BufferCls = Java.use("okio.Buffer");


        CallServerInterceptor.intercept.implementation = function (chain) {
            const logLines = [];
            const request = chain.request();
            const method = request.method();
            const url = request.url().toString();
            const requestHeaders = request.headers();

            logLines.push("\n📤====================[ OkHttp Request ]====================📤");
            logLines.push(`➡️ ${method} ${url}`);

            let curlParts = [`curl -X ${method}`];
            curlParts.push(`'${url}'`);

            logLines.push("🔸 Headers:");
            for (let i = 0; i < requestHeaders.size(); i++) {
                const name = requestHeaders.name(i);
                const value = requestHeaders.value(i);
                logLines.push(`   ${name}: ${value}`);

                // 构造 curl header 参数
                curlParts.push(`-H '${name}: ${value}'`);
            }


            let curlBodyStr = "";
            const requestBody = request.body();


            if (requestBody != null && !requestBody.isDuplex() && !requestBody.isOneShot()) {
                const ok_buffer = BufferCls.$new();
                requestBody.writeTo(ok_buffer);
                try {
                    var bodyText = BufferClsToString.invoke(ok_buffer, [utf8Charset])
                    logLines.push("📝 Body:");
                    const truncated = bodyText.length > 1000 ? bodyText.substring(0, 1000) + "..." : bodyText
                    logLines.push(truncated);
                    curlBodyStr = bodyText.replace(/'/g, "'\\''"); // escape single quotes for curl
                    logLines.push(`--> END ${method} (${requestBody.contentLength()}-byte body)`);

                } catch (error) {
                    logLines.push(`--> END ${method} (binary ${requestBody.contentLength()}-byte body omitted)`);
                }
                /*if (isProbablyUtf8(buffer, buffName)) {
                    logLines.push("📝 Body:");
                    const bodyText = buffer.readUtf8();
                    const truncated = bodyText.length > 1000 ? bodyText.substring(0, 1000) + "..." : bodyText
                    logLines.push(truncated);
                    curlBodyStr = bodyText.replace(/'/g, "'\\''"); // escape single quotes for curl
                    logLines.push(`--> END ${method} (${requestBody.contentLength()}-byte body)`);
                } else {
                    logLines.push(`--> END ${method} (binary ${requestBody.contentLength()}-byte body omitted)`);
                }*/
            } else {
                logLines.push(`--> END ${method}`);
            }

            // 添加 curl body
            if (curlBodyStr.length > 0) {
                curlParts.push(`--data '${curlBodyStr}'`);
            }

            // 输出 curl 命令（标准）
            let curl = curlParts.join(" ")
            logLines.push("\n📦 CURL (Linux/macOS/bash):");
            logLines.push(curl);

            // 输出 curl.exe 命令（Windows PowerShell）
            logLines.push("\n📦 CURL (Windows/PowerShell):");
            logLines.push(curl.replace(/^curl\b/, "curl.exe"));

            // 执行请求
            const startNs = Java.use("java.lang.System").nanoTime();
            let response;
            try {
                response = this.intercept(chain);
            } catch (e) {
                logLines.push("<-- ❌ HTTP FAILED: " + e);
                throw e;
            }

            const tookMs = (Java.use("java.lang.System").nanoTime() - startNs) / 1000000;

            const responseBody = response.body();
            const contentLength = responseBody.contentLength();
            const responseHeaders = response.headers();

            logLines.push("\n📥====================[ OkHttp Response ]====================📥");
            logLines.push(`⬅️ ${response.code()} ${response.message()} (${tookMs}ms)`);
            logLines.push(`↩️ URL: ${response.request().url()}`);
            logLines.push("🔸 Headers:");
            for (let i = 0; i < responseHeaders.size(); i++) {
                const name = responseHeaders.name(i);
                const value = responseHeaders.value(i);
                logLines.push(`   ${name}: ${value}`);
            }

            const encoding = responseHeaders.get("Content-Encoding");
            const source = responseBody.source();
            source.request(Java.use("java.lang.Long").MAX_VALUE.value);
            let buffer = source.getBuffer().clone();
            buffer = Java.cast(buffer, BufferCls);
            logLines.push("📄 Body:");
            logLines.push(buffer)
            logLines.push(`<-- END HTTP (${buffer.size()}-byte body)`);
            let gzippedLength = null;
            if (encoding !== null && encoding.toLowerCase() === "gzip") {
                gzippedLength = buffer.size();
                const gzipSource = GzipSource.$new(Java.cast(buffer.clone(), BufferCls));
                const decompressedBuffer = BufferCls.$new();
                gzipSource.read(decompressedBuffer, Java.use("java.lang.Long").MAX_VALUE.value);
                buffer = decompressedBuffer;
            }
            if (contentLength !== 0) {
                const bodyText = BufferClsToString.invoke(buffer.clone(), [utf8Charset])
                logLines.push("📄 Body:");
                logLines.push(bodyText.length > 1000 ? bodyText.substring(0, 1000) + "..." : bodyText);
            }
            /*let gzippedLength = null;
            if (encoding !== null && encoding.toLowerCase() === "gzip") {
                gzippedLength = buffer.size();
                const gzipSource = GzipSource.$new(Java.cast(buffer.clone(), BufferCls));
                const decompressedBuffer = BufferCls.$new();
                decompressedBuffer.writeAll(gzipSource);
                buffer = decompressedBuffer;
            }

            if (!isProbablyUtf8(buffer)) {
                logLines.push("⚠️  Response body is binary. Skipped logging.");
                logLines.push(`<-- END HTTP (binary ${buffer.size()}-byte body omitted)`);
                return response;
            }

            if (contentLength !== 0) {
                const bodyText = Java.cast(buffer.clone(), BufferCls).readUtf8();
                logLines.push("📄 Body:");
                logLines.push(bodyText.length > 1000 ? bodyText.substring(0, 1000) + "..." : bodyText);
            }*/

            if (gzippedLength !== null) {
                logLines.push(`<-- END HTTP (${buffer.size()}-byte, ${gzippedLength}-gzipped-byte body)`);
            } else {
                logLines.push(`<-- END HTTP (${buffer.size()}-byte body)`);
            }

            logLines.push("==============================================================\n");

            console.log(logLines.join("\n"));

            return response;
        };
    });
}

function detectOkHttpVersion() {
    Java.perform(function () {
        const hasClass = (name) => {
            try {
                Java.use(name);
                return true;
            } catch (_) {
                return false;
            }
        };

        const log = [];
        log.push("🔍 Scanning for OkHttp...");

        // 优先检测公开版本字段（4.x 开始提供）
        if (hasClass("okhttp3.OkHttp")) {
            try {
                const OkHttp = Java.use("okhttp3.OkHttp");
                const version = OkHttp.VERSION.value;
                log.push(`✅ Detected OkHttp: version=${version} (via okhttp3.OkHttp.VERSION)`);
            } catch (e) {
                log.push("⚠️ Found okhttp3.OkHttp but failed to read VERSION field.");
            }
            console.log(log.join("\n"));
            return;
        }

        // 再检测内部类（3.x ~ 4.x 通用）
        if (hasClass("okhttp3.internal.Version")) {
            try {
                const Version = Java.use("okhttp3.internal.Version");
                const userAgent = Version.userAgent();
                log.push(`✅ Detected OkHttp via internal.Version: ${userAgent}`);
            } catch (e) {
                log.push("⚠️ Found okhttp3.internal.Version but failed to read userAgent.");
            }
            console.log(log.join("\n"));
            return;
        }

        log.push("❌ OkHttp not detected in current app.");
        console.log(log.join("\n"));
    });
}

class okhttp {
    static hook(name = "okhttp3.internal.http.CallServerInterceptor", buffName = "okio.Buffer", gzipName = "okio.GzipSource") {
        setImmediate(function () {
            hookInterceptor(name, buffName, gzipName)
        });
    }
}
export { okhttp }
// okio.Buffer 查找 "Method not decompiled: okio.Buffer.readHexadecimalUnsignedLong():long"  implements nc, mc, Cloneable, ByteChannel
// GzipSource 查找 "gzip finished without exhausting source"
// frida -H 127.0.0.1:1234 -F -l okhttp.js
// frida -H 127.0.0.1:1234 -F -l okhttp.js -o log.txt
// frida -H 127.0.0.1:1234 -F -l okhttp.js --runtime=v8 --debug