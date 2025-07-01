"use strict";
(() => {
  // utils/dmlog.ts
  var DMLog = class _DMLog {
    static bDebug = true;
    static d(tag, str) {
      if (this.bDebug) {
        _DMLog.log_(console.log, "DEBUG", tag, str);
      }
    }
    static i(tag, str) {
      _DMLog.log_(console.log, "INFO", tag, str);
    }
    static w(tag, str) {
      _DMLog.log_(console.warn, "WARN", tag, str);
    }
    static e(tag, str) {
      _DMLog.log_(console.error, "ERROR", tag, str);
    }
    static log_(logfunc, leval, tag, str) {
      let threadName = "";
      if (Java.available) {
        Java.perform(() => {
          const Thread2 = Java.use("java.lang.Thread");
          threadName = `[${Thread2.currentThread().getName()}]`;
        });
      }
      logfunc(`[${leval}][${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN")}][PID:${Process.id}]${threadName}[${Process.getCurrentThreadId()}][${tag}]: ${str}`);
    }
    static send(tag, content) {
      let tid = Process.getCurrentThreadId();
      send(JSON.stringify({
        tid,
        status: "msg",
        tag,
        content
      }));
    }
  };

  // utils/android/unpack/fridaUnpack.js
  var fridaUnpack = class {
    static DEX_MAGIC = 175662436;
    static dexrec = [];
    static unpack_common() {
      var exportMethods = Module.enumerateExportsSync("libart.so");
      exportMethods.forEach(function(expmthd) {
        if (expmthd.name.indexOf("OpenCommon") > -1 || expmthd.name.indexOf("OpenMemory") > -1) {
          console.log("unpack_common: " + JSON.stringify(expmthd));
          Interceptor.attach(expmthd.address, {
            onEnter: function(args) {
              if (Memory.readU32(args[1]) == DEX_MAGIC) {
                dexrec.push(args[1]);
              }
            }
          });
        }
      });
      if (Java.available) {
        Java.perform(function() {
          var dexBase64 = "ZGV4CjAzNQCjsh5+52qOBRMl1aMHk33QkLmfsSbOla5wDwAAcAAAAHhWNBIAAAAAAAAAAKAOAABpAAAAcAAAABwAAAAUAgAAGgAAAIQCAAABAAAAvAMAACUAAADEAwAAAQAAAOwEAABkCgAADAUAAAwFAAAPBQAAEgUAABcFAAAfBQAAIwUAADgFAABGBQAASQUAAE0FAABSBQAAVQUAAFkFAABeBQAAYwUAAHcFAACXBQAAtgUAAM8FAADiBQAA+AUAABEGAAAoBgAATAYAAG4GAACCBgAAlgYAALEGAADIBgAA4wYAAP4GAAAaBwAAMQcAAEgHAABzBwAAjAcAAKUHAADSBwAA6AcAAPoHAAD/BwAAAggAAAYIAAAKCAAADQgAABEIAAAlCAAAOggAAE8IAABsCAAAcQgAAHkIAACGCAAAlQgAAKAIAACnCAAAqggAALcIAADKCAAA0wgAANYIAADaCAAA4wgAAPEIAAD5CAAAAAkAAAsJAAAQCQAAGgkAACwJAABDCQAAVQkAAGkJAAB0CQAAfQkAAI0JAACgCQAArwkAAMAJAADJCQAAzAkAANQJAADeCQAA7AkAAPoJAAAFCgAADQoAABYKAAAcCgAAJgoAACwKAAA5CgAAQQoAAEcKAABQCgAAWgoAAGsKAABzCgAAggoAAIgKAACOCgAAlwoAAKAKAACqCgAAwAoAAAcAAAAOAAAADwAAABAAAAARAAAAEgAAABQAAAAVAAAAFgAAABcAAAAYAAAAGQAAABoAAAAbAAAAHAAAAB0AAAAeAAAAHwAAACIAAAAjAAAAJQAAACYAAAAoAAAAKwAAAC0AAAAuAAAALwAAADAAAAAHAAAAAAAAAAAAAAAIAAAAAAAAAMgKAAAJAAAAAAAAAAgLAAAKAAAABQAAAAAAAAALAAAABQAAAOgKAAAKAAAACgAAAAAAAAALAAAACgAAAMgKAAAMAAAACgAAANAKAAANAAAACgAAANgKAAANAAAACgAAAOAKAAAKAAAACwAAAAAAAAALAAAADAAAAOgKAAALAAAADwAAAOgKAAALAAAAEQAAAPAKAAAKAAAAEwAAAAAAAAAKAAAAFAAAAAAAAAAoAAAAFgAAAAAAAAApAAAAFgAAAPAKAAApAAAAFgAAAPgKAAAqAAAAFgAAAAALAAArAAAAFwAAAAAAAAAsAAAAFwAAAMgKAAAKAAAAGAAAAAAAAAALAAAAGQAAABALAAALAAAAGgAAAPAKAAAKAAAAGwAAAAAAAAACAAsAJwAAAAEAAgA3AAAAAgAQAAMAAAACAA0ARAAAAAIAGABFAAAAAgAIAEoAAAACABEAUwAAAAQADgA9AAAABQAMAEYAAAAFABkARwAAAAUACgBJAAAABQADAEwAAAAGAAQAVAAAAAgAEABfAAAACQAQAF8AAAAKABAAAwAAAAoAAwBDAAAACwAVAD8AAAAMABAAAwAAAAwACwAyAAAADAAKAGYAAAAOAAcAQgAAAA4AAQBIAAAADwAGAEIAAAAPABMAYQAAABAACgBJAAAAEAAWAEsAAAAQAAkAUAAAABEAEAADAAAAEQAVADEAAAARAA8AUQAAABEAAABiAAAAEQAXAGUAAAASABIAYwAAABMAFABNAAAAEwAFAFoAAAAUABQATgAAABQABQBZAAAAAgAAAAEAAAAKAAAAAAAAAAUAAAA8CwAAhA4AABYLAAABKAABKQADLS0+AAY8aW5pdD4AAj47ABNFbnVtZXJhdGVDbGFzcy5qYXZhAAxGUmlEQV9VTlBBQ0sAAUkAAklMAANJTEwAAUwAAkxMAANMTEkAA0xMTAASTGFuZHJvaWQvdXRpbC9Mb2c7AB5MY29tL3NtYXJ0ZG9uZS9FbnVtZXJhdGVDbGFzczsAHUxkYWx2aWsvYW5ub3RhdGlvbi9TaWduYXR1cmU7ABdMZGFsdmlrL3N5c3RlbS9EZXhGaWxlOwARTGphdmEvbGFuZy9DbGFzczsAFExqYXZhL2xhbmcvQ2xhc3M8Kj47ABdMamF2YS9sYW5nL0NsYXNzTG9hZGVyOwAVTGphdmEvbGFuZy9FeGNlcHRpb247ACJMamF2YS9sYW5nL0lsbGVnYWxBY2Nlc3NFeGNlcHRpb247ACBMamF2YS9sYW5nL05vU3VjaEZpZWxkRXhjZXB0aW9uOwASTGphdmEvbGFuZy9PYmplY3Q7ABJMamF2YS9sYW5nL1N0cmluZzsAGUxqYXZhL2xhbmcvU3RyaW5nQnVpbGRlcjsAFUxqYXZhL2xhbmcvVGhyb3dhYmxlOwAZTGphdmEvbGFuZy9yZWZsZWN0L0FycmF5OwAZTGphdmEvbGFuZy9yZWZsZWN0L0ZpZWxkOwAaTGphdmEvbGFuZy9yZWZsZWN0L01ldGhvZDsAFUxqYXZhL3V0aWwvQXJyYXlMaXN0OwAVTGphdmEvdXRpbC9BcnJheUxpc3Q8AClMamF2YS91dGlsL0FycmF5TGlzdDxMamF2YS9sYW5nL1N0cmluZzs+OwAXTGphdmEvdXRpbC9Db2xsZWN0aW9uczsAF0xqYXZhL3V0aWwvRW51bWVyYXRpb247ACtMamF2YS91dGlsL0VudW1lcmF0aW9uPExqYXZhL2xhbmcvU3RyaW5nOz47ABRMamF2YS91dGlsL0l0ZXJhdG9yOwAQTGphdmEvdXRpbC9MaXN0OwADVEFHAAFWAAJWTAACVloAAVoAAlpMABJbTGphdmEvbGFuZy9DbGFzczsAE1tMamF2YS9sYW5nL09iamVjdDsAE1tMamF2YS9sYW5nL1N0cmluZzsAG1tMamF2YS9sYW5nL3JlZmxlY3QvTWV0aG9kOwADYWRkAAZhcHBlbmQAC2NsYXNzTG9hZGVyAA1jbGFzc05hbWVMaXN0AAljbGFzc2xpc3QABWNsYXp6AAFkAAtkZXhFbGVtZW50cwARZGV4RWxlbWVudHNMZW5ndGgAB2RleEZpbGUAAWUAAmUyAAdlbnRyaWVzAAxlbnVtZXJhdGlvbnMABmVxdWFscwAFZmllbGQACWZpZWxkTmFtZQADZ2V0AAhnZXRDbGFzcwAQZ2V0Q2xhc3NOYW1lTGlzdAAVZ2V0Q2xhc3NOYW1lTGlzdEFycmF5ABBnZXREZWNsYXJlZEZpZWxkABJnZXREZWNsYXJlZE1ldGhvZHMACWdldExlbmd0aAAHZ2V0TmFtZQAOZ2V0T2JqZWN0RmllbGQAEWdldFBhcmFtZXRlclR5cGVzAA1nZXRTdXBlcmNsYXNzAA9oYXNNb3JlRWxlbWVudHMAB2hhc05leHQAAWkABmludm9rZQAIaXRlcmF0b3IADGxvYWQgY2xhc3M6IAAMbG9hZEFsbENsYXNzAAlsb2FkQ2xhc3MABm1ldGhvZAAHbWV0aG9kcwAEbmFtZQAIbmFtZWxpc3QABG5leHQAC25leHRFbGVtZW50AAZvYmplY3QABG9ianMAB3Bhcm1sZW4ACHBhdGhMaXN0AA9wcmludFN0YWNrVHJhY2UABnJldHZhbAANc2V0QWNjZXNzaWJsZQAEc2l6ZQAEc29ydAAHc3VjY2VzcwAHdG9BcnJheQAIdG9TdHJpbmcAFHRyeSB0byBsb2FkIG1ldGhvZDogAAV2YWx1ZQAAAQAAAAoAAAACAAAACgAAAAIAAAAKAAsAAgAAAAoAGQABAAAACwAAAAEAAAAGAAAAAQAAABUAAAABAAAAFwAAAAIAAAALAAsAAQAAABkAARcGAgMBaBwGFwAXFBcBFyAXGRcEAAAAAAAAAAAAAQAAABkLAAAAAAAAAAAAAAEAAAAAAAAAAgAAADQLAAAOAA4AJAE0DlsEADUSIsMDATkLSwMCOgEdAwNQAS3/BAQ/FCVpoQUEQgUBBQIFAxwfPAA1ATQOSwQAWRIiaQMBYRs8ABMCXEIOSwMANwYBEBBLAwFBEEtdBQEeAwE9CTsFARkeAwE8CjxNBQEfAD0BNA5LBAA2EiL/AwJYDEsEAzcGFEsDBFccARoPaQMHVhFaAwheAS0DCV0aASYPSwJ7dwUHBQgFCUIFAgUDBQQgBQAbIAABAAEAAQAAAFQLAAAEAAAAcBAOAAAADgAHAAEAAgABAFgLAABBAAAAIgARAHAQGwAAABoBXgBxIAQAFgAMARoCOABxIAQAIQAMAXEQFQABAAoCEgM1IyUAcSAUADEADAQaBToAcSAEAFQADAQfBAQAbhAGAAQADARyECEABAAKBTgFDAByECIABAAMBR8FCwBuIBwAUAAo8dgDAwEo3CgCDQFxECAAAAARAAAABQAAADIAAQABAQc8AwABAAIAAACHCwAADgAAAHEQAgACAAwAbhAeAAAACgEjERoAbiAfABAAEQEFAAIAAgABAJgLAAAxAAAAbhAPAAMADABuEAkAAAAMARwCCgBuEAkAAgAMAm4gEAAhAAoBOQEdAG4gBwBAAAwBEhJuIBcAIQBuIBYAMQAMAhECDQFuEAwAAQAoCQ0BbhANAAEAbhAKAAAADAAo1hIBEQEAABQAAAAMAAEAAQIJJgghAAAOAAEAAwABAMILAAB7AAAAcRACAA0ADABuEB0AAAAMAXIQIwABAAoCOAJsAHIQJAABAAwCHwILAG4gCwAtAAwDbhAIAAMADAQaBQYAIgYMAHAQEQAGABoHUgBuIBIAdgBuEAkAAwAMB24gEgB2AG4QEwAGAAwGcSAAAGUAIUUSBjVWPwBGBwQGbhAZAAcADAghiCOJGQAaCgYAIgsMAHAQEQALABoMZwBuIBIAywBuEAkAAwAMDG4gEgDLABoMAgBuIBIAywBuEBgABwAMDG4gEgDLAG4QEwALAAwLcSAAALoAEgpuMBoApwkaCgYAGgtkAHEgAAC6ANgGBgEowiiRKAINAA4AAAAAAAAAdAABAAEBDXkBAAUAABoBgYAEiBgBCaAYAQnAGQEJ7BkBCfAaEQAAAAAAAAABAAAAAAAAAAEAAABpAAAAcAAAAAIAAAAcAAAAFAIAAAMAAAAaAAAAhAIAAAQAAAABAAAAvAMAAAUAAAAlAAAAxAMAAAYAAAABAAAA7AQAAAIgAABpAAAADAUAAAEQAAAKAAAAyAoAAAUgAAABAAAAFgsAAAQgAAABAAAAGQsAAAMQAAADAAAALAsAAAYgAAABAAAAPAsAAAMgAAAFAAAAVAsAAAEgAAAFAAAACAwAAAAgAAABAAAAhA4AAAAQAAABAAAAoA4AAA==";
          var application = Java.use("android.app.Application");
          var BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
          var Base64 = Java.use("android.util.Base64");
          var FileOutputStream = Java.use("java.io.FileOutputStream");
          var DexClassLoader = Java.use("dalvik.system.DexClassLoader");
          var reflectField = Java.use("java.lang.reflect.Field");
          var reflectMethod = Java.use("java.lang.reflect.Method");
          var reflectObject = Java.use("java.lang.Object");
          var reflectClass = Java.use("java.lang.Class");
          var reflectString = Java.use("java.lang.String");
          var reflectClassloader = Java.use("java.lang.ClassLoader");
          if (application != void 0) {
            application.attach.overload("android.content.Context").implementation = function(context) {
              var result = this.attach(context);
              var classloader = context.getClassLoader();
              var filesDir = context.getFilesDir();
              var codeCacheDir = context.getCodeCacheDir();
              console.log("files dir: " + filesDir);
              console.log("code cache dir: " + codeCacheDir);
              if (classloader != void 0) {
                var casedloader = Java.cast(classloader, BaseDexClassLoader);
                var dexbytes = Base64.decode(dexBase64, 0);
                var dexpath = filesDir + "/emmm.dex";
                var fout = FileOutputStream.$new(dexpath);
                fout.write(dexbytes, 0, dexbytes.length);
                fout.close();
                console.log("write dex to " + dexpath);
                var dexstr = dexpath.toString();
                var cachestr = codeCacheDir.toString();
                var dyndex = DexClassLoader.$new(dexstr, cachestr, cachestr, classloader);
                console.log(dyndex.toString());
                var EnumerateClass = dyndex.loadClass("com.smartdone.EnumerateClass");
                var castedEnumerateClass = Java.cast(EnumerateClass, reflectClass);
                var methods = castedEnumerateClass.getDeclaredMethods();
                var loadAllClass = void 0;
                for (var i in methods) {
                  console.log(methods[i].getName());
                  if (methods[i].getName() == "loadAllClass") {
                    console.log("find loadAllClass");
                    loadAllClass = methods[i];
                  }
                }
                if (loadAllClass != void 0) {
                  console.log("loadAllClass: " + loadAllClass.toString());
                  var args = Java.array("Ljava.lang.Object;", [classloader]);
                  var classlist = loadAllClass.invoke(null, args);
                  console.log("start dump dex ");
                  for (var i in dexrec) {
                    if (Memory.readU32(dexrec[i]) == DEX_MAGIC) {
                      var dex_len = Memory.readU32(dexrec[i].add(32));
                      var dumppath = filesDir.toString() + "/" + dex_len.toString(16) + ".dex";
                      console.log(dumppath);
                      var dumpdexfile = new File(dumppath, "wb");
                      dumpdexfile.write(Memory.readByteArray(dexrec[i], dex_len));
                      dumpdexfile.close();
                      console.log("write file to " + dumppath);
                    }
                  }
                  console.log("End dump dex ");
                }
              } else {
                console.error("unable get classloader");
              }
              return result;
            };
          } else {
            console.error("application is null");
          }
        });
      }
    }
  };

  // utils/StdString.ts
  var STD_STRING_SIZE = 3 * Process.pointerSize;
  var StdString = class {
    handle;
    constructor() {
      this.handle = Memory.alloc(STD_STRING_SIZE);
    }
    dispose() {
      const [data, isTiny] = this._getData();
      if (!isTiny) {
        Java.api.$delete(data);
      }
    }
    disposeToString() {
      const result = this.toString();
      this.dispose();
      return result;
    }
    toString() {
      const [data] = this._getData();
      return data.readUtf8String();
    }
    _getData() {
      const str = this.handle;
      const isTiny = (str.readU8() & 1) === 0;
      const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
      return [data, isTiny];
    }
  };

  // utils/FCCommon.ts
  var FCCommon;
  ((FCCommon2) => {
    function showStacksModInfo(context, number) {
      var sp = context.sp;
      for (var i = 0; i < number; i++) {
        var curSp = sp.add(Process.pointerSize * i);
        DMLog.i("showStacksModInfo", "curSp: " + curSp + ", val: " + curSp.readPointer() + ", module: " + FCCommon2.getModuleByAddr(curSp.readPointer()));
      }
    }
    FCCommon2.showStacksModInfo = showStacksModInfo;
    function getModuleByAddr(addr) {
      var result = null;
      Process.enumerateModules().forEach(function(module) {
        if (module.base <= addr && addr <= module.base.add(module.size)) {
          result = JSON.stringify(module);
          return false;
        }
      });
      return result;
    }
    FCCommon2.getModuleByAddr = getModuleByAddr;
    function getLR(context) {
      if (Process.arch == "arm") {
        return context.lr;
      } else if (Process.arch == "arm64") {
        return context.lr;
      } else {
        DMLog.e("getLR", "not support current arch: " + Process.arch);
      }
      return ptr(0);
    }
    FCCommon2.getLR = getLR;
    function dump_module(moduleName, saveDir) {
      const tag = "dump_module";
      const module = Process.getModuleByName(moduleName);
      const base = module.base;
      const size = module.size;
      const savePath = saveDir + "/" + moduleName + "_" + base + "_" + size + ".fcdump";
      DMLog.i(tag, "base: " + base + ", size: " + size);
      DMLog.i(tag, "save path: " + savePath);
      Memory.protect(base, size, "rwx");
      let readed = base.readByteArray(size);
      try {
        const f = new File(savePath, "wb");
        if (f) {
          if (readed) {
            f.write(readed);
            f.flush();
          }
          f.close();
        }
      } catch (e) {
        const fopen_ptr = Module.getExportByName(null, "fopen");
        const fwrite_ptr = Module.getExportByName(null, "fwrite");
        const fclose_ptr = Module.getExportByName(null, "fclose");
        if (fopen_ptr && fwrite_ptr && fclose_ptr) {
          const fopen_func = new NativeFunction(fopen_ptr, "pointer", ["pointer", "pointer"]);
          const fwrite_func = new NativeFunction(fwrite_ptr, "int", ["pointer", "int", "int", "pointer"]);
          const fclose_func = new NativeFunction(fclose_ptr, "int", ["pointer"]);
          let savePath_ptr = Memory.alloc(savePath.length + 1);
          savePath_ptr.writeUtf8String(savePath);
          const f = fopen_func(savePath_ptr, Memory.alloc(3).writeUtf8String("wb"));
          DMLog.i(tag, "fopen: " + f);
          if (f != null && readed) {
            const readed_ptr = Memory.alloc(readed.byteLength);
            readed_ptr.writeByteArray(readed);
            fwrite_func(readed_ptr, readed.byteLength, 1, f);
            fclose_func(f);
          } else {
            DMLog.e(tag, "failed: f->" + f + ", readed->" + readed);
          }
        }
      }
    }
    FCCommon2.dump_module = dump_module;
    function dump2file(addr, size, savePath) {
      DMLog.i("dump2file", `addr: ${addr.toString(16)}, size: ${size}`);
      let file = new File(savePath, "w+");
      let byteArr = addr.readByteArray(size);
      if (null != byteArr) {
        file.write(byteArr);
      }
      file.close();
    }
    FCCommon2.dump2file = dump2file;
    function printModules() {
      Process.enumerateModules().forEach(function(module) {
        DMLog.i("enumerateModules", JSON.stringify(module));
      });
    }
    FCCommon2.printModules = printModules;
    function str2hexstr(str) {
      let res = str.split("").map((x) => x.charCodeAt(0).toString(16).padStart(2, "0")).join("");
      return res;
    }
    FCCommon2.str2hexstr = str2hexstr;
    function str2hexArray(str) {
      return str.split("").map((x) => x.charCodeAt(0));
    }
    FCCommon2.str2hexArray = str2hexArray;
    function arrayBuffer2Hex(buf) {
      return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join(" ");
    }
    FCCommon2.arrayBuffer2Hex = arrayBuffer2Hex;
    function stalkerTrace(moduleName, address) {
      const tag = "stalkerTrace";
      let module_object = Process.findModuleByName(moduleName);
      if (null == module_object) {
        DMLog.e(tag, "module is null");
        return;
      }
      const module_start = module_object.base;
      const module_end = module_object.base.add(module_object.size);
      let pre_regs = {};
      Process.enumerateModules().forEach(function(md) {
        if (md.name != moduleName) {
          let memoryRange = { base: md.base, size: md.size };
          Stalker.exclude(memoryRange);
        }
      });
      let threadId = Process.getCurrentThreadId();
      Interceptor.attach(address, {
        onEnter: function(args) {
          this.tid = threadId;
          if (threadId == this.threadId) {
            this.startFollow = true;
            Stalker.follow(this.tid, {
              events: {
                call: true,
                ret: false,
                exec: true,
                block: false,
                compile: false
              },
              transform(iterator) {
                let instruction = iterator.next();
                do {
                  const startAddress = instruction.address;
                  const isModuleCode = startAddress.compare(module_start) >= 0 && startAddress.compare(module_end) === -1;
                  if (isModuleCode) {
                    iterator.putCallout(function(context) {
                      let pc = context.pc;
                      let module = Process.findModuleByAddress(pc);
                      if (module) {
                        try {
                          let diff_regs = get_diff_regs(context, pre_regs);
                          if (module.name == module_object?.name) {
                            DMLog.i(tag, `${module.name} ! ${pc.sub(module.base)} ${Instruction.parse(pc)} ${JSON.stringify(diff_regs)}`);
                          }
                        } catch (e) {
                          DMLog.e(tag, e.toString());
                        }
                      }
                    });
                  }
                  iterator.keep();
                } while ((instruction = iterator.next()) != null);
              }
            });
          }
        },
        onLeave: function(retval) {
          if (this.startFollow != void 0 && this.startFollow == true) {
            Stalker.unfollow(this.tid);
            this.startFollow = false;
          }
        }
      });
    }
    FCCommon2.stalkerTrace = stalkerTrace;
    function get_diff_regs(context, pre_regs) {
      var diff_regs = {};
      for (const [reg_name, reg_value] of Object.entries(JSON.parse(JSON.stringify(context)))) {
        if (reg_name != "pc" && pre_regs[reg_name] !== reg_value) {
          pre_regs[reg_name] = reg_value;
          diff_regs[reg_name] = reg_value;
        }
      }
      return diff_regs;
    }
    FCCommon2.get_diff_regs = get_diff_regs;
    function newStdString() {
      return new StdString();
    }
    FCCommon2.newStdString = newStdString;
    function copyFile(srcPath, dstPath) {
      let tmp = File.readAllBytes(srcPath);
      File.writeAllBytes(dstPath, tmp);
    }
    FCCommon2.copyFile = copyFile;
  })(FCCommon || (FCCommon = {}));

  // utils/android/repinning.js
  var sslPinningPass = class {
    static ssl_load_cert(cerPath) {
      Java.perform(function() {
        console.log("");
        console.log("[.] Cert Pinning Bypass/Re-Pinning");
        var cf = null;
        var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
        var FileInputStream = Java.use("java.io.FileInputStream");
        var BufferedInputStream = Java.use("java.io.BufferedInputStream");
        var X509Certificate = Java.use("java.security.cert.X509Certificate");
        var KeyStore = Java.use("java.security.KeyStore");
        var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        console.log("[+] Loading our CA...");
        cf = CertificateFactory.getInstance("X.509");
        try {
          var fileInputStream = FileInputStream.$new(cerPath);
          console.log("[i] fileInputStream: " + fileInputStream);
        } catch (err) {
          console.log("[o] " + err);
        }
        console.log("[i] BufferedInputStream: " + BufferedInputStream);
        var bufferedInputStream = BufferedInputStream.$new(fileInputStream);
        console.log("[i] ===========");
        var ca = cf.generateCertificate(bufferedInputStream);
        bufferedInputStream.close();
        var certInfo = Java.cast(ca, X509Certificate);
        console.log("[o] Our CA Info: " + certInfo.getSubjectDN());
        console.log("[+] Creating a KeyStore for our CA...");
        var keyStoreType = KeyStore.getDefaultType();
        var keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ca", ca);
        console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
        var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);
        console.log("[+] Our TrustManager is ready...");
        console.log("[+] Hijacking SSLContext methods now...");
        console.log("[-] Waiting for the app to invoke SSLContext.init()...");
        SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a, b, c) {
          console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
          SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
          console.log("[+] SSLContext initialized with our custom TrustManager!");
        };
      });
    }
  };

  // utils/android/multi_unpinning.js
  var unpinning = class {
    static multi_unpinning() {
      Java.perform(function() {
        console.log("");
        console.log("======");
        console.log("[#] Android Bypass for various Certificate Pinning methods [#]");
        console.log("======");
        var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        var SSLContext = Java.use("javax.net.ssl.SSLContext");
        var TrustManager = Java.registerClass({
          // Implement a custom TrustManager
          name: "dev.asd.test.TrustManager",
          implements: [X509TrustManager],
          methods: {
            checkClientTrusted: function(chain, authType) {
            },
            checkServerTrusted: function(chain, authType) {
            },
            getAcceptedIssuers: function() {
              return [];
            }
          }
        });
        var TrustManagers = [TrustManager.$new()];
        var SSLContext_init = SSLContext.init.overload(
          "[Ljavax.net.ssl.KeyManager;",
          "[Ljavax.net.ssl.TrustManager;",
          "java.security.SecureRandom"
        );
        try {
          SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
            console.log("[+] Bypassing Trustmanager (Android < 7) request");
            SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
          };
        } catch (err) {
          console.log("[-] TrustManager (Android < 7) pinner not found");
        }
        try {
          var okhttp3_Activity_1 = Java.use("okhttp3.CertificatePinner");
          okhttp3_Activity_1.check.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
            console.log("[+] Bypassing OkHTTPv3 {1}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] OkHTTPv3 {1} pinner not found");
        }
        try {
          var okhttp3_Activity_2 = Java.use("okhttp3.CertificatePinner");
          okhttp3_Activity_2.check.overload("java.lang.String", "java.security.cert.Certificate").implementation = function(a, b) {
            console.log("[+] Bypassing OkHTTPv3 {2}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] OkHTTPv3 {2} pinner not found");
        }
        try {
          var okhttp3_Activity_3 = Java.use("okhttp3.CertificatePinner");
          okhttp3_Activity_3.check.overload("java.lang.String", "[Ljava.security.cert.Certificate;").implementation = function(a, b) {
            console.log("[+] Bypassing OkHTTPv3 {3}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] OkHTTPv3 {3} pinner not found");
        }
        try {
          var okhttp3_Activity_4 = Java.use("okhttp3.CertificatePinner");
          okhttp3_Activity_4["check$okhttp"].implementation = function(a, b) {
            console.log("[+] Bypassing OkHTTPv3 {4}: " + a);
          };
        } catch (err) {
          console.log("[-] OkHTTPv3 {4} pinner not found");
        }
        try {
          var trustkit_Activity_1 = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
          trustkit_Activity_1.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
            console.log("[+] Bypassing Trustkit {1}: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Trustkit {1} pinner not found");
        }
        try {
          var trustkit_Activity_2 = Java.use("com.datatheorem.android.trustkit.pinning.OkHostnameVerifier");
          trustkit_Activity_2.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
            console.log("[+] Bypassing Trustkit {2}: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Trustkit {2} pinner not found");
        }
        try {
          var trustkit_PinningTrustManager = Java.use("com.datatheorem.android.trustkit.pinning.PinningTrustManager");
          trustkit_PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log("[+] Bypassing Trustkit {3}");
          };
        } catch (err) {
          console.log("[-] Trustkit {3} pinner not found");
        }
        try {
          var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
          TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log("[+] Bypassing TrustManagerImpl (Android > 7): " + host);
            return untrustedChain;
          };
        } catch (err) {
          console.log("[-] TrustManagerImpl (Android > 7) pinner not found");
        }
        try {
          var appcelerator_PinningTrustManager = Java.use("appcelerator.https.PinningTrustManager");
          appcelerator_PinningTrustManager.checkServerTrusted.implementation = function() {
            console.log("[+] Bypassing Appcelerator PinningTrustManager");
          };
        } catch (err) {
          console.log("[-] Appcelerator PinningTrustManager pinner not found");
        }
        try {
          var OpenSSLSocketImpl = Java.use("com.android.org.conscrypt.OpenSSLSocketImpl");
          OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
            console.log("[+] Bypassing OpenSSLSocketImpl Conscrypt");
          };
        } catch (err) {
          console.log("[-] OpenSSLSocketImpl Conscrypt pinner not found");
        }
        try {
          var OpenSSLEngineSocketImpl_Activity = Java.use("com.android.org.conscrypt.OpenSSLEngineSocketImpl");
          OpenSSLSocketImpl_Activity.verifyCertificateChain.overload("[Ljava.lang.Long;", "java.lang.String").implementation = function(a, b) {
            console.log("[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: " + b);
          };
        } catch (err) {
          console.log("[-] OpenSSLEngineSocketImpl Conscrypt pinner not found");
        }
        try {
          var OpenSSLSocketImpl_Harmony = Java.use("org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl");
          OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
            console.log("[+] Bypassing OpenSSLSocketImpl Apache Harmony");
          };
        } catch (err) {
          console.log("[-] OpenSSLSocketImpl Apache Harmony pinner not found");
        }
        try {
          var phonegap_Activity = Java.use("nl.xservices.plugins.sslCertificateChecker");
          phonegap_Activity.execute.overload("java.lang.String", "org.json.JSONArray", "org.apache.cordova.CallbackContext").implementation = function(a, b, c) {
            console.log("[+] Bypassing PhoneGap sslCertificateChecker: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] PhoneGap sslCertificateChecker pinner not found");
        }
        try {
          var WLClient_Activity_1 = Java.use("com.worklight.wlclient.api.WLClient");
          WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload("java.lang.String").implementation = function(cert) {
            console.log("[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: " + cert);
            return;
          };
        } catch (err) {
          console.log("[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} pinner not found");
        }
        try {
          var WLClient_Activity_2 = Java.use("com.worklight.wlclient.api.WLClient");
          WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload("[Ljava.lang.String;").implementation = function(cert) {
            console.log("[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: " + cert);
            return;
          };
        } catch (err) {
          console.log("[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} pinner not found");
        }
        try {
          var worklight_Activity_1 = Java.use("com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning");
          worklight_Activity_1.verify.overload("java.lang.String", "javax.net.ssl.SSLSocket").implementation = function(a, b) {
            console.log("[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} pinner not found");
        }
        try {
          var worklight_Activity_2 = Java.use("com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning");
          worklight_Activity_2.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
            console.log("[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} pinner not found");
        }
        try {
          var worklight_Activity_3 = Java.use("com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning");
          worklight_Activity_3.verify.overload("java.lang.String", "[Ljava.lang.String;", "[Ljava.lang.String;").implementation = function(a, b) {
            console.log("[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} pinner not found");
        }
        try {
          var worklight_Activity_4 = Java.use("com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning");
          worklight_Activity_4.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
            console.log("[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} pinner not found");
        }
        try {
          var conscrypt_CertPinManager_Activity = Java.use("com.android.org.conscrypt.CertPinManager");
          conscrypt_CertPinManager_Activity.isChainValid.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
            console.log("[+] Bypassing Conscrypt CertPinManager: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Conscrypt CertPinManager pinner not found");
        }
        try {
          var cwac_CertPinManager_Activity = Java.use("com.commonsware.cwac.netsecurity.conscrypt.CertPinManager");
          cwac_CertPinManager_Activity.isChainValid.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
            console.log("[+] Bypassing CWAC-Netsecurity CertPinManager: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] CWAC-Netsecurity CertPinManager pinner not found");
        }
        try {
          var androidgap_WLCertificatePinningPlugin_Activity = Java.use("com.worklight.androidgap.plugin.WLCertificatePinningPlugin");
          androidgap_WLCertificatePinningPlugin_Activity.execute.overload("java.lang.String", "org.json.JSONArray", "org.apache.cordova.CallbackContext").implementation = function(a, b, c) {
            console.log("[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found");
        }
        try {
          var netty_FingerprintTrustManagerFactory = Java.use("io.netty.handler.ssl.util.FingerprintTrustManagerFactory");
          netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
            console.log("[+] Bypassing Netty FingerprintTrustManagerFactory");
          };
        } catch (err) {
          console.log("[-] Netty FingerprintTrustManagerFactory pinner not found");
        }
        try {
          let CertificatePinner2 = Java.use("okhttp3.CertificatePinner");
          CertificatePinner2.check.overload("java.lang.String", "java.util.List").implementation = function(str, list) {
            console.log("[+] bypass CertificatePinner {1}: " + str);
            return;
          };
        } catch (e) {
          console.log("[-] CertificatePinner {1} pinner not found");
        }
        try {
          CertificatePinner.check.overload("java.lang.String", "[Ljava.security.cert.Certificate;").implementation = function(str, certificateArr) {
            console.log("[+] bypass CertificatePinner {2}: " + str);
            return;
          };
        } catch (e) {
          console.log("[-] CertificatePinner {2} pinner not found");
        }
        try {
          var Squareup_CertificatePinner_Activity_1 = Java.use("com.squareup.okhttp.CertificatePinner");
          Squareup_CertificatePinner_Activity_1.check.overload("java.lang.String", "java.security.cert.Certificate").implementation = function(a, b) {
            console.log("[+] Bypassing Squareup CertificatePinner {1}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] Squareup CertificatePinner {1} pinner not found");
        }
        try {
          var Squareup_CertificatePinner_Activity_2 = Java.use("com.squareup.okhttp.CertificatePinner");
          Squareup_CertificatePinner_Activity_2.check.overload("java.lang.String", "java.util.List").implementation = function(a, b) {
            console.log("[+] Bypassing Squareup CertificatePinner {2}: " + a);
            return;
          };
        } catch (err) {
          console.log("[-] Squareup CertificatePinner {2} pinner not found");
        }
        try {
          var Squareup_OkHostnameVerifier_Activity_1 = Java.use("com.squareup.okhttp.internal.tls.OkHostnameVerifier");
          Squareup_OkHostnameVerifier_Activity_1.verify.overload("java.lang.String", "java.security.cert.X509Certificate").implementation = function(a, b) {
            console.log("[+] Bypassing Squareup OkHostnameVerifier {1}: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Squareup OkHostnameVerifier pinner not found");
        }
        try {
          var Squareup_OkHostnameVerifier_Activity_2 = Java.use("com.squareup.okhttp.internal.tls.OkHostnameVerifier");
          Squareup_OkHostnameVerifier_Activity_2.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(a, b) {
            console.log("[+] Bypassing Squareup OkHostnameVerifier {2}: " + a);
            return true;
          };
        } catch (err) {
          console.log("[-] Squareup OkHostnameVerifier pinner not found");
        }
        try {
          var AndroidWebViewClient_Activity_1 = Java.use("android.webkit.WebViewClient");
          AndroidWebViewClient_Activity_1.onReceivedSslError.overload("android.webkit.WebView", "android.webkit.SslErrorHandler", "android.net.http.SslError").implementation = function(obj1, obj2, obj3) {
            console.log("[+] Bypassing Android WebViewClient {1}");
          };
        } catch (err) {
          console.log("[-] Android WebViewClient {1} pinner not found");
        }
        try {
          var AndroidWebViewClient_Activity_2 = Java.use("android.webkit.WebViewClient");
          AndroidWebViewClient_Activity_2.onReceivedSslError.overload("android.webkit.WebView", "android.webkit.WebResourceRequest", "android.webkit.WebResourceError").implementation = function(obj1, obj2, obj3) {
            console.log("[+] Bypassing Android WebViewClient {2}");
          };
        } catch (err) {
          console.log("[-] Android WebViewClient {2} pinner not found");
        }
        try {
          var CordovaWebViewClient_Activity = Java.use("org.apache.cordova.CordovaWebViewClient");
          CordovaWebViewClient_Activity.onReceivedSslError.overload("android.webkit.WebView", "android.webkit.SslErrorHandler", "android.net.http.SslError").implementation = function(obj1, obj2, obj3) {
            console.log("[+] Bypassing Apache Cordova WebViewClient");
            obj3.proceed();
          };
        } catch (err) {
          console.log("[-] Apache Cordova WebViewClient pinner not found");
        }
        try {
          var boye_AbstractVerifier = Java.use("ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier");
          boye_AbstractVerifier.verify.implementation = function(host, ssl) {
            console.log("[+] Bypassing Boye AbstractVerifier: " + host);
          };
        } catch (err) {
          console.log("[-] Boye AbstractVerifier pinner not found");
        }
      });
    }
  };

  // utils/android/Anti.ts
  var Anti;
  ((Anti2) => {
    function anti_InMemoryDexClassLoader(callbackfunc) {
      throw new Error("deprecated method, should use:  FCAnd.useWithInMemoryDexClassLoader");
    }
    Anti2.anti_InMemoryDexClassLoader = anti_InMemoryDexClassLoader;
    function anti_debug() {
      anti_fgets();
      anti_exit();
      anti_fork();
      anti_kill();
      anti_ptrace();
    }
    Anti2.anti_debug = anti_debug;
    function anti_exit() {
      const exit_ptr = Module.findExportByName(null, "_exit");
      DMLog.i("anti_exit", "exit_ptr : " + exit_ptr);
      if (null == exit_ptr) {
        return;
      }
      Interceptor.replace(exit_ptr, new NativeCallback(function(code) {
        if (null == this) {
          return 0;
        }
        var lr = FCCommon.getLR(this.context);
        DMLog.i("exit debug", "entry, lr: " + lr);
        return 0;
      }, "int", ["int", "int"]));
    }
    Anti2.anti_exit = anti_exit;
    function anti_kill() {
      const kill_ptr = Module.findExportByName(null, "kill");
      DMLog.i("anti_kill", "kill_ptr : " + kill_ptr);
      if (null == kill_ptr) {
        return;
      }
      Interceptor.replace(kill_ptr, new NativeCallback(function(ptid, code) {
        if (null == this) {
          return 0;
        }
        var lr = FCCommon.getLR(this.context);
        DMLog.i("kill debug", "entry, lr: " + lr);
        FCAnd.showNativeStacks(this.context);
        return 0;
      }, "int", ["int", "int"]));
    }
    Anti2.anti_kill = anti_kill;
    function anti_fgets() {
      const tag = "anti_fgets";
      const fgetsPtr = Module.findExportByName(null, "fgets");
      DMLog.i(tag, "fgets addr: " + fgetsPtr);
      if (null == fgetsPtr) {
        return;
      }
      var fgets = new NativeFunction(fgetsPtr, "pointer", ["pointer", "int", "pointer"]);
      Interceptor.replace(fgetsPtr, new NativeCallback(function(buffer, size, fp) {
        var logTag = null;
        const lr = FCCommon.getLR(this.context);
        var retval = fgets(buffer, size, fp);
        var bufstr = buffer.readCString();
        if (null != bufstr) {
          if (bufstr.indexOf("TracerPid:") > -1) {
            buffer.writeUtf8String("TracerPid:	0");
            logTag = "TracerPid";
          } else if (bufstr.indexOf("State:	t (tracing stop)") > -1) {
            buffer.writeUtf8String("State:	S (sleeping)");
            logTag = "State";
          } else if (bufstr.indexOf("ptrace_stop") > -1) {
            buffer.writeUtf8String("sys_epoll_wait");
            logTag = "ptrace_stop";
          } else if (bufstr.indexOf(") t") > -1) {
            buffer.writeUtf8String(bufstr.replace(") t", ") S"));
            logTag = "stat_t";
          } else if (bufstr.indexOf("SigBlk:") > -1) {
            buffer.writeUtf8String("SigBlk:	0000000000001204");
            logTag = "SigBlk";
          } else if (bufstr.indexOf("frida") > -1) {
            buffer.writeUtf8String("dmemory");
            logTag = "frida";
          }
          if (logTag) {
            DMLog.i(tag + " " + logTag, bufstr + " -> " + buffer.readCString() + " lr: " + lr + "(" + FCCommon.getModuleByAddr(lr) + ")");
            FCAnd.showNativeStacks(this?.context);
          }
        }
        return retval;
      }, "pointer", ["pointer", "int", "pointer"]));
    }
    Anti2.anti_fgets = anti_fgets;
    function anti_ptrace() {
      var ptrace = Module.findExportByName(null, "ptrace");
      if (null != ptrace) {
        DMLog.i("anti_ptrace", "ptrace addr: " + ptrace);
        Interceptor.replace(ptrace, new NativeCallback(function(p1, p2, p3, p4) {
          DMLog.i("anti_ptrace", "entry");
          return 1;
        }, "long", ["int", "int", "pointer", "pointer"]));
      }
    }
    Anti2.anti_ptrace = anti_ptrace;
    function anti_fork() {
      var fork_addr = Module.findExportByName(null, "fork");
      DMLog.i("anti_fork", "fork_addr : " + fork_addr);
      if (null != fork_addr) {
        Interceptor.replace(fork_addr, new NativeCallback(function() {
          DMLog.i("fork_addr", "entry");
          return -1;
        }, "int", []));
      }
    }
    Anti2.anti_fork = anti_fork;
    function anti_sslLoadCert(cerPath) {
      sslPinningPass.ssl_load_cert(cerPath);
    }
    Anti2.anti_sslLoadCert = anti_sslLoadCert;
    function anti_ssl_unpinning() {
      setTimeout(unpinning.multi_unpinning, 0);
    }
    Anti2.anti_ssl_unpinning = anti_ssl_unpinning;
    function anti_ssl_cronet_32() {
      var moduleName = "libsscronet.so";
      var searchBytes = "01 06 44 BF 6F F0 CE 00 70 47 81 04 44 BF 6F F0 95 00 70 47 41 01 44 BF 6F F0 D8 00 70 47 41 06 44 BF 6F F0 CD 00 70 47 41 07 44 BF 6F F0 C9 00 70 47 C1 07 1C BF 6F F0 C7 00 70 47 C1 01 44 BF";
      var module = Process.getModuleByName(moduleName);
      var baseAddr = module.base;
      var size = module.size;
      var matches = Memory.scan(baseAddr, size, searchBytes, {
        onMatch: function(address, size2) {
          DMLog.i("anti_ssl_cronet", "[*] Match found at: " + address);
          var offset = address.sub(baseAddr);
          DMLog.i("anti_ssl_cronet", "[+] Static Offset: " + offset);
          Interceptor.attach(address.or(1), {
            onLeave: function(retval) {
              retval.replace(ptr(0));
              DMLog.w("anti_ssl_cronet retval", "replace value: " + retval);
            }
          });
        },
        onComplete: function() {
          DMLog.i("anti_ssl_cronet", "[*] Search completed!");
        }
      });
    }
    Anti2.anti_ssl_cronet_32 = anti_ssl_cronet_32;
  })(Anti || (Anti = {}));

  // utils/android/jni/method_data.ts
  var BacktraceJSONContainer = class {
    address;
    module;
    // public readonly symbol: DebugSymbol | null;
    constructor(address, module) {
      this.address = address;
      this.module = module;
    }
  };
  var MethodData = class _MethodData {
    tag = "MethodData";
    methodname;
    args;
    retval;
    methodDef;
    jnival;
    backtrace;
    constructor(ctx, methodname, methodDef, args, retval) {
      this.methodname = methodname;
      this.methodDef = methodDef;
      this.args = args;
      this.jnival = { "args": [], "ret": null };
      let addr = FCCommon.getLR(ctx);
      if (ptr(0) != addr) {
        this.backtrace = [new BacktraceJSONContainer(addr, Process.findModuleByAddress(addr))];
      } else {
        this.backtrace = [];
      }
      let argTypes = this.methodDef.args;
      for (let i = 0; i < argTypes.length; i++) {
        let ptr2 = args[i];
        let argType = argTypes[i];
        let argval = _MethodData.getFridaValue(argType, ptr2);
        this.jnival.args.push({ argType, argVal: argval });
      }
      if (null != retval) {
        this.setRetval(retval);
      }
    }
    setRetval(retval) {
      this.retval = retval;
      let retType = this.methodDef.ret;
      let retVal = _MethodData.getFridaValue(this.methodDef.ret, retval);
      this.jnival.ret = { retType, retVal };
    }
    toString() {
      return JSON.stringify(this);
    }
    static getFridaValue(type, ptr2) {
      if (null == ptr2 || 0 == ptr2.toInt32()) {
        return ptr2;
      }
      if (type.endsWith("*")) {
        if (type.startsWith("char")) {
          return ptr2.readCString();
        } else if (type.startsWith("jchar")) {
          let res = null;
          try {
            let tmp = ptr2.readUtf16String();
            if (tmp) {
              if (tmp[0].charCodeAt(0) < 128) {
                for (let i = 0; i < tmp.length; ++i) {
                  if (tmp.charCodeAt(i) > 128) {
                    tmp = tmp.substring(0, i);
                    break;
                  }
                }
              }
              if (tmp.length < 2) {
                tmp += "(hex:0x" + ptr2.readU16().toString(16) + ")";
              }
            }
            res = tmp;
          } catch (e) {
          }
          return res == null ? "" : res;
        } else {
          try {
            return ptr2.readPointer();
          } catch (e) {
            return ptr2;
          }
        }
      } else {
        if ("jstring" === type) {
          return Java.vm.getEnv().stringFromJni(ptr2);
        } else if ("jclass" === type) {
          return Java.vm.getEnv().getClassName(ptr2);
        } else if ("jobject" === type) {
          return _MethodData.printJObjectAsString(ptr2);
        } else if ("jmethodID" === type) {
          let res = Jni.getMethodInfo(ptr2);
          if (void 0 != res) {
            return JSON.stringify(res);
          } else {
            return ptr2;
          }
        }
        return ptr2;
      }
    }
    // 传入一个 jobject 对象，尝试将其转换为 string 并打印
    static printJObjectAsString(obj) {
      try {
        const javaObject = Java.cast(obj, Java.use("java.lang.Object"));
        if (javaObject.getClass().getName() === "java.lang.String") {
          return javaObject.toString();
        } else {
          return `val: ${obj}, class: ${javaObject.getClass().getName()}`;
        }
      } catch (e) {
        console.error("Error converting jobject to string:", e.message);
        return obj;
      }
    }
  };

  // utils/android/jni/jni_env.js
  var JNIEnv = class {
    static JNI_ENV_METHODS = [
      {
        "name": "reserved0",
        "args": [],
        "ret": "void"
      },
      {
        "name": "reserved1",
        "args": [],
        "ret": "void"
      },
      {
        "name": "reserved2",
        "args": [],
        "ret": "void"
      },
      {
        "name": "reserved3",
        "args": [],
        "ret": "void"
      },
      {
        "name": "GetVersion",
        "args": [
          "JNIEnv*"
        ],
        "ret": "jint"
      },
      {
        "name": "DefineClass",
        "args": [
          "JNIEnv*",
          "char*",
          "jobject",
          "jbyte*",
          "jsize"
        ],
        "ret": "jclass"
      },
      {
        "name": "FindClass",
        "args": [
          "JNIEnv*",
          "char*"
        ],
        "ret": "jclass"
      },
      {
        "name": "FromReflectedMethod",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jmethodID"
      },
      {
        "name": "FromReflectedField",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jfieldID"
      },
      {
        "name": "ToReflectedMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jboolean"
        ],
        "ret": "jobject"
      },
      {
        "name": "GetSuperclass",
        "args": [
          "JNIEnv*",
          "jclass"
        ],
        "ret": "jclass"
      },
      {
        "name": "IsAssignableFrom",
        "args": [
          "JNIEnv*",
          "jclass",
          "jclass"
        ],
        "ret": "jboolean"
      },
      {
        "name": "ToReflectedField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jboolean"
        ],
        "ret": "jobject"
      },
      {
        "name": "Throw",
        "args": [
          "JNIEnv*",
          "jthrowable"
        ],
        "ret": "jint"
      },
      {
        "name": "ThrowNew",
        "args": [
          "JNIEnv*",
          "jclass",
          "char*"
        ],
        "ret": "jint"
      },
      {
        "name": "ExceptionOccurred",
        "args": [
          "JNIEnv*"
        ],
        "ret": "jthrowable"
      },
      {
        "name": "ExceptionDescribe",
        "args": [
          "JNIEnv*"
        ],
        "ret": "void"
      },
      {
        "name": "ExceptionClear",
        "args": [
          "JNIEnv*"
        ],
        "ret": "void"
      },
      {
        "name": "FatalError",
        "args": [
          "JNIEnv*",
          "char*"
        ],
        "ret": "void"
      },
      {
        "name": "PushLocalFrame",
        "args": [
          "JNIEnv*",
          "jint"
        ],
        "ret": "jint"
      },
      {
        "name": "PopLocalFrame",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jobject"
      },
      {
        "name": "NewGlobalRef",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jobject"
      },
      {
        "name": "DeleteGlobalRef",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "DeleteLocalRef",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "IsSameObject",
        "args": [
          "JNIEnv*",
          "jobject",
          "jobject"
        ],
        "ret": "jboolean"
      },
      {
        "name": "NewLocalRef",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jobject"
      },
      {
        "name": "EnsureLocalCapacity",
        "args": [
          "JNIEnv*",
          "jint"
        ],
        "ret": "jint"
      },
      {
        "name": "AllocObject",
        "args": [
          "JNIEnv*",
          "jclass"
        ],
        "ret": "jobject"
      },
      {
        "name": "NewObject",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jobject"
      },
      {
        "name": "NewObjectV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jobject"
      },
      {
        "name": "NewObjectA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jobject"
      },
      {
        "name": "GetObjectClass",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jclass"
      },
      {
        "name": "IsInstanceOf",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass"
        ],
        "ret": "jboolean"
      },
      {
        "name": "GetMethodID",
        "args": [
          "JNIEnv*",
          "jclass",
          "char*",
          "char*"
        ],
        "ret": "jmethodID"
      },
      {
        "name": "CallObjectMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jobject"
      },
      {
        "name": "CallObjectMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallObjectMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallBooleanMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallBooleanMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallBooleanMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallByteMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallByteMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallByteMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallCharMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jchar"
      },
      {
        "name": "CallCharMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallCharMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallShortMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jshort"
      },
      {
        "name": "CallShortMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallShortMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallIntMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jint"
      },
      {
        "name": "CallIntMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jint"
      },
      {
        "name": "CallIntMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jint"
      },
      {
        "name": "CallLongMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jlong"
      },
      {
        "name": "CallLongMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallLongMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallFloatMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallFloatMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallFloatMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallDoubleMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallDoubleMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallDoubleMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallVoidMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "..."
        ],
        "ret": "void"
      },
      {
        "name": "CallVoidMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "va_list"
        ],
        "ret": "void"
      },
      {
        "name": "CallVoidMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "void"
      },
      {
        "name": "CallNonvirtualObjectMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jobject"
      },
      {
        "name": "CallNonvirtualObjectMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallNonvirtualObjectMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallNonvirtualBooleanMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallNonvirtualBooleanMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallNonvirtualBooleanMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallNonvirtualByteMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallNonvirtualByteMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallNonvirtualByteMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallNonvirtualCharMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jchar"
      },
      {
        "name": "CallNonvirtualCharMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallNonvirtualCharMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallNonvirtualShortMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jshort"
      },
      {
        "name": "CallNonvirtualShortMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallNonvirtualShortMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallNonvirtualIntMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jint"
      },
      {
        "name": "CallNonvirtualIntMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jint"
      },
      {
        "name": "CallNonvirtualIntMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jint"
      },
      {
        "name": "CallNonvirtualLongMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jlong"
      },
      {
        "name": "CallNonvirtualLongMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallNonvirtualLongMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallNonvirtualFloatMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallNonvirtualFloatMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallNonvirtualFloatMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallNonvirtualDoubleMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallNonvirtualDoubleMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallNonvirtualDoubleMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallNonvirtualVoidMethod",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "void"
      },
      {
        "name": "CallNonvirtualVoidMethodV",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "void"
      },
      {
        "name": "CallNonvirtualVoidMethodA",
        "args": [
          "JNIEnv*",
          "jobject",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "void"
      },
      {
        "name": "GetFieldID",
        "args": [
          "JNIEnv*",
          "jclass",
          "char*",
          "char*"
        ],
        "ret": "jfieldID"
      },
      {
        "name": "GetObjectField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jobject"
      },
      {
        "name": "GetBooleanField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jboolean"
      },
      {
        "name": "GetByteField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jbyte"
      },
      {
        "name": "GetCharField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jchar"
      },
      {
        "name": "GetShortField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jshort"
      },
      {
        "name": "GetIntField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jint"
      },
      {
        "name": "GetLongField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jlong"
      },
      {
        "name": "GetFloatField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jfloat"
      },
      {
        "name": "GetDoubleField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID"
        ],
        "ret": "jdouble"
      },
      {
        "name": "SetObjectField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "SetBooleanField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jboolean"
        ],
        "ret": "void"
      },
      {
        "name": "SetByteField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jbyte"
        ],
        "ret": "void"
      },
      {
        "name": "SetCharField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jchar"
        ],
        "ret": "void"
      },
      {
        "name": "SetShortField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jshort"
        ],
        "ret": "void"
      },
      {
        "name": "SetIntField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "SetLongField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jlong"
        ],
        "ret": "void"
      },
      {
        "name": "SetFloatField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jfloat"
        ],
        "ret": "void"
      },
      {
        "name": "SetDoubleField",
        "args": [
          "JNIEnv*",
          "jobject",
          "jfieldID",
          "jdouble"
        ],
        "ret": "void"
      },
      {
        "name": "GetStaticMethodID",
        "args": [
          "JNIEnv*",
          "jclass",
          "char*",
          "char*"
        ],
        "ret": "jmethodID"
      },
      {
        "name": "CallStaticObjectMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jobject"
      },
      {
        "name": "CallStaticObjectMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallStaticObjectMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jobject"
      },
      {
        "name": "CallStaticBooleanMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallStaticBooleanMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallStaticBooleanMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jboolean"
      },
      {
        "name": "CallStaticByteMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallStaticByteMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallStaticByteMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jbyte"
      },
      {
        "name": "CallStaticCharMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jchar"
      },
      {
        "name": "CallStaticCharMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallStaticCharMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jchar"
      },
      {
        "name": "CallStaticShortMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jshort"
      },
      {
        "name": "CallStaticShortMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallStaticShortMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jshort"
      },
      {
        "name": "CallStaticIntMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jint"
      },
      {
        "name": "CallStaticIntMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jint"
      },
      {
        "name": "CallStaticIntMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jint"
      },
      {
        "name": "CallStaticLongMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jlong"
      },
      {
        "name": "CallStaticLongMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallStaticLongMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jlong"
      },
      {
        "name": "CallStaticFloatMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallStaticFloatMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallStaticFloatMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jfloat"
      },
      {
        "name": "CallStaticDoubleMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallStaticDoubleMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallStaticDoubleMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "jdouble"
      },
      {
        "name": "CallStaticVoidMethod",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "..."
        ],
        "ret": "void"
      },
      {
        "name": "CallStaticVoidMethodV",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "va_list"
        ],
        "ret": "void"
      },
      {
        "name": "CallStaticVoidMethodA",
        "args": [
          "JNIEnv*",
          "jclass",
          "jmethodID",
          "jvalue*"
        ],
        "ret": "void"
      },
      {
        "name": "GetStaticFieldID",
        "args": [
          "JNIEnv*",
          "jclass",
          "char*",
          "char*"
        ],
        "ret": "jfieldID"
      },
      {
        "name": "GetStaticObjectField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jobject"
      },
      {
        "name": "GetStaticBooleanField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jboolean"
      },
      {
        "name": "GetStaticByteField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jbyte"
      },
      {
        "name": "GetStaticCharField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jchar"
      },
      {
        "name": "GetStaticShortField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jshort"
      },
      {
        "name": "GetStaticIntField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jint"
      },
      {
        "name": "GetStaticLongField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jlong"
      },
      {
        "name": "GetStaticFloatField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jfloat"
      },
      {
        "name": "GetStaticDoubleField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID"
        ],
        "ret": "jdouble"
      },
      {
        "name": "SetStaticObjectField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticBooleanField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jboolean"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticByteField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jbyte"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticCharField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jchar"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticShortField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jshort"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticIntField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticLongField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jlong"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticFloatField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jfloat"
        ],
        "ret": "void"
      },
      {
        "name": "SetStaticDoubleField",
        "args": [
          "JNIEnv*",
          "jclass",
          "jfieldID",
          "jdouble"
        ],
        "ret": "void"
      },
      {
        "name": "NewString",
        "args": [
          "JNIEnv*",
          "jchar*",
          "jsize"
        ],
        "ret": "jstring"
      },
      {
        "name": "GetStringLength",
        "args": [
          "JNIEnv*",
          "jstring"
        ],
        "ret": "jsize"
      },
      {
        "name": "GetStringChars",
        "args": [
          "JNIEnv*",
          "jstring",
          "jboolean*"
        ],
        "ret": "jchar*"
      },
      {
        "name": "ReleaseStringChars",
        "args": [
          "JNIEnv*",
          "jstring",
          "jchar*"
        ],
        "ret": "void"
      },
      {
        "name": "NewStringUTF",
        "args": [
          "JNIEnv*",
          "char*"
        ],
        "ret": "jstring"
      },
      {
        "name": "GetStringUTFLength",
        "args": [
          "JNIEnv*",
          "jstring"
        ],
        "ret": "jsize"
      },
      {
        "name": "GetStringUTFChars",
        "args": [
          "JNIEnv*",
          "jstring",
          "jboolean*"
        ],
        "ret": "char*"
      },
      {
        "name": "ReleaseStringUTFChars",
        "args": [
          "JNIEnv*",
          "jstring",
          "char*"
        ],
        "ret": "void"
      },
      {
        "name": "GetArrayLength",
        "args": [
          "JNIEnv*",
          "jarray"
        ],
        "ret": "jsize"
      },
      {
        "name": "NewObjectArray",
        "args": [
          "JNIEnv*",
          "jsize",
          "jclass",
          "jobject"
        ],
        "ret": "jobjectArray"
      },
      {
        "name": "GetObjectArrayElement",
        "args": [
          "JNIEnv*",
          "jobjectArray",
          "jsize"
        ],
        "ret": "jobject"
      },
      {
        "name": "SetObjectArrayElement",
        "args": [
          "JNIEnv*",
          "jobjectArray",
          "jsize",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "NewBooleanArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jbooleanArray"
      },
      {
        "name": "NewByteArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jbyteArray"
      },
      {
        "name": "NewCharArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jcharArray"
      },
      {
        "name": "NewShortArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jshortArray"
      },
      {
        "name": "NewIntArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jintArray"
      },
      {
        "name": "NewLongArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jlongArray"
      },
      {
        "name": "NewFloatArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jfloatArray"
      },
      {
        "name": "NewDoubleArray",
        "args": [
          "JNIEnv*",
          "jsize"
        ],
        "ret": "jdoubleArray"
      },
      {
        "name": "GetBooleanArrayElements",
        "args": [
          "JNIEnv*",
          "jbooleanArray",
          "jboolean*"
        ],
        "ret": "jboolean*"
      },
      {
        "name": "GetByteArrayElements",
        "args": [
          "JNIEnv*",
          "jbyteArray",
          "jboolean*"
        ],
        "ret": "jbyte*"
      },
      {
        "name": "GetCharArrayElements",
        "args": [
          "JNIEnv*",
          "jcharArray",
          "jboolean*"
        ],
        "ret": "jchar*"
      },
      {
        "name": "GetShortArrayElements",
        "args": [
          "JNIEnv*",
          "jshortArray",
          "jboolean*"
        ],
        "ret": "jshort*"
      },
      {
        "name": "GetIntArrayElements",
        "args": [
          "JNIEnv*",
          "jintArray",
          "jboolean*"
        ],
        "ret": "jint*"
      },
      {
        "name": "GetLongArrayElements",
        "args": [
          "JNIEnv*",
          "jlongArray",
          "jboolean*"
        ],
        "ret": "jlong*"
      },
      {
        "name": "GetFloatArrayElements",
        "args": [
          "JNIEnv*",
          "jfloatArray",
          "jboolean*"
        ],
        "ret": "jfloat*"
      },
      {
        "name": "GetDoubleArrayElements",
        "args": [
          "JNIEnv*",
          "jdoubleArray",
          "jboolean*"
        ],
        "ret": "jdouble*"
      },
      {
        "name": "ReleaseBooleanArrayElements",
        "args": [
          "JNIEnv*",
          "jbooleanArray",
          "jboolean*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseByteArrayElements",
        "args": [
          "JNIEnv*",
          "jbyteArray",
          "jbyte*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseCharArrayElements",
        "args": [
          "JNIEnv*",
          "jcharArray",
          "jchar*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseShortArrayElements",
        "args": [
          "JNIEnv*",
          "jshortArray",
          "jshort*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseIntArrayElements",
        "args": [
          "JNIEnv*",
          "jintArray",
          "jint*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseLongArrayElements",
        "args": [
          "JNIEnv*",
          "jlongArray",
          "jlong*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseFloatArrayElements",
        "args": [
          "JNIEnv*",
          "jfloatArray",
          "jfloat*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "ReleaseDoubleArrayElements",
        "args": [
          "JNIEnv*",
          "jdoubleArray",
          "jdouble*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "GetBooleanArrayRegion",
        "args": [
          "JNIEnv*",
          "jbooleanArray",
          "jsize",
          "jsize",
          "jboolean*"
        ],
        "ret": "void"
      },
      {
        "name": "GetByteArrayRegion",
        "args": [
          "JNIEnv*",
          "jbyteArray",
          "jsize",
          "jsize",
          "jbyte*"
        ],
        "ret": "void"
      },
      {
        "name": "GetCharArrayRegion",
        "args": [
          "JNIEnv*",
          "jcharArray",
          "jsize",
          "jsize",
          "jchar*"
        ],
        "ret": "void"
      },
      {
        "name": "GetShortArrayRegion",
        "args": [
          "JNIEnv*",
          "jshortArray",
          "jsize",
          "jsize",
          "jshort*"
        ],
        "ret": "void"
      },
      {
        "name": "GetIntArrayRegion",
        "args": [
          "JNIEnv*",
          "jintArray",
          "jsize",
          "jsize",
          "jint*"
        ],
        "ret": "void"
      },
      {
        "name": "GetLongArrayRegion",
        "args": [
          "JNIEnv*",
          "jlongArray",
          "jsize",
          "jsize",
          "jlong*"
        ],
        "ret": "void"
      },
      {
        "name": "GetFloatArrayRegion",
        "args": [
          "JNIEnv*",
          "jfloatArray",
          "jsize",
          "jsize",
          "jfloat*"
        ],
        "ret": "void"
      },
      {
        "name": "GetDoubleArrayRegion",
        "args": [
          "JNIEnv*",
          "jdoubleArray",
          "jsize",
          "jsize",
          "jdouble*"
        ],
        "ret": "void"
      },
      {
        "name": "SetBooleanArrayRegion",
        "args": [
          "JNIEnv*",
          "jbooleanArray",
          "jsize",
          "jsize",
          "jboolean*"
        ],
        "ret": "void"
      },
      {
        "name": "SetByteArrayRegion",
        "args": [
          "JNIEnv*",
          "jbyteArray",
          "jsize",
          "jsize",
          "jbyte*"
        ],
        "ret": "void"
      },
      {
        "name": "SetCharArrayRegion",
        "args": [
          "JNIEnv*",
          "jcharArray",
          "jsize",
          "jsize",
          "jchar*"
        ],
        "ret": "void"
      },
      {
        "name": "SetShortArrayRegion",
        "args": [
          "JNIEnv*",
          "jshortArray",
          "jsize",
          "jsize",
          "jshort*"
        ],
        "ret": "void"
      },
      {
        "name": "SetIntArrayRegion",
        "args": [
          "JNIEnv*",
          "jintArray",
          "jsize",
          "jsize",
          "jint*"
        ],
        "ret": "void"
      },
      {
        "name": "SetLongArrayRegion",
        "args": [
          "JNIEnv*",
          "jlongArray",
          "jsize",
          "jsize",
          "jlong*"
        ],
        "ret": "void"
      },
      {
        "name": "SetFloatArrayRegion",
        "args": [
          "JNIEnv*",
          "jfloatArray",
          "jsize",
          "jsize",
          "jfloat*"
        ],
        "ret": "void"
      },
      {
        "name": "SetDoubleArrayRegion",
        "args": [
          "JNIEnv*",
          "jdoubleArray",
          "jsize",
          "jsize",
          "jdouble*"
        ],
        "ret": "void"
      },
      {
        "name": "RegisterNatives",
        "args": [
          "JNIEnv*",
          "jclass",
          "JNINativeMethod*",
          "jint"
        ],
        "ret": "jint"
      },
      {
        "name": "UnregisterNatives",
        "args": [
          "JNIEnv*",
          "jclass"
        ],
        "ret": "jint"
      },
      {
        "name": "MonitorEnter",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jint"
      },
      {
        "name": "MonitorExit",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jint"
      },
      {
        "name": "GetJavaVM",
        "args": [
          "JNIEnv*",
          "JavaVM**"
        ],
        "ret": "jint"
      },
      {
        "name": "GetStringRegion",
        "args": [
          "JNIEnv*",
          "jstring",
          "jsize",
          "jsize",
          "jchar*"
        ],
        "ret": "void"
      },
      {
        "name": "GetStringUTFRegion",
        "args": [
          "JNIEnv*",
          "jstring",
          "jsize",
          "jsize",
          "char*"
        ],
        "ret": "void"
      },
      {
        "name": "GetPrimitiveArrayCritical",
        "args": [
          "JNIEnv*",
          "jarray",
          "jboolean*"
        ],
        "ret": "void"
      },
      {
        "name": "ReleasePrimitiveArrayCritical",
        "args": [
          "JNIEnv*",
          "jarray",
          "void*",
          "jint"
        ],
        "ret": "void"
      },
      {
        "name": "GetStringCritical",
        "args": [
          "JNIEnv*",
          "jstring",
          "jboolean*"
        ],
        "ret": "jchar"
      },
      {
        "name": "ReleaseStringCritical",
        "args": [
          "JNIEnv*",
          "jstring",
          "jchar*"
        ],
        "ret": "void"
      },
      {
        "name": "NewWeakGlobalRef",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jweak"
      },
      {
        "name": "DeleteWeakGlobalRef",
        "args": [
          "JNIEnv*",
          "jweak"
        ],
        "ret": "void"
      },
      {
        "name": "ExceptionCheck",
        "args": [
          "JNIEnv*"
        ],
        "ret": "jboolean"
      },
      {
        "name": "NewDirectByteBuffer",
        "args": [
          "JNIEnv*",
          "void*",
          "jlong"
        ],
        "ret": "jobject"
      },
      {
        "name": "GetDirectBufferAddress",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "void"
      },
      {
        "name": "GetDirectBufferCapacity",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jlong"
      },
      {
        "name": "GetObjectRefType",
        "args": [
          "JNIEnv*",
          "jobject"
        ],
        "ret": "jobjectRefType"
      }
    ];
  };

  // utils/android/jnimgr.ts
  var JNI_ENV_METHODS = JNIEnv.JNI_ENV_METHODS;
  var jni_struct_array = [
    "reserved0",
    "reserved1",
    "reserved2",
    "reserved3",
    "GetVersion",
    "DefineClass",
    "FindClass",
    "FromReflectedMethod",
    "FromReflectedField",
    "ToReflectedMethod",
    "GetSuperclass",
    "IsAssignableFrom",
    "ToReflectedField",
    "Throw",
    "ThrowNew",
    "ExceptionOccurred",
    "ExceptionDescribe",
    "ExceptionClear",
    "FatalError",
    "PushLocalFrame",
    "PopLocalFrame",
    "NewGlobalRef",
    "DeleteGlobalRef",
    "DeleteLocalRef",
    "IsSameObject",
    "NewLocalRef",
    "EnsureLocalCapacity",
    "AllocObject",
    "NewObject",
    "NewObjectV",
    "NewObjectA",
    "GetObjectClass",
    "IsInstanceOf",
    "GetMethodID",
    "CallObjectMethod",
    "CallObjectMethodV",
    "CallObjectMethodA",
    "CallBooleanMethod",
    "CallBooleanMethodV",
    "CallBooleanMethodA",
    "CallByteMethod",
    "CallByteMethodV",
    "CallByteMethodA",
    "CallCharMethod",
    "CallCharMethodV",
    "CallCharMethodA",
    "CallShortMethod",
    "CallShortMethodV",
    "CallShortMethodA",
    "CallIntMethod",
    "CallIntMethodV",
    "CallIntMethodA",
    "CallLongMethod",
    "CallLongMethodV",
    "CallLongMethodA",
    "CallFloatMethod",
    "CallFloatMethodV",
    "CallFloatMethodA",
    "CallDoubleMethod",
    "CallDoubleMethodV",
    "CallDoubleMethodA",
    "CallVoidMethod",
    "CallVoidMethodV",
    "CallVoidMethodA",
    "CallNonvirtualObjectMethod",
    "CallNonvirtualObjectMethodV",
    "CallNonvirtualObjectMethodA",
    "CallNonvirtualBooleanMethod",
    "CallNonvirtualBooleanMethodV",
    "CallNonvirtualBooleanMethodA",
    "CallNonvirtualByteMethod",
    "CallNonvirtualByteMethodV",
    "CallNonvirtualByteMethodA",
    "CallNonvirtualCharMethod",
    "CallNonvirtualCharMethodV",
    "CallNonvirtualCharMethodA",
    "CallNonvirtualShortMethod",
    "CallNonvirtualShortMethodV",
    "CallNonvirtualShortMethodA",
    "CallNonvirtualIntMethod",
    "CallNonvirtualIntMethodV",
    "CallNonvirtualIntMethodA",
    "CallNonvirtualLongMethod",
    "CallNonvirtualLongMethodV",
    "CallNonvirtualLongMethodA",
    "CallNonvirtualFloatMethod",
    "CallNonvirtualFloatMethodV",
    "CallNonvirtualFloatMethodA",
    "CallNonvirtualDoubleMethod",
    "CallNonvirtualDoubleMethodV",
    "CallNonvirtualDoubleMethodA",
    "CallNonvirtualVoidMethod",
    "CallNonvirtualVoidMethodV",
    "CallNonvirtualVoidMethodA",
    "GetFieldID",
    "GetObjectField",
    "GetBooleanField",
    "GetByteField",
    "GetCharField",
    "GetShortField",
    "GetIntField",
    "GetLongField",
    "GetFloatField",
    "GetDoubleField",
    "SetObjectField",
    "SetBooleanField",
    "SetByteField",
    "SetCharField",
    "SetShortField",
    "SetIntField",
    "SetLongField",
    "SetFloatField",
    "SetDoubleField",
    "GetStaticMethodID",
    "CallStaticObjectMethod",
    "CallStaticObjectMethodV",
    "CallStaticObjectMethodA",
    "CallStaticBooleanMethod",
    "CallStaticBooleanMethodV",
    "CallStaticBooleanMethodA",
    "CallStaticByteMethod",
    "CallStaticByteMethodV",
    "CallStaticByteMethodA",
    "CallStaticCharMethod",
    "CallStaticCharMethodV",
    "CallStaticCharMethodA",
    "CallStaticShortMethod",
    "CallStaticShortMethodV",
    "CallStaticShortMethodA",
    "CallStaticIntMethod",
    "CallStaticIntMethodV",
    "CallStaticIntMethodA",
    "CallStaticLongMethod",
    "CallStaticLongMethodV",
    "CallStaticLongMethodA",
    "CallStaticFloatMethod",
    "CallStaticFloatMethodV",
    "CallStaticFloatMethodA",
    "CallStaticDoubleMethod",
    "CallStaticDoubleMethodV",
    "CallStaticDoubleMethodA",
    "CallStaticVoidMethod",
    "CallStaticVoidMethodV",
    "CallStaticVoidMethodA",
    "GetStaticFieldID",
    "GetStaticObjectField",
    "GetStaticBooleanField",
    "GetStaticByteField",
    "GetStaticCharField",
    "GetStaticShortField",
    "GetStaticIntField",
    "GetStaticLongField",
    "GetStaticFloatField",
    "GetStaticDoubleField",
    "SetStaticObjectField",
    "SetStaticBooleanField",
    "SetStaticByteField",
    "SetStaticCharField",
    "SetStaticShortField",
    "SetStaticIntField",
    "SetStaticLongField",
    "SetStaticFloatField",
    "SetStaticDoubleField",
    "NewString",
    "GetStringLength",
    "GetStringChars",
    "ReleaseStringChars",
    "NewStringUTF",
    "GetStringUTFLength",
    "GetStringUTFChars",
    "ReleaseStringUTFChars",
    "GetArrayLength",
    "NewObjectArray",
    "GetObjectArrayElement",
    "SetObjectArrayElement",
    "NewBooleanArray",
    "NewByteArray",
    "NewCharArray",
    "NewShortArray",
    "NewIntArray",
    "NewLongArray",
    "NewFloatArray",
    "NewDoubleArray",
    "GetBooleanArrayElements",
    "GetByteArrayElements",
    "GetCharArrayElements",
    "GetShortArrayElements",
    "GetIntArrayElements",
    "GetLongArrayElements",
    "GetFloatArrayElements",
    "GetDoubleArrayElements",
    "ReleaseBooleanArrayElements",
    "ReleaseByteArrayElements",
    "ReleaseCharArrayElements",
    "ReleaseShortArrayElements",
    "ReleaseIntArrayElements",
    "ReleaseLongArrayElements",
    "ReleaseFloatArrayElements",
    "ReleaseDoubleArrayElements",
    "GetBooleanArrayRegion",
    "GetByteArrayRegion",
    "GetCharArrayRegion",
    "GetShortArrayRegion",
    "GetIntArrayRegion",
    "GetLongArrayRegion",
    "GetFloatArrayRegion",
    "GetDoubleArrayRegion",
    "SetBooleanArrayRegion",
    "SetByteArrayRegion",
    "SetCharArrayRegion",
    "SetShortArrayRegion",
    "SetIntArrayRegion",
    "SetLongArrayRegion",
    "SetFloatArrayRegion",
    "SetDoubleArrayRegion",
    "RegisterNatives",
    "UnregisterNatives",
    "MonitorEnter",
    "MonitorExit",
    "GetJavaVM",
    "GetStringRegion",
    "GetStringUTFRegion",
    "GetPrimitiveArrayCritical",
    "ReleasePrimitiveArrayCritical",
    "GetStringCritical",
    "ReleaseStringCritical",
    "NewWeakGlobalRef",
    "DeleteWeakGlobalRef",
    "ExceptionCheck",
    "NewDirectByteBuffer",
    "GetDirectBufferAddress",
    "GetDirectBufferCapacity",
    "GetObjectRefType"
  ];
  var Jni;
  ((Jni2) => {
    const methodMap = /* @__PURE__ */ new Map();
    var have_record_method_info = false;
    function getJNIFunctionAdress(jnienv_addr, func_name) {
      let idx = jni_struct_array.indexOf(func_name);
      if (-1 == idx) {
        DMLog.e("getJNIFunctionAdress", `func name: ${func_name} not found!`);
        return ptr(0);
      }
      var offset = idx * Process.pointerSize;
      return jnienv_addr.add(offset).readPointer();
    }
    Jni2.getJNIFunctionAdress = getJNIFunctionAdress;
    function getJNIAddr(name) {
      var env = Java.vm.getEnv();
      var env_ptr = env.handle.readPointer();
      const addr = Jni2.getJNIFunctionAdress(env_ptr, name);
      return addr;
    }
    Jni2.getJNIAddr = getJNIAddr;
    function hookJNI(name, callbacksOrProbe, data) {
      const addr = Jni2.getJNIAddr(name);
      console.log("Jni.getJNIAddr: " + name + ", addr: " + addr);
      return Interceptor.attach(addr, callbacksOrProbe);
    }
    Jni2.hookJNI = hookJNI;
    function hook_registNatives() {
      const tag = "fridaRegstNtv";
      Jni2.hookJNI("RegisterNatives", {
        onEnter: function(args) {
          var env = Java.vm.getEnv();
          var p_size = Process.pointerSize;
          var methods = args[2];
          var methodcount = args[3].toInt32();
          var name = env.getClassName(args[1]);
          DMLog.i(tag, "==== class: " + name + " ====");
          DMLog.i(tag, "==== methods: " + methods + " nMethods: " + methodcount + " ====");
          for (var i = 0; i < methodcount; i++) {
            var idx = i * p_size * 3;
            var fnPtr = methods.add(idx + p_size * 2).readPointer();
            const module = Process.getModuleByAddress(fnPtr);
            if (module) {
              const modulename = module.name;
              const modulebase = module.base;
              var logstr = "name: " + methods.add(idx).readPointer().readCString() + ", signature: " + methods.add(idx + p_size).readPointer().readCString() + ", fnPtr: " + fnPtr + ", modulename: " + modulename + " -> base: " + modulebase;
              if (null != modulebase) {
                logstr += ", offset: " + fnPtr.sub(modulebase);
              }
              DMLog.i(tag, logstr);
            } else {
              DMLog.e(tag, "module is null");
            }
          }
        }
      });
    }
    Jni2.hook_registNatives = hook_registNatives;
    function traceAllJNISimply() {
      jni_struct_array.forEach(traceJNICore);
    }
    Jni2.traceAllJNISimply = traceAllJNISimply;
    function traceJNI(nameArray) {
      nameArray.forEach(function(name) {
        let idx = getJNIFunctionIndex(name);
        DMLog.i("traceJNI", "name: " + name + "idx: " + idx);
        if (-1 != idx) {
          traceJNICore(name, idx);
        }
      });
    }
    Jni2.traceJNI = traceJNI;
    function traceJNICore(func_name, idx) {
      Jni2.record_method_info();
      if (!func_name.includes("reserved")) {
        Jni2.hookJNI(func_name, {
          onEnter(args) {
            let md = new MethodData(this.context, func_name, JNI_ENV_METHODS[idx], args);
            this.md = md;
          },
          onLeave(retval) {
            this.md.setRetval(retval);
            send(JSON.stringify({ tid: this.threadId, status: "jnitrace", data: this.md }));
          }
        });
      }
    }
    Jni2.traceJNICore = traceJNICore;
    function getJNIFunctionIndex(funcName) {
      return JNI_ENV_METHODS.findIndex((method) => method.name === funcName);
    }
    Jni2.getJNIFunctionIndex = getJNIFunctionIndex;
    function record_method_info() {
      if (have_record_method_info == false) {
        Jni2.hookJNI("GetMethodID", {
          onEnter: function(args) {
            this.methodName = args[2].readCString();
            this.signature = args[3].readCString();
          },
          onLeave: function(retval) {
            methodMap.set(retval.toString(), {
              methodName: this.methodName,
              signature: this.signature,
              methodId: retval,
              isStatic: false
            });
          }
        });
        Jni2.hookJNI("GetStaticMethodID", {
          onEnter: function(args) {
            this.methodName = args[2].readCString();
            this.signature = args[3].readCString();
          },
          onLeave: function(retval) {
            methodMap.set(retval.toString(), {
              methodName: this.methodName,
              signature: this.signature,
              methodId: retval,
              isStatic: true
            });
          }
        });
        have_record_method_info = true;
      }
    }
    Jni2.record_method_info = record_method_info;
    function getMethodInfo(methodId) {
      return methodMap.get(methodId.toString());
    }
    Jni2.getMethodInfo = getMethodInfo;
  })(Jni || (Jni = {}));

  // utils/FCAnd.ts
  var FCAnd;
  ((FCAnd2) => {
    FCAnd2.anti = Anti;
    FCAnd2.jni = Jni;
    FCAnd2.common = FCCommon;
    var firstdiscovery = false;
    function getStacks() {
      return Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()) + "";
    }
    FCAnd2.getStacks = getStacks;
    function showStacks() {
      Java.perform(function() {
        DMLog.d("showStacks", getStacks());
      });
    }
    FCAnd2.showStacks = showStacks;
    function hook_uri(bShowStacks) {
      const Uri = Java.use("android.net.Uri");
      Uri.parse.implementation = function(str) {
        DMLog.i("hook_uri", "str: " + str);
        if (bShowStacks) {
          showStacks();
        }
        return this.parse(str);
      };
    }
    FCAnd2.hook_uri = hook_uri;
    function hook_url(bShowStacks) {
      const URL = Java.use("java.net.URL");
      URL.$init.overload("java.lang.String").implementation = function(url) {
        DMLog.i("hook_url", "url: " + url);
        if (bShowStacks) {
          showStacks();
        }
        return this.$init(url);
      };
    }
    FCAnd2.hook_url = hook_url;
    function hook_JSONObject_getString(pKey) {
      const JSONObject = Java.use("org.json.JSONObject");
      JSONObject.getString.implementation = function(key) {
        if (key == pKey) {
          DMLog.i("hook_JSONObject_getString", "found key: " + key);
          showStacks();
        }
        return this.getString(key);
      };
    }
    FCAnd2.hook_JSONObject_getString = hook_JSONObject_getString;
    function hook_fastJson(pKey) {
      const fastJson = Java.use("com/alibaba/fastjson/JSONObject");
      fastJson.getString.implementation = function(key) {
        if (key == pKey) {
          DMLog.i("hook_fastJson getString", "found key: " + key);
          showStacks();
        }
        return this.getString(key);
      };
      fastJson.getJSONArray.implementation = function(key) {
        if (key == pKey) {
          DMLog.i("hook_fastJson getJSONArray", "found key: " + key);
          showStacks();
        }
        return this.getString(key);
      };
      fastJson.getJSONObject.implementation = function(key) {
        if (key == pKey) {
          DMLog.i("hook_fastJson getJSONObject", "found key: " + key);
          showStacks();
        }
        return this.getString(key);
      };
      fastJson.getInteger.implementation = function(key) {
        if (key == pKey) {
          DMLog.i("hook_fastJson getJSONObject", "found key: " + key);
          showStacks();
        }
        return this.getString(key);
      };
    }
    FCAnd2.hook_fastJson = hook_fastJson;
    function hook_Map(pKey, accurately) {
      const Map2 = Java.use("java.util.Map");
      Map2.put.implementation = function(key, val) {
        var bRes = false;
        if (accurately) {
          bRes = key + "" == pKey;
        } else {
          bRes = (key + "").indexOf(pKey) > -1;
        }
        if (bRes) {
          DMLog.i("map", "key: " + key);
          DMLog.i("map", "val: " + val);
          showStacks();
        }
        this.put(key, val);
      };
      const LinkedHashMap = Java.use("java.util.LinkedHashMap");
      LinkedHashMap.put.implementation = function(key1, val) {
        var bRes = false;
        if (accurately) {
          bRes = key1 + "" == pKey;
        } else {
          bRes = (key1 + "").indexOf(pKey) > -1;
        }
        if (null != key1 && bRes) {
          DMLog.i("LinkedHashMap", "key: " + key1);
          DMLog.i("LinkedHashMap", "val: " + val);
          showStacks();
        }
        return this.put(key1, val);
      };
    }
    FCAnd2.hook_Map = hook_Map;
    function hook_log() {
      const Log = Java.use("android.util.Log");
      Log.d.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log d", "tag: " + tag + ", content: " + content);
        return 0;
      };
      Log.v.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log v", "tag: " + tag + ", content: " + content);
        return 0;
      };
      Log.i.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log i", "tag: " + tag + ", content: " + content);
        return 0;
      };
      Log.w.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log w", "tag: " + tag + ", content: " + content);
        return 0;
      };
      Log.e.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log e", "tag: " + tag + ", content: " + content);
        return 0;
      };
      Log.wtf.overload("java.lang.String", "java.lang.String").implementation = function(tag, content) {
        DMLog.i("Log wtf", "tag: " + tag + ", content: " + content);
        return 0;
      };
    }
    FCAnd2.hook_log = hook_log;
    function dump_dex_common() {
      fridaUnpack.unpack_common();
    }
    FCAnd2.dump_dex_common = dump_dex_common;
    function dump_dex_loadAllClass() {
      let tag = "dd_loadAllClass";
      var dex_maps = {};
      var module = Process.findModuleByName("libart.so");
      var addr_DefineClass = null;
      var symbols = module.enumerateSymbols();
      for (var index = 0; index < symbols.length; index++) {
        var symbol = symbols[index];
        var symbol_name = symbol.name;
        if (symbol_name.indexOf("ClassLinker") >= 0 && symbol_name.indexOf("DefineClass") >= 0 && symbol_name.indexOf("Thread") >= 0 && symbol_name.indexOf("DexFile") >= 0) {
          DMLog.i(tag, `${symbol_name} : ${symbol.address}`);
          addr_DefineClass = symbol.address;
        }
      }
      DMLog.i(tag, `DefineClass: ${addr_DefineClass}`);
      if (addr_DefineClass) {
        Interceptor.attach(addr_DefineClass, {
          onEnter: function(args) {
            var dex_file = args[5];
            var base = dex_file.add(Process.pointerSize).readPointer();
            var size = dex_file.add(Process.pointerSize + Process.pointerSize).readUInt();
            if (dex_maps[String(base)] == void 0) {
              dex_maps[String(base)] = size;
              DMLog.i(tag, `hook_dex: ${base}, ${size}`);
            }
          },
          onLeave: function(retval) {
          }
        });
      }
      function dump_dex() {
        loadAllClass2();
        let tag2 = "dump_dex";
        for (var base in dex_maps) {
          var size = dex_maps[base];
          var magic = ptr(base).readCString();
          if (null != magic && magic.indexOf("dex") == 0) {
            var process_name = FCAnd2.getProcessName();
            DMLog.i(tag2, "process_name: " + process_name);
            if (process_name != "-1") {
              var dex_path = "/data/data/" + process_name + "/files/" + base + "_" + size.toString(16) + ".dex";
              DMLog.i(tag2, "dex_path: " + dex_path);
              var fd = new File(dex_path, "wb");
              if (fd && fd != null) {
                var dex_buffer = ptr(base).readByteArray(size);
                if (null != dex_buffer) {
                  fd.write(dex_buffer);
                  fd.flush();
                }
                fd.close();
                DMLog.i(tag2, "dump dex success: " + dex_path);
              }
            }
          }
        }
      }
      function loadAllClass2() {
        let tag2 = "loadAllClass2";
        Java.perform(function() {
          DMLog.i(tag2, "---------------Java.enumerateClassLoaders");
          Java.enumerateClassLoadersSync().forEach(function(loader) {
            try {
              loadAllClassCore(loader);
            } catch (e) {
              DMLog.e(tag2, "Java.enumerateClassLoaders error:" + e);
            }
          });
        });
        function loadAllClassCore(loader) {
          let tag3 = "loadAllClassCore";
          var clstr = loader.$className.toString();
          DMLog.i(tag3, "classloader: " + clstr);
          var class_BaseDexClassLoader = Java.use("dalvik.system.BaseDexClassLoader");
          var pathcl = Java.cast(loader, class_BaseDexClassLoader);
          DMLog.i(tag3, ".pathList: " + pathcl.pathList.value);
          var class_DexPathList = Java.use("dalvik.system.DexPathList");
          var dexPathList = Java.cast(pathcl.pathList.value, class_DexPathList);
          DMLog.i(tag3, ".dexElements: " + dexPathList.dexElements.value.length);
          var class_DexFile = Java.use("dalvik.system.DexFile");
          var class_DexPathList_Element = Java.use("dalvik.system.DexPathList$Element");
          for (var i = 0; i < dexPathList.dexElements.value.length; i++) {
            var dexPathList_Element = Java.cast(dexPathList.dexElements.value[i], class_DexPathList_Element);
            if (dexPathList_Element.dexFile.value) {
              var dexFile = Java.cast(dexPathList_Element.dexFile.value, class_DexFile);
              var mcookie = dexFile.mCookie.value;
              if (dexFile.mInternalCookie.value) {
                mcookie = dexFile.mInternalCookie.value;
              }
              var classNameArr = dexPathList_Element.dexFile.value.getClassNameList(mcookie);
              DMLog.i(tag3, "DexFile.getClassNameList.length:" + classNameArr.length);
              DMLog.i(tag3, "     |------------Enumerate ClassName Start");
              for (var i = 0; i < classNameArr.length; i++) {
                try {
                  loader.loadClass(classNameArr[i]);
                } catch (e) {
                  DMLog.w(tag3, "loadClass warning:" + e);
                }
              }
              DMLog.i(tag3, "     |------------Enumerate ClassName End");
            }
          }
        }
      }
      rpc.exports = {
        ddc() {
          dump_dex();
        }
      };
    }
    FCAnd2.dump_dex_loadAllClass = dump_dex_loadAllClass;
    function traceLoadlibrary() {
      const dlopen_ptr = Module.findExportByName(null, "dlopen");
      if (null != dlopen_ptr) {
        DMLog.i("traceLoadlibrary", "dlopen_ptr: " + dlopen_ptr);
        Interceptor.attach(dlopen_ptr, {
          onEnter: function(args) {
            DMLog.i("traceLoadlibrary", "loadlibrary: " + args[0].readCString());
          }
        });
      } else {
        DMLog.e("traceLoadlibrary", "dlopen_ptr is null");
      }
    }
    FCAnd2.traceLoadlibrary = traceLoadlibrary;
    function showModules() {
      const modules = Process.enumerateModules();
      modules.forEach(function(value, index, array) {
        DMLog.i("showModules", JSON.stringify(value));
      });
    }
    FCAnd2.showModules = showModules;
    function traceFopen() {
      const open_ptr = Module.findExportByName(null, "fopen");
      if (null != open_ptr) {
        DMLog.i("traceFopen", "fopen_ptr: " + open_ptr);
        Interceptor.attach(open_ptr, {
          onEnter: function(args) {
            DMLog.i("traceFopen", "file_path: " + args[0].readCString());
          }
        });
      } else {
        DMLog.e("traceFopen", "fopen_ptr is null");
      }
    }
    FCAnd2.traceFopen = traceFopen;
    function writeMemory(addr, str) {
      Memory.protect(addr, str.length, "rwx");
      addr.writeAnsiString(str);
    }
    FCAnd2.writeMemory = writeMemory;
    function newString(res) {
      if (null == res) {
        return null;
      }
      const String2 = Java.use("java.lang.String");
      return String2.$new(res);
    }
    FCAnd2.newString = newString;
    function getApplicationContext() {
      const ActivityThread = Java.use("android.app.ActivityThread");
      const Context = Java.use("android.content.Context");
      const ctx = Java.cast(ActivityThread.currentApplication().getApplicationContext(), Context);
      return ctx;
    }
    FCAnd2.getApplicationContext = getApplicationContext;
    function printByteArray(jbytes) {
      var result = "";
      for (var i = 0; i < jbytes.length; ++i) {
        result += " ";
        result += jbytes[i].toString(16);
      }
      return result;
    }
    FCAnd2.printByteArray = printByteArray;
    function printHashMap(data) {
      let result = Java.cast(data, Java.use("java.util.HashMap"));
      let keys = result.keySet().toArray();
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = result.get(key);
        DMLog.i("printHashMap", "Key: " + key.toString() + ", Value: " + value.toString());
      }
    }
    FCAnd2.printHashMap = printHashMap;
    FCAnd2.tjm_default_cls = [
      // 'E:javax.crypto.Cipher',
      // 'E:javax.crypto.spec.SecretKeySpec',
      // 'E:javax.crypto.spec.IvParameterSpec',
      // 'E:javax.crypto.Mac',
      // 'M:KeyGenerator',
      "M:Base64",
      "M:javax.crypto",
      "M:java.security",
      "E:java.lang.String"
    ];
    FCAnd2.tjm_default_white_detail = {
      /*{ clsname: {white: true/false, methods[a, b, c]} }*/
      "java.lang.String": { white: true, methods: ["toString", "getBytes"] }
    };
    function traceArtMethods(clazzes, clsWhitelist, stackFilter) {
      traceJavaMethods(clazzes, clsWhitelist, stackFilter);
    }
    FCAnd2.traceArtMethods = traceArtMethods;
    function traceJavaMethods(clazzes, clsWhitelist, stackFilter) {
      let dest_cls = [];
      let dest_white = { ...FCAnd2.tjm_default_white_detail, ...clsWhitelist };
      if (clazzes != null) {
        dest_cls = FCAnd2.tjm_default_cls.concat(clazzes);
      } else {
        dest_cls = FCAnd2.tjm_default_cls;
      }
      traceJavaMethods_custom(dest_cls, dest_white, stackFilter);
    }
    FCAnd2.traceJavaMethods = traceJavaMethods;
    function traceJavaMethods_custom(clazzes, clsWhitelist, stackFilter) {
      function match(destCls, curClsName) {
        let mode = destCls[0];
        let ex = destCls.substr(2);
        if (mode == "E") {
          return ex == curClsName;
        } else {
          return curClsName.match(ex);
        }
      }
      function sendContent(obj) {
        let str = JSON.stringify(obj);
        let stacks = null;
        if (null != stackFilter && str.indexOf(stackFilter) > -1) {
          stacks = getStacks();
          obj["stacks"] = stacks;
          if (false == firstdiscovery) {
            obj["firstdiscovery"] = true;
            firstdiscovery = true;
          }
          str = JSON.stringify(obj);
        }
        send(str);
      }
      function getMethodDescription(clsname, overload) {
        let argumentTypes = overload.argumentTypes.map((val) => val.className).toString();
        let desc = `${overload.returnType.className} ${clsname}#${overload.methodName}(${argumentTypes})`;
        return desc;
      }
      function traceJavaMethodsCore(clsname) {
        const tag = "traceJavaMethodsCore";
        let detail = null;
        if (null != clsWhitelist) {
          detail = clsWhitelist[clsname];
        }
        let cls = Java.use(clsname);
        let methods = cls.class.getDeclaredMethods();
        DMLog.i(tag, "trace cls: " + clsname + ", method size: " + methods.length);
        methods.forEach(function(method) {
          let methodName = method.getName();
          if (null != detail && typeof detail == "object") {
            if (detail.methods.indexOf(methodName) > -1 != detail.white) {
              return true;
            }
          }
          if ("invoke" == methodName) {
            return true;
          }
          let methodOverloads = cls[methodName].overloads;
          if (null != methodOverloads) {
            methodOverloads.forEach(function(overload) {
              try {
                let methodDesc = getMethodDescription(clsname, overload);
                DMLog.i(tag, "hookmethod: " + methodDesc);
                overload.implementation = function() {
                  let tid = Process.getCurrentThreadId();
                  let tname = Java.use("java.lang.Thread").currentThread().getName();
                  sendContent({
                    tid,
                    status: "entry",
                    tname,
                    classname: clsname,
                    method: methodDesc,
                    args: arguments
                  });
                  let retval = overload.apply(this, arguments);
                  sendContent({
                    tid,
                    status: "exit",
                    tname,
                    classname: clsname,
                    method: methodDesc,
                    retval
                  });
                  return retval;
                };
              } catch (e) {
                DMLog.d(tag, "overload.implementation exception:	" + overload.methodName + "	" + e.toString());
              }
            });
          }
        });
        let constructors = cls.class.getConstructors();
        if (null != constructors && (null == detail || detail.methods.indexOf("$init") > -1)) {
          try {
            let methodOverloads = cls["$init"].overloads;
            methodOverloads.forEach(function(overload) {
              overload.implementation = function() {
                let tid = Process.getCurrentThreadId();
                let tname = Java.use("java.lang.Thread").currentThread().getName();
                sendContent({
                  tid,
                  status: "entry",
                  tname,
                  classname: clsname + "_$init",
                  method: overload.holder.toString(),
                  method_: overload._p[0],
                  args: arguments
                });
                const retval = this["$init"].apply(this, arguments);
                sendContent({
                  tid,
                  status: "exit",
                  tname,
                  classname: clsname,
                  method: overload.holder.toString(),
                  retval
                });
                return retval;
              };
            });
          } catch (e) {
          }
        }
      }
      Java.enumerateLoadedClassesSync().forEach((curClsName, index, array) => {
        clazzes.forEach((destCls) => {
          if (match(destCls, curClsName)) {
            traceJavaMethodsCore(curClsName);
            return false;
          }
        });
      });
    }
    FCAnd2.traceJavaMethods_custom = traceJavaMethods_custom;
    function toJSONString(obj) {
      if (null == obj) {
        return "obj is null";
      }
      let resstr = "";
      let GsonBuilder = null;
      try {
        GsonBuilder = Java.use("com.google.gson.GsonBuilder");
      } catch (e) {
        FCAnd2.registGson();
        GsonBuilder = Java.use("com.google.gson.GsonBuilder");
      }
      if (null != GsonBuilder) {
        try {
          const gson = GsonBuilder.$new().serializeNulls().serializeSpecialFloatingPointValues().disableHtmlEscaping().setLenient().create();
          resstr = gson.toJson(obj);
        } catch (e) {
          DMLog.e("gson.toJson", "exceipt: " + e.toString());
          resstr = FCAnd2.parseObject(obj);
        }
      }
      return resstr;
    }
    FCAnd2.toJSONString = toJSONString;
    function parseObject(data) {
      try {
        const declaredFields = data.class.getDeclaredFields();
        let res = {};
        for (let i = 0; i < declaredFields.length; i++) {
          const field = declaredFields[i];
          field.setAccessible(true);
          const type = field.getType();
          let fdata = field.get(data);
          if (null != fdata) {
            if (type.getName() != "[B") {
              fdata = fdata.toString();
            } else {
              fdata = Java.array("byte", fdata);
              fdata = JSON.stringify(fdata);
            }
          }
          res[field.getName()] = fdata;
        }
        return JSON.stringify(res);
      } catch (e) {
        return "parseObject except: " + e.toString();
      }
    }
    FCAnd2.parseObject = parseObject;
    function registGson() {
      try {
        let dexpath = "/data/local/tmp/fclibs/gson.jar";
        Java.openClassFile(dexpath).load();
      } catch (e) {
        DMLog.e("registGson", "exception, please try to run `setupAndorid.py`");
      }
    }
    FCAnd2.registGson = registGson;
    function useWithDexClassLoader(clsname, callback) {
      const tag = "useWithDexClassLoader";
      var dexclassLoader = Java.use("dalvik.system.DexClassLoader");
      dexclassLoader.$init.implementation = function(dexPath, optimizedDirectory, librarySearchPath, parent) {
        DMLog.d(tag, "dexPath: " + dexPath);
        DMLog.d(tag, "optimizedDirectory: " + optimizedDirectory);
        DMLog.d(tag, "librarySearchPath: " + librarySearchPath);
        DMLog.d(tag, "parent: " + parent);
        this.$init(dexPath, optimizedDirectory, librarySearchPath, parent);
        let cls = this.loadClass(clsname);
        if (null != cls) {
          DMLog.w("dex_loadclass", "found: " + clsname);
          callback(cls);
        }
      };
    }
    FCAnd2.useWithDexClassLoader = useWithDexClassLoader;
    function useWhenLoadClass(clsname, callback) {
      const ClassLoader = Java.use("java.lang.ClassLoader");
      ClassLoader.loadClass.overload("java.lang.String").implementation = function(name) {
        const cls = this.loadClass(name);
        if (name.indexOf(clsname) > -1) {
          DMLog.w("useWhenLoadClass", `name: ${clsname} matched!`);
          try {
            const clsFactory = Java.ClassFactory.get(this);
            const useCls = clsFactory.use(clsname);
            DMLog.e("loadClass", "name: " + name);
            callback(useCls);
          } catch (e) {
            DMLog.e("useWhenLoadClass", "exception: " + e);
          }
        }
        return cls;
      };
    }
    FCAnd2.useWhenLoadClass = useWhenLoadClass;
    function useWithInMemoryDexClassLoader(clsname, callback) {
      const tag = "useWithInMemoryDexClassLoader";
      try {
        const InMemoryDexClassLoader = Java.use("dalvik.system.InMemoryDexClassLoader");
        InMemoryDexClassLoader.$init.overload("java.nio.ByteBuffer", "java.lang.ClassLoader").implementation = function(buff, loader) {
          this.$init(buff, loader);
          let clsFactory = Java.ClassFactory.get(this);
          try {
            let result = clsFactory.use(clsname);
            DMLog.w(tag, JSON.stringify(result));
            callback(result);
          } catch (e) {
            DMLog.e(tag, `${clsname} not found: ${e}`);
          }
        };
      } catch (e) {
        DMLog.e(tag, e.toString());
      }
    }
    FCAnd2.useWithInMemoryDexClassLoader = useWithInMemoryDexClassLoader;
    function useWithBaseDexClassLoader(clsname, callback) {
      const tag = "useWithBaseDexClassLoader";
      var dexclassLoader = Java.use("dalvik.system.BaseDexClassLoader");
      dexclassLoader.$init.overload("java.lang.String", "java.io.File", "java.lang.String", "java.lang.ClassLoader").implementation = function(dexPath, optimizedDirectory, librarySearchPath, parent) {
        DMLog.d(tag, "dexPath: " + dexPath);
        DMLog.d(tag, "optimizedDirectory: " + optimizedDirectory);
        DMLog.d(tag, "librarySearchPath: " + librarySearchPath);
        DMLog.d(tag, "parent: " + parent);
        this.$init(dexPath, optimizedDirectory, librarySearchPath, parent);
        let clsFactory = Java.ClassFactory.get(this);
        try {
          let result = clsFactory.use(clsname);
          DMLog.w(tag, JSON.stringify(result));
          callback(result);
        } catch (e) {
          DMLog.e(tag, `${clsname} not found: ${e}`);
        }
      };
    }
    FCAnd2.useWithBaseDexClassLoader = useWithBaseDexClassLoader;
    function showNativeStacks(context) {
      DMLog.i("showNativeStacks", "	Backtrace:\n	" + Thread.backtrace(
        context,
        Backtracer.ACCURATE
      ).map(DebugSymbol.fromAddress).join("\n	"));
    }
    FCAnd2.showNativeStacks = showNativeStacks;
    function hook_send_recv() {
      var myModule = Process.getModuleByName("libc.so");
      var myFuncs = ["recv", "send"];
      myModule.enumerateExports().filter((module_export) => module_export.type === "function" && myFuncs.some((fName) => module_export.name.includes(fName))).forEach((module_export) => {
        Interceptor.attach(module_export.address, {
          onEnter: function(args) {
            const tag = module_export.name + "_onEnter";
            var fd = args[0].toInt32();
            var socktype = Socket.type(fd);
            var sockaddr = Socket.peerAddress(fd);
            if (socktype !== "tcp" && socktype !== "tcp6" || sockaddr === null)
              return;
            try {
              var len = args[2].toInt32();
              this.buf = new NativePointer(args[1]);
              var data = {
                "event": module_export.name,
                "fd": fd,
                "sockaddr": sockaddr,
                "socktype": socktype
                // 'buffer': printByte2(buf2hex(buf))
              };
              DMLog.i(tag, "\n");
              DMLog.i(tag, JSON.stringify(data));
              FCAnd2.showNativeStacks(this.context);
            } catch (err) {
              DMLog.e(tag, err);
            }
          },
          onLeave: function(retval) {
            if (void 0 != this.buf) {
              const retlen = retval.toInt32();
              DMLog.i(module_export.name + "_onLeave", "size:" + retval);
              if (-1 != retlen) {
                DMLog.i(module_export.name + "_onLeave", "\n" + hexdump(this.buf, {
                  offset: 0,
                  length: retlen,
                  header: true,
                  ansi: false
                }));
              }
            }
          }
        });
      });
    }
    FCAnd2.hook_send_recv = hook_send_recv;
    function replaceMemoryData(addr, size, pattern, distarr, replaceAll) {
      const tag = "replaceMemoryData";
      let dest = Memory.scanSync(addr, size, pattern);
      if (null != dest && dest.length > 0) {
        DMLog.i(tag, "found dest");
        if (replaceAll) {
          dest.forEach(function(match) {
            match.address.writeByteArray(distarr);
            DMLog.i(tag, "foreach replaced address: " + match.address);
          });
        } else {
          dest[0].address.writeByteArray(distarr);
          DMLog.i(tag, "replaced address: " + dest[0].address);
        }
      }
    }
    FCAnd2.replaceMemoryData = replaceMemoryData;
    function findClass(clsname) {
      FCAnd2.useWhenLoadClass(clsname, function(cls) {
        DMLog.i("findclass useWhenLoadClass", "" + cls);
      });
      FCAnd2.useWithDexClassLoader(clsname, function(cls) {
        DMLog.i("findclass useWithDexClassLoader", "" + cls);
      });
      FCAnd2.useWithBaseDexClassLoader(clsname, function(cls) {
        DMLog.i("findclass useWithBaseDexClassLoader", "" + cls);
      });
      FCAnd2.useWithInMemoryDexClassLoader(clsname, function(cls) {
        DMLog.i("findclass useWithInMemoryDexClassLoader", "" + cls);
      });
    }
    FCAnd2.findClass = findClass;
    function enumerateClassLoadersAndUse(clsname, callback) {
      const tag = "enumerateClassLoadersAndUse";
      enumerateClassLoadersAndGetFactory(clsname, function(cf) {
        try {
          let cls = cf.use(clsname);
          callback(cls);
        } catch (e) {
          DMLog.e(tag, `use ${clsname} excepted: ${e}`);
        }
      });
    }
    FCAnd2.enumerateClassLoadersAndUse = enumerateClassLoadersAndUse;
    function enumerateClassLoadersAndGetFactory(clsname, callback) {
      const tag = "enumerateClassLoadersAndGetFactory";
      Java.enumerateClassLoaders({
        onMatch(loader) {
          try {
            let cls = loader.loadClass(clsname);
            if (null != cls) {
              DMLog.i(tag, "found cls: " + cls);
              let cf = Java.ClassFactory.get(loader);
              callback(cf);
            }
          } catch (e) {
            DMLog.w(tag, `classloader: ${loader} not found:${e.toString()}`);
          }
        },
        onComplete() {
          DMLog.i(tag, "completed .");
        }
      });
    }
    FCAnd2.enumerateClassLoadersAndGetFactory = enumerateClassLoadersAndGetFactory;
    function attachWhenSoLoad(soname, offsetAddr, callback) {
      whenSoLoad(soname, function(mod) {
        Interceptor.attach(mod.base.add(offsetAddr), callback);
      });
    }
    FCAnd2.attachWhenSoLoad = attachWhenSoLoad;
    function whenSoLoad(soname, callback) {
      const VERSION = Java.use("android.os.Build$VERSION");
      let dlopenFuncName = "android_dlopen_ext";
      if (VERSION.SDK_INT.value <= 23) {
        dlopenFuncName = "dlopen";
      }
      var so_listener = Interceptor.attach(Module.findExportByName(null, dlopenFuncName), {
        onEnter: function(args) {
          this.sopath = args[0].readCString();
        },
        onLeave: function(retval) {
          let sopath = this.sopath;
          DMLog.d("WhenSoLoad dlopen", `sopath: ${sopath}`);
          if (null != sopath && sopath.indexOf(soname) > -1) {
            let mod = Module.load(sopath);
            callback(mod);
            so_listener.detach();
          }
        }
      });
    }
    FCAnd2.whenSoLoad = whenSoLoad;
    function prettyMethod_C(name) {
      let ptr__cxa_demangle = Module.findExportByName("libc++.so", "__cxa_demangle");
      if (null == ptr__cxa_demangle) {
        DMLog.e("libc++.so", "__cxa_demangle not found");
        return;
      }
      let max_size = 512;
      let addr = Memory.alloc(max_size);
      let buffaddr = Memory.alloc(max_size);
      let buffsize = Memory.alloc(Process.pointerSize);
      let status = Memory.alloc(Process.pointerSize);
      addr.writeUtf8String(name);
      buffsize.writeUInt(max_size);
      status.writeUInt(0);
      let func_cxa_demangle = new NativeFunction(ptr__cxa_demangle, "pointer", ["pointer", "pointer", "pointer", "pointer"]);
      func_cxa_demangle(addr, buffaddr, buffsize, status);
      let result = buffaddr.readCString();
      return result;
    }
    FCAnd2.prettyMethod_C = prettyMethod_C;
    function prettyMethod_Jni(methodId, withSignature) {
      let result = FCCommon.newStdString();
      Java.api["art::ArtMethod::PrettyMethod"](result, methodId, withSignature);
      return result.disposeToString();
    }
    FCAnd2.prettyMethod_Jni = prettyMethod_Jni;
    function getProcessName() {
      var openPtr = Module.getExportByName("libc.so", "open");
      var open = new NativeFunction(openPtr, "int", ["pointer", "int"]);
      var readPtr = Module.getExportByName("libc.so", "read");
      var read = new NativeFunction(readPtr, "int", ["int", "pointer", "int"]);
      var closePtr = Module.getExportByName("libc.so", "close");
      var close = new NativeFunction(closePtr, "int", ["int"]);
      var path = Memory.allocUtf8String("/proc/self/cmdline");
      var fd = open(path, 0);
      if (fd != -1) {
        var buffer = Memory.alloc(4096);
        var readsize = read(fd, buffer, 4096);
        close(fd);
        let result = buffer.readCString();
        return result;
      }
      return null;
    }
    FCAnd2.getProcessName = getProcessName;
    function watch_svc_address_list(base, address_list) {
      address_list.forEach((addr) => {
        let addr_offset = parseInt(addr, 16);
        Interceptor.attach(base.add(addr_offset), {
          onEnter: function(args) {
            FCAnd2.showNativeStacks(this.context);
          }
        });
      });
    }
    FCAnd2.watch_svc_address_list = watch_svc_address_list;
    function byteshexdump(bytes) {
      if (!bytes || bytes.length === 0) return;
      const kHexChars = "0123456789abcdef";
      let offset = 0;
      while (offset < bytes.length) {
        let hex = offset.toString(16).padStart(8, "0") + "  ";
        let ascii = "";
        for (let i = 0; i < 16; i++) {
          if (offset + i < bytes.length) {
            const b = bytes[offset + i] & 255;
            hex += kHexChars[b >> 4 & 15] + kHexChars[b & 15] + " ";
            ascii += b >= 32 && b <= 126 ? String.fromCharCode(b) : ".";
          } else {
            hex += "   ";
            ascii += " ";
          }
          if (i === 7) hex += " ";
        }
        console.log(hex + " |" + ascii + "|");
        offset += 16;
      }
    }
    FCAnd2.byteshexdump = byteshexdump;
  })(FCAnd || (FCAnd = {}));

  // index.ts
  Java.perform(function() {
    function hookMethods(targetClass, targetMethod, start = null, end = null) {
      try {
        var targetClassMethod = targetClass + "." + targetMethod;
        var hook = Java.use(targetClass);
        console.log(hook);
        var overloadCount = hook[targetMethod].overloads.length;
        console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
        for (var i = 0; i < overloadCount; i++) {
          hook[targetMethod].overloads[i].implementation = function() {
            var log = targetClassMethod + "(";
            var retval = null;
            if (start) {
              retval = start(this, arguments);
            } else {
              for (var j = 0; j < arguments.length; j++) {
                log = log + arguments[j];
                if (j != arguments.length - 1) {
                  log = log + ",";
                }
              }
              log = log + ")";
              console.log(log);
            }
            if (!retval)
              retval = this[targetMethod].apply(this, arguments);
            if (end) {
              retval = end(this, retval, arguments);
            }
            if (retval == "void") {
              return;
            }
            return retval;
          };
        }
        hook.$dispose;
      } catch (e) {
        console.error(e);
        console.error("hook[" + targetClass + "]\u5931\u8D25");
        return;
      }
    }
  });
  Java.perform(function() {
    const targetClass = "com.rookie.v.data.api.Proxy";
    function hookClassMethods(className, methodName) {
      const targetClass2 = Java.use(className);
      const methods = targetClass2.class.getDeclaredMethods();
      methods.forEach((method) => {
        if (methodName == "*") {
          methodName = method.getName();
        } else if (methodName != method.getName()) {
          return;
        }
        const overloads = targetClass2[methodName].overloads;
        overloads.forEach((overload) => {
          overload.implementation = function() {
            const signature = `${className}.${methodName}(${overload.argumentTypes.map((t) => t.className).join(",")})`;
            console.log(`[+] Called: ${signature}`);
            for (let i = 0; i < arguments.length; i++) {
              console.log(`  arg${i}: ${JSON.stringify(arguments[i])}`);
            }
            const result = this[methodName].apply(this, arguments);
            if ('"http://47.239.115.80/e4ebc517-c46e-40d5-9bfb-e302cde331bf/api/info"' == JSON.stringify(result)) {
              console.log(`1231231`);
              FCAnd.showStacks();
            }
            console.log(`  <= Return: ${JSON.stringify(result)}`);
            if (methodName == "copy$default") {
              console.log(arguments[0]);
            }
            return result;
          };
        });
      });
    }
    hookClassMethods("com.rookie.v.libs.AES", "getDesedeCipher");
    DMLog.i("MAIN", "HELLO FridaContainer, please add code on the index.ts1");
  });
  function main() {
    DMLog.d("MAIN", "HELLO FridaContainer, please add code on the index.ts");
  }
  if (Java.available) {
    DMLog.i("JAVA", "available");
    Java.perform(function() {
      main();
    });
  }
  function isProbablyUtf8(buffer) {
    const BufferCls = Java.use("okio.Buffer");
    const Character = Java.use("java.lang.Character");
    const prefix = BufferCls.$new();
    const byteCount = Math.min(buffer.size(), 64);
    buffer.copyTo(prefix, 0, byteCount);
    for (let i = 0; i < 16; i++) {
      if (prefix.exhausted()) break;
      const codePoint = prefix.readUtf8CodePoint();
      if (Character.isISOControl(codePoint) && !Character.isWhitespace(codePoint)) {
        return false;
      }
    }
    return true;
  }
  function hookInterceptor(name) {
    Java.perform(function() {
      const CallServerInterceptor = Java.use(name);
      const BufferCls = Java.use("okio.Buffer");
      const GzipSource = Java.use("okio.GzipSource");
      CallServerInterceptor.intercept.implementation = function(chain) {
        const logLines = [];
        const request = chain.request();
        const method = request.method();
        const url = request.url().toString();
        const requestHeaders = request.headers();
        logLines.push("\n\u{1F4E4}====================[ OkHttp Request ]====================\u{1F4E4}");
        logLines.push(`\u27A1\uFE0F ${method} ${url}`);
        let curlParts = [`curl -X ${method}`];
        curlParts.push(`'${url}'`);
        logLines.push("\u{1F538} Headers:");
        for (let i = 0; i < requestHeaders.size(); i++) {
          const name2 = requestHeaders.name(i);
          const value = requestHeaders.value(i);
          logLines.push(`   ${name2}: ${value}`);
          curlParts.push(`-H '${name2}: ${value}'`);
        }
        let curlBodyStr = "";
        const requestBody = request.body();
        if (requestBody != null && !requestBody.isDuplex() && !requestBody.isOneShot()) {
          const buffer2 = BufferCls.$new();
          requestBody.writeTo(buffer2);
          if (isProbablyUtf8(buffer2)) {
            logLines.push("\u{1F4DD} Body:");
            const bodyText = buffer2.readUtf8();
            const truncated = bodyText.length > 1e3 ? bodyText.substring(0, 1e3) + "..." : bodyText;
            logLines.push(truncated);
            curlBodyStr = bodyText.replace(/'/g, "'\\''");
            logLines.push(`--> END ${method} (${requestBody.contentLength()}-byte body)`);
          } else {
            logLines.push(`--> END ${method} (binary ${requestBody.contentLength()}-byte body omitted)`);
          }
        } else {
          logLines.push(`--> END ${method}`);
        }
        if (curlBodyStr.length > 0) {
          curlParts.push(`--data '${curlBodyStr}'`);
        }
        let curl = curlParts.join(" ");
        logLines.push("\n\u{1F4E6} CURL (Linux/macOS/bash):");
        logLines.push(curl);
        logLines.push("\n\u{1F4E6} CURL (Windows/PowerShell):");
        logLines.push(curl.replace(/^curl\b/, "curl.exe"));
        const startNs = Java.use("java.lang.System").nanoTime();
        let response;
        try {
          response = this.intercept(chain);
        } catch (e) {
          logLines.push("<-- \u274C HTTP FAILED: " + e);
          throw e;
        }
        const tookMs = (Java.use("java.lang.System").nanoTime() - startNs) / 1e6;
        const responseBody = response.body();
        const contentLength = responseBody.contentLength();
        const responseHeaders = response.headers();
        logLines.push("\n\u{1F4E5}====================[ OkHttp Response ]====================\u{1F4E5}");
        logLines.push(`\u2B05\uFE0F ${response.code()} ${response.message()} (${tookMs}ms)`);
        logLines.push(`\u21A9\uFE0F URL: ${response.request().url()}`);
        logLines.push("\u{1F538} Headers:");
        for (let i = 0; i < responseHeaders.size(); i++) {
          const name2 = responseHeaders.name(i);
          const value = responseHeaders.value(i);
          logLines.push(`   ${name2}: ${value}`);
        }
        const encoding = responseHeaders.get("Content-Encoding");
        const source = responseBody.source();
        source.request(Java.use("java.lang.Long").MAX_VALUE.value);
        let buffer = source.buffer();
        buffer = Java.cast(buffer, BufferCls);
        let gzippedLength = null;
        if (encoding !== null && encoding.toLowerCase() === "gzip") {
          gzippedLength = buffer.size();
          const gzipSource = GzipSource.$new(Java.cast(buffer.clone(), BufferCls));
          const decompressedBuffer = BufferCls.$new();
          decompressedBuffer.writeAll(gzipSource);
          buffer = decompressedBuffer;
        }
        if (!isProbablyUtf8(buffer)) {
          logLines.push("\u26A0\uFE0F  Response body is binary. Skipped logging.");
          logLines.push(`<-- END HTTP (binary ${buffer.size()}-byte body omitted)`);
          return response;
        }
        if (contentLength !== 0) {
          const bodyText = Java.cast(buffer.clone(), BufferCls).readUtf8();
          logLines.push("\u{1F4C4} Body:");
          logLines.push(bodyText.length > 1e3 ? bodyText.substring(0, 1e3) + "..." : bodyText);
        }
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
  setImmediate(function() {
    hookInterceptor("okhttp3.internal.http.CallServerInterceptor");
  });
})();
