## 小结

TypeScript背后的主干也是围绕着AST的操作。

常规的AST操作有三个阶段：

1. parse阶段：将code转换为AST节点集合
   1. 词法分析：将code转换为tokens集合；
   2. 语法分析：根据tokens集合的排列顺序，构建AST节点，继而构建AST节点集合；
2. transform阶段；
3. Generate阶段；

<Br/>

TypeScript在此基础上做了扩展，分析mini-typescript就可以看到：

1. parse阶段：以一个语句为工作单元，基于词法片段生成AST；
   1. 准备工作，预置的tokens类型、Node类型和keywords；
   2. 设计了词法分析工具`lex`，按照行为单位，将code拆解为一个一个tokens，根据tokens的排列顺序组织为AST的Node节点，特别注意的是，在这个阶段收集了变量的类型 `typename`；
2. bind阶段；
   1. 这里的bind阶段非常简单，仅仅是检查了变量有没有重定义；
3. check阶段：检查一个语句单位内，基本语法、类型准确性；
   1. 做了基本的类型校检，比如 `var a:string = 'hello'` ，其中 string 的类型标注，在之前收集的Node节点的`typename`属性；'hello'本身是一个表达式，表达式是一个独立的Node的节点，根据节点的类型可以去获取表达式的类型。最后两者做比较；
4. transform阶段：
   1. 如果存在类型标注，移除一下。操作非常方便，还记得之前收集的类型是`typename` ，这里之前将Node上的这个信息给去掉了就行；
5. emit/generator阶段：
   1. 生成js代码。因为在AST Node构建之初，有`text`属性记录原始文本，所以再搬回来就是了。

<Br/>

这里要补充的是，真实的bind阶段，是TypeScript Infer起作用的节点，它的算法根据上下文判断，给没有类型标注的变量补上类型标注。

<Br/>




