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
                {text: "about", href: "/"},
                {text: "projects", href: "/projects"},
                {text: "notes", href: "/notes"},
                // {text: "resume", href: "/resume"},
            ],
        },
        footer: {
            text: "Made with love by Josemi.",
            links: [
                {text: "GitHub", href: "https://github.com/jmjuanes"},
            ],
        },
        buildInfo: getBuildInfo(),
    },
    page: null,
    pages: getPages(),
    // posts: getPosts(),
};

// build stuff
globalData.pages.forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    globalData.page.content = mikel(page.content, globalData); // compile page content
    const content = mikel(template, globalData); // compile template
    fs.writeFileSync(path.join(output, page.url), content, "utf8");
});
