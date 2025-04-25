import React from "react";
import classNames from "classnames";
import * as codeCake from "codecake";
import {renderIcon} from "@josemi-icons/react";
import lz from "lz-string";

export const LANGUAGES = {
    HTML: "html",
    CSS: "css",
    JS: "javascript"
};

export const LANGUAGES_CONFIG = {
    [LANGUAGES.HTML]: {name: "index.html", icon: "html5", iconClass: "text-orange-500"},
    [LANGUAGES.CSS]: {name: "styles.css", icon: "css", iconClass: "text-blue-500"},
    [LANGUAGES.JS]: {name: "app.js", icon: "javascript", iconClass: "text-yellow-600"},
};

// list of default sanbox attributes
export const SANDBOX_ATTRIBUTES = [
    "allow-downloads",
    "allow-forms",
    "allow-modals",
    "allow-pointer-lock",
    "allow-popups",
    "allow-presentation",
    "allow-same-origin",
    "allow-scripts",
];

// @description create a new element with the given tag name and attributes
const createElement = (tag, attributes = {}, content = "") => {
    const attributesArray = Object.keys(attributes).map(key => {
        return `${key}="${attributes[key]}"`;
    });
    return `<${tag} ${attributesArray.join(" ")}>${content}</${tag}>`;
};

// @description wrap javascript code
const wrapJavaScriptCode = (code = "") => { 
    return `
        // console.clear();
        const __execute = () => {
            const scriptTag = document.createElement("script");
            scriptTag.innerHTML = ${JSON.stringify(code)};
            document.body.appendChild(scriptTag);
        };
        document.addEventListener("DOMContentLoaded", __execute);
    `;
};

