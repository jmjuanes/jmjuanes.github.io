import * as fs from "node:fs";
import * as path from "node:path";
import fm from "front-matter";

// @description read a file from disk
export const read = (file, encoding = "utf8") => {
    return fs.readFileSync(file, encoding);
};

// @description write a file to disk
export const write = (file, content) => {
    const folder = path.dirname(file);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
    }
    fs.writeFileSync(file, content, "utf8");
};

// @description get all files from the given folder and the given extensions
export const readdir = (folder, extensions = "*") => {
    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
        return [];
    }
    return fs.readdirSync(folder, "utf8").filter(file => {
        return extensions === "*" || extensions.includes(path.extname(file));
    });
};

// @description create a virtual file object from the given options
export const createVirtualFile = (options = {}) => {
    const content = options.content || read(options.file);
    const extname = options.extname || path.extname(options.file) || ".html";
    const basename = options.basename || path.basename(options.file, path.extname(options.file)) || "virtual";
    const {body, attributes} = fm(content);
    return {
        name: basename + extname,
        basename: basename,
        extname: extname,
        url: options.url || attributes?.permalink || path.join("/", basename + extname),
        data: attributes || {},
        content: typeof options.transform === "function" ? options.transform(body, basename + extname) : body,
    };
};
