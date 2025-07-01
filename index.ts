import { DMLog } from "./utils/dmlog.js";
import { FCCommon } from "./utils/FCCommon.js";
import { FCAnd } from "./utils/FCAnd.js";
import { okhttp } from "./utils/okhttp.js";

function hookMethods(targetClass: string, targetMethod: string, start: any = null, end: any = null) {
    try {
        var targetClassMethod = targetClass + '.' + targetMethod;
        var hook = Java.use(targetClass);

        console.log(hook);
        var overloadCount = hook[targetMethod].overloads.length;
        console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
        for (var i = 0; i < overloadCount; i++) {
            hook[targetMethod].overloads[i].implementation = function () {
                var log = targetClassMethod + "("
                var retval = null
                if (start) {
                    retval = start(this, arguments)
                } else {
                    for (var j = 0; j < arguments.length; j++) {
                        log = log + arguments[j]
                        if (j != arguments.length - 1) {
                            log = log + ","
                        }
                    }
                    log = log + ")"
                    console.log(log);
                }
                if (!retval)
                    retval = this[targetMethod].apply(this, arguments);
                if (end) {
                    retval = end(this, retval, arguments)
                }
                if (retval == "void") {
                    return;
                }

                return retval;
            }
        }
        hook.$dispose;
    } catch (e) {
        console.error(e);
        console.error("hook[" + targetClass + "]失败");
        return
    }
}

function hookClassMethods(className: string, methodName: string) {
    const targetClass = Java.use(className);
    // 获取所有声明的方法
    const methods = targetClass.class.getDeclaredMethods();
    methods.forEach((method: any) => {
        if (methodName == "*") {
            methodName = method.getName();
        } else if (methodName != method.getName()) {
            return;
        }
        //const methodName = method.getName();
        const overloads = targetClass[methodName].overloads;

        // 处理每个重载版本
        overloads.forEach((overload: any) => {
            overload.implementation = function () {
                // 打印方法签名
                const signature = `${className}.${methodName}(${overload.argumentTypes.map((t: any) => t.className).join(',')
                    })`;
                console.log(`[+] Called: ${signature}`);

                // 打印参数
                for (let i = 0; i < arguments.length; i++) {
                    console.log(`  arg${i}: ${JSON.stringify(arguments[i])}`);
                }

                // 调用原方法
                const result = this[methodName].apply(this, arguments);

                if ("\"http://47.239.115.80/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/info\"" == JSON.stringify(result)) {
                    console.log(`1231231`);
                    FCAnd.showStacks();

                }
                // 打印返回值
                console.log(`  <= Return: ${JSON.stringify(result)}`);

                if (methodName == "copy$default") {
                    console.log(arguments[0]);
                }
                return result;
            };
        });
    });
}

export { DMLog, FCCommon, FCAnd , okhttp, hookMethods, hookClassMethods};