import * as path from "node:path";
import config from "../press.config.js";
import {assignHooks, dispatchHook, dispatchHookOnce} from "./helpers.js";

// list of valid hooks
const allHooks = ["load", "transform", "filter", "beforeEmit", "emit", "done"];

// build site
const build = () => {
    const {source, destination, plugins, ...siteConfiguration} = config;
    const context = assignHooks(allHooks, {
        config: config,
        source: path.resolve(config.source || "./pages"),
        destination: path.resolve(config.destination || "./www"),
        site: siteConfiguration,
        nodes: new Map(),
    });
    // initialize plugins
    (config.plugins || []).forEach(plugin => {
        return plugin(context);
    });
    // load nodes
    dispatchHook(context, "load");
    // transform nodes
    Array.from(context.nodes.values()).forEach(node => {
        dispatchHook(context, "transform", node);
    });
    // filter nodes and get only the ones that are going to be emitted
    const filteredNodes = Array.from(context.nodes.values()).filter(node => {
        return dispatchHook(context, "filter", node).every(result => !!result);
    });
    // emit each node
    dispatchHook(context, "beforeEmit", filteredNodes);
    filteredNodes.forEach(node => {
        return dispatchHookOnce(context, "emit", node, filteredNodes);
    });
    // done
    dispatchHook(context, "done", null);
};

// build site
build();
