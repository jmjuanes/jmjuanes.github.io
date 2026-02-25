import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import type { MikelUseOptions } from "mikel";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getBuildInfo = (): string => {
    // Use Intl.DateFileFormat to generate build time
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long", timeZone: "CET" }).format(new Date());
};

export type BrandPluginOptions = {
    iconsPath?: string;
};

export default (options: BrandPluginOptions = {}): Partial<MikelUseOptions> => {
    const prefix = "josemi";
    // 1. read components and layouts and save them as partials
    const partials = {} as Record<string, string>;
    ["components", "layouts"].forEach(folder => {
        const folderPath = path.join(__dirname, folder);
        fs.readdirSync(folderPath, "utf8").forEach(file => {
            if (path.extname(file) === ".mustache") {
                const partialName = [prefix, path.basename(file, ".mustache")].join(":");
                partials[partialName] = fs.readFileSync(path.join(folderPath, file), "utf8");
            }
        });
    });
    // 2. return the new options for mikel
    return {
        partials: partials,
        initialState: {
            josemi: {
                iconsPath: options?.iconsPath || "/icons.svg",
                buildInfo: getBuildInfo(),
            },
        },
    };
};
