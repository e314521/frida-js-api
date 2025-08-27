function dump_dex() {
    var libart = Process.findModuleByName("libart.so");
    if (libart == null) {
        console.log("not found libart.so");
        return;
    }
    var addr_DefineClass:NativePointer | null = null;
    var symbols = libart.enumerateSymbols();
    for (var index = 0; index < symbols.length; index++) {
        var symbol = symbols[index];
        var symbol_name = symbol.name;
        //这个DefineClass的函数签名是Android9的
        //_ZN3art11ClassLinker11DefineClassEPNS_6ThreadEPKcmNS_6HandleINS_6mirror11ClassLoaderEEERKNS_7DexFileERKNS9_8ClassDefE
        if (symbol_name.indexOf("ClassLinker") >= 0 &&
            symbol_name.indexOf("DefineClass") >= 0 &&
            symbol_name.indexOf("Thread") >= 0 &&
            symbol_name.indexOf("DexFile") >= 0) {
            console.log(symbol_name, symbol.address);
            addr_DefineClass = symbol.address;
        }
    }
    var dex_maps = {};
    var dex_count = 1;

    console.log("[DefineClass:]", addr_DefineClass);
    if (addr_DefineClass) {
        Interceptor.attach(addr_DefineClass, {
            onEnter: function(args) {
                var dex_file = args[5];
                var base = dex_file.add(Process.pointerSize).readPointer();
                var size = dex_file.add(Process.pointerSize + Process.pointerSize).readUInt();
                var dex_name = base.toString()
                if (dex_maps[dex_name] == undefined) {
                    dex_maps[dex_name] = size;
                    var magic = base.readCString();
                    if (magic.indexOf("dex") == 0) {
                        console.log("[find dex]:", dex_name, dex_count);
                        var dex_buffer = base.readByteArray(size);
                        dex_count++;

                        /*var process_name = get_self_process_name();
                        if (process_name != "-1") {
                            var dex_dir_path = "/data/data/" + process_name + "/files/dump_dex_" + process_name;
                            mkdir(dex_dir_path);
                            var dex_path = dex_dir_path + "/class" + (dex_count == 1 ? "" : dex_count) + ".dex";
                            console.log("[find dex]:", dex_path);
                            var fd = new File(dex_path, "wb");
                            if (fd && fd != null) {
                                dex_count++;
                                var dex_buffer = ptr(base).readByteArray(size);
                                fd.write(dex_buffer);
                                fd.flush();
                                fd.close();
                                console.log("[dump dex]:", dex_path);

                            }
                        }*/
                    }
                }
                
            },
            onLeave: function(retval) {}
        });
    }
}

export { dump_dex }