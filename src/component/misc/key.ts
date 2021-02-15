'use strict';
import {InjectionKey, ComponentPublicInstance} from 'vue';
import {MenuMode, MenuitemType, MenuitemChecked} from './type';

interface EventInit<T> {
    /**
     * 该事件是否可以取消
     *
     * @default false
     */
    cancelable?: boolean;
    /** 事件参数 */
    detail?: T;
}

interface MenuitemStruct {
    readonly element: HTMLElement | ComponentPublicInstance;
    readonly type: MenuitemType;
    readonly disabled?: boolean;
    readonly hidden?: boolean;
    checked?: MenuitemChecked;
    focus: () => void;
}

/** 响应式只读数 */
interface DropdownStore {
    /** 下拉框触发方式 */
    cause: 'click' | 'hover';
    /** 下拉框状态 */
    state: boolean;
    /** 菜单栏 `id`, 切换键 `aria-controls` 属性同样使用该 `id` */
    id: string;
}

interface DropdownAction {
    /**
     * 切换下拉框状态
     *
     * @param [value] 如果打开下拉框传入 true, 否则传入 false
     */
    toggle: (value?: boolean) => void;
    /**
     * 委托 Dropdown 组件派遣事件
     *
     * @param name 事件名称
     * @param eventInit 事件初始化参数
     * @return 如果事件被取消则或 {@link EventInit.cancelable cancelable} 为 `true`, 则返回 `false`, 否则返回 `true`
     */
    dispatchEvent: <T>(name: 'command' | 'commanded', eventInit: EventInit<T>) => boolean;
    /**
     * 延迟关闭菜单栏
     *
     * @param [time=150] 延迟时间, 默认 150 毫秒
     */
    delayedClosure: (time?: number) => void;
    /**
     * 当使用 `hover` 方式触发下拉框时, 可以调用该函数取消延迟关闭 (鼠标离开切换元素时, 延迟150毫秒关闭菜单栏)
     */
    cancelDelayedClosure: () => void;
    /**
     * 菜单栏开启原因
     *
     * 当 {@link DropdownStore.state state} 为 `true` 时, 可调用该函数查看菜单栏开启原因
     *
     * 完成相关事件处理后, 可调用 {@link handled} 函数, 通知 Dropdown 组件重置 {@link relatedEvent} 属性
     */
    menuOpenReason: () => { relatedEvent?: MouseEvent | KeyboardEvent, handled: () => void };
}

/** 响应式只读数 */
interface RootMenuStore {
    /** 根菜单渲染模式 */
    mode: MenuMode;
    /** 根菜单是否已设置不使用过渡 */
    notTransition: boolean;
}

interface RootMenuAction {
    /** 当 menuitemradio 菜单项点击后, 调用该方法重置所有 menuitemradio 菜单项 `aria-checked` 属性为 `false` */
    menuitemradioChecked: () => void;
}

interface MenuAction {
    addMenuitem: (value: MenuitemStruct) => void;
    removeMenuitem: (value: HTMLElement | ComponentPublicInstance) => void;
    menuitemCheckedChanged(): void;
}

const dropdownStore: InjectionKey<Readonly<DropdownStore>> = Symbol()
    , dropdownAction: InjectionKey<DropdownAction> = Symbol()
    , rootMenuStore: InjectionKey<Readonly<RootMenuStore>> = Symbol()
    , rootMenuAction: InjectionKey<RootMenuAction> = Symbol()
    , menuAction: InjectionKey<MenuAction> = Symbol();

export {
    EventInit,
    MenuitemStruct,
    DropdownStore, dropdownStore,
    DropdownAction, dropdownAction,
    RootMenuStore, rootMenuStore,
    RootMenuAction, rootMenuAction,
    MenuAction, menuAction,
};
