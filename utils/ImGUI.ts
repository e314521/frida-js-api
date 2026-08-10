import Java from "frida-java-bridge";

function checkFileExists(filePath:string) {
    // 找到 libc 中的 access 函数
    var p_access = Module.findGlobalExportByName("access");
    if (!p_access) {
        console.log("[-] 未能找到 access 函数");
        return false;
    }
    
    // 创建一个 C 语言风格的函数指针
    // int access(const char *pathname, int mode); R_OK=4, F_OK=0 (F_OK代表只检查文件是否存在)
    var access = new NativeFunction(p_access, 'int', ['pointer', 'int']);
    
    // 将 JS 字符串转换为内存中的 C 字符串
    var c_path = Memory.allocUtf8String(filePath);
    
    // 调用 access。若返回 0 代表文件存在，返回 -1 代表不存在
    var result = access(c_path, 0); 
    
    return result === 0;
}

function loadImguiSo(path: string, activity: Java.Wrapper<{}>) {
    try {
        // 方法1：使用 System.load（推荐，支持完整路径）
        var System = Java.use("java.lang.System");
        System.load(path);
        Java.use("com.imgui.ImGuiView").$new(activity);

    } catch (e) {
        console.log("[-] System.load 失败: " + e);
    }
}

var isLoad = false;
var ImGuiView = null;
var isCallback = false
export function LoadImGUI(callback: Function, so_path: string, activity_name: string, timeoutMs = 100000) {
    var startTime = Date.now();
    var interval = setInterval(function () {
        var module = Process.findModuleByName("libimgui.so");
        if (module == null) {
            if (!isLoad) {
                Java.scheduleOnMainThread(function () {
                    var System = Java.use("java.lang.System");
                    System.load(so_path);
                });
                isLoad = true;
            }

        } else {
            if(isCallback == false){
                isCallback = true;
                callback(new ImGUI())
            }
            Java.perform(function () {
                Java.choose(activity_name, {
                    onMatch: function (activity) {
                        clearInterval(interval);
                        Java.use("com.imgui.ImGuiView").show(activity)
                        // Java.scheduleOnMainThread(function () {
                        //     ImGuiView = Java.use("com.imgui.ImGuiView").$new(activity);
                        // });

                    },
                    onComplete: function () {}
                });
            })
        }









        // var moduleName = "libimgui.so"
        // var module = Process.findModuleByName("libimgui.so");
        // if (module) {
        //     clearInterval(interval);
        //     console.log("[+] Module " + moduleName + " found!");
        //     Java.perform(function () {
        //         callback(new ImGUI());
        //     });
        if (Date.now() - startTime > timeoutMs) {
            clearInterval(interval);
            console.error("[-] Timeout waiting for module");
        }
    }, 5000);


}
export function LoadImGUI1(callback: Function, so_path: string, activity_name: string, timeoutMs = 100000) {
    var startTime = Date.now();
    var interval = setInterval(function () {
        var moduleName = "libimgui.so"
        var module = Process.findModuleByName("libimgui.so");
        if (module) {
            clearInterval(interval);
            console.log("[+] Module " + moduleName + " found!");
            Java.perform(function () {
                callback(new ImGUI());
            });
        } else if (Date.now() - startTime > timeoutMs) {
            clearInterval(interval);
            console.error("[-] Timeout waiting for module: " + moduleName);
        } else {
            Java.perform(function () {
                Java.choose(activity_name, {
                    onMatch: function (activity) {
                        Java.perform(function () {
                            Java.scheduleOnMainThread(function () {
                                loadImguiSo(so_path, activity);
                            });
                            // var Runnable = Java.use("java.lang.Runnable");
                            // // 注释掉的代码：用于获取ImGuiView类引用
                            // //var ImGuiView = Java.use("com.imgui.ImGuiView");
                            // // 注册一个新的自定义类MyRunnable，实现Runnable接口
                            // var MyRunnable = Java.registerClass({
                            //     name: 'com.imgui.MyRunnable',  // 类名
                            //     implements: [Runnable],          // 实现的接口
                            //     methods: {
                            //         // 实现run方法，这是Runnable接口要求的方法
                            //         run: function () {
                            //             // 加载libimgui.so库
                            //             loadImguiSo(so_path, activity)
                            //             //callback(new ImGUI())
                            //             // 再次加载libimgui.so模块
                            //             //var libimgui = Module.load("/data/data/com.pinkcore.heros/libimgui.so")
                            //             // 对libimgui进行hook操作
                            //             //hookImgui(libimgui)
                            //         }
                            //     }
                            // });
                            // // 提交到UI线程执行
                            // var runnable = MyRunnable.$new();
                            // activity.runOnUiThread(runnable);
                        });
                        //callback(new ImGUI())
                    },
                    onComplete: function () {

                    }
                });
            })
        }
    }, 1000);



    // Java.perform(function () {
    //     if (Process.findModuleByName("libimgui.so")) {
    //         return callback(new ImGUI())
    //     }
    //     var is_find_activity = false







    //     // 使用Java.choose方法查找指定的类实例
    //     Java.choose(activity_name, {
    //         // 当找到匹配的类实例时执行的回调函数
    //         onMatch: function (activity) {
    //             is_find_activity = true
    //             console.log(activity_name, activity)
    //             // 获取Runnable类引用
    //             var Runnable = Java.use("java.lang.Runnable");
    //             // 注释掉的代码：用于获取ImGuiView类引用
    //             //var ImGuiView = Java.use("com.imgui.ImGuiView");
    //             // 注册一个新的自定义类MyRunnable，实现Runnable接口
    //             var MyRunnable = Java.registerClass({
    //                 name: 'com.imgui.MyRunnable',  // 类名
    //                 implements: [Runnable],          // 实现的接口
    //                 methods: {
    //                     // 实现run方法，这是Runnable接口要求的方法
    //                     run: function () {
    //                         // 加载libimgui.so库
    //                         loadImguiSo(so_path, activity)
    //                         callback(new ImGUI())
    //                         // 再次加载libimgui.so模块
    //                         //var libimgui = Module.load("/data/data/com.pinkcore.heros/libimgui.so")
    //                         // 对libimgui进行hook操作
    //                         //hookImgui(libimgui)
    //                     }
    //                 }
    //             });
    //             // 提交到UI线程执行
    //             var runnable = MyRunnable.$new();
    //             activity.runOnUiThread(runnable);
    //         },
    //         onComplete: function () {
    //             if (!is_find_activity) {
    //                 // 没有找到匹配的类实例
    //                 console.log("[-] 没有找到 " + activity_name + " 类实例");
    //             }


    //         }
    //     });
    // })
}
export const ImGuiWindowFlags = {
    None: 0,
    NoTitleBar: 1 << 0,
    NoResize: 1 << 1,
    NoMove: 1 << 2,
    NoScrollbar: 1 << 3,
    NoScrollWithMouse: 1 << 4,
    NoCollapse: 1 << 5,
    AlwaysAutoResize: 1 << 6,
    NoBackground: 1 << 7,
    NoSavedSettings: 1 << 8,
    NoMouseInputs: 1 << 9,
    MenuBar: 1 << 10,
    HorizontalScrollbar: 1 << 11,
    NoFocusOnAppearing: 1 << 12,
    NoBringToFrontOnFocus: 1 << 13,
    AlwaysVerticalScrollbar: 1 << 14,
    AlwaysHorizontalScrollbar: 1 << 15,
    NoNavInputs: 1 << 16,
    NoNavFocus: 1 << 17,
    UnsavedDocument: 1 << 18,

    // 组合标志
    NoNav: (1 << 16) | (1 << 17),
    NoDecoration: (1 << 0) | (1 << 1) | (1 << 3) | (1 << 5),
    NoInputs: (1 << 9) | (1 << 16) | (1 << 17),

    // 内部标志
    ChildWindow: 1 << 24,
    Tooltip: 1 << 25,
    Popup: 1 << 26,
    Modal: 1 << 27,
    ChildMenu: 1 << 28,

    // 过时标志 (根据版本可能已废弃)
    NavFlattened: 1 << 29,
    AlwaysUseWindowPadding: 1 << 30
};

