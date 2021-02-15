'use strict';
import {assert} from 'chai';
import sinon from 'sinon';
import {h as createElement} from 'vue';
import {mount} from '@vue/test-utils';
import {Dropdown, Menuitem} from '../src/component';

describe('Vue dropdown component', () => {
    afterEach(() => sinon.restore());

    it('dropdown scoped slot', () => {
        const create = ({toggle}) => createElement('button', {...toggle, type: 'button'}, 'Button')
            , element = mount(Dropdown, {slots: {default: create}})
            , toggle = element.find('button');

        assert.isTrue(element.exists());
        assert.isTrue(toggle.exists());
        assert.equal(toggle.attributes('aria-haspopup'), 'menu');
        assert.isNotEmpty(toggle.attributes('aria-controls'));
    });

    it('dropdown v-model', async () => {
        const onUpdate = sinon.fake()
            , element = mount(Dropdown, {
            props: {modelValue: false},
            attrs: {'onUpdate:modelValue': onUpdate},
            slots: {default: ({toggle}) => createElement('button', {...toggle, type: 'button'}, 'Button')}
        });
        assert.isTrue(element.exists());

        const button = element.find('button');
        assert.isTrue(button.exists());

        await button.trigger('click');
        assert.isTrue(onUpdate.calledOnceWith(sinon.match.same(true)));

        onUpdate.resetHistory();
        await element.setProps({modelValue: true});
        await button.trigger('click');
        assert.isTrue(onUpdate.calledOnceWith(sinon.match.same(false)));
    });

    it('dropdown overlay', async () => {
        const element = mount(Dropdown, {props: {nooverlay: true, cause: 'click'}});

        assert.isTrue(element.exists());
        assert.isFalse(element.find('.j-dropdown-overlay').exists());

        await element.setProps({nooverlay: false});
        assert.isTrue(element.find('.j-dropdown-overlay').exists());
    });

    it('determine whether to add overlay according to the cause', async () => {
        const element = mount(Dropdown, {props: {nooverlay: false, cause: 'click'}});

        assert.isTrue(element.exists());
        assert.isTrue(element.find('.j-dropdown-overlay').exists());

        await element.setProps({cause: 'hover'});
        assert.isFalse(element.find('.j-dropdown-overlay').exists());
    });

    it('close dropdown and focus toggle on Escape', async () => {
        const div = document.createElement('div');
        div.id = 'ut_id';
        document.body.append(div);

        const element = mount(Dropdown, {
            attachTo: '#ut_id',
            slots: {default: ({toggle}) => createElement('button', {...toggle, type: 'button'}, 'Button')}
        });
        assert.isTrue(element.exists());

        await element.trigger('keydown', {key: 'Escape'});
        assert.equal(document.activeElement, element.find('button').element);

        element.unmount();
        document.body.innerHTML = '';
    });

    describe('event', () => {
        it('cancel the command event', async () => {
            const onCommand = (_, cancel) => cancel()
                , onCommanded = sinon.fake()
                , element = mount(Dropdown, {
                attrs: {onCommand, onCommanded},
                slots: {default: () => createElement(Menuitem, {}, {default: () => 'menuitem'})}
            });
            assert.isTrue(element.exists());

            const menuitem = element.findComponent(Menuitem);
            await menuitem.trigger('click');
            assert.isTrue(onCommanded.notCalled);
        });

        it('event firing sequence', async () => {
            const onCommand = sinon.fake()
                , onCommanded = sinon.fake()
                , element = mount(Dropdown, {
                attrs: {onCommand, onCommanded},
                slots: {default: () => createElement(Menuitem, {}, {default: () => 'menuitem'})}
            });
            assert.isTrue(element.exists());

            const menuitem = element.findComponent(Menuitem);
            await menuitem.trigger('click');

            assert.isTrue(onCommand.calledOnce);
            assert.isTrue(onCommanded.calledOnce);
            assert.isTrue(onCommand.calledBefore(onCommanded));
        });

        it('open or close the dropdown to trigger the toggle event', async () => {
            const onToggle = sinon.fake()
                , element = mount(Dropdown, {
                attrs: {onToggle},
                slots: {default: ({toggle}) => createElement('button', {...toggle, type: 'button'}, 'Button')}
            });
            assert.isTrue(element.exists());

            const button = element.find('button');
            assert.isTrue(button.exists());

            await button.trigger('click');
            assert.isTrue(onToggle.calledOnceWith(sinon.match.same(true)));

            onToggle.resetHistory();
            await button.trigger('click');
            assert.isTrue(onToggle.calledOnceWith(sinon.match.same(false)));
        });
    });
});
