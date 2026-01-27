import * as path from "node:path";
import mikel from "mikel";
import press from "mikel-press";
import markdown from "mikel-markdown";
import hljs from "highlight.js";
import websiteConfig from "./website.config.json" with { type: "json" };

press({
    url: websiteConfig.url,
    title: websiteConfig.title,
    description: websiteConfig.description,
    extensions: [ ".mustache", ".md", ".markdown" ],
    template: mikel.create({
        // helpers: {},
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
            build: () => {
                // Use Intl.DateFileFormat to generate build time
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
                return new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "long", timeZone: "CET" }).format(new Date());
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
            patterns: Object.keys(websiteConfig.assets || {}).map(destination => {
                return {
                    from: websiteConfig.assets[destination],
                    to: destination,
                };
            }),
        }),
        press.UsePlugin(markdown({
            ...websiteConfig.markdown,
            highlight: (code, language) => {
                return hljs.highlight(code.trim(), { language: language }).value;
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
