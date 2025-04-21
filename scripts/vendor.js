import * as fs from "node:fs";
import * as path from "node:path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import virtual from "@rollup/plugin-virtual";
import {rollup} from "rollup";

// @description build vendor files
const vendor = async patterns => {
    const destination = path.resolve("www/vendor");
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, {recursive: true});
    }
    // process patterns
    for (let i = 0; i < patterns.length; i++) {
        const item = patterns[i];
        if (typeof item.from === "string") {
            fs.cpSync(path.resolve(item.from), path.join(destination, item.to), {
                force: true,
            });
            console.log(`[vendor] copy '${item.from}' -> '${path.join(destination, item.to)}'`);
        }
        else if (typeof item.virtual === "string") {
            const bundle = await rollup({
                input: "entry",
                external: item.external || [],
                plugins: [
                    virtual({
                        entry: item.virtual,
                    }),
                    replace({
                        preventAssignment: true,
                        "process.env.NODE_ENV": JSON.stringify("development"),
                    }),
                    resolve(),
                    commonjs(),
                ],
            });
            await bundle.write({
                file: path.join(destination, item.to),
                format: item.format || "esm",
            });
            console.log(`[vendor] bundle ${path.join(destination, item.to)}`);
        }
    }
};

// build vendor files
vendor([
    {
        virtual: `import * as React from "react"; export default React;`,
        to: "react.esm.js",
    },
    {
        virtual: `import * as ReactDOM from "react-dom"; export default ReactDOM;`,
        external: ["react"],
        to: "react-dom.esm.js",
    },
    {
        virtual: `import * as ReactDOMClient from "react-dom/client"; export default ReactDOMClient;`,
        external: ["react"],
        to: "react-dom-client.esm.js",
    },
    {
        from: "node_modules/lowcss/low.css",
        to: "low.css",
    },
    {
        from: "node_modules/mikel/index.js",
        to: "mikel.esm.js",
    },
    {
        from: "node_modules/@josemi-icons/svg/sprite.svg",
        to: "icons.svg",
    },
    {
        from: "node_modules/@josemi-icons/react/index.js",
        external: ["react"],
        to: "icons.esm.js",
    },
    {
        virtual: `import cn from "classnames"; export default cn;`,
        to: "classnames.esm.js",
    },
    {
        from: "node_modules/codecake/codecake.js",
        to: "codecake.js",
    },
    {
        from: "node_modules/codecake/codecake.css",
        to: "codecake.css",
    },
    {
        from: "node_modules/highlight.js/styles/nord.css",
        to: "highlight.css",
    },
]);
