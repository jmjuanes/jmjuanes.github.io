import * as path from "path";
import * as babel from "@babel/core";
import press from "mikel-press";

// transform jsx code
const transform = code => {
    const result = babel.transformSync(code, {
        presets: [
            "@babel/preset-react",
        ],
        filename: "inline.jsx", // needed for Babel to recognize JSX
    });
    return result.code;
};

// @description babel plugin for parsing JSX content in HTML files
export const BabelJSXPlugin = () => {
    const regex = /<script\s+type=["']text\/babel["']>([\s\S]*?)<\/script>/g;
    return {
        name: "BabelJSXPlugin",
        transform: (context, node) => {
            // 1. transform inline jsx content in .html files
            if (node.path.endsWith(".html") && !!node.content) {
                node.content = node.content.replace(regex, (_, code) => {
                    return `<script type="module">${transform(code)}</script>`;
                });
            }
            // 2. transform jsx content in .jsx files
            if (node.label === press.LABEL_ASSET && path.extname(node.path) === ".jsx") {
                node.content = transform(press.utils.read(node.source));
                node.path = path.join(path.dirname(node.path), path.basename(node.path, ".jsx") + ".js");
            }
        }
    };
};
