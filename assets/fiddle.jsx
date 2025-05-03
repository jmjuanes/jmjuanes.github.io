import React from "react";
import classNames from "classnames";
import * as codeCake from "codecake";
import {renderIcon, CodeBlockIcon} from "@josemi-icons/react";
import {Button, LoadingScreen} from "@josemihq/ui";
import {Dialog, Center, useDialog} from "@josemihq/ui";
import {Form, FORM_OPTIONS, useFormData} from "@josemihq/form";

// @description available languages
export const LANGUAGES = {
    HTML: "html",
    CSS: "css",
    JAVASCRIPT: "js",
};

// @description available preprocessors
export const PRE_PROCESSORS = {};

// @description languages configurations
export const LANGUAGES_CONFIG = {
    [LANGUAGES.HTML]: {
        name: "HTML",
        highlight: "html",
        display: {
            icon: "html5",
            iconClass: "text-orange-500",
        },
    },
    [LANGUAGES.CSS]: {
        name: "CSS",
        highlight: "css",
        display: {
            icon: "css",
            iconClass: "text-blue-500",
        },
    },
    [LANGUAGES.JAVASCRIPT]: {
        name: "JS",
        highlight: "javascript",
        display: {
            icon: "javascript",
            iconClass: "text-yellow-600",
        },
    },
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

// @description default bundler
export const bundler = async (fiddle = {}, options = {}) => {
    // 1. wrap javascript code
    const javascriptCode = `
        // console.clear();
        const __execute = () => {
            const scriptTag = document.createElement("script");
            scriptTag.innerHTML = ${JSON.stringify(fiddle[LANGUAGES.JAVASCRIPT])};
            document.body.appendChild(scriptTag);
        };
        document.addEventListener("DOMContentLoaded", __execute);
    `;
    // 2. generate head tags
    const head = [
        `<style>${fiddle[LANGUAGES.CSS] || ""}</style>`,
        `<script>${javascriptCode}</script>`,
    ];
    // 3. generate the html document
    return `<!doctype html><html><head>${head.join("")}</head><body>${fiddle[LANGUAGES.HTML]}</body></html>`;
};

// @description export a fiddle to a data-url string
// @param {object} fiddle - fiddle data
// @return {string} - data-url string
export const exportFiddle = (fiddle, options = {}) => {
    return new Promise(resolve => {
        const data = JSON.stringify({
            title: fiddle.title || "Untitled",
            preset: fiddle.preset,
            files: fiddle.files,
        });
        return resolve(lz.compressToBase64(data));
    });
};

// @description internal wrapper for the code editor
const CodeEditor = props => {
    const parentRef = React.useRef(null);
    const editorRef = React.useRef(null);
    const codePanelClass = classNames({
        "w-full h-full overflow-y-auto": true,
    });

    // on mount, initialize editor
    React.useEffect(() => {
        editorRef.current = codeCake.create(parentRef.current, {
            language: LANGUAGES_CONFIG[props.language].highlight,
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
            props.onChange(props.language, code);
        });
    }, [props.onChange]);

    return (
        <div className={codePanelClass} ref={parentRef} />
    );
};

// @description internal wrapper for the preview iframe
const Preview = props => {
    const iframeRef = React.useRef(null);

    // effect to update the iframe content
    React.useEffect(() => {
        let aborted = false;
        props.generateBundle().then(html => {
            if (!aborted && html) {
                // write the html content to the iframe
                iframeRef.current.contentWindow.document.open();
                iframeRef.current.contentWindow.document.write(html);
                iframeRef.current.contentWindow.document.close();
            }
        });
        // if the component is unmounted, abort updating the content of
        // the iframe, as this iframe have been removed from the DOM
        return () => {
            aborted = true;
        };
    }, []);

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            scrolling="yes"
            sandbox={SANDBOX_ATTRIBUTES.join(" ")}
        />
    );
};

// @description settings dialog
const SettingsDialog = props => {
    const {hideDialog} = useDialog();
    const [formData, changeFormData] = useFormData({
        title: props.initialData.title,
        description: props.initialData.description,
        autorun: props.initialData.autorun ?? false,
    });
    const formFields = React.useMemo(() => {
        return {
            title: {
                type: FORM_OPTIONS.TEXT,
                title: "Title",
                placeholder: "Give a title to your fiddle",
            },
            autorun: {
                type: FORM_OPTIONS.CHECKBOX,
                title: "Auto run",
                helper: "Update preview automatically after every change.",
            },
        };
    }, []);

    return (
        <Center className="top-0 left-0 fixed z-50">
            <Dialog.Content className="w-full max-w-lg">
                <Dialog.Header>
                    <Dialog.Title>Settings</Dialog.Title>
                    <Dialog.Close onClick={hideDialog} />
                </Dialog.Header>
                <Dialog.Body>
                    <Form
                        items={formFields}
                        data={formData}
                        onChange={changeFormData}
                    />
                </Dialog.Body>
                <Dialog.Footer>
                    <Button
                        variant="primary"
                        text="Save Settings"
                        onClick={() => props.onSave(formData)}
                    />
                </Dialog.Footer>
            </Dialog.Content>
        </Center>
    );
};

// @description logo of the app
const Logo = props => (
    <div className="flex items-center gap-1" onClick={props.onClick}>
        <span className="flex items-center text-3xl">
            <CodeBlockIcon />
        </span>
        <span className="text-2xl font-extrabold leading-none">fiddle.</span>
    </div>
);

// fiddle editor context
const FiddleContext = React.createContext({});

// use fiddle context
export const useFiddle = () => {
    return React.useContext(FiddleContext);
};

