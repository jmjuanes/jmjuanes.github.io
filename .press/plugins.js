import * as path from "node:path";
import * as marked from "marked";
import babel from "@babel/core";
import {readdir, read} from "./helpers.js";

// @description data plugin
export const dataPlugin = (options = {}) => {
    return context => {
        context.hooks.initialize.add(() => {
            const folder = path.resolve(options.source || "./data");
            const files = readdir(folder, [".json"]).map(file => {
                return [
                    path.basename(file, ".json"),
                    JSON.parse(read(path.join(folder, file))),
                ];
            });
            context.site.data = Object.fromEntries(files);
        });
    };
};

// @description assets plugin
export const assetsPlugin = (options = {}) => {
    return context => {
        context.hooks.beforeEmit.add(() => {
            const folder = path.resolve(options.source || context.source);
            context.site.assets = context.site.assets || {}; // make sure assets is defined
            readdir(folder, options?.extensions || "*").forEach(file => {
                if (folder !== context.source || !context.extensions.includes(path.extname(file))) {
                    const name = path.basename(file);
                    const asset = createVirtualFile({
                        file: path.join(folder, file),
                        transform: options.transform || null,
                    });
                    // register as asset and file
                    context.site.assets[name] = asset;
                    context.files.push(asset);
                }
            });
        });
    };
};

// @description markdown plugin
export const markdownPlugin = (options = {}) => {
    const extensions = options?.extensions || [".md", ".markdown"];
    return context => {
        // 1. add markdown extensions to the list of extensions to process
        context.hooks.initialize.add(() => {
            context.extensions.push(...extensions);
        });
        // 2. transform markdown files before emit
        context.hooks.beforeEmit.add(() => {
            context.site.pages.forEach(page => {
                if (extensions.includes(page.extname)) {
                    page.content = marked(page.content);
                    // page.extname = ".html";
                    page.url = path.dirname(page.url) + "/" + page.basename + ".html";
                }
            });
        });
    };
};

// @description set mikel options plugin
export const setMikelOptionsPlugin = options => {
    return context => {
        context.hooks.compiler.add(compiler => {
            Object.keys(options?.functions || {}).forEach(functionName => {
                compiler.addFunction(functionName, options.functions[functionName]);
            });
            Object.keys(options?.helpers || {}).forEach(helperName => {
                compiler.addHelper(helperName, options.helpers[helperName]);
            });
            Object.keys(options?.partials || {}).forEach(partialName => {
                compiler.addPartial(partialName, options.partials[partialName]);
            });
        });
    };
};

// @description progress plugin
export const progressPlugin = () => {
    return context => {
        context.hooks.emitPage.add(page => console.log(`[build:page] save page '${page.url}'`));
        context.hooks.emitAsset.add(asset => console.log(`[build:asset] save asset '${asset.url}'`));
        context.hooks.done.add(() => console.log("[build] done"));
    };
};

// @description transform the given asset
export const transformJsxPlugin = () => {
    return context => {
        context.hooks.emitAsset.add(asset => {
            // transform JSX files to JS
            if (asset.extname === ".jsx") {
                const result = babel.transformSync(asset.content, {
                    filename: asset.name,
                    presets: [
                        "@babel/preset-react",
                    ],
                });
                // update asset attributes
                asset.content = result.code;
                asset.extname = ".js";
                asset.name = asset.basename + asset.extname;
                asset.url = path.dirname(asset.url) + "/" + asset.name;
            }
        });
    };
};
