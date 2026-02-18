import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import { minify } from "csso";
import lowcss from "lowcss";

const INPUT_FILE = "index.css";
const OUTPUT_FILE = ".cache/ui.css";

const build = (): Promise<void> => {
    return Promise.resolve()
        .then(() => {
            // 1. create the output folder for the output file
            return fs.mkdir(path.dirname(OUTPUT_FILE), {recursive: true });
        })
        .then(() => {
            // 2. read the input file
            return fs.readFile(INPUT_FILE, "utf8");
        })
        .then(input => {
            // 3. compile input css file
            const plugins: any[] = [
                autoprefixer,
                postcssImport,
                lowcss,
            ];
            return postcss(plugins).process(input, {
                from: INPUT_FILE,
            });
        })
        .then(result => {
            // print all warnings (if any)
            result.warnings().forEach(warn => {
                console.warn(warn.toString());
            });
            // 4. minify result css
            return minify(result.css, {
                sourceMap: false,
            });
        })
        .then(result => {
            // 5. save result css
            return fs.writeFile(OUTPUT_FILE, result.css);
        });
};

build().catch(console.error);
