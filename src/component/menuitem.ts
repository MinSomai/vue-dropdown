'use strict';
import {
    defineComponent,
    h as createElement,
    renderSlot,
    inject,
    resolveComponent,
    computed,
    ref,
    withDirectives,
    vShow,
    onMounted,
    onBeforeUnmount,
    Slots,
    PropType,
    VNodeChild,
    ComponentPublicInstance
} from 'vue';
import {
    dropdownAction as dropdownActionKey,
    rootMenuStore as rootMenuStoreKey,
    rootMenuAction as rootMenuActionKey,
    menuAction as menuActionKey,
    MenuitemStruct
} from './misc/key';
import {Check} from './misc/icon';
import {MenuitemChecked, MenuitemType} from './misc/type';

declare type CommandType = PropType<number | string | Record<string, unknown> | undefined>;

const allowedRoles = ['menuitem', 'menuitemradio', 'menuitemcheckbox']
    , checkables = ['menuitemradio', 'menuitemcheckbox'];

function renderDivider(mode: 'menu' | 'select-menu', slots: Slots): VNodeChild {
    const data: Record<string, unknown> = {
        class: 'j-dropdown-divider',
        'aria-orientation': 'horizontal',
        role: 'separator'
    };

    if (mode === 'menu' || !slots.default) {
        return createElement('hr', data);
    }

    return createElement('div', data, renderSlot(slots, 'default'));
}

