import {DMLog} from "./utils/dmlog.js";
import {FCCommon} from "./utils/FCCommon.js";
import {FCAnd} from "./utils/FCAnd.js";
import {OkHttp} from "./utils/okhttp.js";
Java.perform(function() {
    function hookMethods(targetClass:string, targetMethod:string, start:any = null, end:any = null)
    {
        try{
            var targetClassMethod = targetClass + '.' + targetMethod;
            var hook = Java.use(targetClass);

            console.log(hook);
            var overloadCount = hook[targetMethod].overloads.length;
            console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
            for (var i = 0; i < overloadCount; i++) {
                hook[targetMethod].overloads[i].implementation = function() {
                    var log = targetClassMethod + "("
                    var retval = null
                    if(start){
                        retval = start(this, arguments)
                    }else{
                        for (var j = 0; j < arguments.length; j++){
                            log = log + arguments[j]
                            if(j != arguments.length - 1){
                                log = log + ","
                            }
                        }
                        log = log + ")"
                        console.log(log);
                    }
                    if(!retval)
                        retval = this[targetMethod].apply(this, arguments);
                    if(end){
                        retval = end(this, retval, arguments)
                    }
                    if(retval == "void"){
                        return;
                    }
                    
                    return retval;
                }
            }
            hook.$dispose;
        }catch(e){
            console.error(e);
            console.error("hook["  + targetClass + "]失败");
            return
        }
    }
    //hookMethods("com.rookie.v.libs.AES","decryptString")
});



Java.perform(function() {
    // 目标类名（需替换为实际类名）
    const targetClass = "com.rookie.v.data.api.Proxy";
    function hookClassMethods(className:string, methodName: string) {
        const targetClass = Java.use(className);
        // 获取所有声明的方法
        const methods = targetClass.class.getDeclaredMethods();
        methods.forEach((method:any) => {
            if (methodName == "*"){
                methodName = method.getName();
            }else if (methodName != method.getName()){
                return;
            }            
            //const methodName = method.getName();
            const overloads = targetClass[methodName].overloads;
            
            // 处理每个重载版本
            overloads.forEach((overload: any) => { 
                overload.implementation = function() {
                    // 打印方法签名
                    const signature = `${className}.${methodName}(${
                        overload.argumentTypes.map((t:any) => t.className).join(',')
                    })`;
                    console.log(`[+] Called: ${signature}`);
                    
                    // 打印参数
                    for (let i = 0; i < arguments.length; i++) {
                        console.log(`  arg${i}: ${JSON.stringify(arguments[i])}`);
                    }
                    
                    // 调用原方法
                    const result = this[methodName].apply(this, arguments);

                    if("\"http://47.239.115.80/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/info\"" == JSON.stringify(result)){
                        console.log(`1231231`);
                        FCAnd.showStacks();

                    }
                    // 打印返回值
                    console.log(`  <= Return: ${JSON.stringify(result)}`);

                    if (methodName == "copy$default"){
                        console.log(arguments[0]);
                    }
                    return result;
                };
            });
        });
    }
    
    // 执行Hook
    //hookClassMethods("com.rookie.v.data.api.Proxy", "*");
});




function main() {
    DMLog.d('MAIN', 'HELLO FridaContainer, please add code on the index.ts');
    //FCAnd.traceJavaMethods_custom(['E:com.dragon.read.pages.main.MainFragmentActivity']);
    //FCAnd.hook_log();
    //FCAnd.traceJavaMethods_custom(['E:java.lang.String'], {'java.lang.String': {white: true, methods: ['substring', 'getChars']}});

    /*FCAnd.traceJavaMethods(
        ['E:java.lang.String'],
        {'java.lang.String': {white: true, methods:['substring', 'getChars']}},
        "match_str_show_stacks"
    );*/
    //FCAnd.jni.traceAllJNISimply();
    //FCAnd.anti.anti_ptrace();
    // FCAnd.Anti.anti_fgets();
    // and.anti.Anti.anti_fgets();

    // FCAnd.anti.anti_debug();
    /// dp
    // DianPing.anti_debug();
    // DianPing.hook_cx_stacks();
    ///
    // FCAnd.showStacks();
    // FCAnd.dump_dex_common();
    // FCAnd.Anti.anti_sslPinning("/data/local/tmp/cert-der.crt");

    // FCCommon.dump_module('libmtguard.so', '/data/data/com.dianping.v1');
    // DianPing.hook_stuffs();
    // call mtgsig
    // DianPing.test_call_mtgsig();
    //DianPing.hook_zlog();
    // FCAnd.anti.anti_debug();
    // coord: (0,203,25) | addr: Lcom.dianping.nvnetwork.tunnel.Encrypt.SocketSecureManager;->getB2keyByB2(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String; | loc: ?
    // FCAnd.traceArtMethods(['E:com.dianping.nvnetwork.tunnel.Encrypt.SocketSecureManager'], null, "122,108,111,103,46,98,105,110");  // "zlog.bin"
    // FCAnd.anti.anti_ssl_unpinning();
    // DianPing.hook_stuffs();
    // DianPing.hook_net();
    // DianPing.modify_devinfo();
    // DianPing.hook_stuffs();
    // FCAnd.hook_uri(false);
    // FCAnd.hook_url(true);
    // FCAnd.jni.traceAllJNISimply();
    // FCAnd.traceArtMethods(['M:retrofit2']);
    // rpc.exports = {
    //     test() {
    //         Java.perform(() => {
    //             FCAnd.jni.traceAllJNISimply();
    //         });
    //     }
    // }
    //OkHttp.hook();
}

if (Java.available) {
    DMLog.i("JAVA", "available");
    Java.perform(function () {
        main();
    });
}

