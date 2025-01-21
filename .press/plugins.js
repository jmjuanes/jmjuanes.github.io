import * as path from "node:path";
import * as marked from "marked";
import frontmatter from "front-matter";
import mikel from "mikel";
import {createNode} from "./helpers.js";
import {write, read, readdir} from "./util.js";

// @description source plugin
export const SourcePlugin = (options = {}) => {
    return context => {
        const folder = path.resolve(options?.source || context.source);
        context.hooks.load.add(() => {
            readdir(folder, options?.extensions || "*").map(file => {
                return createNode(context, {type: options?.type, cwd: folder, path: file});
            });
        });
    };
};

// @description data plugin
export const DataPlugin = (options = {}) => {
    return context => {
        const dataFolder = path.resolve(options.source || "./data");
        // 1. initialize data notes
        context.hooks.load.add(() => {
            return readdir(dataFolder, [".json"]).forEach(file => {
                return createNode(context, {
                    cwd: dataFolder,
                    path: file,
                });
            });
        });
        // 2. register a data transform to load data files
        context.hooks.transform.add(node => {
            if (node.cwd === dataFolder && path.extname(node.path) === ".json") {
                node.content = JSON.parse(read(path.join(node.cwd, node.path)));
            }
        });
        // 3. remove data nodes from emitters
        context.hooks.filter.add(node => {
            return !(node.cwd === dataFolder && path.extname(node.path) === ".json");
        });
        // 3. before emit, prepare the data object in context.site
        context.hooks.beforeEmit.add(() => {
            const dataNodes = Array.from(context.nodes.values()).filter(node => {
                return node.cwd === dataFolder && path.extname(node.path) === ".json";
            });
            context.site.data = Object.fromEntries(dataNodes.map(node => {
                return [
                    path.basename(node.path, ".json"),
                    node.content,
                ];
            }));
        });
    };
};

// @description content reader plugin
export const ContentPlugin = (options = {}) => {
    return context => {
        const extensions = options.extensions || [".md", ".markdown", ".html"];
        context.hooks.transform.add(node => {
            // read the content of the node if it is not defined and the extension is valid
            if (typeof node.content === "undefined" && (extensions === "*" || extensions.includes(path.extname(node.path)))) {
                node.content = read(path.join(node.cwd, node.path));
            }
        });
    };
};

// @description frontmatter plugin
export const FrontmatterPlugin = (options = {}) => {
    return context => {
        const extensions = options.extensions || [".md", ".markdown", ".html"];
        context.hooks.transform.add(node => {
            if (extensions.includes(path.extname(node.path)) && typeof node.content === "string") {
                const {body, attributes} = frontmatter(node.content);
                node.data = attributes;
                node.content = body;
            }
        });
    };
};

// @description markdown plugin
export const MarkdownPlugin = () => {
    return context => {
        context.hooks.transform.add(node => {
            if (path.extname(node.path) === ".md" || path.extname(node.path) === ".markdown") {
                node.content = marked.parse(body);
                node.extname = ".html"; // change node extension to .html
            }
        });
    };
};

// @description template plugin
export const TemplatePlugin = (options = {}) => {
    return context => {
        // 1. create a new node for the template
        const templatePath = path.resolve(options.template);
        const templateNode = createNode(context, {
            cwd: path.dirname(templatePath),
            path: path.basename(templatePath),
        });
        // 2. [TODO] register a dependency to all pages
        // 3. read and transform the template node
        context.hooks.transform.add(node => {
            if (node === templateNode) {
                node.content = read(path.join(node.cwd, node.path));
            }
        });
        // 4. add a filter to skip this node from emitters
        context.hooks.filter.add(node => {
            return node.cwd !== path.dirname(templatePath) && node.path !== path.basename(templatePath);
        });
        // 5. before emit, generate the list of pages in context.site.pages
        context.hooks.beforeEmit.add(nodesToPublish => {
            context.site.pages = nodesToPublish.filter(node => {
                return path.extname(node.path) === ".html";
            });
            // save all pages tagged as posts
            context.site.posts = nodesToPublish.filter(node => {
                return node.type === "post" && path.extname(node.path) === ".html";
            });
        });
        // 5. register a new emitter for all pages
        context.hooks.emit.add(node => {
            if (path.extname(node.path) === ".html") {
                const data = {
                    site: context.site,
                    page: node,
                };
                node.content = mikel(node.content, data, options);
                const content = mikel(templateNode.content, data, options);
                write(path.join(context.destination, node.url || node.path), content);
                return true;
            }
            return false;
        });
    };
};