export const ImGuiCond =
{
    None: 0,        // No condition (always set the variable), same as _Always
    Always: 1 << 0,   // No condition (always set the variable), same as _None
    Once: 1 << 1,   // Set the variable once per runtime session (only the first call will succeed)
    FirstUseEver: 1 << 2,   // Set the variable if the object/window has no persistently saved data (no entry in .ini file)
    Appearing: 1 << 3,   // Set the variable if the object/window is appearing after being hidden/inactive (or the first time)
};
export const XMLDynamicBindType = {
    Float: 0,
    Int: 1,
    Bool: 2,
    Chars: 3
};

export type XMLDynamicBindType = typeof XMLDynamicBindType[keyof typeof XMLDynamicBindType];

interface FileConfigItem {
    value: any;
    type: XMLDynamicBindType;
}

interface ConfigItem {
    ptr: NativePointer | null;
    size: number;
    config: FileConfigItem;
}

// 2. 定义主配置结构（键名为任意 string）
export type ImGUIConfig = Record<string, ConfigItem>;
type FileConfig = Record<string, FileConfigItem>;

export class ImGUI {

    public config: ImGUIConfig = {}
    public libimgui: Module
    private __cxa_demangle: any;
    private Demangle: NativeFunction<NativePointer, [NativePointerValue, NativePointerValue, NativePointerValue, NativePointerValue]>;
    private demangledStatus: NativePointer;
    Begin: NativeFunction<number, [NativePointerValue, NativePointerValue, number]>;
    End: NativeFunction<void, []>;
    Text: NativeFunction<number, [NativePointerValue]>;
    Checkbox: NativeFunction<number, [NativePointerValue, NativePointerValue]>;
    SliderInt: NativeFunction<number, [NativePointerValue, NativePointerValue, number, number, NativePointerValue, number]>;
    RadioButton: NativeFunction<number, [NativePointerValue, NativePointerValue, number]>;
    SameLine: NativeFunction<number, [number, number]>;
    NewLine: NativeFunction<number, []>;
    SetNextItemWidth: NativeFunction<number, [number]>;
    IsWindowAppearing: NativeFunction<number, []>;
    SetWindowSize: NativeFunction<void, [NativePointerValue, number]>;
    SetWindowCollapsed: NativeFunction<void, [number, number]>;
    SetNextWindowCollapsed: NativeFunction<void, [number, number]>;
    IsWindowFocused: NativeFunction<number, [number]>;
    renderFrame: NativeFunction<void, [NativePointerValue]>;
    readXml: NativeFunction<void, [NativePointerValue]>;
    addDynamicBindFunction: NativeFunction<void, [NativePointerValue, NativePointerValue, number, number]>;
    configPath: string;
    timerId: any;











