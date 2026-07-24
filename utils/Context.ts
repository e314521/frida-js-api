
import Java from "frida-java-bridge";



function getApplication(): Java.Wrapper<{}> {
    return <Java.Wrapper>Java.use("android.app.ActivityThread").currentApplication();
}

function getContext(): Java.Wrapper<{}> {
    return <Java.Wrapper>getApplication().getApplicationContext()
}
function getPackageManager(context: Java.Wrapper<{}> | null = null): Java.Wrapper<{}>{
    if (context) {
        return <Java.Wrapper>context.getPackageManager();
    }
    return <Java.Wrapper>getContext().getPackageManager()
}
function getPackageName(context: Java.Wrapper<{}> | null = null):string {
    if (context) {
        return context.getPackageName();
    }
    return getContext().getPackageName()
}



function getPackageInfo(context: Java.Wrapper<{}> | null = null): Java.Wrapper<{}> {
    return getPackageManager(context).getPackageInfo(getPackageName(context), 0);
}

function getPackageVersionName(context: any = null):string {
    return (<Java.Field>getPackageInfo(context).versionName).value; // 获取版本名称
}
function getPackageVersionCode(context: any = null):string {
    return (<Java.Field>getPackageInfo(context).versionCode).value; // 获取版本号

}



export { getContext, getPackageInfo, getPackageName, getPackageVersionName, getPackageVersionCode }