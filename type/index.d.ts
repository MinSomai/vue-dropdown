import {Plugin} from 'vue';

interface Option {
    /**
     * Dropdown 组件注册名称
     *
     * @default j-dropdown
     */
    dropdown?: string;
    /**
     * Menu 组件注册名称
     *
     * @default j-dropdown
     */
    menu?: string;
    /**
     * Menuitem 组件注册名称
     *
     * @default j-dropdown
     */
    menuitem?: string;
}

declare const install: Plugin;

export default install;
export { Option };
export { default as Dropdown, Prop as DropdownProp } from './dropdown';
export { default as Menu, Prop as MenuProp } from './menu';
export { default as Menuitem, Prop as MenuitemProp } from './menuitem';
