import * as fs from "node:fs";
import * as path from "node:path";
import frontMatter from "front-matter";
import mikel from "mikel";

// Read a JSON file
const readJsonSync = (jsonPath, encoding = "utf8") => {
    return JSON.parse(fs.readFileSync(jsonPath, encoding));
};

// Read and parse the provided page content
const readPage = pagePath => {
    const page = frontMatter(fs.readFileSync(pagePath, "utf8"));
    return {
        name: path.basename(pagePath, ".html"),
        content: page.body || "",
        data: page.attributes || {},
    };
};

const build = () => {
    const inputFolder = path.join(process.cwd(), "pages");
    const outputFolder = path.join(process.cwd(), "www");
    const template = fs.readFileSync(path.join(process.cwd(), "template.html"), "utf8");
    fs.readdirSync(inputFolder, "utf8")
        .filter(file => path.extname(file) === ".html")
        .forEach(file => {
            const page = readPage(path.join(inputFolder, file));
            const content = mikel(template, {page}, {
                partials: {
                    content: page.content,
                },
            });
            console.log(`[build] Saving '${file}'`);
            fs.writeFileSync(path.join(outputFolder, file), content, "utf8");
        });
};

build();
