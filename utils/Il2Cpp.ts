import "frida-il2cpp-bridge"
import Java from "frida-java-bridge";



export function traceMethods(domain: string, classname: string = "*", methodname: string = "*", methodFilter: string[] = [], parameters = true, verbose = true) {
    Il2Cpp.trace(parameters)
        .verbose(verbose)
        .assemblies(Il2Cpp.domain.assembly(domain))
        .filterClasses(Classes => {
            if (classname == "*")
                return true;
            if (classname.startsWith("*")) {
                return Classes.name.toLowerCase().includes(classname.substring(1).toLowerCase())
            } else {
                return Classes.name.toLowerCase() == classname.toLowerCase()
            }
        })
        .filterMethods(method => {
            if (method.name.startsWith("<")) {
                return false
            }
            if (methodFilter) {
                if (methodFilter.includes(method.name)) {
                    return false
                }
            }
            if (methodname == "*")
                return true;
            if (methodname.startsWith("*")) {
                return method.name.toLowerCase().includes(methodname.substring(1).toLowerCase())
            } else {
                return method.name.toLowerCase() == methodname.toLowerCase()
            }
        })
        .and()
        .attach();
}

export function traceMethodsReturnBoolean(domain: string, classname: string = "*", methodname: string = "*", methodFilter: string[] = [], parameters = true, verbose = true) {
    Il2Cpp.trace(parameters)
        .verbose(verbose)
        .assemblies(Il2Cpp.domain.assembly(domain))
        .filterClasses(Classes => {
            if (classname == "*")
                return true;
            if (classname.startsWith("*")) {
                return Classes.name.toLowerCase().includes(classname.substring(1).toLowerCase())
            } else {
                return Classes.name.toLowerCase() == classname.toLowerCase()
            }
        })
        .filterMethods(method => {
            if (method.returnType.name != "System.Boolean") {
                return false
            }
            if (method.name.startsWith("<")) {
                return false
            }
            
            if (methodFilter) {
                if (methodFilter.includes(method.name)) {
                    return false
                }
            }
            if (methodname == "*")
                return true;
            if (methodname.startsWith("*")) {
                return method.name.toLowerCase().includes(methodname.substring(1).toLowerCase())
            } else {
                return method.name.toLowerCase() == methodname.toLowerCase()
            }
        })
        .and()
        .attach();
}


