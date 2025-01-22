import * as path from "node:path";

// @description add a new node item
export const createNode = (options = {}) => ({
    ...options,
    cwd: options?.cwd || "/",
    path: options.path,
    url: path.normalize("/" + options.path),
    // originalPath: options.path,
});

// @description update the path of the given node
export const updateNode = (node, options = {}) => {
    const extname = options.extname || path.extname(options.path || node.path);
    const name = options.name || path.basename(options.path || node.path, path.extname(options.path || node.path));
    const dirname = options.dirname || path.dirname(options.path || node.path);
    return Object.assign(node, {
        path: path.normalize(dirname + "/" + name + extname),
        url: path.normalize("/" + dirname + "/" + name + extname),
    });
};