// @description run the code in the iframe
const generateHtml = async (code = {}, options = {}) => {
    // TODO: we have apply transforms to the code before running it
    // 1. generate head tags
    const head = [
        createElement("style", {}, code.css || ""),
        createElement("script", {}, wrapJavaScriptCode(code.javascript || "")),
    ].join("");
    // 2. generate body content
    const body = code.html || "";
    // generate the html document
    return `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;
};

// @description export a fiddle to a data-url string
// @param {object} fiddle - fiddle data
// @return {string} - data-url string
export const exportFiddle = (fiddle, options = {}) => {
    return new Promise(resolve => {
        const data = JSON.stringify({
            title: fiddle.title || "Untitled",
            htmlCode: fiddle.code.html,
            cssCode: fiddle.code.css,
            javascriptCode: fiddle.code.javascript,
        });
        return resolve(lz.compressToBase64(data));
    });
};

// @description import a fiddle from a data-url string
// @param {string} data - data-url string
// @return {object} - fiddle data
export const importFiddle = (data, options = {}) => {
    return new Promise((resolve, reject) => {
        const decodedData = lz.decompressFromBase64(data);
        if (!decodedData) {
            return reject(new Error("The fiddle data is not valid."));
        }
        const parsedData = JSON.parse(decodedData);
        return resolve({
            title: parsedData.title || "Untitled",
            readonly: options?.readonly || false,
            autorun: options?.autorun || true,
            code: {
                html: parsedData.htmlCode || "<div>Hello World</div>",
                css: parsedData.cssCode || "/* Write your CSS here */",
                javascript: parsedData.javascriptCode || "// Write your JS here",
            },
        });
    });
};

// fiddle editor context
export const FiddleContext = React.createContext({});

// use fiddle context
export const useFiddle = () => {
    return React.useContext(FiddleContext);
};

// fiddle provider
export const FiddleProvider = ({children, ...props}) => {
    const [state, setState] = React.useState(() => {
        return {
            executionId: 0,
            activeCode: "html",
            autorun: props.data?.autorun ?? true,
            readonly: props.data?.readonly ?? false,
            title: props.data?.title || "Untitled",
            code: {
                html: props.data?.code?.html || "<div>Hello World</div>",
                css: props.data?.code?.css || "/* Write your CSS here */",
                javascript: props.data?.code?.javascript || props.data?.code?.js || "// Write your JS here",
            },
        };
    });
    const actions = React.useMemo(() => ({
        run: () => {
            return setState(prevState => ({
                ...prevState,
                executionId: prevState.executionId + 1,
            }));
        },
        update: newState => {
            return setState(prevState => ({...prevState, ...newState}));
        },
        updateCode: (language, code) => {
            return setState(prevState => ({
                ...prevState,
                code: {
                    ...prevState.code,
                    [language]: code,
                },
            }));
        },
        setActiveCode: language => {
            setState(prevState => ({...prevState, activeCode: language}));
        },
    }), [setState]);

    // effect to display the onchange handler
    React.useEffect(() => {
        if (typeof props.onChange === "function") {
            props.onChange(state.code);
        }
    }, [state.code]);

    return (
        <FiddleContext value={{...state, ...actions}}>
            {children}
        </FiddleContext>
    );
};

// @description base layout component
export const FiddleLayout = props => {
    return (
        <div className={classNames("flex-auto flex min-h-0", props.className)}>
            {props.children}
        </div>
    );
};

const CodeEditor = props => {
    const parentRef = React.useRef(null);
    const editorRef = React.useRef(null);
    const codePanelClass = classNames({
        "w-full h-full overflow-y-auto": true,
        // "CodeCake-dark": props.theme === "dark",
        // "CodeCake-light bg-cool-50": !props.theme || props.theme === "light",
    });

    // on mount, initialize editor
    React.useEffect(() => {
        editorRef.current = codeCake.create(parentRef.current, {
            language: props.language || "html",
            className: "codecake-light h-full bg-white px-2 py-4",
            lineNumbers: true,
            highlight: codeCake.highlight,
        });
        // initialize the code
        if (props.initialCode) {
            editorRef.current.setCode(props.initialCode);
        }
        // register on change method
        editorRef.current.onChange(code => {
            return props.onChange(props.language, code);
        });
    }, [props.onChange]);

    return (
        <div className={codePanelClass} ref={parentRef}></div>
    );
};

// export code editor component
export const FiddleCode = () => {
    const fiddle = useFiddle();
    const availableCodeEditors = Object.values(LANGUAGES);
    const tabs = React.useMemo(() => {
        return availableCodeEditors.map(key => {
            const tabActive = key === fiddle.activeCode;
            const tabClassName = classNames({
                "flex items-center gap-1 cursor-pointer p-3 font-medium text-neutral-950": true,
                "bg-white": tabActive,
                "opacity-60 hover:opacity-90": !tabActive
            });
            const tabClick = () => fiddle.setActiveCode(key);
            return (
                <div key={"tab:" + key} className={tabClassName} onClick={tabClick}>
                    <span className={classNames("flex items-center text-lg", LANGUAGES_CONFIG[key].iconClass)}>
                        {renderIcon(LANGUAGES_CONFIG[key].icon)}
                    </span>
                    <span className="text-sm">{LANGUAGES_CONFIG[key].name}</span>
                </div>
            );
        });
    }, [fiddle.activeCode, fiddle.setActiveCode, availableCodeEditors.join(",")]);

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="w-full flex items-center justify-between gap-2 select-none bg-neutral-100">
                <div className="flex">{tabs}</div>
            </div>
            {availableCodeEditors.map(tab => (
                <div key={tab} className={classNames("flex-auto", {"hidden": !(tab === fiddle.activeCode)})}>
                    <CodeEditor
                        key={"editor:" + tab}
                        language={tab}
                        initialCode={fiddle.code[tab]}
                        onChange={fiddle.updateCode}
                    />
                </div>
            ))}
        </div>
    );
};

// @description output fiddle
export const FiddleOutput = props => {
    const fiddle = useFiddle();
    const currentExecutionId = React.useRef(fiddle?.executionId ?? 0);
    const iframeRef = React.useRef(null);

    // delay the update of the iframe
    React.useEffect(() => {
        if (fiddle.autorun) {
            const delayedFnTimer = window.setTimeout(() => {
                fiddle.run();
            }, props.execitionDelay || 1000);
            return () => {
                window.clearTimeout(delayedFnTimer);
            };
        }
    }, [fiddle?.run, fiddle?.autorun, fiddle?.code?.html, fiddle?.code?.css, fiddle?.code?.javascript]);

    // effect to update the iframe content
    React.useEffect(() => {
        // avoid running the code if the execution id does not match
        if (currentExecutionId.current !== fiddle.executionId) {
            currentExecutionId.current = fiddle.executionId; // store the current execution id
            if (iframeRef.current && fiddle.code) {
                generateHtml(fiddle.code, {}).then(html => {
                    // if the execution id has changed, do not continue
                    if (currentExecutionId.current !== fiddle.executionId) {
                        return;
                    }
                    // write the html content to the iframe
                    iframeRef.current.contentWindow.document.open();
                    iframeRef.current.contentWindow.document.write(html);
                    iframeRef.current.contentWindow.document.close();
                });
            }
        }
    }, [fiddle.executionId]);

    return (
        <div className="w-full h-full relative">
            <iframe
                key={"frame:" + fiddle.executionId}
                ref={iframeRef}
                className="w-full h-full border-0 bg-white"
                scrolling="yes"
                sandbox={SANDBOX_ATTRIBUTES.join(" ")}
            />
        </div>
    );
};
