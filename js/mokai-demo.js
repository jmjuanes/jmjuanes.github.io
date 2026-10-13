import mokai from "/cdn/mokai@latest/index.js";
import highlight from "/cdn/mokai-syntax@latest/index.js";
    
const root = document.getElementById("editor");
const exampleCode = [
    `function sum(a, b) {`,
    `    return a + b;`,
    `};`,
    ``,
    `// Expected: 4`,
    `console.log(sum(2, 2));`,
];

// initialize example editor
const editor = mokai(root, {
    className: "mokai-dark",
    lineNumbers: true,
    highlight: code => highlight(code, "javascript"),
});

editor.set(exampleCode.join("\n"));

