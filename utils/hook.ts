import Java from "frida-java-bridge";


function getFieldValue(obj  : any, fieldName: string) {
    var cls = obj.getClass();
    var field = cls.getDeclaredField(fieldName);
    field.setAccessible(true);
    var name = field.getName();
    var value = field.get(obj);
	//console.log(value.getClass().getName())
	//console.log(value,Java.use(value.class.getName()))
	if(value)
		return Java.cast(value,Java.use(value.getClass().getName()))
    return value;
}
function hookMethods(targetClass: string, targetMethod: string, start?: (thisObj: any, args: any) => any, end?: (thisObj: any, ret: any, args: any) => any) {
    Java.perform(function () {
        try {
            var targetClassMethod = targetClass + '.' + targetMethod;
            var hook = Java.use(targetClass);
            console.log("hook[" + targetClass + "]成功");
            console.log(hook[targetMethod])
            var overloadCount = hook[targetMethod].overloads.length;
            //console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
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
                        //console.log(log);
                    }
                    if (!retval)
                        retval = this[targetMethod].apply(this, arguments);
                    if (end) {
                        retval = end(this, retval, arguments)
                    }
                    console.log(log + ";ret=" + retval);
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
    })


}
function hookClass(targetClass: string, targetMethod: string = "*"){
    Java.perform(function () {
        try {
            console.log("hook[" + targetClass + "]成功");
            const groups = Java.enumerateMethods(targetClass + '!' + targetMethod);
            console.log(groups)
            groups.forEach(function (group) {
                console.log(group.loader)
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
export { hookMethods , hookClass, getFieldValue}