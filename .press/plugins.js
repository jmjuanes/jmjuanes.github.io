import * as path from "node:path";
import mikel from "mikel";
import {createNode} from "./helpers.js";
import {frontmatterLoader, pageLoader, markdownLoader} from "./loaders.js";
import {write, readdir} from "./util.js";

// @description source plugin
export const SourcePlugin = (options = {}) => {
    return context => {
        const folder = path.resolve(options?.source || context.source);
        return readdir(folder, "*").map(file => {
            return createNode(context, {cwd: folder, path: file});
        });
    };
};

// @description data plugin
export const DataPlugin = (options = {}) => {
    return context => {
        context.hooks.beforeEmit.add(() => {
            const folder = path.resolve(options.source || "./data");
            const files = readdir(folder, [".json"]).map(file => {
                return [
                    path.basename(file, ".json"),
                    JSON.parse(read(path.join(folder, file))),
                ];
            });
            context.site.data = Object.fromEntries(files);
        });
    };
};

// @description markdown plugin
export const MarkdownPlugin = () => {
    return context => {
        context.rules.add({
            test: /\.(md|markdown)$/,
            type: "page",
            loaders: [
                pageLoader,
                frontmatterLoader,
                markdownLoader,
            ],
        });
    };
};

// @description HTML pages plugin
export const HtmlPlugin = () => {
    return context => {
        return context.rules.add({
            test: /\.(html|htm)$/,
            type: "page",
            loaders: [
                pageLoader,
                frontmatterLoader,
            ],
        });
    };
};

// @description template plugin
export const TemplatePlugin = (options = {}) => {
    return context => {
        context.site = Object.assign(context.site || {}, {});
        const template = createNode(context, {
            path: options?.template || context.config.template,
            cwd: context.source,
        });
        // register pages emitter
        context.emitters.set("page", (_, node) => {
            const data = {
                site: context.site,
                page: node,
                layout: template,
            };
            node.content = mikel(node.content, data, options);
            const content = mikel(template.content, data, options);
            write(path.resolve(context.destination, page.url), content);
        });
        // add a filter to skip this node from emitters
        context.filters.add(node => {
            return node.cwd !== template.cwd && node.path !== template.path;
        });
        // before emit, prepare the list of pages and change template node type
        context.hooks.beforeEmit.add(() => {
            template.type = "asset/template";
            context.site.pages = Array.from(context.nodes.values()).filter(n => n.type === "page");
        });
    };
};