    constructor() {
        this.libimgui = Process.findModuleByName("libimgui.so") as Module;
        if (this.libimgui == null) {
            throw new Error("libimgui.so not found");
        }
        this.__cxa_demangle = this.libimgui.getExportByName('__cxa_demangle');
        this.Demangle = new NativeFunction(this.__cxa_demangle, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
        this.demangledStatus = Memory.alloc(0x4);
        this.Begin = new NativeFunction(this.getImGuiSymbol('ImGui::Begin('), 'bool', ['pointer', 'pointer', 'int'])
        this.End = new NativeFunction(this.getImGuiSymbol('ImGui::End('), 'void', [])
        this.Text = new NativeFunction(this.getImGuiSymbol('ImGui::Text('), 'bool', ['pointer'])
        this.Checkbox = new NativeFunction(this.getImGuiSymbol('ImGui::Checkbox('), 'bool', ['pointer', 'pointer'])
        this.SliderInt = new NativeFunction(this.getImGuiSymbol('ImGui::SliderInt('), 'bool', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int'])
        this.RadioButton = new NativeFunction(this.getImGuiSymbol('ImGui::RadioButton(char const*, int*, int)'), 'bool', ['pointer', 'pointer', 'int'])
        this.SameLine = new NativeFunction(this.getImGuiSymbol('ImGui::SameLine('), 'bool', ['float', 'float'])
        this.NewLine = new NativeFunction(this.getImGuiSymbol('ImGui::NewLine('), 'bool', [])
        this.SetNextItemWidth = new NativeFunction(this.getImGuiSymbol('ImGui::SetNextItemWidth('), 'bool', ['float'])
        this.IsWindowAppearing = new NativeFunction(this.getImGuiSymbol('ImGui::IsWindowAppearing('), 'bool', [])
        this.SetWindowSize = new NativeFunction(this.getImGuiSymbol('ImGui::SetWindowSize(ImVec2 const&, int)'), 'void', ['pointer', 'int'])
        this.SetWindowCollapsed = new NativeFunction(this.getImGuiSymbol('ImGui::SetWindowCollapsed(bool, int)'), 'void', ['bool', 'int'])
        this.SetNextWindowCollapsed = new NativeFunction(this.getImGuiSymbol('ImGui::SetNextWindowCollapsed(bool, int)'), 'void', ['bool', 'int'])
        this.IsWindowFocused = new NativeFunction(this.getImGuiSymbol('ImGui::IsWindowFocused('), 'bool', ['int'])
        this.renderFrame = new NativeFunction(this.libimgui.findSymbolByName('renderFrame') as NativePointerValue, 'void', ['pointer'])
        this.readXml = new NativeFunction(this.libimgui.findSymbolByName('readXml') as NativePointerValue, 'void', ['pointer'])
        this.addDynamicBindFunction = new NativeFunction(this.libimgui.findSymbolByName('addDynamicBind') as NativePointerValue, 'void', ['pointer', 'pointer', 'uint', 'int'])
        this.configPath = "";
        var that = this;
        // Interceptor.attach(this.libimgui.findExportByName('onDynamic') as NativePointer, {
        //     onEnter(args) {
        //         console.log("onDynamic:",args[0]);
        //         that.onDynamic(args[0]);
        //     },
        //     onLeave(retval) {
        //         console.log("readXml:",retval);
        //     }
        // })


        Interceptor.replace(this.libimgui.findExportByName('onDynamic') as NativePointer, new NativeCallback((name) => {
            var key = name.readUtf8String();
            if (key) {
                var type = this.config[key].config.type;
                if (type == XMLDynamicBindType.Int) {
                    this.config[key].config.value = this.config[key].ptr?.readUInt()
                }
                else if (type == XMLDynamicBindType.Float) {
                    this.config[key].config.value = this.config[key].ptr?.readFloat()
                }
                else if (type == XMLDynamicBindType.Bool) {
                    this.config[key].config.value = this.config[key].ptr?.readU8() == 1
                }
                else if (type == XMLDynamicBindType.Chars) {
                    this.config[key].config.value = this.config[key].ptr?.readUtf8String()
                }
                that.saveConfig();
                that.onDynamic(key);
            }

        }, 'void', ['pointer']))





        // Interceptor.attach(this.renderFrame, {
        //     onEnter(args) {
        //         this.Text(Memory.allocUtf8String('Welcome to the ImGui demo!1 '));
        //     }
        // });


        // 在Java环境中执行操作
        // Java.perform(function () {
        //     // 检查是否找到libimgui.so模块
        //     if (libimgui) {
        //         // 如果找到，则对ImGui模块进行hook操作
        //         //hookImgui(libimgui)
        //         // 输出找到模块的日志信息
        //         console.log("[*] libimgui.so found")
        //     } else {
        //         // 如果未找到，则查找Activity
        //         //findActivity()
        //     }
        // })
    }
    onDynamic(name: string) {

    }
    findImGuiSymbol(name: string) {
        const symbol = this.libimgui.enumerateExports().find((exp) => {
            const expName = Memory.allocUtf8String(exp.name);
            const realName = this.Demangle(expName, NULL, NULL, this.demangledStatus);
            if (this.demangledStatus.readU32() !== 0) return false;
            return realName.readCString()?.includes(name);
        });
        return symbol;
    }
    getImGuiSymbol(name: string) {
        const symbol = this.findImGuiSymbol(name);
        if (!symbol) throw new Error(`Symbol ${name} not found`);
        return symbol.address;
    }
    readConfig(filePath: string) {
        this.configPath = filePath;
        try {
            var file = new File(filePath, "rb");
            var config: FileConfig = JSON.parse(file.readText());
            for (const key in config) {
                this.config[key] = { ptr: null, size: 0, config: config[key] };
            }
        } catch (error) {

        }
    }
    saveConfig() {
        if (this.configPath) {
            if (this.timerId) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.timerId = null
                var file = new File(this.configPath, "wb");
                var config: FileConfig = {};
                for (const key in this.config) {
                    config[key] = this.config[key].config;
                }
                file.write(JSON.stringify(config));
            }, 2000)
        }

    }

