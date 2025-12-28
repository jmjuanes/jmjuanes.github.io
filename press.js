import * as path from "node:path";
import * as babel from "@babel/core";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./website.config.json" with { type: "json" };

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
    const transform = code => {
        const result = babel.transformSync(code, {
            presets: [
                "@babel/preset-react",
            ],
            filename: "inline.jsx", // needed for Babel to recognize JSX
        });
        return result.code;
    };
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
    extensions: [ ".mustache", ".md", ".markdown" ],
    build: {
        date: getBuildInfo(),
    },
    template: mikel.create({
        helpers: {
            pages: params => {
                const collection = params?.opt?.collection || params?.options?.collection || null;
                const items = (params.data?.site?.pages || []).filter(page => {
                    return !collection || page.attributes?.collection === collection;
                });
                const limit = Math.min(items.length, params.options?.limit || params.opt?.limit || items.length);
                return items.slice(0, limit)
                    .reverse()
                    .map((item, index) => params.fn(item, {index: index}))
                    .join("");
            },
        },
        functions: {
            icon: params => {
                return [
                    `<svg width="1em" height="1em">`,
                    `<use xlink:href="/vendor/icons.svg#${params.options?.icon || params.opt?.icon || ""}"></use>`,
                    `</svg>`,
                ].join("");
            },
            highlight: params => {
                const code = (params.options?.code || params.opt?.code).trim();
                const language = params.options?.language || params.opt?.language;
                return hljs.highlight(code, { language }).value;
            },
        },
    }),
    plugins: [
        press.SourcePlugin({
            folder: "./content",
            extensions: [ ".mustache" ],
        }),
        press.SourcePlugin({
            folder: "./pages",
            extensions: [ ".mustache" ],
        }),
        press.SourcePlugin({
            folder: "./posts",
            extensions: [ ".md", ".markdown" ],
        }),
        press.DataPlugin(),
        press.PartialsPlugin({
            extensions: [ ".mustache" ],
        }),
        press.LayoutsPlugin({
            folder: "./layouts",
            extensions: [ ".mustache" ],
        }),
        press.CopyAssetsPlugin({
            basePath: "vendor",
            patterns: [
                {from: "node_modules/lowcss/low.css"},
                {from: "node_modules/@josemi-icons/svg/sprite.svg", to: "icons.svg"},
                {from: "node_modules/highlight.js/styles/nord.css", to: "highlight.css"},
            ],
        }),
        press.UsePlugin(markdown({
            highlight: (code, language) => {
                return hljs.highlight(code.trim(), { language: language }).value;
            },
            classNames: {
                link: "font-medium underline",
                code: "bg-gray-100 rounded-md py-1 px-2 text-xs font-mono font-bold bg-gray-900",
                pre: "w-full overflow-x-auto bg-gray-950 text-gray-100 text-sm font-mono leading-relaxed my-6 p-4 rounded-xl",
                heading: "font-bold mb-4 first:mt-0 mt-8 text-gray-950",
                heading2: "text-2xl",
                heading3: "text-xl",
                heading4: "text-lg",
                list: "list-inside mb-6 pl-4",
                listItem: "mb-3 pl-1",
                paragraph: "block leading-relaxed mb-6",
            },
        })),
        press.FrontmatterPlugin(),
        BabelJSXPlugin(),
        press.ContentPagePlugin(),
    ],
});
