'use strict';
import {assert} from 'chai';
import sinon from 'sinon';
import {mount} from '@vue/test-utils';
import {Menuitem} from '../src/component';
import {dropdownAction, rootMenuStore} from '../src/component/misc/key';

describe('Vue dropdown menuitem component', () => {
    afterEach(() => sinon.restore());

    describe('divider', () => {
        it('slot content is not rendered in menu mode', () => {
            const element = mount(Menuitem, {
                props: {divider: true},
                slots: {default: 'default slot'},
                global: {provide: {[rootMenuStore]: {mode: 'menu'}}}
            });

            assert.isTrue(element.exists());
            assert.equal(element.element.nodeName, 'HR');
            assert.isEmpty(element.text());
        });

        it('in select menu mode, if the default slot provided, the content will be rendered', () => {
            const element = mount(Menuitem, {
                props: {divider: true},
                slots: {default: () => 'default slot'},
                global: {provide: {[rootMenuStore]: {mode: 'select-menu'}}}
            });

            assert.isTrue(element.exists());
            assert.equal(element.element.nodeName, 'DIV');
            assert.equal(element.text(), 'default slot');
        });

        it('in select menu mode, if no default slot is provided, it will be rendered as hr label', () => {
            const element = mount(Menuitem, {
                props: {divider: true},
                global: {provide: {[rootMenuStore]: {mode: 'select-menu'}}}
            });

            assert.isTrue(element.exists());
            assert.equal(element.element.nodeName, 'HR');
            assert.isEmpty(element.text());
        });
    });

    it('specify HTML tag', async () => {
        const element = mount(Menuitem, {props: {role: 'menuitem'}});
        assert.isTrue(element.exists());
        assert.equal(element.element.nodeName, 'BUTTON');

        await element.setProps({role: 'menuitemradio'});
        assert.equal(element.element.nodeName, 'LABEL');

        await element.setProps({role: 'menuitemcheckbox'});
        assert.equal(element.element.nodeName, 'LABEL');

        await element.setProps({as: 'div'});
        assert.equal(element.element.nodeName, 'DIV');
    });

    it('disable menuitem', async () => {
        const element = mount(Menuitem, {props: {disabled: true}});
        assert.isTrue(element.exists());
        assert.equal(element.attributes('aria-disabled'), 'true');

        await element.setProps({disabled: false});
        assert.equal(element.attributes('aria-disabled'), 'false');
    });

    it('when role is menuitem, the checked prop is ignored', () => {
        const element = mount(Menuitem, {props: {role: 'menuitem', checked: 'true'}});
        assert.isTrue(element.exists());
        assert.isFalse(element.element.hasAttribute('aria-selected'));
        assert.isFalse(element.element.hasAttribute('aria-checked'));
    });

    it('when role is menuitemradio or menuitemcheckbox, the checked prop only takes effect at initialization', async () => {
        function assertion(vueWrapper) {
            assert.equal(vueWrapper.attributes('aria-selected'), 'true');
            assert.equal(vueWrapper.attributes('aria-checked'), 'true');
        }

        let element = mount(Menuitem, {props: {role: 'menuitemradio', checked: 'true'}});
        assert.isTrue(element.exists());
        assertion(element);

        await element.setProps({checked: 'false'});
        assertion(element);

        element = mount(Menuitem, {props: {role: 'menuitemcheckbox', checked: 'true'}});
        assert.isTrue(element.exists());
        assertion(element);

        await element.setProps({checked: 'false'});
        assertion(element);
    });

    it('emit command event', async () => {
        const toggle = sinon.fake()
            , dispatchEvent = sinon.fake.returns(true)
            , element = mount(Menuitem, {global: {provide: {[dropdownAction]: {toggle, dispatchEvent}}}});

        await element.trigger('click');
        assert.isTrue(element.exists());
        assert.isTrue(dispatchEvent.called);
    });

    it('if the command event is cancelled, the commanded event will not be triggered', async () => {
        // 返回 false, 模拟 command 事件被取消
        const dispatchEvent = sinon.fake.returns(false)
            , element = mount(Menuitem, {global: {provide: {[dropdownAction]: {dispatchEvent}}}});

        await element.trigger('click');
        assert.isTrue(element.exists());
        assert.equal(dispatchEvent.callCount, 1);
    });

    it('if the role is menuitem or menuitemradio, close the menu after triggering the command event', async () => {
        const toggle = sinon.fake()
            , dispatchEvent = sinon.fake.returns(true)
            , element = mount(Menuitem, {global: {provide: {[dropdownAction]: {toggle, dispatchEvent}}}});
        assert.isTrue(element.exists());

        await element.trigger('click');
        assert.isTrue(toggle.called);

        toggle.resetHistory();

        await element.setProps({role: 'menuitemradio'});
        await element.trigger('click');
        assert.isTrue(toggle.called);
    });

    it('if the role is menuitemcheckbox, the menu will not be closed after the command event is triggered', async () => {
        const toggle = sinon.fake()
            , dispatchEvent = sinon.fake.returns(true)
            , element = mount(Menuitem, {
            props: {role: 'menuitemcheckbox'},
            global: {provide: {[dropdownAction]: {toggle, dispatchEvent}}}
        });
        assert.isTrue(element.exists());

        await element.trigger('click');
        assert.isFalse(toggle.called);
    });
});
