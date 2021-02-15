'use strict';
import {
    ComponentPublicInstance,
    computed,
    ComputedRef,
    defineComponent,
    h as createElement,
    inject,
    nextTick,
    onBeforeUnmount,
    onMounted,
    PropType,
    provide,
    reactive,
    readonly,
    ref,
    renderSlot,
    Slots,
    toRef,
    Transition,
    TransitionProps,
    VNode,
    VNodeArrayChildren,
    VNodeChild,
    vShow,
    watch,
    withDirectives
} from 'vue';
import {
    dropdownAction as dropdownActionKey,
    DropdownAction,
    dropdownStore as dropdownStoreKey,
    menuAction as menuActionKey,
    MenuitemStruct,
    rootMenuAction as rootMenuActionKey,
    rootMenuStore as rootMenuStoreKey,
} from './misc/key';
import {Check, ChevronRight, Indeterminate, X} from './misc/icon';
import {createDirections} from './util/direction';
import {MenuitemChecked, MenuMode} from './misc/type';

const allowedDirections = createDirections(['top', 'right', 'bottom', 'left'])
    , submenuAllowedDirections = createDirections(['right', 'left']);

function withTransition(defaultSlot: (...args: any[]) => VNodeChild): VNode {
    const props: TransitionProps = {
        css: true,
        mode: 'out-in',
        type: 'transition',
        name: 'j-dropdown-menu-fade-in'
    };
    return createElement(Transition, props, {default: defaultSlot});
}

function renderSelectMenuChildren(slots: Slots, dismissable: boolean, service: DropdownAction | null): VNodeArrayChildren {
    const children: VNodeArrayChildren = [];

    if (slots.header) {
        const nodes: VNodeArrayChildren = [renderSlot(slots, 'header')];
        if (dismissable) {
            const data: Record<string, unknown> = {
                class: 'j-dropdown-closer',
                'aria-label': 'Close',
                type: 'button',
                onClick(event: MouseEvent) {
                    if (!service) return;
                    !event.defaultPrevented && event.preventDefault();
                    service.toggle(false);
                }
            };
            nodes.push(createElement('button', data, [X()]));
        }

        children.push(createElement('header', {class: 'j-dropdown-header'}, nodes));
    }

    if (!slots.header && !slots.footer) {
        children.push(renderSlot(slots, 'default'));
    } else {
        children.push(createElement('div', {class: 'j-dropdown-body'}, renderSlot(slots, 'default')));
    }

    if (slots.footer) {
        children.push(createElement('footer', {class: 'j-dropdown-footer'}, renderSlot(slots, 'footer')));
    }

    return children;
}

/**
 * 下拉框菜单组件
 */
