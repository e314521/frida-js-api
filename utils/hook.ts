import Java from "frida-java-bridge";


function getFieldValue(obj: any, fieldName: string) {
    var cls = obj.getClass();
    var field = cls.getDeclaredField(fieldName);
    field.setAccessible(true);
    var name = field.getName();
    var value = field.get(obj);
    //console.log(value.getClass().getName())
    //console.log(value,Java.use(value.class.getName()))
    if (value)
        return Java.cast(value, Java.use(value.getClass().getName()))
    return value;
}

function hookMethod(method: Java.Method, start: Function | null = null, end: Function | null = null) {
    method.implementation = function () {
        var result
        if (start) {
            result = start.apply(this, arguments)
            if (result !== undefined) {
                if (method.returnType.className === "void") {
                    return
                }
                return result
            }
        } else {
            console.log("[+] "+ method.methodName + " 触发 ->")
            method.argumentTypes.forEach((item, index) => {
                console.log("      -> 参数" +  index + " [" + item.className + "] " + arguments[index]);
            })
        }
        result = method.apply(this, arguments as any);
        if (end) {
            end.apply(this, [result])
        }else{
            if (method.returnType.className !== "void") {
                console.log("[+] "+ method.methodName + " 返回值 ->" + result)
            }
        }
        return result
    }

}
function hookMethods(targetClass: string, targetMethod: string, start: Function | null = null, end: Function | null = null) {
    Java.perform(function () {
        try {
            var hook = Java.use(targetClass);
            var methodDispatcher: Java.MethodDispatcher = hook[targetMethod]
            methodDispatcher.overloads.forEach((method) => {
                console.log(`hook ${targetClass}.${method.toString().slice(9)} `)
                hookMethod(method, start, end)
            })
        } catch (e) {
            console.error(e);
            console.error("hook[" + targetClass + "]失败");
            return
        }
    })


}
// function hookMethods(targetClass: string, targetMethod: string, start?: ((thisObj: any, args: any) => any) | null, end?: ((thisObj: any, ret: any, args: any) => any) | null) {
//     Java.perform(function () {
//         try {

//             var targetClassMethod = targetClass + '.' + targetMethod;
//             var hook = Java.use(targetClass);

//             //console.log(hook[targetMethod])
//             var overloadCount = hook[targetMethod].overloads.length;
//             //console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
//             for (var i = 0; i < overloadCount; i++) {
//                 console.log("hook[" + targetClass + "]" +  hook[targetMethod].overloads[i] +  "成功");

//                 hook[targetMethod].overloads[i].implementation = function () {



//                     var log = targetClassMethod + "("
//                     var retval = null
//                     if (start) {
//                         retval = start(this, arguments)
//                     } else {
//                         for (var j = 0; j < arguments.length; j++) {
//                             log = log + arguments[j]
//                             if (j != arguments.length - 1) {
//                                 log = log + ","
//                             }
//                         }
//                         log = log + ")"
//                         //console.log(log);
//                     }
//                     if (!retval)
//                         retval = this[targetMethod].apply(this, arguments);
//                     if (end) {
//                         retval = end(this, retval, arguments)
//                     }
//                     console.log(log + ";ret=" + retval);
//                     if (retval == "void") {
//                         return;
//                     }
//                     return retval;
//                 }
//             }
//             //hook.$dispose;
//         } catch (e) {
//             console.error(e);
//             console.error("hook[" + targetClass + "]失败");
//             return
//         }
//     })


// }

function detachMethods(targetClass: string, targetMethod: string) {
    Java.perform(function () {
        try {
            var targetClassMethod = targetClass + '.' + targetMethod;
            var hook = Java.use(targetClass);
            //console.log(hook[targetMethod])
            var overloadCount = hook[targetMethod].overloads.length;
            //console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
            for (var i = 0; i < overloadCount; i++) {
                console.log("detach[" + targetClass + "]" + hook[targetMethod].overloads[i] + "成功");
                hook[targetMethod].overloads[i].implementation = null
            }
        } catch (e) {
            console.error(e);
            console.error("detach[" + targetClass + "]失败");
            return
        }
    })
}

function hookClass(targetClass: string, targetMethod: string = "*") {
    Java.perform(function () {
        try {
            Java.use(targetClass);
            console.log("hook[" + targetClass + "]成功");
            const groups = Java.enumerateMethods(targetClass + '!' + targetMethod);
            groups.forEach(function (group) {
                //console.log(group.loader)
                group.classes.forEach(function (clazz) {
                    console.log(clazz.name)
                    clazz.methods.forEach(function (method) {
                        hookMethods(clazz.name, method)

                    })

                })

            })
            //console.log(JSON.stringify(groups, null, 2));
            //console.log(groups[0].classes)
            //var hook = Java.use(targetClass);
            //console.log( hook.class.$methods)
            /*console.log("hook[" + targetClass + "]成功");
            hook.class.getDeclaredMethods().forEach(function (method) {
                console.log("hook[" + targetClass + "]方法:" + method);

            })*/

        } catch (e) {
            console.error(e);
            console.error("hook[" + targetClass + "]失败");
            return
        }
    })
}

function hookSvcByMemoryScan(moduleName: string) {
    const mod = Process.findModuleByName(moduleName);
    if (!mod) return;

    console.log(`开始扫描 ${moduleName} 中的所有 SVC 指令...`);

    // 搜索 ARM64 的 svc #0 机器码特征：01 00 00 d4
    Memory.scan(mod.base, mod.size, '01 00 00 d4', {
        onMatch: function (address, size) {
            console.log(`[Found] 发现 SVC 指令于地址: ${address.sub(mod.base)}`);

            // 直接对该地址进行硬件拦截
            Interceptor.attach(address, {
                onEnter: function (args) {
                    // 读取此时的 X8 寄存器
                    const syscall_id = (this.context as Arm64CpuContext).x8.toInt32();
                    console.log(`[Inline SVC] 地址 ${address.sub(mod.base)} 触发了系统调用: ${syscall_id}`);
                    var backtrace = Thread.backtrace(this.context, Backtracer.ACCURATE);
                    backtrace.forEach(function (address) {
                        console.log("  [+] " + address.sub(mod.base));//这边查看堆栈 获取了 0x359D24 0x2EF28
                    })
                }
            });
        },
        onComplete: function () {
            console.log("SVC 内存扫描完毕。");
        }
    });
}

export { hookMethods, hookClass, getFieldValue, detachMethods }