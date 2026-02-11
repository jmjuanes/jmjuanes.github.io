import fs from "node:fs/promises";
import postcss from "postcss";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import { minify } from "csso";
import lowcss from "lowcss";

const INPUT_FILE = "index.css";
const OUTPUT_FILE = "brand.css";

const build = (): Promise<void> => {
    return fs.readFile(INPUT_FILE, "utf8")
        .then(input => {
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
            return minify(result.css, {
                sourceMap: false,
            });
        })
        .then(result => {
            return fs.writeFile(OUTPUT_FILE, result.css);
        });
};

build().catch(console.error);
