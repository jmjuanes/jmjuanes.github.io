import * as path from "node:path";
import config from "../press.config.js";

// get plugins with the specified function
const getPlugins = (plugins, functionName) => {
    return plugins.filter(plugin => typeof plugin[functionName] === "function");
};

// build site
const build = () => {
    // const {source, destination, plugins, ...siteConfiguration} = config;
    const context = {
        config: config,
        source: path.resolve(config.source || "."),
        destination: path.resolve(config.destination || "./www"),
        site: {},
        nodes: new Set(),
    };
    // 0. initialize plugins
    const plugins = config.plugins || [];
    // 1. load nodes into context
    const nodesPaths = new Set(); // prevent adding duplicated nodes
    getPlugins(plugins, "load").forEach(plugin => {
        const nodes = plugin.load(context) || [];
        [nodes].flat().forEach(node => {
            if (!nodesPaths.has(path.join(node.cwd, node.path))) {
                context.nodes.add(node);
            }
        });
    });
    // 2. transform nodes
    const transformPlugins = getPlugins(plugins, "transform");
    Array.from(context.nodes).forEach((node, _, allNodes) => {
        transformPlugins.forEach(plugin => {
            return plugin.transform(context, node, allNodes);
        });
    });
    // 3. filter nodes and get only the ones that are going to be emitted
    const shouldEmitPlugins = getPlugins(plugins, "shouldEmit");
    const filteredNodes = Array.from(context.nodes).filter((node, _, allNodes) => {
        for (let i = 0; i < shouldEmitPlugins.length; i++) {
            const plugin = shouldEmitPlugins[i];
            if (!plugin.shouldEmit(context, node, allNodes)) {
                return false;
            }
        }
        return true;
    });
    // 4. emit each node
    getPlugins(plugins, "emit").forEach(plugin => {
        return plugin.emit(context, filteredNodes);
    });
    // done
    // dispatchHook(context, "done", null);
};

// build site
build();
