import { readFileSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import mikel from "mikel";
import { createInput } from "mikel-cli";
import frontmatterPlugin from "mikel-frontmatter";
import { defineConfig } from "mikel-cli";

const ROOT = process.cwd();
const COMPONENTS_DIR = join(ROOT, "content/_components");
const LAYOUTS_DIR = join(ROOT, "content/_layouts");
const DATA_DIR = join(ROOT, "content/_data");
const POSTS_DIR = join(ROOT, "content/_posts");

const readFolder = (folder, prefix, extension, parser) => {
    const entries = [];
    readdirSync(folder, "utf-8").forEach(file => {
        if (extname(file) === extension) {
            entries.push([
                [...prefix, basename(file, extension)].filter(Boolean).join("::"),
                parser(readFileSync(join(folder, file), "utf8")),
            ]);
        }
    });
    return Object.fromEntries(entries);
};

export default defineConfig({
    context: ROOT,
    input: [
        "index.html",
    ],
    output: {
        dir: "www",
    },
    partials: {
        // ...readFolder(LAYOUTS_DIR, ["josemi", "layout"], ".mustache", d => d),
        // ...readFolder(COMPONENTS_DIR, ["josemi"], ".mustache", d => d),
    },
    plugins: [
        mikel.SetStatePlugin("site", {
            title: "josemi",
        }),
        frontmatterPlugin(),
    ],
});
