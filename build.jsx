const fs = require("node:fs/promises");
const path = require("node:path");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");
const runtime = require("react/jsx-runtime");
const matter = require("gray-matter")
const {renderIcon} = require("@josemi-icons/react/cjs");

// Generate build info
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
    return {
        time: {
            formatted: new Intl.DateTimeFormat("en-US", dateTimeOptions).format(now),
        },
    };
};

// Fetch imports before running build script
const fetchImports = () => {
    return Promise.all([
        import("@mdx-js/mdx"),
    ]);
};

// Menu button
const MenuButton = props => (
    <a href={props.to} className="py-1 px-0 text-gray-600 hover:text-gray-900 no-underline hover:underline">
        <span>{props.text}</span>
    </a>
);

// External link
const ExternalLink = props => (
    <a href={props.to} target="_blank" className="no-underline hover:underline flex items-center gap-1 text-gray-600 hover:text-gray-900">
        <div className="flex items-center text-lg">
            {renderIcon("arrow-up-right")}
        </div>
        <div className="">{props.text}</div>
    </a>
);

const PageWrapper = props => (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no" />
            <meta name="title" content="Josemi Juanes, Ph.D." />
            <meta name="description" content="Hey! I'm Josemi, a mathematician working, frontend developer and product designer." />
            <meta property="og:site_name" content="Josemi Juanes, Ph.D." />
            <meta property="og:title" content="Josemi Juanes, Ph.D." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.josemi.xyz" />
            <meta property="og:image" content="https://www.josemi.xyz/og.png" />
            <meta property="og:description" content="Hey! I'm Josemi, a mathematician, frontend developer and product designer." />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@700;900&display=swap" />
            <link rel="stylesheet" href={"/low.css"} />
            <link rel="stylesheet" href={"/resume.css"} />
            <title>{`Josemi Juanes, Ph.D.`}</title>
        </head>
        <body className="bg-white m-0 p-0 font-inter text-gray-900 leading-normal">
            {(props.page?.data?.layout === "default" || props.page?.data?.layout === "post") && (
                <div className="w-full maxw-2xl mx-auto px-6 md:px-0 py-16">
                    <div className="site-header flex flex-row items-center gap-4 mb-16">
                        <MenuButton to="/" text="about" />
                        <MenuButton to="/projects" text="projects" />
                        <MenuButton to="/posts" text="writings" />
                        <MenuButton to="/resume" text="resume" />
                    </div>
                    {props.page.data.layout === "default" && (
                        <React.Fragment>
                            {props.content}
                        </React.Fragment>
                    )}
                    {props.page.data.layout === "post" && (
                        <React.Fragment>
                            <div className="mb-8">
                                <div className="text-2xl font-bold">{props.page.data.title}</div>
                                <div className="text-gray-600 text-sm">{props.page.data.date}</div>
                            </div>
                            <div className="markdown">
                                {props.content}
                            </div>
                        </React.Fragment>
                    )}
                    <div className="site-footer py-16">
                        <div className="flex gap-4 mb-8">
                            <ExternalLink to="https://github.com/jmjuanes" text="my github profile" />
                        </div>
                        <div className="text-xs mb-1">Hand-crafted with care and love by <b>Josemi</b>.</div>
                        <div className="text-xs text-gray-700">Last built on {props.build.time.formatted}.</div>
                    </div>
                </div>
            )}
            {props.page?.data?.layout === "empty" && (
                <React.Fragment>
                    {props.content}
                </React.Fragment>
            )}
        </body>
    </html>
);

// Page components
const pageComponents = {
    Fragment: React.Fragment,
    Icon: props => renderIcon(props.icon),
    ExternalLink: ExternalLink,
    h1: props => <h1 className="text-xl font-bold mb-3 mt-4">{props.children}</h1>,
    h2: props => <h2 className="text-lg font-bold mb-3 mt-4">{props.children}</h2>,
    p: props => <p className="mt-0 mb-4">{props.children}</p>,
    ul: props => <ul className="pl-8">{props.children}</ul>,
    ol: props => <ol className="pl-8">{props.children}</ol>,
    li: props => <li className="mb-2">{props.children}</li>,
    code: props => <code className="font-mono text-sm font-bold">{"`"}{props.children}{"`"}</code>,
    pre: props => {
        const items = React.Children.toArray(props.children);
        const code = items[0].props.children;
        // const language = (items[0].props.className || "").replace("language-", "");
        // if (props.language) {
        //     return React.createElement("pre", {
        //         className: className,
        //         dangerouslySetInnerHTML: {
        //             __html: hljs.highlight(props.children, {language: props.language}).value,
        //         },
        //     });
        // }
        // Default: render without code highlight
        return (
            <pre className="font-mono text-xs p-4 rounded-md bg-gray-200 overflow-auto mb-8">
                {code}
            </pre>
        );
    },
};

const readMarkdownFilesFromFolder = async folder => {
    const files = (await fs.readdir(folder)).filter(file => path.extname(file) === ".mdx");
    return Promise.all(files.map(file => {
        const filePath = path.join(folder, file);
        return fs.readFile(filePath, "utf8").then(fileContent => ({
            ...matter(fileContent),
            fileName: path.basename(file, ".mdx") + ".html",
            url: `/${path.basename(file, ".mdx")}`,
        }));
    }));
};

fetchImports().then(async imports => {
    const [mdx] = imports;
    const buildInfo = getBuildInfo();
    const outputFolder = path.join(process.cwd(), "www");
    const pages = await readMarkdownFilesFromFolder(path.join(process.cwd(), "pages"));
    const posts = await readMarkdownFilesFromFolder(path.join(process.cwd(), "posts"));
    await Promise.all([...pages, ...posts].map(page => {
        return mdx.evaluate(page.content, {...runtime})
            .then(pageComponent => {
                const pageContent = React.createElement(PageWrapper, {
                    content: React.createElement(pageComponent.default, {
                        page: page,
                        components: pageComponents,
                        pages: pages,
                        posts: posts,
                    }),
                    page: page,
                    build: buildInfo,
                });
                return renderToStaticMarkup(pageContent);
            })
            .then(content => {
                return fs.writeFile(path.join(outputFolder, page.fileName), content, "utf8");
            })
            .then(() => {
                console.log(`Saved file '${path.join("www", page.fileName)}'.`);
            });
    }));
    console.log("Build finished");
});