    addDynamicBind(name: string, type: XMLDynamicBindType, default_value: any) {
        if (this.config[name] == null) {
            this.config[name] = { ptr: null, size: 0, config: { value: default_value, type: type } }
        }
        if (type == XMLDynamicBindType.Int || type == XMLDynamicBindType.Float) {
            if (typeof default_value !== 'number') {
                throw new Error("默认值错误，请输入数字");
            }
            if (typeof this.config[name].config.value !== 'number') {
                this.config[name].config.value = default_value
                console.log("默认值错误，已经修改成默认");
            }
        }
        if (type == XMLDynamicBindType.Bool) {

            if (typeof default_value !== 'boolean') {
                throw new Error("默认值错误，请输入布尔值");
            }
            if (typeof this.config[name].config.value !== 'boolean') {
                this.config[name].config.value = default_value
                console.log("默认值错误，已经修改成默认");
            }
        }
        if (type == XMLDynamicBindType.Chars) {
            if (typeof default_value !== 'string') {
                throw new Error("默认值错误，请输入字符串");
            }
            if (typeof this.config[name].config.value !== 'string') {
                this.config[name].config.value = default_value
                console.log("默认值错误，已经修改成默认");
            }
        }
        var malloc = new NativeFunction(<NativePointer>Module.findGlobalExportByName("malloc"), 'pointer', ['ulong']);
        //var malloc = Memory.alloc
        if (type == XMLDynamicBindType.Int) {
            this.config[name].size = Int32Array.BYTES_PER_ELEMENT
            this.config[name].ptr = malloc(this.config[name].size).writeInt(this.config[name].config.value)
        } else if (type == XMLDynamicBindType.Bool) {
            this.config[name].size = Uint8Array.BYTES_PER_ELEMENT
            this.config[name].ptr = malloc(this.config[name].size).writeU8(this.config[name].config.value ? 1 : 0)
        } else if (type == XMLDynamicBindType.Float) {
            this.config[name].size = Float32Array.BYTES_PER_ELEMENT
            this.config[name].ptr = malloc(this.config[name].size).writeFloat(this.config[name].config.value)
        } else if (type == XMLDynamicBindType.Chars) {
            this.config[name].size = 1024
            this.config[name].ptr = malloc(this.config[name].size).writeUtf8String(this.config[name].config.value)
        }
        if (this.config[name].ptr) {
            this.addDynamicBindFunction(Memory.allocUtf8String(name), this.config[name].ptr, this.config[name].size, this.config[name].config.type)
        }
    }
}

