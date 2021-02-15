'use strict';
import {
    defineComponent,
    h as createElement,
    provide,
    ref,
    toRef,
    customRef,
    renderSlot,
    reactive,
    readonly,
    PropType,
    VNodeChild, withDirectives, vShow
} from 'vue';
import {
    dropdownStore as dropdownStoreKey,
    dropdownAction as dropdownActionKey,
    EventInit
} from './misc/key';

/**
 * 下拉框组件
 *
 * @example
 * <j-dropdown @toggle="handleToggle" @command="handleCommand">...</j-dropdown>
 */
const component = defineComponent({
    name: 'JDropdown',
    props: {
        /** 下拉框初始状态. 如果需要默认打开请将该值设置为 `true` */
        modelValue: {required: false, type: Boolean as PropType<boolean | undefined>, default: undefined},
        /**
         * 菜单栏与切换键 `aria-controls` 属性同时使用的 `id` 属性<br>
         * 默认生成一个随机字符串
         */
        id: {
            required: false,
            type: String,
            default: () => `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
        },
        /**
         * 是否为下拉框组件添加一个元素充当遮罩层,
         * 点击该遮罩层将关闭下拉框 (点击菜单栏之外的元素, 将关闭下拉框)
         */
        nooverlay: {required: false, type: Boolean, default: false},
        /**
         * 触发下拉的行为, 默认 `click`
         *
         * 如果使用 `hover` 方式触发下拉行为, 则 `nooverlay` 选项将失效
         *
         * 可选值:
         * - click
         * - hover
         */
        cause: {
            required: false,
            type: String as PropType<'click' | 'hover'>,
            default: 'click',
            validator: (value: string) => ['click', 'hover'].includes(value)
        }
    },
    emits: [
        'update:modelValue',
        /*
         * 下拉框展开或隐藏时触发
         * 该事件具有一个为 true(下拉框展开) 或 false(下拉框隐藏) 的回调参数
         */
        'toggle',
        /*
         * 点击菜单项触发的回调事件,
         * 该事件具有一个包含 Menuitem 组件 command prop 和一个取消函数回调参数
         *
         * 该事件触发后, 如果未取消事件并且 Menuitem 组件为 menuitemradio 或 menuitemcheckbox,
         * 则会更新组件如无障碍访问 (aria-*) 等属性
         *
         * 如果该事件被取消, 则不会触发 commanded 事件
         */
        'command',
        /*
         * 下拉框关闭后 (如果点击元素是 menuitemcheckbox 组件, 则不会关闭下拉框) 触发该事件
         * 该事件按不可取消
         */
        'commanded'
    ],
    setup(props, {emit, slots}) {
        /** 下拉框状态 */
        const state = typeof props.modelValue === 'undefined'
            ? ref(false)
            : customRef<boolean>((track, trigger) => ({
                get() {
                    track();
                    return props.modelValue as boolean;
                },
                set(value) {
                    emit('update:modelValue', value);
                    trigger();
                }
            }))
            , toggleHtmlRef = ref<HTMLElement | null>(null);

        let delayedClosureIdentifier: number | undefined = undefined;

        function cancelDelayedClosure(): void {
            if (typeof delayedClosureIdentifier === 'undefined') return;

            window.clearTimeout(delayedClosureIdentifier);
            delayedClosureIdentifier = undefined;
        }

        function delayedClosure(time: number = 150): void {
            cancelDelayedClosure();
            delayedClosureIdentifier = window.setTimeout(() => toggle(false), time);
        }

        function toggle(value: boolean = !state.value): void {
            cancelDelayedClosure();
            state.value = value;
            emit('toggle', state.value);
        }

        function dispatchEvent<T>(
            name: 'command' | 'commanded',
            {cancelable = false, detail = undefined}: EventInit<T>): boolean {
            let unCanceled = true;

            const args: unknown[] = [detail];
            if (cancelable) args.push(() => unCanceled = false);

            emit.call(null, name, ...args);

            return unCanceled;
        }

        function dropdownDismissOnOverlay(event: MouseEvent): void {
            !event.defaultPrevented && event.preventDefault();
            toggle(false);
        }

        async function dropdownDismissOnEscape(event: KeyboardEvent): Promise<void> {
            if (event.key === 'Tab') return toggle(false);

            if (event.key !== 'Escape') return;
            !event.defaultPrevented && event.preventDefault();
            toggle(false);

            if (!(toggleHtmlRef.value instanceof HTMLElement)) return;
            toggleHtmlRef.value.focus();
        }

        let menuOpenReasonEvent: MouseEvent | KeyboardEvent | undefined = undefined;

        function toggleMouseInteraction(event: MouseEvent): void {
            let toState = undefined;
            switch (event.type) {
                case 'click':
                    toState = !state.value;
                    break;
                case 'mouseenter':
                    toState = true;
                    break;
                case 'mouseleave':
                    return delayedClosure();
                default:
                    return;
            }

            !event.defaultPrevented && event.preventDefault();
            if (toState) menuOpenReasonEvent = event;
            toggle(toState);
        }

        /**
         * 键盘按下事件, 实现键盘交互
         *
         * @param event KeyboardEvent
         */
        async function toggleKeyboardInteraction(event: KeyboardEvent): Promise<void> {
            let toState = undefined;
            switch (event.key) {
                case ' ':
                case 'Enter':
                    toState = !state.value;
                    break;
                case 'Escape':
                    toState = false;
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    toState = true;
                    break;
                default:
                    return;
            }

            !event.defaultPrevented && event.preventDefault();
            if (toState) menuOpenReasonEvent = event;
            toggle(toState);

            if (toState || !(toggleHtmlRef.value instanceof HTMLElement)) return;
            toggleHtmlRef.value.focus();
        }

        provide(dropdownStoreKey, readonly(reactive({
            state,
            cause: toRef(props, 'cause'),
            id: toRef(props, 'id')
        })));
        provide(dropdownActionKey, {
            toggle,
            dispatchEvent,
            delayedClosure,
            cancelDelayedClosure,
            menuOpenReason: () => ({
                relatedEvent: menuOpenReasonEvent,
                handled: () => menuOpenReasonEvent = undefined
            })
        });

        return () => {
            const toggleVBind: Record<string, unknown> = {
                ref: toggleHtmlRef,
                'aria-haspopup': 'menu',
                'aria-expanded': state.value.toString(),
                'aria-controls' : props.id,
                onKeydown: toggleKeyboardInteraction,
                onClick: props.cause === 'click' && toggleMouseInteraction,
                onMouseenter: props.cause === 'hover' && toggleMouseInteraction,
                onMouseleave: props.cause === 'hover' && toggleMouseInteraction
            }
                , data: Record<string, unknown> = {
                class: ['j-dropdown', {'j-dropdown-open': state.value}],
                onKeydown: dropdownDismissOnEscape
            }
                ,  children: VNodeChild = [];

            if (props.cause === 'click' && !props.nooverlay) {
                const overlay = createElement('div', {
                    class: 'j-dropdown-overlay',
                    role: 'none',
                    onClick: dropdownDismissOnOverlay
                });

                children.push(withDirectives(overlay, [[vShow, state.value]]));
            }

            children.push(renderSlot(slots, 'default', {toggle: toggleVBind}));

            return createElement('div', data, children);
        };
    }
});

export default component;
