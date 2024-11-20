import * as fs from "node:fs";
import * as path from "node:path";
import * as marked from "marked";
import fm from "front-matter";
import mikel from "mikel";

// globals
const input = path.join(process.cwd(), "pages");
const output = path.join(process.cwd(), "www");
const template = fs.readFileSync(path.join(process.cwd(), "template.html"), "utf8");

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

// read /data folder
const getData = () => {
    const dataFolder = path.join(process.cwd(), "data");
    const files = fs.readdirSync(dataFolder, "utf8")
        .filter(file => path.extname(file) === ".json")
        .map(file => path.join(dataFolder, file))
        .map(file => {
            return [path.basename(file, ".json"), JSON.parse(fs.readFileSync(file, "utf8"))];
        });
    return Object.fromEntries(files);
};

// get pages from input folder
const getPages = () => {
    return fs.readdirSync(input, "utf8")
        .filter(file => path.extname(file) === ".html")
        .map(file => path.join(input, file))
        .map(file => {
            const content = fm(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, ".html"),
                url: path.join("/", path.basename(file)),
                data: content.attributes,
                content: content.body,
            };
        });
};

// get posts
const getPosts = () => {
    const postsFolder = path.join(process.cwd(), "posts");
    return fs.readdirSync(postsFolder, "utf8")
        .filter(file => path.extname(file) === ".md")
        .map(file => path.join(postsFolder, file))
        .map(file => {
            const content = fm(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, ".md"),
                url: path.join("/", path.basename(file, ".md") + ".html"),
                data: content.attributes,
                content: marked.parse(content.body),
            };
        });
};

// global data object
const globalData = {
    site: {
        title: "Josemi Juanes, Ph.D.",
        description: "React developer and Minimal Design lover.",
        url: "https://www.josemi.xyz",
        navbar: {
            links: [
                // {text: "About", url: "/"},
                // {text: "Notes", url: "/notes"},
                {text: "Resume", href: "https://resume.josemi.xyz"},
            ],
        },
        footer: {
            text: "Hand-crafted with care by <b>Josemi</b>.",
            links: [
                {text: "GitHub", url: "https://github.com/jmjuanes"},
            ],
        },
        build: getBuildInfo(),
    },
    data: getData(),
    page: null,
    pages: getPages(),
    // posts: getPosts(),
};

// build stuff
globalData.pages.forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    // globalData.page.content = mikel(page.content, globalData); // compile page content
    const content = mikel(template, globalData, {
        functions: {
            icon: args => {
                return `<svg width="1em" height="1em"><use xlink:href="sprite.svg#${args.opt.icon}"></use></svg>`;
            },
        },
        partials: {
            content: page.content,
        },
    });
    fs.writeFileSync(path.join(output, page.url), content, "utf8");
});
