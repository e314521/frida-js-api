import Java from "frida-java-bridge";
function loadImguiSo(path, activity) {
    try {
        // 方法1：使用 System.load（推荐，支持完整路径）
        var System = Java.use("java.lang.System");
        System.load(path);
        Java.use("com.imgui.ImGuiView").$new(activity);
        
    } catch (e) {
        console.log("[-] System.load 失败: " + e);
    }
}
export function LoadImGUI(callback: Function, so_path: string, activity_name: string) {
    Java.perform(function () {
        if (Process.findModuleByName("libimgui.so")){
            return callback(new ImGUI())
        }

        // 使用Java.choose方法查找指定的类实例
        Java.choose(activity_name, {
            // 当找到匹配的类实例时执行的回调函数
            onMatch: function (activity) {
                console.log(activity_name, activity)
                // 获取Runnable类引用
                var Runnable = Java.use("java.lang.Runnable");
                // 注释掉的代码：用于获取ImGuiView类引用
                //var ImGuiView = Java.use("com.imgui.ImGuiView");
                // 注册一个新的自定义类MyRunnable，实现Runnable接口
                var MyRunnable = Java.registerClass({
                    name: 'com.imgui.MyRunnable',  // 类名
                    implements: [Runnable],          // 实现的接口
                    methods: {
                        // 实现run方法，这是Runnable接口要求的方法
                        run: function () {
                            // 加载libimgui.so库
                            loadImguiSo(so_path, activity)
                            callback(new ImGUI())
                            // 再次加载libimgui.so模块
                            //var libimgui = Module.load("/data/data/com.pinkcore.heros/libimgui.so")
                            // 对libimgui进行hook操作
                            //hookImgui(libimgui)
                        }
                    }
                });
                // 提交到UI线程执行
                var runnable = MyRunnable.$new();
                activity.runOnUiThread(runnable);
            },
            onComplete: function () {

            }
        });
    })
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
    None          : 0,        // No condition (always set the variable), same as _Always
    Always        : 1 << 0,   // No condition (always set the variable), same as _None
    Once          : 1 << 1,   // Set the variable once per runtime session (only the first call will succeed)
    FirstUseEver  : 1 << 2,   // Set the variable if the object/window has no persistently saved data (no entry in .ini file)
   Appearing     : 1 << 3,   // Set the variable if the object/window is appearing after being hidden/inactive (or the first time)
};
export class ImGUI {
    private libimgui: Module
    private __cxa_demangle: any;
    private Demangle: NativeFunction<NativePointer, [NativePointerValue, NativePointerValue, NativePointerValue, NativePointerValue]>;
    private demangledStatus: NativePointer;
    renderFrame: any;
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
    
    


    

    




    constructor() {
        this.libimgui = Process.findModuleByName("libimgui.so")
        if (this.libimgui == null) {
            throw new Error("libimgui.so not found");
        }
        this.__cxa_demangle = this.libimgui.getExportByName('__cxa_demangle');
        this.Demangle = new NativeFunction(this.__cxa_demangle, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
        this.demangledStatus = Memory.alloc(0x4);
        this.Begin = new NativeFunction(this.getImGuiSymbol('ImGui::Begin('), 'bool', ['pointer', 'pointer', 'int'])
        this.End = new NativeFunction(this.getImGuiSymbol('ImGui::End('), 'void', [])
        this.Text = new NativeFunction(this.getImGuiSymbol('ImGui::Text('), 'bool', ['pointer'])
        this.Checkbox = new NativeFunction(this.getImGuiSymbol('ImGui::Checkbox('), 'bool', ['pointer','pointer'])
        this.SliderInt = new NativeFunction(this.getImGuiSymbol('ImGui::SliderInt('), 'bool', ['pointer','pointer', 'int', 'int','pointer', 'int'])
        this.RadioButton = new NativeFunction(this.getImGuiSymbol('ImGui::RadioButton(char const*, int*, int)'), 'bool', ['pointer','pointer', 'int'])
        this.SameLine = new NativeFunction(this.getImGuiSymbol('ImGui::SameLine('), 'bool', ['float','float'])
        this.NewLine = new NativeFunction(this.getImGuiSymbol('ImGui::NewLine('), 'bool', [])
        this.SetNextItemWidth = new NativeFunction(this.getImGuiSymbol('ImGui::SetNextItemWidth('), 'bool', ['float'])
        this.IsWindowAppearing = new NativeFunction(this.getImGuiSymbol('ImGui::IsWindowAppearing('), 'bool', [])
        this.SetWindowSize = new NativeFunction(this.getImGuiSymbol('ImGui::SetWindowSize(ImVec2 const&, int)'), 'void', ['pointer', 'int'])
        this.SetWindowCollapsed = new NativeFunction(this.getImGuiSymbol('ImGui::SetWindowCollapsed(bool, int)'), 'void', ['bool', 'int'])
        this.SetNextWindowCollapsed = new NativeFunction(this.getImGuiSymbol('ImGui::SetNextWindowCollapsed(bool, int)'), 'void', ['bool', 'int'])
        this.IsWindowFocused = new NativeFunction(this.getImGuiSymbol('ImGui::IsWindowFocused('), 'bool', ['int'])
  
        
        this.renderFrame = new NativeFunction(this.libimgui.findSymbolByName('renderFrame'), 'void', [])
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
}