import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderResponsiveGoogleButton } from '../src/features/googleSignIn/utils/renderResponsiveGoogleButton.ts';
test('Google button follows available width without repeated shrink renders and cleans up', (t) => {
    let resize = () => { };
    let frame;
    let disconnected = false;
    let width = 0;
    const widths = [];
    const originals = ['ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
    t.after(() => {
        for (const [key, descriptor] of originals) {
            if (descriptor)
                Object.defineProperty(globalThis, key, descriptor);
            else
                Reflect.deleteProperty(globalThis, key);
        }
    });
    Object.defineProperties(globalThis, {
        ResizeObserver: { configurable: true, value: class {
                constructor(callback) { resize = callback; }
                observe() { }
                disconnect() { disconnected = true; }
            } },
        requestAnimationFrame: { configurable: true, value: (callback) => { frame = callback; return 1; } },
        cancelAnimationFrame: { configurable: true, value: () => { frame = undefined; } },
    });
    const element = {
        get clientWidth() { return Math.floor(width); },
        getBoundingClientRect: () => ({ width: width * 1.2 }),
        replaceChildren() { },
    };
    const api = { accounts: { id: { renderButton: (_element, options) => {
                    widths.push(options.width);
                    assert.equal(options.locale, 'ru');
                    assert.equal(options.logo_alignment, 'center');
                } } } };
    const stop = renderResponsiveGoogleButton(element, api, 'ru');
    assert.deepEqual(widths, []);
    width = 520;
    resize();
    frame?.();
    width = 342.8;
    resize();
    frame?.();
    resize();
    frame?.();
    width = 0;
    resize();
    frame?.();
    width = 342.8;
    resize();
    frame?.();
    assert.deepEqual(widths, ['400', '342']);
    width = 280;
    resize();
    stop();
    assert.equal(frame, undefined);
    assert.equal(disconnected, true);
});
