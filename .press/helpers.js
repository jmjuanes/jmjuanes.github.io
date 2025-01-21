import {uid} from "uid/secure";

// @description asign hooks to the provided context
export const assignHooks = (hooks, context) => {
    return Object.assign(context, {
        hooks: Object.fromEntries(hooks.map(hook => {
            return [hook, new Set()]
        })),
    });
};

// @description dispatch the provided hook
export const dispatchHook = (context, hook, ...payload) => {
    return context.hooks[hook].map(fn => fn(...payload));
};

// @description ensore that a hook is dispatched only once
export const dispatchHookOnce = (context, hook, ...payload) => {
    const listeners = Array.from(context.hooks[hook]);
    for (let i = 0; i < listeners.length; i++) {
        if (!!listeners[i](...payload)) {
            return true;
        }
    }
    return false;
};

// @description add a new node item
export const createNode = (context, options = {}, id = uid(8)) => {
    // TODO: check if this path has been already registered?
    context.nodes.set(id, {
        ...options,
        type: options?.type || "asset",
        cwd: options?.cwd || context.source,
        path: options.path,
    });
    return context.nodes.get(id);
};
