import * as fs from "node:fs";
import * as path from "node:path";

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

// @description copy a file
export const copy = (source, target) => {
    const folder = path.dirname(target);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
    }
    fs.copyFileSync(source, target);
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