export function traceReturnType(typename, domain: string, classname: string = "*", methodname: string = "*", methodFilter: string[] = [], parameters = true, verbose = true) {
    Il2Cpp.trace(parameters)
        .verbose(verbose)
        .assemblies(Il2Cpp.domain.assembly(domain))
        .filterClasses(Classes => {
            if (classname == "*")
                return true;
            if (Classes.name.startsWith("<>")) {
                return false;
            }
            if (classname.startsWith("*")) {
                return Classes.name.toLowerCase().includes(classname.substring(1).toLowerCase())
            } else {
                return Classes.name.toLowerCase() == classname.toLowerCase()
            }
        })
        .filterMethods(method => {
            if (typename.startsWith("*")) {
                if (!method.returnType.name.includes(typename.substring(1)))
                    return false
            } else if (method.returnType.name != typename) {
                return false
            }
            if (methodFilter) {
                if (methodFilter.includes(method.name)) {
                    return false
                }
            }
            if (methodname == "*")
                return true;

            if (methodname.startsWith("*")) {
                return method.name.toLowerCase().includes(methodname.substring(1).toLowerCase())
            } else {
                return method.name.toLowerCase() == methodname.toLowerCase()
            }
        })
        .and()
        .attach();
}
export function backTraceMethods(domain: string, classname: string = "*", methodname: string = "*", parameters = true, verbose = true) {
    Il2Cpp.backtrace()
        .verbose(verbose)
        .assemblies(Il2Cpp.domain.assembly(domain))
        .filterClasses(Classes => {
            if (classname == "*")
                return true;
            if (classname.startsWith("*")) {
                return Classes.name.toLowerCase().includes(classname.substring(1).toLowerCase())
            } else {
                return Classes.name.toLowerCase() == classname.toLowerCase()
            }
        })
        .filterMethods(method => {
            if (methodname == "*")
                return true;
            if (methodname.startsWith("*")) {
                return method.name.toLowerCase().includes(methodname.substring(1).toLowerCase())
            } else {
                return method.name.toLowerCase() == methodname.toLowerCase()
            }
        })
        .and()
        .attach();
}
export function enumerateFieldsValue1(object: any) {
    class FieldsPrint {
        depth: number
        max_depth: number
        object: any
        constructor(object: any, depth = 0, max_depth = 0) {
            this.depth = depth
            this.max_depth = max_depth
            //console.log(this.object)

            if (object instanceof Il2Cpp.Object) {
                this.object = object
            } else if (object instanceof Il2Cpp.Class) {
                this.object = object
            } else if (object instanceof Il2Cpp.ValueType) {
                this.object = object
            }
            this.getFields(object)

        }
        /*getFields(object: Il2Cpp.Object, depth = 0, fixstart = "") {
            var text = ""
            object.class.fields.forEach(field => {
                if (!field.isStatic) {
                    try {
                        if (field.type.enumValue == 18 && depth < this.max_depth) {
                            text += this.getFields(object.field<Il2Cpp.Object>(field.name).value, depth + 1, fixstart + field.name + ".")
                        } else {
                            text += ' '.repeat(depth) + fixstart + field.name + " = " + object.field(field.name).value + "\n"
                        }
                    } catch (error) {
                        text += ' '.repeat(depth) + fixstart + field.name + " = read err\n"
                    }
                }
            })
            return text

        }*/
        getObjectFields(object: Il2Cpp.Object, depth = 0, fixstart = "") {
            console.log(fixstart + "┌─" + object.class.name)


            var text = ""
            object.class.fields.forEach(field => {
                if (!field.isStatic) {
                    try {
                        text += ' '.repeat(depth) + fixstart + field.name + " = " + object.field(field.name).value + "\n"
                    } catch (error) {
                        text += ' '.repeat(depth) + fixstart + field.name + " = read err\n"
                    }
                }
            })
            return text

        }
        getFields(object: any) {
            var text = ""
            if (this.object instanceof Il2Cpp.Object) {
                text += this.getObjectFields(this.object)
            }
            return text
        }
        toString() {
            return this.getFields(this.object)
            var text = ""
            if (this.object instanceof Il2Cpp.array) {
                console.log("Il2Cpp.array")
            } else if (this.object instanceof Il2Cpp.ValueType) {
                console.log("Il2Cpp.ValueType")
            }
            if (this.object instanceof Il2Cpp.Object) {
                console.log(this.object)

                return this.getFields(this.object)
            } else {
                return "err"
            }
            return text
        }
    }
    var Fields = new FieldsPrint(object)
    return Fields;
}
export function enumerateFieldsValue(object: any, name = "") {
    function getDepthFix(depth = 0) {
        return `\x1b[0m${"│ ".repeat(depth)}`
    }

    function getStartClassText(name: string) {
        return `\x1b[0m┌─\x1b[35m${name}`
    }
    function getEndClassText(name: string) {
        return `\x1b[0m└─\x1b[35m${name}`
    }
    function getKeyValueText(key: string, value: any) {
        return `\x1b[32m"${key}"\x1b[0m = \x1b[36m${value}`
    }
    function getErrKeyValueText(key: string, value: any) {
        return `\x1b[32m"${key}"\x1b[0m = \x1b[31m${value}`
    }
    function getJsonText(json: object) {
        var ret = "\x1b[0m{"
        var keys = []
        Object.keys(json).forEach(key => {
            keys.push(getKeyValueText(key, json[key]))
        })
        ret += keys.join(",")
        ret += "\x1b[0m}"
        return ret
    }
    function printObjectFields(name: string, object: Il2Cpp.Object, depth, max_depth) {
        console.log(getDepthFix(depth) + getStartClassText(object.class.name) + ` \x1b[32m"${name}"`)
        object.class.fields.forEach(field => {
            if (!field.isStatic) {
                try {
                    var value = object.field(field.name).value
                    if (depth + 1 <= max_depth) {
                        if (field.type.enumValue == 18) {
                            printFields(field.name, value, depth + 1, max_depth)
                            return
                        }
                    }
                    console.log(getDepthFix(depth + 1) + getKeyValueText(field.name, value))
                } catch (error) {
                    console.log(getDepthFix(depth + 1) + getErrKeyValueText(field.name, error))
                }
            }
        })
        console.log(getDepthFix(depth) + getEndClassText(object.class.name))
    }
    function printArrayFields(name: string, object: Il2Cpp.Array, depth, max_depth) {
        console.log(getDepthFix(depth) + getStartClassText(object.elementType.toString() + "[]") + ` \x1b[32m"${name}" : ` + getJsonText({ "length": object.length }))
        for (let ii = 0; ii < object.length; ii++) {
            printFields(ii.toString(), object.get(ii), depth + 1, max_depth)
        }
        console.log(getDepthFix(depth) + getEndClassText(object.elementType.toString() + "[]"))

    }
    function printValueTypeFields(name: string, object: Il2Cpp.ValueType, depth, max_depth) {
        console.log(getDepthFix(depth) + getStartClassText(object.type.class.fullName) + ` \x1b[32m "${name}"`)
        object.type.class.fields.forEach(field => {
            if (!field.isStatic) {
                try {
                    var value = object.field(field.name).value
                    if (depth + 1 <= max_depth) {
                        printFields(field.name, value, depth + 1, max_depth)
                        return
                    }
                    console.log(getDepthFix(depth + 1) + getKeyValueText(field.name, value))
                } catch (error) {
                    console.log(getDepthFix(depth + 1) + getErrKeyValueText(field.name, error))
                }
            }
        })
        console.log(getDepthFix(depth) + getEndClassText(object.type.class.fullName))

    }
    function printFields(name: string, object: any, depth, max_depth) {
        if (object instanceof Il2Cpp.Object) {
            printObjectFields(name, object, depth, max_depth)
        } else if (object instanceof Il2Cpp.Array) {
            printArrayFields(name, object, depth, max_depth)
        } else if (object instanceof Il2Cpp.ValueType) {
            printValueTypeFields(name, object, depth, max_depth)
        }else if (object instanceof Il2Cpp.String) {
            //printValueTypeFields(name, object, depth, max_depth)
            console.log(getDepthFix(depth) + getKeyValueText(name, object))
        } else {
            console.log(getDepthFix(depth) + getErrKeyValueText(name, object))
        }
    }
    printFields(name, object, 0, 1)
    console.log(`\x1b[0m`)


}

export function getDictionaryKeys(object: any) {
    var ret = []
    if (object instanceof Il2Cpp.Object) {
        for (let ii = 0; ii < (object.method("get_Count").invoke() as number); ii++) {
            object.method("get_Item").invoke(ii)
        }
    }
    return ret

}

export function findClass(classname: string) {
    const assemblies = Il2Cpp.domain.assemblies;
    console.log(`Found ${assemblies.length} assemblies:`);
    assemblies.forEach(assembly => {
        const classes = assembly.image.classes;
        classes.forEach(cls => {
            if (cls.name.includes(classname)) {
                console.log(`- Name: ${assembly.name}`);
                console.log(`  Image: ${assembly.image.name}`);
                console.log(`  Classes: ${classes.length}`);

                console.log(`    - ${cls.name} (${cls.methods.length} methods)`);
            }

        });
    });
}



