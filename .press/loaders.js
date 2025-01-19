import * as path from "node:path";
import * as marked from "marked";
import fm from "front-matter";
import {read} from "./util.js";

// @description asset loader
export const assetLoader = (node, options = {}) => {
    return Object.assign(node, {
        ...options,
        name: options.name || path.basename(options?.url || node.path),
        url: options.url || path.normalize("/" + node.path),
        content: options.content || read(path.resolve(node.cwd, node.path)),
    });
};

// @description page loader
export const pageLoader = node => {
    const p = node.path;
    return assetLoader(node, {
        url: path.normalize("/" + path.dirname(p) + "/" + path.basename(p, path.extname(p)) + ".html"),
    });
};

// @description frontmatter loader
export const frontmatterLoader = node => {
    const {body, attributes} = fm(node.content || "");
    node.content = body;
    node.data = attributes;
    node.url = attributes.permalink || node.url;
};

// @description markdown loader for pages
export const markdownLoader = node => {
    node.content = marked.parse(node.content);
};
