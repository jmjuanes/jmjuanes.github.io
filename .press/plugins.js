import * as fs from "node:fs";
import * as path from "node:path";
import * as marked from "marked";
import frontmatter from "front-matter";
import mikel from "mikel";
import {createNode, updateNode} from "./helpers.js";
import {write, read, copy, readdir} from "./util.js";

// @description source plugin
export const SourcePlugin = (options = {}) => {
    const label = options.label || "pages";
    return {
        name: "SourcePlugin",
        load: context => {
            const folder = path.resolve(context.source, options.source || "./content");
            const nodes = readdir(folder, options?.extensions || "*").map(file => {
                return createNode({label: label, cwd: folder, path: file});
            });
            // register nodes in context.site.[label]
            context.site[label] = nodes;
            return nodes;
        },
        transform: (_, node) => {
            if (node.label === label) {
                node.content = read(path.join(node.cwd, node.path));
            }
        },
    };
};

// @description data plugin
export const DataPlugin = (options = {}) => {
    const label = options?.label || "asset/data";
    return {
        name: "DataPlugin",
        load: context => {
            context.site.data = {}; // register store for data
            const folder = path.resolve(context.source, options.source || "./data");
            return readdir(folder, [".json"]).map(file => {
                return createNode({label: label, cwd: folder, path: file});
            });
        },
        transform: (context, node) => {
            if (node.label === label && path.extname(node.path) === ".json") {
                const name = path.basename(node.path, ".json");
                const content = JSON.parse(read(path.join(node.cwd, node.path)));
                context.site.data[name] = content;
            }
        },
        shouldEmit: (_, node) => {
            return node.label !== label;
        },
    };
};

// @description frontmatter plugin
export const FrontmatterPlugin = (options = {}) => {
    const extensions = options.extensions || [".md", ".markdown", ".html"];
    return {
        name: "FrontmatterPlugin",
        transform: (_, node) => {
            if ((extensions === "*" || extensions.includes(path.extname(node.path))) && typeof node.content === "string") {
                const {body, attributes} = frontmatter(node.content);
                node.data = attributes;
                node.content = body;
            }
        },
    };
};

// @description permalink plugin
export const PermalinkPlugin = () => {
    return {
        name: "PermalinkPlugin",
        transform: (_, node) => {
            return updateNode(node, {
                path: node.data?.permalink || node.path,
            });
        },
    };
};

// @description markdown plugin
export const MarkdownPlugin = () => {
    return {
        name: "MarkdownPlugin",
        transform: (_, node) => {
            if (path.extname(node.path) === ".md" || path.extname(node.path) === ".markdown") {
                node.content = marked.parse(node.content);
                updateNode(node, {extname: ".html"});
            }
        },
    };
};

// @description template plugin
export const TemplatePlugin = (options = {}) => {
    const label = options.label || "asset/template";
    return {
        name: "TemplatePlugin",
        load: context => {
            return createNode({
                label: label,
                path: path.resolve(context.source, options.template),
                content: read(path.resolve(context.source, options.template)),
            });
        },
        shouldEmit: (_, node) => {
            return node.label !== label;
        },
        emit: (context, nodesToEmit) => {
            const template = Array.from(context.nodes).find(n => n.label === label);
            const compiler = mikel.create(template.content, options);
            nodesToEmit.forEach(node => {
                if (path.extname(node.path) !== ".html") {
                    return;
                }
                compiler.addPartial("content", node.content);
                const content = compiler({
                    site: Object.assign({}, context.config, context.site),
                    page: node,
                    template: template,
                });
                write(path.join(context.destination, node.path), content);
            });
        },
    };
};

// @description copy plugin
export const CopyAssetsPlugin = (options = {}) => {
    return {
        name: "CopyAssetsPlugin",
        emit: context => {
            (options.patterns || []).forEach(item => {
                if (item.from && item.to && fs.existsSync(item.from)) {
                    copy(item.from, path.join(context.destination, item.to));
                }
            });
        },
    };
};
