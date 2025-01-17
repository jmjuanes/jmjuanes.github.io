import * as path from "node:path";
import mikel from "mikel";
import siteConfig from "../press.config.js";
import {createVirtualFile, read, write, readdir} from "./helpers.js";

// list with all the available hooks
const HOOKS = {
    INITIALIZE: "initialize",
    COMPILER: "compiler",
    BEFORE_EMIT: "beforeEmit",
    EMIT: "emit",
    DONE: "done",
};

// build site
const build = () => {
    const {source = "./content", destination = "./www", layout, plugins = [], ...otherSiteConfig} = siteConfig;
    const context = {
        source: path.resolve(source),
        destination: path.resolve(destination),
        extensions: [".html", ".htm"],
        hooks: Object.fromEntries(Object.values(HOOKS).map(hook => {
            return [hook, new Set()];
        })),
        dispatch: (hookName, ...args) => {
            return Array.from(context.hooks[hookName]).forEach(callback => callback(...args));
        },
        files: [],
        site: Object.assign({}, otherSiteConfig, {pages: []}),
        layout: createVirtualFile({
            file: path.resolve(layout || "./layout.html"),
        }),
    };
    plugins.forEach(plugin => plugin(context)); // initialize plugins
    context.dispatch(HOOKS.INITIALIZE);
    // create compiler
    const compiler = mikel.create(context.layout?.content || "");
    context.dispatch(HOOKS.COMPILER, compiler);
    // read site stuff
    context.site.pages = readdir(context.source, [...context.extensions, ...context.staticExtensions]).map(filePath => {
        const file = createVirtualFile({
            file: path.join(context.source, filePath),
        });
        context.files.push(file);
        return file;
    });
    context.dispatch(HOOKS.BEFORE_EMIT);
    context.files.forEach(file => {
        context.dispatch(HOOKS.EMIT, file);
        let content = file.content;
        if (path.extname(file.url) === ".html" || path.extname(file.url) === ".htm") {
            compiler.addPartial("content", file.content);
            content = compiler({site: context.site, layout: context.layout, page: file});
        }
        // save file
        write(path.join(context.destination, file.url), content);
    });
    // done
    context.dispatch(HOOKS.DONE);
};

// build site
build();
