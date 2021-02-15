'use strict';
import {h as createElement, VNodeChild} from 'vue';

function X(): VNodeChild {
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            class: ['octicon', 'octicon-x'],
            viewBox: '0 0 16 16',
            width: '16',
            height: '16',
            role: 'img'
        },
        createElement('path', {
            'fill-rule': 'evenodd',
            d: 'M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z'
        })
    );
}

function Check(): VNodeChild {
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            class: ['octicon', 'octicon-check'],
            viewBox: '0 0 16 16',
            width: '16',
            height: '16',
            role: 'img'
        },
        createElement('path', {
            'fill-rule': 'evenodd',
            d: 'M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'
        })
    );
}

function Indeterminate(): VNodeChild {
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            class: ['octicon', 'octicon-dash'],
            viewBox: '0 0 16 16',
            width: '16',
            height: '16',
            role: 'img'
        },
        createElement('path', {
            'fill-rule': 'evenodd',
            d: 'M2 7.75A.75.75 0 012.75 7h10a.75.75 0 010 1.5h-10A.75.75 0 012 7.75z'
        })
    );
}

function ArrowRight(): VNodeChild {
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            class: ['octicon', 'octicon-arrow-right'],
            viewBox: '0 0 16 16',
            width: '16',
            height: '16',
            role: 'img'
        },
        createElement('path', {
            'fill-rule': 'evenodd',
            d: 'M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z'
        })
    );
}

function ChevronRight(): VNodeChild {
    return createElement(
        'svg',
        {
            xmlns: 'http://www.w3.org/2000/svg',
            class: ['octicon', 'octicon-chevron-right'],
            viewBox: '0 0 16 16',
            width: '16',
            height: '16',
            role: 'img'
        },
        createElement('path', {
            'fill-rule': 'evenodd',
            d: 'M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z'
        })
    );
}

export { X, Check, Indeterminate, ArrowRight, ChevronRight };
