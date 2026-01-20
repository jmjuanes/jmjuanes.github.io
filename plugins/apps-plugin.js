import fs from "node:fs";
import path from "node:path";
import press from "mikel-press";

export default AppsPlugin = (options = {}) => {
    const pages = new Set();
    return {
        load: context => {
            const nodes = [];
            const folder = path.join(context.source, options?.folder);
            const extensions = options?.extensions || context.extensions;
            // we have to read all applications
            fs.readdirSync(folder).forEach(applicationName => {
                const applicationFolder = path.join(folder, applicationName);
                if (fs.statSync(applicationFolder).isDirectory()) {
                    // 1. read all pages in the application folder
                    press.utils.readdir(applicationFolder, extensions).forEach(file => {
                        pages.add(path.join(applicationFolder, file));
                        return nodes.push({
                            source: path.join(applicationFolder, file),
                            label: press.LABEL_PAGE,
                            path: path.join(options?.basePath || ".", applicationName, file),
                        });
                    });
                    // 2. read other stuff (assets, data, etc)
                    press.utils.walkdir(applicationFolder, "*").forEach(file => {
                        if (!pages.has(path.join(applicationFolder, file))) {
                            return nodes.push({
                                source: path.join(applicationFolder, file),
                                label: press.LABEL_ASSET,
                                path: path.join("_press", press.utils.md5(path.join(applicationFolder, file)) + path.extname(file)),
                            });
                        }
                    });
                }
            });
            return nodes;
        },
        transform: (context, node) => {
            if (pages.has(node.source)) {
                node.content = press.utils.read(node.source);
            }
        },
    };
};
