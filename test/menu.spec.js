'use strict';
import {assert} from 'chai';
import sinon from 'sinon';
import {Transition, h as createElement, nextTick} from 'vue';
import {mount} from '@vue/test-utils';
import {Dropdown, Menu, Menuitem} from '../src/component';
import {dropdownStore, dropdownAction, rootMenuStore} from '../src/component/misc/key';

describe('Vue dropdown menu component', () => {
    afterEach(() => sinon.restore());

    it('mode prop', async () => {
        const element = mount(Menu, {
            props: {mode: 'menu'},
            global: {provide: {[dropdownStore]: {state: false}}}
        });
        assert.isTrue(element.exists());
        assert.include(element.classes(), 'j-dropdown-menu');

        await element.setProps({mode: 'select-menu'});
        assert.include(element.classes(), 'j-dropdown-select-menu');
    });

    it('menu direction', async () => {
        const element = mount(Menu, {global: {provide: {[dropdownStore]: {state: false}}}});
        assert.isTrue(element.exists());
        assert.include(element.classes(), 'j-dropdown-bottom-start');

        const directions = [
            'top-start', 'top-center', 'top-end',
            'right-start', 'right-center', 'right-end',
            'bottom-start', 'bottom-center', 'bottom-end',
            'left-start', 'left-center', 'left-end'
        ];
        for (const direction of directions) {
            await element.setProps({direction});
            assert.include(element.classes(), `j-dropdown-${direction}`);
        }
    });

    it('close menu button', async () => {
        const element = mount(Menu, {
            props: {mode: 'select-menu', dismissable: false},
            slots: {header: () => 'Header'},
            global: {provide: {[dropdownStore]: {state: false}}}
        });
        assert.isTrue(element.exists());
        assert.isFalse(element.find('.j-dropdown-closer').exists());

        await element.setProps({dismissable: true});
        assert.isTrue(element.find('.j-dropdown-closer').exists());
    });

    it('notransition prop', async () => {
        const element = mount(Menu, {
            props: {notransition: true},
            global: {
                stubs: {transition: true},
                provide: {[dropdownStore]: {state: false}}
            }
        });
        assert.isTrue(element.exists());
        assert.isFalse(element.findComponent(Transition).exists());

        await element.setProps({notransition: false});
        // ???
        assert.isTrue(element.findComponent(Transition).exists());
    });

    describe('submenu', () => {
        it('create submenu', async () => {
            const provide = {
                [dropdownStore]: {state: false},
                [rootMenuStore]: {mode: 'menu', notTransition: false}
            };
            const element = mount(Menu, {global: {provide}});

            assert.isTrue(element.find('.j-dropdown-submenu').exists());
        });

        it('submenu direction', async () => {
            const element = mount(Menu, {global: {provide: {
                        [dropdownStore]: {state: false},
                        [rootMenuStore]: {mode: 'menu', notTransition: false}
                    }}});
            assert.isTrue(element.exists());

            const submenu = element.find('.j-dropdown-submenu');

            await element.setProps({direction: 'null'});
            assert.include(submenu.classes(), 'j-dropdown-right-start');

            const directions = [
                'right-start', 'right-center', 'right-end',
                'left-start', 'left-center', 'left-end'
            ];
            for (const direction of directions) {
                await element.setProps({direction});
                assert.include(submenu.classes(), `j-dropdown-${direction}`);
            }
        });

        it('submenu placeholder slot', () => {
            const element = mount(Menu, {
                slots: {placeholder: () => 'Placeholder'},
                global: {
                    provide: {
                        [dropdownStore]: {state: false},
                        [rootMenuStore]: {mode: 'menu', notTransition: false}
                    }}});
            assert.isTrue(element.exists());

            const placeholder = element.find('.submenu-placeholder');
            assert.isTrue(placeholder.exists());
            assert.equal(placeholder.text(), 'Placeholder');
        });
    });

    describe('focus management', () => {
        const defaultSlot = () => [
            createElement(Menuitem, 'menuitem'),
            createElement(Menuitem, 'menuitem'),
            createElement(Menuitem, {divider: true}),
            createElement(Menuitem, {disabled: true}, 'menuitem'),
            createElement(Menuitem, {hidden: true}, 'menuitem'),
            createElement(Menuitem, 'menuitem'),
            createElement(Menuitem, 'menuitem')
        ]
            , simpleMenuOpenReason = sinon.fake.returns({
            relatedEvent: new MouseEvent('click'),
            handled: sinon.fake()
        });

        /** @type {VueWrapper<ComponentPublicInstance>} */
        let element;

        beforeEach(() => {
            const div = document.createElement('div');
            div.id = 'ut_id';
            document.body.append(div);

            element = mount(Menu, {
                attachTo: div,
                slots: {default: defaultSlot},
                global: {
                    provide: {
                        [dropdownStore]: {state: true},
                        [dropdownAction]: {menuOpenReason: simpleMenuOpenReason}
                    }}
            });

            assert.isTrue(element.exists());
        });

        afterEach(() => element.unmount());
        after(() => document.body.innerHTML = '');

        it('focus first menuitem on Home', async () => {
            await element.trigger('keydown', {key: 'Home'});
            assert.equal(document.activeElement, element.findAll('[role="menuitem"]')[0].element);
        });

        it('focus last menuitem on End', async () => {
            await element.trigger('keydown', {key: 'End'});
            const menuitems = element.findAll('[role="menuitem"]');
            assert.equal(document.activeElement, menuitems[menuitems.length - 1].element);
        });

        it('focus next menuitem on arrow down', async () => {
            await element.trigger('keydown', {key: 'Home'});
            await element.trigger('keydown', {key: 'ArrowDown'});
            assert.equal(document.activeElement, element.findAll('[role="menuitem"]')[1].element);
        });

        it('from the last to the first on arrow down', async () => {
            await element.trigger('keydown', {key: 'End'});
            await element.trigger('keydown', {key: 'ArrowDown'});
            assert.equal(document.activeElement, element.findAll('[role="menuitem"]')[0].element);
        });

        it('focus previous menuitem on arrow up', async () => {
            await element.trigger('keydown', {key: 'End'});
            await element.trigger('keydown', {key: 'ArrowUp'});

            const menuitems = element.findAll('[role="menuitem"]');
            // hidden menuitem is not focusable
            assert.equal(document.activeElement, menuitems[menuitems.length - 2].element);
        });

        it('from the first to the last on arrow up', async () => {
            await element.trigger('keydown', {key: 'Home'});
            await element.trigger('keydown', {key: 'ArrowUp'});

            const menuitems = element.findAll('[role="menuitem"]');
            assert.equal(document.activeElement, menuitems[menuitems.length - 1].element);
        });

        it('disabled menuitem are focusable', async () => {
            await element.trigger('keydown', {key: 'End'});
            await element.trigger('keydown', {key: 'ArrowUp'});
            await element.trigger('keydown', {key: 'ArrowUp'});

            assert.equal(document.activeElement, element.findAll('[role="menuitem"]')[2].element);
        });

        it('the separator in the menu is not focusable', async () => {
            await element.trigger('keydown', {key: 'Home'});
            await element.trigger('keydown', {key: 'ArrowDown'});
            await element.trigger('keydown', {key: 'ArrowDown'});

            assert.equal(document.activeElement, element.findAll('[role="menuitem"]')[2].element);
        });
    });

    describe('submenu focus management', () => {
        const submenuDefaultSlot = () => [
            createElement(Menuitem, 'menuitem'),
            createElement(Menuitem, 'menuitem'),
        ]
            , defaultSlot = () => [
            createElement(Menuitem, 'menuitem'),
            createElement(Menuitem, 'menuitem'),
            createElement(Menu, {}, {default: submenuDefaultSlot}),
        ]
            , simpleMenuOpenReason = sinon.fake.returns({
            relatedEvent: new MouseEvent('click'),
            handled: sinon.fake()
        })
            , mountOption = {
            attachTo: '#ut_id',
            slots: {default: defaultSlot},
            props: {notransition: true},
            global: {
                // 未生效 ?
                stubs: {transition: true},
                provide: {
                    [dropdownStore]: {state: true},
                    [dropdownAction]: {menuOpenReason: simpleMenuOpenReason}
                }
            }
        };

        /** @type {VueWrapper<ComponentPublicInstance>} */
        let element;

        beforeEach(() => {
            const div = document.createElement('div');
            div.id = 'ut_id';
            document.body.append(div);

            element = mount(Menu, mountOption);
            assert.isTrue(element.exists());
        });

        afterEach(() => element.unmount());
        after(() => document.body.innerHTML = '');

        function findComponent() {
            const container = element.findComponent(Menu)
                , submenu = container.find('[role="menu"]')
                , toggle = container.find('[aria-haspopup="menu"][role="menuitem"]');

            assert.isTrue(container.exists());
            assert.include(container.classes(), 'j-dropdown-submenu-container');
            assert.isTrue(submenu.exists());
            assert.isTrue(toggle.exists());

            return { container, submenu, toggle };
        }

        it('open submenu on mouse hover', async () => {
            const {submenu, toggle} = findComponent();

            assert.equal(submenu.element.style.display, 'none');

            await toggle.trigger('mouseenter');
            assert.isEmpty(submenu.element.style.display);
        });

        it('open submenu and focus first menuitem on space or enter or arrow left or arrow right', async () => {
            const {container, submenu, toggle} = findComponent()
            const menuitems = container.findAllComponents(Menuitem);

            const assertion = async key => {
                await toggle.trigger('keydown', {key});
                assert.isEmpty(submenu.element.style.display);

                await nextTick();
                assert.equal(document.activeElement, menuitems[0].element);

                await container.trigger('keydown', {key: 'Escape'});
                assert.equal(submenu.element.style.display, 'none');
            };

            await assertion(' ');
            await assertion('Enter');
            await assertion('ArrowLeft');
            await assertion('ArrowRight');
        });

        it('close submenu on mouse leave toggle or submenu', async () => {
            const clock = sinon.useFakeTimers()
                , {submenu, toggle} = findComponent();

            await toggle.trigger('keydown', {key: 'Enter'});
            assert.isEmpty(submenu.element.style.display);

            await toggle.trigger('mouseleave');
            await clock.runAllAsync();
            assert.equal(submenu.element.style.display, 'none');

            await toggle.trigger('keydown', {key: 'Enter'});
            await submenu.trigger('mouseleave');
            await clock.runAllAsync();
            assert.equal(submenu.element.style.display, 'none');
        });

        it('close submenu and focus submenu toggle on escape', async () => {
            const {container, submenu, toggle} = findComponent();

            await toggle.trigger('mouseenter');
            assert.isEmpty(submenu.element.style.display);

            await container.trigger('keydown', {key: 'Escape'});
            assert.equal(submenu.element.style.display, 'none');
            assert.equal(document.activeElement, toggle.element);
        });

        it('focus first menuitem on Home', async () => {
            const {container, submenu, toggle} = findComponent()
                , menuitems = container.findAllComponents(Menuitem);

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'ArrowDown'});
            assert.equal(document.activeElement, menuitems[1].element);

            await submenu.trigger('keydown', {key: 'Home'});
            assert.equal(document.activeElement, menuitems[0].element);
        });

        it('focus last menuitem on End', async () => {
            const {container, submenu, toggle} = findComponent()
                , menuitems = container.findAllComponents(Menuitem);

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'End'});

            assert.equal(document.activeElement, menuitems[menuitems.length - 1].element);
        });

        it('focus next menuitem on arrow down', async () => {
            const {container, submenu, toggle} = findComponent();

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'ArrowDown'});
            assert.equal(document.activeElement, container.findAllComponents(Menuitem)[1].element);
        });

        it('from the last to the first on arrow down', async () => {
            const {container, submenu, toggle} = findComponent();

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'End'});
            await submenu.trigger('keydown', {key: 'ArrowDown'});

            assert.equal(document.activeElement, container.findAllComponents(Menuitem)[0].element);
        });

        it('focus previous menuitem on arrow up', async () => {
            const {container, submenu, toggle} = findComponent()
                , menuitems = container.findAllComponents(Menuitem);

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'End'});
            await submenu.trigger('keydown', {key: 'ArrowUp'});

            assert.equal(document.activeElement, menuitems[menuitems.length - 2].element);
        });

        it('from the first to the last on arrow up', async () => {
            const {container, submenu, toggle} = findComponent()
                , menuitems = container.findAllComponents(Menuitem);

            await toggle.trigger('keydown', {key: 'Enter'});
            await nextTick();
            await submenu.trigger('keydown', {key: 'Home'});
            await submenu.trigger('keydown', {key: 'ArrowUp'});

            assert.equal(document.activeElement, menuitems[menuitems.length - 1].element);
        });
    });

    it('reset other menu items aria-checked to false after selecting a menuitemradio', async () => {
        function createMenuitemradio(value) {
            const props = {
                command: String(value),
                role: 'menuitemradio',
                checked: value === 1 ? 'true' : 'false'
            }
                , defaultSlot = () => [
                createElement('input', {name: 'num', value: String(value), type: 'radio'}),
                'menuitemradio'
            ];
            return createElement(Menuitem, props, {default: defaultSlot});
        }

        const div = document.createElement('div');
        div.id = 'ut_id';
        document.body.append(div);

        const defaultSlot = () => [
            createMenuitemradio(1),
            createMenuitemradio(2),
            createElement(Menu, {}, {default: () => [createMenuitemradio(3), createMenuitemradio(4)]})
        ]
            , option = {
            attachTo: '#ut_id',
            props: {notransition: true},
            slots: {default: defaultSlot},
            global: {
                provide: {
                    [dropdownStore]: {state: true},
                    [dropdownAction]: {
                        menuOpenReason: sinon.fake.returns({
                            relatedEvent: new MouseEvent('click'),
                            handled: sinon.fake()
                        }),
                        dispatchEvent: sinon.fake.returns(true),
                        toggle: sinon.fake()
                    }
                }
            }
        }
            , element = mount(Menu, option);
        assert.isTrue(element.exists());

        const menuitems = element.findAllComponents(Menuitem);
        menuitems.forEach((item, index) => assert.equal(item.attributes('aria-checked'), String(index === 0)));

        await menuitems[1].trigger('click');
        menuitems.forEach((item, index) => assert.equal(item.attributes('aria-checked'), String(index === 1)));

        await menuitems[2].trigger('click');
        menuitems.forEach((item, index) => assert.equal(item.attributes('aria-checked'), String(index === 2)));

        document.body.innerHTML = '';
        element.unmount();
    });

    describe('submenu icon', () => {
        beforeEach(() => {
            const div = document.createElement('div');
            div.id = 'ut_id';
            document.body.append(div);
        });

        afterEach(() => document.body.innerHTML = '');

        it('menuitemradio', async () => {
            const defaultSlot = () => [
                createElement(Menuitem, {role: 'menuitemradio'}, 'menuitemradio'),
                createElement(Menu, {}, {default: () => [
                        createElement(Menuitem, {role: 'menuitemradio'}, 'menuitemradio'),
                        createElement(Menuitem, {role: 'menuitemradio'}, 'menuitemradio'),
                    ]})
            ]
                , element = mount(Dropdown, {
                attachTo: '#ut_id',
                props: {modelValue: true},
                slots: {default: () => createElement(Menu, {mode: 'select-menu', notransition: true}, {default: defaultSlot})},
                global: {provide: {[dropdownStore]: {state: false}}}
            })
                , submenu = element.findComponent(Menu).findComponent(Menu);

            assert.isTrue(submenu.exists());
            assert.isTrue(submenu.find('.submenu-blank-icon').exists());

            await submenu.findAllComponents(Menuitem)[0].trigger('click');
            assert.isTrue(submenu.find('.submenu-toggle .octicon-check').exists());

            element.unmount();
        });

        it('menuitemcheckbox', async () => {
            const defaultSlot = () => [
                createElement(Menuitem, {role: 'menuitemcheckbox'}, 'menuitemcheckbox'),
                createElement(Menu, {}, {default: () => [
                        createElement(Menuitem, {role: 'menuitemcheckbox'}, 'menuitemcheckbox'),
                        createElement(Menuitem, {role: 'menuitemcheckbox'}, 'menuitemcheckbox')
                    ]})
            ]
                , element = mount(Dropdown, {
                attachTo: '#ut_id',
                props: {modelValue: true},
                slots: {default: () => createElement(Menu, {mode: 'select-menu', notransition: true}, {default: defaultSlot})}
            })
                , submenu = element.findComponent(Menu).findComponent(Menu);

            assert.isTrue(submenu.exists());
            assert.isTrue(submenu.find('.submenu-blank-icon').exists());

            await submenu.findAllComponents(Menuitem)[0].trigger('click');
            assert.isTrue(element.find('.submenu-toggle .octicon-dash').exists());

            await submenu.findAllComponents(Menuitem)[1].trigger('click');
            assert.isTrue(element.find('.submenu-toggle .octicon-check').exists());

            element.unmount();
        });
    });
});
