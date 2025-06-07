import * as path from "node:path";
// import * as babel from "@babel/core";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./website.config.json" with {type: "json"};

// generate build info
const getBuildInfo = () => {
    const now = new Date();
    // Use Intl.DateFileFormat to generate build time
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    const dateTimeOptions = {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: "CET",
    };
    // Return build info
    return new Intl.DateTimeFormat("en-US", dateTimeOptions).format(now);
};

// @description babel plugin for parsing JSX content in HTML files
const BabelJSXPlugin = () => {
    const regex = /<script\s+type=["']text\/babel["']>([\s\S]*?)<\/script>/g;
    // const transform = code => {
    //     const result = babel.transformSync(code, {
    //         presets: [
    //             "@babel/preset-react",
    //         ],
    //         filename: "inline.jsx", // needed for Babel to recognize JSX
    //     });
    //     return result.code;
    // };
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
        },
    };
};

press({
    ...websiteConfig,
    build: {
        date: getBuildInfo(),
    },
    mikelOptions: {
        helpers: {
            getCollection: params => {
                const items = (params.data?.site?.pages || []).filter(page => {
                    return params.args[0] && page?.attributes?.collection === params.args[0];
                });
                return params.fn(params.data, {collection: items});
            },
        },
        functions: {
            icon: args => {
                return [
                    `<svg width="1em" height="1em">`,
                    `<use xlink:href="/vendor/icons.svg#${args.opt.icon}"></use>`,
                    `</svg>`,
                ].join("");
            },
            highlight: params => {
                return hljs.highlight(params.opt.code.trim(), {language: params.opt.language}).value;
            },
        },
    },
    plugins: [
        press.SourcePlugin({folder: "./posts", basePath: "notes"}),
        press.SourcePlugin({folder: "./content"}),
        press.DataPlugin(),
        press.PartialsPlugin(),
        press.CopyAssetsPlugin({
            basePath: "vendor",
            patterns: [
                {from: "node_modules/lowcss/low.css"},
                {from: "node_modules/@josemi-icons/svg/sprite.svg", to: "icons.svg"},
                {from: "node_modules/highlight.js/styles/nord.css", to: "highlight.css"},
            ],
        }),
        press.UsePlugin(markdown({})),
        press.FrontmatterPlugin(),
        press.ContentPagePlugin(),
    ],
});
