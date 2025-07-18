import "frida-il2cpp-bridge"
import Java from "frida-java-bridge";



export function traceMethods(domain: string, classname: string = "*", methodname: string = "*", methodFilter: string[] = [],parameters = true, verbose = true) {
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
            if (methodFilter){
                if(methodFilter.includes(method.name)){
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


export function traceReturnType(typename, domain: string, classname: string = "*", methodname: string = "*", methodFilter: string[] = [],parameters = true, verbose = true) {
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
                if(!method.returnType.name.includes(typename.substring(1)))
                    return false
            }else if (method.returnType.name != typename){
                return false
            }
            if (methodFilter){
                if(methodFilter.includes(method.name)){
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
        //.verbose(verbose)
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
export function enumerateFieldsValue(object: any) {
     class FieldsPrint{
        depth: number
        max_depth: number
        object: any
        constructor(object:any ,depth = 0, max_depth = 1) {
            this.depth = depth
            this.max_depth = max_depth
            //console.log(this.object)
            
            if (object instanceof Il2Cpp.Object){
                this.object = object
            }else if (object instanceof Il2Cpp.Class){
                this.object = object
            }else if (object instanceof Il2Cpp.ValueType){
                this.object = object
            }
        }
        getFields(object:Il2Cpp.Object, depth = 0, fixstart = ""){
            var text = ""
            object.class.fields.forEach(field => {
                if (!field.isStatic){
                    try {
                        if (field.type.enumValue == 18 && depth < this.max_depth){
                            text += this.getFields(object.field<Il2Cpp.Object>(field.name).value, depth + 1, fixstart + field.name + ".")
                        }else{
                            text += ' '.repeat(depth) + fixstart + field.name + " = " + object.field(field.name).value + "\n"
                        }
                    } catch (error) {
                        text += ' '.repeat(depth) + fixstart + field.name + " = read err\n"
                    }
                }
            })
            return text

        }
        toString() {
            var text = ""
            if (this.object instanceof Il2Cpp.Object){
                return this.getFields(this.object, this.depth)
            }else{
                return "err"
            }
            return text
         }
     }
    var Fields = new FieldsPrint(object)
    return Fields;
}



