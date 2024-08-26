import * as fs from "node:fs";
import * as path from "node:path";
import mikel from "mikel";

// globals
const input = path.join(process.cwd(), "pages");
const output = path.join(process.cwd(), "www");
const template = fs.readFileSync(path.join(process.cwd(), "template.html"), "utf8");

// get pages from input folder
const getPages = () => {
    return fs.readdirSync(input, "utf8")
        .filter(file => path.extname(file) === ".html")
        .map(file => path.join(input, file))
        .map(file => {
            const content = mikel.frontmatter(fs.readFileSync(file, "utf8"));
            return {
                name: path.basename(file, ".html"),
                url: path.join("/", path.basename(file)),
                data: content.data,
                content: content.body,
            };
        });
};

// global data object
const globalData = {
    site: {
        title: "Josemi Juanes, Ph.D.",
        description: "React developer and Minimal Design lover.",
        url: "https://www.josemi.xyz",
        // navbar: {
        //     subdomain: "folio",
        //     links: [
        //         {text: "home", link: "/"},
        //         {text: "pricing", link: "/"},
        //         {text: "releases", link: "/"},
        //     ],
        //     actions: [
        //         {text: "Try it", link: "/"},
        //     ],
        // },
        // brand: [
        //     {text: "josemi", link: "/"},
        //     {text: "folio", link: "/"},
        // ],
        footer: "Made with love by Josemi."
    },
    page: null,
    pages: getPages(),
};

// build pages
globalData.pages.forEach(page => {
    console.log(`[build] save ${page.url}`);
    globalData.page = page; // set current page in global data object
    const content = mikel(template, globalData); // compile template
    fs.writeFileSync(path.join(output, page.url), content, "utf8");
});
