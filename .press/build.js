import * as path from "node:path";
import config from "../press.config.js";
import {write, copy} from "./util.js";

// build site
const build = () => {
    const {source, destination, plugins = [], ...otherConfig} = config;
    const context = {
        config: otherConfig,
        source: path.resolve(source || "./content"),
        destination: path.resolve(destination || "./www"),
        hooks: Object.fromEntries(["beforeLoad", "beforeEmit", "done"].map(hook => {
            return [hook, new Set()];
        })),
        nodes: new Map(),
        rules: new Set(),
        filters: new Set(),
        emitters: new Map(),
    };
    plugins.forEach(plugin => plugin(context));
    // load nodes
    Array.from(context.hooks.beforeLoad).forEach(fn => fn());
    context.nodes.forEach(node => {
        const rule = Array.from(context.rules).find(rule => {
            if (typeof rule.test === "function") {
                return rule.test(node);
            }
            if (Object.prototype.toString.call(rule.test) === "[object RegExp]") {
                return rule.test.test(node.path);
            }
            return false;
        });
        if (typeof rule === "object" && !!rule) {
            node.type = rule.type || node.type; // change node type
            (rule.loaders || []).forEach(loader => {
                Array.isArray(loader) ? loader[0](node, loader[1]) : loader(node);
            });
        }
    });
    // emit each node
    Array.from(context.hooks.beforeEmit).forEach(fn => fn());
    context.nodes.forEach(node => {
        if (context.filters.size === 0 || Array.from(context.filters).every(fn => !!fn(node))) {
            // check if we have registered an emmiter for this node type
            if (context.emitters.has(node.type || "asset")) {
                return context.emitters.get(node.type)(context, node);
            }
            // check if the node has a content associated
            if (typeof node.content === "string") {
                return write(path.join(context.destination, node.url || node.path), node.content)
            }
            // other case, just copy the file
            copy(path.join(node.cwd, node.path), path.join(context.destination, node.url || node.path));
        }
    });
    // done
    Array.from(context.hooks.done).forEach(fn => fn());
};

// build site
build();
