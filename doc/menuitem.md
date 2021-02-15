# j-dropdown-menuitem

## Prop
### divider
Type: Boolean  
Required: false  
Default: false  
是否渲染为菜单栏分割线  
如果该属性为 `true`, 则忽略所有其他 prop  
如果菜单为 `select-menu` 模式, 则可以提供默认插槽显示提示信息

### as
Type: string  
Required: false  
Default:
- 如果 `role` 选项为 `menuitem` 时, 默认渲染为 `button` 元素
- 如果 `role` 选项为 `menuitemradio` 或 `menuitemcheckbox` 时 (**此时不建议修改标签**), 默认渲染为 `label` 元素

需要渲染为的 HTML 元素, 可以传入组件名称, 如 `router-link`  
如果需要渲染特定的组件, 则需要确保传入该组件需要的 prop

### role
Type: String  
Required: false  
Default: menuitem  
可选值: `menuitem` | `menuitemradio` | `menuitemcheckbox`  
菜单项支持的类型, **不推荐菜单项类型混合使用**

### checked
Type: String  
Required: false  
Default: 'false'  
可选值: `true` | `false` |`mixed`  
当 `role` 为 `menuitemradio` 或 `menuitemcheckbox` 类型时, 指定该元素是否默认为已选择状态
菜单栏中应只有一个元素为已选择状态

### disabled
Type: Boolean  
Required: false  
Default: false  
是否禁用该菜单项  
被禁用的菜单项可聚焦但无法激活

### hidden
Type: Boolean  
Required: false  
Default: false  
是否隐藏该菜单项

### command
Type: Number | String | Object  
Required: false  
指定该组件指令名称

## 使用
使用指定组件
```html
<j-dropdown-menuitem as="router-link" to="/">homepage</j-dropdown-menuitem>
```

使用 `menuitemradio` 或 `menuitemcheckbox` 时, 推荐添加 `input` 元素
```html
<j-dropdown-menuitem  role="menuitemradio">
    <input name="name" value="1" type="radio">
    menuitemradio
</j-dropdown-menuitem>

<j-dropdown-menuitem role="menuitemcheckbox">
    <input name="name" value="1" type="checkbox">
    menuitemcheckbox
</j-dropdown-menuitem>
```
