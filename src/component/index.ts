'use strict';
import {Plugin} from 'vue';
import {Option} from '../../type';
import Dropdown from './dropdown';
import Menu from './menu';
import Menuitem from './menuitem';

const install: Plugin = (app, option: Option) => {
    const {
        dropdown = 'j-dropdown',
        menu = 'j-dropdown-menu',
        menuitem = 'j-dropdown-menuitem'
    } = option || {};

    app.component(dropdown, Dropdown);
    app.component(menu, Menu);
    app.component(menuitem, Menuitem);
};

export default install;
export { Dropdown, Menu, Menuitem };
