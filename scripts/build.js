import * as path from "node:path";
import press from "mikel-press";
import hljs from "highlight.js";
import websiteConfig from "../website.config.json" with {type: "json"};

// convert string to pascal case
const pascalCase = str => {
    return str.match(/[a-zA-Z0-9]+/g).map(w => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join("");
};

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

// get partials
const getPartials = () => {
    const folder = path.resolve("partials");
    return Object.fromEntries(press.utils.walkdir(folder, [".html"]).map(file => {
        return [
            pascalCase(path.basename(file, ".html")),
            press.utils.read(path.join(folder, file)),
        ];
    }));
};

press.build({
    ...websiteConfig,
    build: getBuildInfo(),
    plugins: [
        press.SourcePlugin({
            source: "./pages",
            label: "pages",
        }),
        press.DataPlugin(),
        press.FrontmatterPlugin({
            parser: JSON.parse,
        }),
        press.PermalinkPlugin(),
        press.ContentPlugin({
            layout: "./layouts/default.html",
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
            partials: getPartials(),
        }),
        // press.CopyAssetsPlugin({
        //     patterns: [
        //         {from: path.resolve("node_modules/lowcss/low.css"), to: "low.css"},
        //         {from: path.resolve("node_modules/@josemi-icons/svg/sprite.svg"), to: "icons.svg"},
        //         {
        //             from: path.resolve("node_modules/highlight.js/styles/nord.css"),
        //             to: "highlight.css",
        //         },
        //     ],
        // }),
    ],
});