const component = defineComponent({
    name: 'JDropdownMenu',
    props: {
        /**
         * 菜单栏模式, 默认 `menu`
         *
         * 如果是子菜单则此选项将被忽略
         *
         * 可选值:
         * - menu
         * - select-menu
         */
        // 是否应拆分为多个组件分别使用 ?
        mode: {
            required: false,
            type: String as PropType<MenuMode>,
            validator: (value: string) => ['menu', 'select-menu'].includes(value)
        },
        /**
         * 菜单栏显示方向, 默认为 `bottom-start`
         *
         * 如果渲染为子菜单, 则只有 `left` 或 `right` 方向生效. 默认为 `right-start`
         *
         * 可选值:
         * - top-start 上左
         * - top-center 上中
         * - top-end 上右
         * - right-start 右上
         * - right-center 右中
         * - right-end 右下
         * - bottom-start 下左
         * - bottom-center 下中
         * - bottom-end 下右
         * - left-start 左上
         * - left-center 左中
         * - left-end 左下
         */
        direction: {
            required: false,
            type: String,
            validator: (value: string) => allowedDirections.includes(value)
        },
        /** 是否显示菜单栏关闭按钮 (**必须提供 `header` 插槽**), 只有 `mode` 为 `select-menu` 时生效 */
        dismissable: {required: false, type: Boolean, default: true},
        /** 是否取消组件过渡效果 */
        notransition: {required: false, type: Boolean, default: false}
    },
    setup(props, {slots}) {
        const dropdownStore = inject(dropdownStoreKey, null)
            , dropdownAction = inject(dropdownActionKey, null)
            , rootMenuStore = inject(rootMenuStoreKey, null)
            , menuAction = inject(menuActionKey, null)
        // =====================================================
        const submenuHtmlRef = ref<HTMLElement | null>(null)
            , submenuToggleHtmlRef = ref<HTMLElement | null>(null)
            , submenuChecked = ref<MenuitemChecked | null>(null)
        // =====================================================
        const menuitemStructs: MenuitemStruct[] = [];
        // 当前聚焦的元素
        let activeElement: HTMLElement | ComponentPublicInstance | undefined = undefined;

        /** 计算菜单栏模式 */
        const computedMode = computed(() => {
            // 如果是子菜单, 则忽略 props mode 选项
            if (rootMenuStore) return 'submenu';
            // 如果未 mode 参数传入值, 则默认为 menu
            return props.mode ?? 'menu';
        });

        function refreshSubmenuChecked(): void {
            if (!rootMenuStore) return;

            const filtered = menuitemStructs
                .filter(({type}) => type !== 'menuitem')
                .filter(struct => 'checked' in struct)
            if (!filtered.length) {
                submenuChecked.value = null;
                return;
            }

            const hasMenuitemradio = filtered.some(({type}) => type === 'menuitemradio')
                , hasMenuitemcheckbox = filtered.some(({type}) => type === 'menuitemcheckbox');

            // 当同时存在 menuitemradio 与 menuitemcheckbox 菜单项时, 不显示图标
            if (hasMenuitemradio && hasMenuitemcheckbox) {
                submenuChecked.value = null;
                return;
            }

            if (hasMenuitemradio) {
                // 将 menuitemradio 菜单项 checked 属性 mixed 值视为 false
                submenuChecked.value = menuitemStructs.some(({checked}) => checked === 'true')
                    ? 'true'
                    : 'false';
                return;
            }

            // 只有当所有菜单项 checked 属性为 true 时, 才会显示 Check 图标
            const allChecked = menuitemStructs
                .every(({checked}) => checked === 'true');
            if (allChecked) {
                submenuChecked.value = 'true';
                return;
            }

            const hasChecked = menuitemStructs.some(
                ({checked}) =>
                    checked && ['true', 'mixed'].includes(checked)
            );
            if (hasChecked) {
                submenuChecked.value = 'mixed';
                return;
            }

            submenuChecked.value = 'false';
        }

        provide(menuActionKey, {
            addMenuitem(value) {
                const index = menuitemStructs.findIndex(val => val.element === value.element);
                if (index !== -1) {
                    menuitemStructs.splice(index, 1, value);
                    refreshSubmenuChecked();
                    return;
                }

                menuitemStructs.push(value);
                refreshSubmenuChecked();
            },
            removeMenuitem(value) {
                const index = menuitemStructs.findIndex(val => val.element === value);
                if (index === -1) return;
                menuitemStructs.splice(index, 1);
            },
            menuitemCheckedChanged: refreshSubmenuChecked
        });

        onlySubmenuExecute: {
            if (!menuAction) break onlySubmenuExecute;

            watch(submenuChecked, () => menuAction.menuitemCheckedChanged());

            onMounted(() => {
                const submenuElement = submenuHtmlRef.value;
                if (!submenuElement) return;

                const obj = {};

                async function focus(): Promise<void> {
                    const element = submenuToggleHtmlRef.value;
                    if (!element) return;
                    await nextTick(() => element.focus());
                }

                Object.defineProperty(obj, 'element', {writable: false, value: submenuElement});
                Object.defineProperty(obj, 'type', {writable: false, value: 'submenu'});
                Object.defineProperty(obj, 'focus', {writable: false, value: focus});
                Object.defineProperty(obj, 'checked', {
                    get: () => submenuChecked.value,
                    set(value: MenuitemChecked): void {
                        submenuChecked.value = value;
                        if (value === 'false') {
                            menuitemStructs.forEach(menuitem => menuitem.checked = 'false');
                        }
                    }
                });

                menuAction.addMenuitem(obj as MenuitemStruct);
            });

            onBeforeUnmount(() => {
                if (!(submenuHtmlRef.value instanceof HTMLElement)) return;
                menuAction.removeMenuitem(submenuHtmlRef.value);
            });
        }

        onlyRootMenuExecute: {
            if (rootMenuStore) break onlyRootMenuExecute;

            provide(rootMenuStoreKey, readonly(reactive({
                mode: computedMode as ComputedRef<MenuMode>,
                notTransition: toRef(props, 'notransition')
            })));

            provide(
                rootMenuActionKey,
                {menuitemradioChecked: () => menuitemStructs.forEach(menuitem => menuitem.checked = 'false')}
            );

            watch(() => dropdownStore!.state, async value => {
                if (!value) return;

                const {relatedEvent, handled} = dropdownAction!.menuOpenReason();
                if (!relatedEvent) return;
                // 如果使用鼠标打开下拉框, 则不聚焦菜单项
                if (relatedEvent.type === 'click') return handled();
                // 只处理 keydown 事件
                if (relatedEvent.type !== 'keydown') return handled();

                const focusable = menuitemStructs.filter(value => !value.hidden)
                    , event = relatedEvent as KeyboardEvent;
                let index = -1;
                switch (event.key) {
                    case 'ArrowUp':
                        index = focusable.length - 1;
                        break;
                    case ' ':
                    case 'Enter':
                    case 'ArrowDown':
                        index = 0;
                        break;
                }

                if (index === -1) return;

                await nextTick(() => {
                    focusable[index]?.focus();
                    activeElement = focusable[index]?.element;
                    handled();
                });
            }, {immediate: true});
        }

        const showSubmenu = ref(false);
        watch(() => dropdownStore!.state, () => showSubmenu.value = false);

        const isNotTransition = computed(() => rootMenuStore?.notTransition ?? props.notransition)
            /** 计算菜单栏方向, 该属性适用于菜单栏与子菜单栏 */
            , computedDirection = computed(() => {
                const {direction} = props;
                if (computedMode.value === 'submenu') {
                    if (direction && submenuAllowedDirections.includes(direction)) return direction;
                    return 'right-start';
                }

                return direction ?? 'bottom-start';
            })
            /** 菜单栏 class 样式 */
            , computedMenuClass = computed(() => {
                const classes: unknown[] = [
                    `j-dropdown-${computedMode.value}`,
                    `j-dropdown-${computedDirection.value}`
                ];

                if (computedMode.value === 'select-menu') {
                    classes.push({'j-dropdown-select-menu-with-header': !!slots.header});
                }

                return classes;
            });

        let submenuStateIdentifier: number | undefined = undefined;

        /**
         * 处理子菜单显示状态
         *
         * 鼠标离开 button 或子菜单元素时, 都延迟关闭子菜单,
         * 防止多次修改 {@link showSubmenu} 值, 而多次触发 Vue 过渡效果
         *
         * @param event MouseEvent
         */
        function submenuMouseInteraction(event: MouseEvent): void {
            !event.defaultPrevented && event.preventDefault();

            if (typeof submenuStateIdentifier !== 'undefined') {
                window.clearTimeout(submenuStateIdentifier);
                submenuStateIdentifier = undefined;
            }

            if (event.type === 'mouseenter') {
                showSubmenu.value = true;
            } else {
                submenuStateIdentifier = window.setTimeout(() => showSubmenu.value = false, 100);
            }
        }

        /**
         * 子菜单切换键通过键盘打开或关闭子菜单
         *
         * @param event KeyboardEvent
         */
        async function submenuToggleKeyboardInteraction(event: KeyboardEvent): Promise<void> {
            if (![' ', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;

            !event.defaultPrevented && event.preventDefault();
            event.stopPropagation();

            if (typeof submenuStateIdentifier !== 'undefined') {
                window.clearTimeout(submenuStateIdentifier);
                submenuStateIdentifier = undefined;
            }

            showSubmenu.value = true;
            await nextTick(() => {
                const first = menuitemStructs.filter(value => !value.hidden)[0];
                first?.focus();
                activeElement = first?.element;
            });
        }

        /**
         * 处理菜单与子菜单键盘切换菜单项焦点的函数
         *
         * @param event KeyboardEvent
         */
        function commonKeyboardInteraction(event: KeyboardEvent): void {
            if (computedMode.value === 'submenu') {
                // 如果当前组件是子菜单, 并且该子菜单并未开启
                // 则不处理此次事件
                if (!showSubmenu.value) return;

                // 如果按下 Escape 按键, 则关闭该子菜单
                // 并将焦点转移到子菜单切换按键
                if (event.key === 'Escape') {
                    !event.defaultPrevented && event.preventDefault();
                    // 停止冒泡, 防止 dropdown 组件关闭菜单
                    event.stopPropagation();

                    showSubmenu.value = false;
                    activeElement = undefined;

                    const toggle = submenuToggleHtmlRef.value;
                    if (!(toggle instanceof HTMLElement)) return;
                    toggle.focus();

                    return;
                }
            }

            const focusable = menuitemStructs.filter(value => !value.hidden)
                , last = focusable.length - 1;
            let index = -1;
            switch (event.key) {
                case 'Home':
                    index = 0;
                    break;
                case 'End':
                    index = last;
                    break;
                case 'ArrowUp': {
                    let i = focusable.findIndex(({element}) => element === activeElement);
                    i = i === -1 ? last : i;
                    index = i <= 0 ? last : i - 1;
                    break;
                }
                case 'ArrowDown': {
                    let i = focusable.findIndex(({element}) => element === activeElement);
                    i = i === -1 ? 0 : i;
                    index = i >= last ? 0 : i + 1;
                    break;
                }
                default:
                    return;
            }

            if (index === -1) return;

            !event.defaultPrevented && event.preventDefault();
            // 停止冒泡, 防止父菜单处理此次键盘事件
            if (computedMode.value === 'submenu') event.stopPropagation();

            focusable[index]?.focus();
            activeElement = focusable[index]?.element;
        }

        return () => {
            // ========== submenu ==========
            if (computedMode.value === 'submenu') {
                const buttonChildren: VNodeChild = [];
                if (rootMenuStore?.mode === 'select-menu') {
                    switch (submenuChecked.value) {
                        case 'true':
                            buttonChildren.push(Check());
                            break;
                        case 'mixed':
                            buttonChildren.push(Indeterminate());
                            break;
                        default:
                            buttonChildren.push(createElement('span', {class: 'submenu-blank-icon'}));
                            break;
                    }
                }

                buttonChildren.push(createElement('span', {class: 'submenu-placeholder'}, renderSlot(slots, 'placeholder')));
                buttonChildren.push(ChevronRight());

                const button = createElement('button', {
                    ref: submenuToggleHtmlRef,
                    class: ['submenu-toggle', {'checked': submenuChecked.value && submenuChecked.value != 'false'}],
                    tabindex: '-1',
                    'aria-haspopup': 'menu',
                    'aria-expanded': showSubmenu.value.toString(),
                    type: 'button',
                    role: 'menuitem',
                    onMouseenter: submenuMouseInteraction,
                    onMouseleave: submenuMouseInteraction,
                    onKeydown: submenuToggleKeyboardInteraction
                }, buttonChildren)
                    , renderedSubmenu = createElement(
                    'div',
                    {
                        ref: submenuHtmlRef,
                        class: computedMenuClass.value,
                        'aria-orientation': 'vertical',
                        role: 'menu',
                        onMouseenter: submenuMouseInteraction,
                        onMouseleave: submenuMouseInteraction
                    },
                    renderSlot(slots, 'default')
                )
                    , withDirectiveRenderedSubmenu = withDirectives(renderedSubmenu, [[vShow, showSubmenu.value]])
                    , children: VNodeChild = [button];

                if (isNotTransition.value) {
                    children.push(withDirectiveRenderedSubmenu);
                } else {
                    children.push(withTransition(() => withDirectiveRenderedSubmenu));
                }

                const data: Record<string, unknown> = {
                    class: 'j-dropdown-submenu-container',
                    role: 'none',
                    onKeydown: commonKeyboardInteraction
                };
                return createElement('div', data, children);
            }

            // ========== menu ==========
            const data: Record<string, unknown> = {
                id: dropdownStore?.id,
                class: computedMenuClass.value,
                'aria-orientation': 'vertical',
                role: 'menu',
                onKeydown: commonKeyboardInteraction
            };

            if (dropdownStore && dropdownAction && dropdownStore.cause === 'hover') {
                data.onMouseenter = data.onMouseleave = (event: MouseEvent) => {
                    !event.defaultPrevented && event.preventDefault();
                    const name = event.type === 'mouseenter' ? 'cancelDelayedClosure' : 'delayedClosure';
                    dropdownAction[name]();
                };
            }

            const renderedMenu = createElement(
                'div',
                data,
                computedMode.value === 'select-menu'
                    ? renderSelectMenuChildren(slots, props.dismissable, dropdownAction)
                    : renderSlot(slots, 'default')
            )
                , withDirectiveRenderedMenu = withDirectives(renderedMenu, [[vShow, dropdownStore!.state]]);

            return isNotTransition.value
                ? withDirectiveRenderedMenu
                : withTransition(() => withDirectiveRenderedMenu);
        }
    }
});

export default component;
