1.内部实现了一个require方法
function require(path) {
  return self.require(path);
}

2.通过Module对象的静态__load方法加载模块文件
Module.prototype.require = function(path) {
  return Module._load(path, this, /* isMain */ false);
};

3.通过Module对象的静态_resolveFilename方法, 得到绝对路径并添加后缀名
var filename = Module._resolveFilename(request, parent, isMain);

4.根据路径判断是否有缓存, 如果没有就创建一个新的Module模块对象并缓存起来
var cachedModule = Module._cache[filename];
if (cachedModule) {
   return cachedModule.exports;
}
var module = new Module(filename, parent);
Module._cache[filename] = module;

function Module(id, parent) {
  this.id = id;
  this.exports = {};
}
5.利用tryModuleLoad方法加载模块
tryModuleLoad(module, filename);
    - 6.1取出模块后缀
    var extension = path.extname(filename);

    - 6.2根据不同后缀查找不同方法并执行对应的方法, 加载模块
    Module._extensions[extension](this, filename);

    - 6.3如果是JSON就转换成对象
    module.exports = JSON.parse(internalModule.stripBOM(content));

    - 6.4如果是JS就包裹一个函数
    var wrapper = Module.wrap(content);
    NativeModule.wrap = function(script) {
        return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
    };
    NativeModule.wrapper = [
        '(function (exports, require, module, __filename, __dirname) { ',
        '\n});'
    ];
    - 6.5执行包裹函数之后的代码, 拿到执行结果(String -- Function)
    var compiledWrapper = vm.runInThisContext(wrapper);

    - 6.6利用call执行fn函数, 修改module.exports的值
    var args = [this.exports, require, module, filename, dirname];
    var result = compiledWrapper.call(this.exports, args);

    - 6.7返回module.exports
    return module.exports;
