import * as path from "path";
import * as babel from "@babel/core";
import press from "mikel-press";

// internal constants
const ASSETS_LABEL = "assets";

// @description assets plugin
export const AssetsPlugin = (options = {}) => {
    const label = options?.label || ASSETS_LABEL;
    const publicPath = options?.publicPath || "assets";
    return {
        name: "AssetsPlugin",
        load: context => {
            const folder = path.resolve(context.source, options.source || "./assets");
            const nodes = press.utils.walkdir(folder, options?.extensions || "*").map(file => {
                return press.createNode(folder, file, label);
            });
            return nodes;
        },
        transform: (context, node) => {
            if (node.label === label) {
                node.data.content = press.utils.read(path.join(node.source, node.path));
            }
        },
        emit: (context, nodesToEmit) => {
            nodesToEmit.forEach(node => {
                if (node.label === label) {
                    const filePath = path.join(context.destination, publicPath, node.data.path || node.path);
                    press.utils.write(filePath, node.data.content);
                }
            });
        },
    };
};

// @description babel plugin for parsing JSX content in HTML files
export const BabelJSXPlugin = () => {
    const regex = /<script\s+type=["']text\/babel["']>([\s\S]*?)<\/script>/g;
    return {
        name: "BabelJSXPlugin",
        transform: (context, node) => {
            if (node.path.endsWith(".html") && !!node.data.content) {
                node.data.content = node.data.content.replace(regex, (_, jsxCode) => {
                    const result = babel.transformSync(jsxCode, {
                        presets: [
                            "@babel/preset-react",
                        ],
                        filename: "inline.jsx", // needed for Babel to recognize JSX
                    });
                    return `<script type="module">${result.code}</script>`;
                });
            }
        }
    };
};