// @description generate initial state from the given props
const getInitialFiddleStateFromProps = async props => {
    let data = props?.data || {}; // initialize data object to fill the rest of options
    // 1. initialize code object
    const initialCode = {
        [LANGUAGES.HTML]: data?.[LANGUAGES.HTML] || "",
        [LANGUAGES.CSS]: data?.[LANGUAGES.CSS] || "",
        [LANGUAGES.JAVASCRIPT]: data?.[LANGUAGES.JAVASCRIPT] || "",
    };
    // 2. return initial fiddle state
    return {
        ...initialCode,
        title: data?.title || "Untitled",
        description: data?.description || "",
        activeCode: data?.activeCode || Object.keys(initialCode)[0],
        visibleCodes: data?.visibleCodes || Object.keys(initialCode),
        autorun: !!data?.autorun ?? true, 
        readonly: !!props?.readonly || !!data?.readonly || false,
        version: 0,
    };
};

// fiddle provider
export const FiddleProvider = ({children, ...props}) => {
    const [state, setState] = React.useState(null);
    const [error, setError] = React.useState(null);
    const actions = React.useMemo(() => ({
        // running the fiddle just changes the version of it
        run: () => {
            setState(prevState => ({...prevState, version: prevState.version + 1}));
        },
        update: newState => {
            setState(prevState => ({...prevState, ...newState}));
        },
        setCode: (language, value = "") => {
            setState(prevState => {
                prevState[language] = value;
                return {...prevState};
            });
        },
        setActiveCode: language => {
            setState(prevState => ({...prevState, activeCode: language}));
        },
        setAutorun: value => {
            setState(prevState => ({...prevState, autorun: !!value}));
        },
    }), [setState]);

    // after mounting the element, import fiddle data
    React.useEffect(() => {
        getInitialFiddleStateFromProps(props)
            .then(newState => setState(newState));
    }, []);

    // no state available (yet), render the loading screen
    if (!state) {
        return <LoadingScreen icon="code-block" />;
    }

    return (
        <FiddleContext value={{...state, ...actions}}>
            <Dialog.Provider>
                {children}
            </Dialog.Provider>
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

// @description fiddle main bar
export const FiddleBar = () => {
    const fiddle = useFiddle();
    const {showDialog} = useDialog();

    // handle click on the settings button
    const handleSettingsClick = React.useCallback(() => {
        showDialog({
            component: SettingsDialog,
            props: {
                initialData: {
                    title: fiddle.title,
                    description: fiddle.description,
                    autorun: fiddle.autorun,
                },
                onSave: data => fiddle.update(data),
            },
        });
    }, [fiddle, showDialog]);

    return (
        <div className="flex-none flex items-center justify-between py-4 px-3 bg-white text-neutral-950 border-b border-neutral-200">
            <div className="flex items-center gap-2">
                <Logo />
                {fiddle?.title && (
                    <div className="text-base font-medium text-neutral-600">
                        <span>{fiddle.title}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="primary"
                    icon="reload"
                    text="Run"
                    disabled={fiddle.autorun}
                    onClick={() => fiddle.run()}
                />
                <Button
                    variant="secondary"
                    icon="sliders"
                    onClick={handleSettingsClick}
                />
            </div>
        </div>
    );
};

// @description code editor component
export const FiddleCode = () => {
    const fiddle = useFiddle();
    const tabs = React.useMemo(() => {
        return fiddle.visibleCodes.map(language => {
            const tabActive = language === fiddle.activeCode;
            const tabClassName = classNames({
                "flex items-center gap-1 cursor-pointer p-3 font-medium text-neutral-950": true,
                "bg-white": tabActive,
                "opacity-60 hover:opacity-90": !tabActive
            });
            const tabClick = () => fiddle.setActiveCode(language);
            return (
                <div key={"tab:" + language} className={tabClassName} onClick={tabClick}>
                    <span className={classNames("flex items-center text-lg", LANGUAGES_CONFIG[language].display.iconClass)}>
                        {renderIcon(LANGUAGES_CONFIG[language].display.icon)}
                    </span>
                    <span className="text-sm">{LANGUAGES_CONFIG[language].name}</span>
                </div>
            );
        });
    }, [fiddle.activeCode, fiddle.setActiveCode]);

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="w-full flex items-center justify-between gap-2 select-none bg-neutral-100">
                <div className="flex">{tabs}</div>
            </div>
            {fiddle.visibleCodes.map(language => (
                <div key={language} className={classNames("flex-auto", {"hidden": !(language === fiddle.activeCode)})}>
                    <CodeEditor
                        key={"editor:" + language}
                        language={language}
                        initialCode={fiddle[language] || ""}
                        onChange={fiddle.setCode}
                    />
                </div>
            ))}
        </div>
    );
};

// @description preview fiddle
export const FiddlePreview = props => {
    const fiddle = useFiddle();

    // delay the update of the iframe
    React.useEffect(() => {
        if (fiddle?.autorun || fiddle?.version === 0) {
            const delayedFnTimer = window.setTimeout(() => {
                fiddle.run();
            }, props.executionDelay || 1000);
            return () => {
                window.clearTimeout(delayedFnTimer);
            };
        }
    }, [fiddle?.autorun, fiddle[LANGUAGES.HTML], fiddle[LANGUAGES.CSS], fiddle[LANGUAGES.JAVASCRIPT]]);

    // function to generate the bundle of the fiddle
    const generateBundle = React.useCallback(() => bundler(fiddle), [fiddle?.version]);

    // if version is 0, means that the fiddle is not ready to be executed
    return (
        <div className="w-full h-full relative">
            {fiddle.version > 0 && (
                <Preview
                    key={"preview:" + fiddle.version}
                    generateBundle={generateBundle}
                />
            )}
        </div>
    );
};
