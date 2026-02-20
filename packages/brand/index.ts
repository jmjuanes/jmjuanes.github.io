import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import type { MikelOptions, MikelPartial } from "mikel";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type BrandPluginOptions = {
    iconsPath?: string;
};

export default (options: BrandPluginOptions = {}): Partial<MikelOptions> => {
    // 1. read components and layouts and save them as partials
    const partials = {} as Record<string, string>;
    ["components", "layouts"].forEach(folder => {
        const folderPath = path.join(__dirname, folder);
        fs.readdirSync(folderPath, "utf8").forEach(file => {
            if (path.extname(file) === ".mustache") {
                partials[file] = fs.readFileSync(path.join(folderPath, file), "utf8");
            }
        });
    });
    // 2. return the new options for mikel
    return {
        partials: partials,
        variables: {
            josemi: {
                iconsPath: options?.iconsPath || "/icons.svg",
            },
        },
    };
};
