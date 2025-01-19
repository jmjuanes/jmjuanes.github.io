import {uid} from "uid/secure";

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
