import * as path from "node:path";
import press from "mikel-press";
import * as marked from "marked";
import * as yaml from "js-yaml";
import websiteConfig from "../website.config.json" with {type: "json"};

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

press.build({
    ...websiteConfig,
    build: getBuildInfo(),
    plugins: [
        press.SourcePlugin({
            source: "./pages",
            label: "pages",
        }),
        press.SourcePlugin({
            source: "./posts",
            label: "posts",
        }),
        press.DataPlugin(),
        press.FrontmatterPlugin({
            parser: yaml.load,
        }),
        press.MarkdownPlugin({
            parser: marked.parse,
        }),
        press.PermalinkPlugin(),
        press.ContentPlugin({
            layout: "./layout.html",
            functions: {
                icon: args => {
                    return [
                        `<svg width="1em" height="1em">`,
                        `<use xlink:href="/icons.svg#${args.opt.icon}"></use>`,
                        `</svg>`,
                    ].join("");
                },
            },
        }),
        press.CopyAssetsPlugin({
            patterns: [
                {from: path.resolve("node_modules/lowcss/low.css"), to: "low.css"},
                {from: path.resolve("node_modules/@josemi-icons/svg/sprite.svg"), to: "icons.svg"},
            ],
        }),
    ],
});
