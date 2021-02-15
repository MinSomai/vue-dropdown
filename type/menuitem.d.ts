import {DefineComponent, RenderFunction} from 'vue';

interface Prop {
    /**
     * 是否渲染为菜单栏分割线
     *
     * 如果该属性为 `true`, 则忽略所有其他 prop
     *
     * 如果菜单为 `select-menu` 模式, 则可以提供默认插槽显示提示信息
     *
     * @default false
     */
    divider?: boolean;
    /**
     * 需要渲染为的 HTML 元素, 可以传入组件名称, 如 `router-link`
     *
     * 如果需要渲染特定的组件, 则需要确保传入该组件需要的 prop
     *
     * 默认值:
     * - 如果 `role` 选项为 `menuitem` 时, 默认渲染为 `button` 元素
     * - 如果 `role` 选项为 `menuitemradio` 或 `menuitemcheckbox` 时 (**此时不建议修改标签**), 默认渲染为 `label` 元素
     */
    as?: string;
    /**
     * 菜单项支持的类型, **不推荐菜单项类型混合使用**
     *
     * 可选的属性:
     * - menuitem
     * - menuitemradio
     * - menuitemcheckbox
     *
     * @default menuitem
     */
    role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
    /**
     * 当 `role` 为 `menuitemradio` 或 `menuitemcheckbox` 类型时,
     * 指定该元素是否默认为已选择状态
     *
     * 菜单栏中应只有一个元素为已选择状态
     *
     * 该属性使用 `String` 类型, 只为兼容 `aria-checked` 属性 `mixed` 值
     *
     * @default false
     */
    checked?: 'true' | 'false' | 'mixed';
    /**
     * 是否禁用该菜单项
     *
     * 被禁用的菜单项可聚焦但无法激活
     *
     * @default false
     */
    disabled?: boolean;
    /**
     * 是否隐藏该菜单项
     *
     * @default false
     */
    hidden?: boolean;
    /** 指定该组件指令名称 */
    command?: number | string | Record<string, unknown>;
}

declare const component: DefineComponent<Prop, RenderFunction>;

export default component;
export { Prop };
