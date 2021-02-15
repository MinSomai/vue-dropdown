import {DefineComponent, RenderFunction} from 'vue';

interface Prop {
    /** 下拉框初始状态. 如果需要默认打开请将该值设置为 `true` */
    moduleValue?: boolean;
    /**
     * 菜单栏与切换键 `aria-controls` 属性同时使用的 `id` 属性<br>
     * 默认生成一个随机字符串
     *
     * @default Date.now().toString(16) + Math.random().toString(16).slice(2)
     */
    id?: string;
    /**
     * 是否为下拉框组件添加一个元素充当遮罩层,
     * 点击该遮罩层将关闭下拉框 (点击菜单栏之外的元素, 将关闭下拉框)
     *
     * @default false
     */
    nooverlay?: boolean;
    /**
     * 触发下拉的行为, 默认 `click`
     *
     * 如果使用 `hover` 方式触发下拉行为, 则 `nooverlay` 选项将失效
     *
     * 可选值:
     * - click
     * - hover
     *
     * @default click
     */
    cause?: 'click' | 'hover';
}

declare type Emits = [
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
];

declare const component: DefineComponent<
    Prop,
    RenderFunction,
    {},
    {},
    {},
    {},
    {},
    Emits,
    'toggle' | 'command' | 'commanded'
>;

export default component;
export { Prop };