const component = defineComponent({
    name: 'JDropdownMenuitem',
    props: {
        /**
         * 是否渲染为菜单栏分割线
         *
         * 如果该属性为 `true`, 则忽略所有其他 prop
         *
         * 如果菜单为 `select-menu` 模式, 则可以提供默认插槽显示提示信息
         */
        divider: {required: false, type: Boolean, default: false},
        /**
         * 需要渲染为的 HTML 元素, 可以传入组件名称, 如 `router-link`
         *
         * 如果需要渲染特定的组件, 则需要确保传入该组件需要的 prop
         *
         * 默认值:
         * - 如果 `role` 选项为 `menuitem` 时, 默认渲染为 `button` 元素
         * - 如果 `role` 选项为 `menuitemradio` 或 `menuitemcheckbox` 时 (**此时不建议修改标签**), 默认渲染为 `label` 元素
         */
        as: {required: false, type: String},
        /**
         * 菜单项支持的类型, **不推荐菜单项类型混合使用**
         *
         * 可选的属性:
         * - menuitem
         * - menuitemradio
         * - menuitemcheckbox
         */
        role: {
            required: false,
            type: String as PropType<'menuitem' | 'menuitemradio' | 'menuitemcheckbox'>,
            default: 'menuitem',
            validator: (value: string) => allowedRoles.includes(value)
        },
        /**
         * 当 `role` 为 `menuitemradio` 或 `menuitemcheckbox` 类型时,
         * 指定该元素是否默认为已选择状态
         *
         * 菜单栏中应只有一个元素为已选择状态
         *
         * 该属性使用 `String` 类型, 只为兼容 `aria-checked` 属性 `mixed` 值
         */
        checked: {
            required: false,
            type: String as PropType<MenuitemChecked>,
            default: 'false',
            validator: (value: string) => ['true', 'false', 'mixed'].includes(value)
        },
        /** 是否禁用该菜单项 */
        disabled: {required: false, type: Boolean, default: false},
        /** 是否隐藏该菜单项 */
        hidden: {required: false, type: Boolean, default: false},
        /** 指定该组件指令名称 */
        command: {required: false, type: [Number, String, Object] as CommandType}
    },
    setup(props, {slots}) {
        const dropdownAction = inject(dropdownActionKey, null)
            , rootMenuStore = inject(rootMenuStoreKey, null)
            , rootMenuAction = inject(rootMenuActionKey, null)
            , menuAction = inject(menuActionKey, null)
            // ======================================================
            , menuitemChecked = ref(props.checked)
            , menuitemElementRef = ref<HTMLElement | ComponentPublicInstance | null>(null);

        /** 菜单项需要渲染的元素 */
        const computedRenderType = computed(() => {
            if (props.as) return resolveComponent(props.as);

            switch (props.role) {
                case 'menuitem':
                    return 'button';
                case 'menuitemradio':
                case 'menuitemcheckbox':
                    return 'label';
                default:
                    return 'div';
            }
        });

        _hook: {
            // 如果该组件渲染为分隔符则不执行
            if (!menuAction || props.divider) break _hook;

            onMounted(() => {
                const menuitemElement = menuitemElementRef.value;
                if (menuitemElement === null) return;

                const struct: MenuitemStruct = Object.defineProperties({}, {
                    element: {writable: false, value: menuitemElement},
                    type: {get: (): MenuitemType => props.role},
                    disabled: {get: (): boolean => props.disabled},
                    hidden: {get: (): boolean => props.hidden},
                    focus: {
                        writable: false,
                        value() {
                            const element: HTMLElement =
                                menuitemElement instanceof HTMLElement
                                    ? menuitemElement
                                    : menuitemElement.$el;
                            element.focus();
                        }
                    }
                });

                if (props.role !== 'menuitem') {
                    Object.defineProperty(struct, 'checked', {
                        get: () => menuitemChecked.value,
                        set: (value: MenuitemChecked) => menuitemChecked.value = value
                    });
                }

                menuAction.addMenuitem(struct);
            });

            onBeforeUnmount(() => {
                if (menuitemElementRef.value === null) return;
                menuAction.removeMenuitem(menuitemElementRef.value);
            });
        }

        function commitEvent(event: Event): void {
            if (!dropdownAction || props.disabled) return;
            !event.defaultPrevented && event.preventDefault();

            const dispatched = dropdownAction.dispatchEvent('command', {
                cancelable: true,
                detail: {
                    command: props.command,
                    relatedTarget: menuitemElementRef.value
                }});
            // 如果事件被取消, 则结束函数
            if (!dispatched) return;

            _updateChecked: {
                if (props.role === 'menuitem') break _updateChecked;

                let checkState: MenuitemChecked;
                if (props.role === 'menuitemradio') {
                    // radio 类型元素不支持 aria-checked="mixed"
                    // 如果为 mixed 则视为 false
                    // https://www.w3.org/TR/wai-aria-1.2/#aria-checked
                    checkState = menuitemChecked.value === 'true' ? 'false' : 'true';

                    // 通知菜单组件将所有 menuitemradio 元素重置为未选中状态
                    rootMenuAction?.menuitemradioChecked();

                } else {
                    // checkbox 类型元素将 mixed 值视为 true
                    checkState = ['true', 'mixed'].includes(menuitemChecked.value) ? 'false' : 'true';
                }

                // 是否需要该代码 ???
                _dependInput: {
                    const label = menuitemElementRef.value;
                    if (!label) break _dependInput;

                    let input: HTMLElement | null;
                    if (label instanceof HTMLLabelElement) {
                        input = label.control;

                    } else {
                        const target = label instanceof HTMLElement ? label : label.$el;
                        if (!(target instanceof Element)) break _dependInput;

                        input = target.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
                    }

                    if (!(input instanceof HTMLInputElement)) break _dependInput;

                    if (props.role === 'menuitemradio') {
                        checkState = String(input.checked) as MenuitemChecked;
                    } else {
                        checkState = input.indeterminate ? 'mixed' : String(input.checked) as MenuitemChecked;
                    }
                }

                menuitemChecked.value = checkState;
                menuAction?.menuitemCheckedChanged();
            }

            if (props.role !== 'menuitemcheckbox') dropdownAction.toggle(false);

            dropdownAction.dispatchEvent('commanded', {
                cancelable: false,
                detail: {
                    command: props.command,
                    relatedTarget: menuitemElementRef.value
                }});
        }

        /**
         * 判断是否应该提交事件
         *
         * @param event Event
         */
        function shouldCommitEvent(event: Event): void {
            if (!dropdownAction) return;

            if (event.type === 'click') {
                // 如果组件是 menuitem 元素, 则直接提交事件
                if (props.role === 'menuitem') return commitEvent(event);

                /*
                 * 如果组件是 menuitemradio 或 menuitemcheckbox 元素, 则查看元素内是否存在
                 * HTMLInputElement 元素
                 *
                 * 如果存在 HTMLInputElement 元素, 则忽略此次 click 事件, 等待触发
                 * change 事件后触发组件 command 事件
                 */
                const hasInput = menuitemElementRef.value instanceof HTMLLabelElement
                              && menuitemElementRef.value.control instanceof HTMLInputElement;
                if (hasInput) return;

                commitEvent(event);

            } else if (event.type === 'change' && checkables.includes(props.role)) {
                commitEvent(event);
            }
        }

        return () => {
            if (props.divider) return renderDivider(rootMenuStore?.mode ?? 'menu', slots);

            const data: Record<string, unknown> = {
                ref: menuitemElementRef,
                class: ['j-dropdown-menuitem'],
                tabindex: '-1',
                /*
                 * 被禁用的菜单项应可聚焦, 但不能激活
                 *
                 * 如果被渲染元素支持 disabled 属性同时使用该属性, 则该元素无法被聚焦
                 * 使用 aria-disabled 代替 disabled 属性
                 *
                 * https://www.w3.org/TR/wai-aria-practices-1.2/#issue-container-generatedID-16
                 */
                'aria-disabled': props.disabled.toString(),
                'aria-selected': checkables.includes(props.role) ? menuitemChecked.value : null,
                'aria-checked': checkables.includes(props.role) ? menuitemChecked.value : null,
                type: computedRenderType.value === 'button' ? 'button' : null,
                role: props.role,
                onClick: shouldCommitEvent,
                onChange: checkables.includes(props.role) ? shouldCommitEvent : null
            }
                , slot = {
                default: () => props.role === 'menuitem'
                    ? [renderSlot(slots, 'default')]
                    : [Check(), renderSlot(slots, 'default')]
            };

            // @ts-ignore
            return withDirectives(createElement(computedRenderType.value, data, slot), [[vShow, !props.hidden]]);
        }
    }
});

export default component;
