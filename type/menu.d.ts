import {DefineComponent, RenderFunction} from 'vue';

interface Prop {
    /**
     * 菜单栏模式, 默认 `menu`
     *
     * 如果是子菜单则此选项将被忽略
     *
     * 可选值:
     * - menu
     * - select-menu
     */
    mode?: 'menu' | 'select-menu';
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
    direction?: false;
    /**
     * 是否显示菜单栏关闭按钮 (**必须提供 `header` 插槽**), 只有 `mode` 为 `select-menu` 时生效
     *
     * @default true
     */
    dismissable?: boolean;
    /**
     * 是否取消组件过渡效果
     *
     * @default false
     */
    notransition?: boolean;
}

declare const component: DefineComponent<Prop, RenderFunction>;

export default component;
export { Prop };
