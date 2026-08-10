export class Lua {
    loadbuffer: NativeFunction<number, [NativePointerValue, NativePointerValue, number, NativePointerValue]>;
    luaL_loadstring: NativeFunction<number, [NativePointerValue, NativePointerValue]>;
    lua_pcall: NativeFunction<number, [NativePointerValue, number, number, number]>;
    lua_L: NativePointer | null = null;
    lua_list: {[key:string]:{size:number, text:string, callback:Function | null}} = {}

    constructor(module:Module) {
        const self = this;
        var loadbuffer_ptr = module.findExportByName("tolua_loadbuffer") as NativePointer;
        this.loadbuffer = new NativeFunction(loadbuffer_ptr, 'int', ['pointer', 'pointer', 'int', 'pointer']);


        var luaL_loadstring_ptr = module.findExportByName("luaL_loadstring") as NativePointer;
        this.luaL_loadstring = new NativeFunction(luaL_loadstring_ptr, 'int', ['pointer', 'pointer']);


        var lua_pcall_ptr = module.findExportByName("lua_pcall") as NativePointer;
        this.lua_pcall = new NativeFunction(lua_pcall_ptr, 'int', ['pointer', 'uint32', 'uint32', 'uint32']);


        var lua_pcall_hook = Interceptor.attach(lua_pcall_ptr, {
            onEnter: function (args) {
                self.lua_L = args[0];
                lua_pcall_hook.detach()
            },
            onLeave: function (retval) {

            }
        });
        Interceptor.attach(loadbuffer_ptr, {
            onEnter: function (args) {
                this.luaName = args[3].readUtf8String()
                if(this.luaName && this.luaName in self.lua_list){
                    var text = args[1].readUtf8String(args[2].toInt32())
                    if(text){
                        self.lua_list[this.luaName].text = text
                        self.lua_list[this.luaName].size = args[2].toInt32()
                        this.callback = self.lua_list[this.luaName].callback
                        

                    }
                }
                
                
            },
            onLeave: function (retval) {
                if(this.callback){
                    this.callback()
                }
            }
        });
    }
    replace(name: string, func: string, local: string = "") {
        if (this.lua_L == null) {
            const self = this;
            var interval = setInterval(function () {
                if(self.lua_L){
                    clearInterval(interval);
                    self.replace(name, func)
                }
            }, 100); 
            return
        }
        
        var replace_lua = `${local}
if ${name}_old then
    ${name} = ${name}_old
else
    ${name}_old = ${name}
end
`
        if(func){
            replace_lua = replace_lua + `${name} = ${func}\n`
        }
        const scriptPtr = Memory.allocUtf8String(replace_lua);
        if(this.luaL_loadstring(this.lua_L, scriptPtr) != 0){
            console.log(`${name}:脚本加载失败`)
            return
        }
        if(this.lua_pcall(this.lua_L, 0, 0, 0) != 0){
            console.log(`${name}:脚本执行失败`)
            return
        }
        console.log(`${name}:脚本替换成功`)

    }
    replaceText(name: string, replace_list:{[key:string]:string}, local: string = ""){
        for (const key in this.lua_list) {
            var start = this.lua_list[key].text.indexOf(`\nfunction ${name}(`);
            if (start != -1){
                start += 11 + name.length
                var end = this.lua_list[key].text.indexOf(`\nend`, start);
                if(end != -1){
                    end += 4
                    var oldtext = this.lua_list[key].text.substring(start, end)
                    if(name.indexOf(":") == -1){
                        oldtext = `function(` + oldtext
                    }else{
                        name = name.replace(":", ".")
                        oldtext = `function(self, ` + oldtext
                    }
                    for (const  key in replace_list) {
                        oldtext = oldtext.replace(key, replace_list[key])
                    }
                    return this.replace(name, oldtext, local)

                }
            }
        }
        console.log(`${name}:未找到函数`)
        

    }
    saveList(namelist:{[key:string]:{callback:Function | null}}){
        this.lua_list = {}
        for (const key in namelist) {
            this.lua_list[key] = {
                text:"",
                size:0,
                callback:namelist[key].callback
            }
        }
    }
    addList(name:string, callback:Function | null = null){
        this.lua_list[name] = {
                text:"",
                size:0,
                callback:callback
        }
    }


    
    // public static getModule():Module{
    //     return this.module;
    //

    

}