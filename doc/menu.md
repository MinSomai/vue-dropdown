# j-dropdwon-menu

## Prop
### mode
Type: String  
Required: false  
Default: menu  
可选值: `menu` | `select-menu`  
菜单栏模式

### direction
Type: String  
Required: false  
可选值:
- `top-start` | `top-center` | `top-end`
- `right-start` | `right-center` | `right-end`
- `bottom-start` | `bottom-center` | `bottom-end`
- `left-start` | `left-center` | `left-end`  

菜单栏显示方向, 默认为 `bottom-start`
如果渲染为子菜单, 则只有 `left` 或 `right` 方向生效. 默认为 `right-start`

### dismissable
Type: Boolean  
Required: false  
Default: false  
是否显示菜单栏关闭按钮 (**必须提供 `header` 插槽**), 只有 `mode` 为 `select-menu` 时生效

### notransition
Type: Boolean  
Required: false  
Default: false  
是否取消组件过渡效果

## Slot
### header
当 `mode` 参数为 `select-menu` 是该插槽生效

### footer
当 `mode` 参数为 `select-menu` 是该插槽生效

---
如果该组件是子菜单, 则需要提供 `placeholder` 插槽 (子菜单忽略 `header` 与 `footer` 插槽)

```html
<j-dropdown-menu>
    <template #placeholder>submenu</template>
    <j-dropdown-menuitem>menuitem</j-dropdown-menuitem>
</j-dropdown-menu>
```
