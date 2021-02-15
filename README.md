# vue-dropdown
下拉菜单组件 **Vue3**

## 安装
```shell
npm install @tomoeed/vue-dropdown --save
```

## 使用
```js
import {createApp} from 'vue';
import VueDropdown, {Dropdown, Menu, Menuitem} from '@tomoeed/vue-dropdown';

createApp({}).use(vueDropdown, {
    dropdown: 'j-dropdown',
    menu: 'j-dropdown-menu',
    menuitem: 'j-dropdown-menuitem'
});

// or
createApp({}).component('j-dropdown', Dropdown);
createApp({}).component('j-dropdown-menu', Menu);
createApp({}).component('j-dropdown-menuitem', Menuitem);
```

## 组件
### [j-dropdown](https://github.com/meshareL/vue-dropdown/blob/master/doc/dropdown.md)
### [j-dropdown-menu](https://github.com/meshareL/vue-dropdown/blob/master/doc/menu.md)
### [j-dropdown-menuitem](https://github.com/meshareL/vue-dropdown/blob/master/doc/menuitem.md)

## License
[Apache-2.0](https://github.com/meshareL/vue-dropdown/blob/master/LICENSE)
