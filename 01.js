const path = require("path");
const fs = require("fs");
const vm = require("vm");

//创建一个NJModule类
class NJModule{
    constructor(id){
        this.id = id; //保存当前模块的绝对路径
        this.exports = {};
    }
}
 
//存储模块 用于缓存
NJModule._cache = {};
//存储不同后缀名的文件,的解析
NJModule._extensions = {
    ".js":function(module){
        // 1. 读取js代码
        var fu = fs.readFileSync(module.id);
        // 2. 将js代码包裹到函数中
        /* (function (exports, require, module, __filename, __dirname) */
        var strScript = NJModule.wrapper[0]+fu+NJModule.wrapper[1];
        // 3. 将字符串转化成js代码
        let jsScript = vm.runInThisContext(strScript);

        //这里的第二个参数非常重要,因为我们要暴露的模块都是通过exports暴露出去的,所以也就相当于变相的
        // module.exports.xxx = xxx;
        jsScript.call(module.exports,module.exports)  
    },
    ".json":function(module){
       var json  = fs.readFileSync(module.id);
       let obj = JSON.parse(json);
       module.exports = obj;
    }
}

//用来包裹js代码
NJModule.wrapper = [
    '(function (exports, require, module, __filename, __dirname) { ',
    '\n});'
]

function njRequire(filePath){
    //1. 将传入的相对路径转换成绝对路径
    let absPath = path.join(__dirname,filePath);

    //2/ 尝试从缓存中获取当前模块
    let cachedModule = NJModule._cache[absPath];
    //2.1 判断缓存中是否存在该模块
    if(cachedModule){ 
        return cachedModule.exports ;
        //cachedModule相当于module,因为不存在的话,下面的储存方式就是这样的,键是一个模块的地址,值是一个实力对象module
    }

    //3. 如果没有缓存就自己创建一个NJModule对象,并缓存起来
    let module = new NJModule(absPath);  //此时id等于这个路径了
    NJModule._cache[absPath] = module;
    //4 利用tryModuleLoad方法加载模块
    tryModuleLoad(module);
    //5 返回模块的exports
    return module.exports
}

//ryModuleLoad方法加载模块 
function tryModuleLoad(module){
    //1. 取出模块的后缀
    let extName = path.extname(module.id);
    // NJModule._extensions是一个对象,这个对象中包含两个键js和json,通过对应的键,找到方法并执行,最后把结果赋值到全实例对戏module的exports中
    NJModule._extensions[extName](module)
}


var{name} = njRequire("./03.js");
console.log(name)
// 注意最后暴露出来的是一个对象,所以需要解构