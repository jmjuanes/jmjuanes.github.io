import * as path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";

import websiteConfig from "./website.config.json" with { type: "json" };
import vendor from "./vendor.json" with { type: "json" };

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
            basePath: ".",
            patterns: press.utils.walkdir(path.resolve("./assets")).map(file => ({
                from: path.resolve(path.join("./assets", file)),
                to: file,
            })),
        }),
        press.CopyAssetsPlugin({
            basePath: "vendor",
            patterns: Object.keys(vendor).map(target => {
                return { from: vendor[target], to: target };
            }),
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
        press.TransformPlugin(node => {
            if (node.label === press.LABEL_PAGE && node.content && path.extname(node.source) === ".md") {
                node.content = `{{#markdown}}\n\n${node.content}\n\n{{/markdown}}\n`;
            }
        }),
        press.ContentPagePlugin(),
    ],
});
