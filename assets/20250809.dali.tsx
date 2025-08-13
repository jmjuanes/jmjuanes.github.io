import React from "react";
import classNames from "classnames";
import { renderIcon, PathIcon, PlusIcon } from "@josemi-icons/react";

enum DaliCommands {
    MOVE = "m",
    LINE = "l",
    HORIZONTAL_LINE = "h",
    VERTICAL_LINE = "v",
    CUBIC_BEZIER = "c",
    SMOOTH_CUBIC_BEZIER = "s",
    QUADRATIC_BEZIER = "q",
    SMOOTH_QUADRATIC_BEZIER = "t",
    ARC = "a",
    CLOSE = "z",
};

type DaliPathCommand = {
    type: string;
    values: number[];
};

type DaliPath = {
    id: string;
    name?: string;
    absolute?: boolean;
    commands: DaliPathCommand[];
    fillColor?: string;
    strokeWidth?: number;
    strokeColor?: string;
};

type DaliState = {
    title?: string;
    paths: DaliPath[];
    width: number;
    height: number;
    background: string;
    grid?: number;
};

type Dali = {
    title: string;
    paths: DaliPath[];
    width: number;
    height: number;
    background: string;
    activePath: string | null;

    // internal methods to manipulate the dali editor
    createPath: (name?: string) => void;
    setActivePath: (pathId: string | null) => void;
    getActivePath: () => DaliPath | null;
};

// internal context to access to the dali state manager
const DaliContext = React.createContext<{dali: Dali, version: number} | null>(null);

// hook to create a dali state
const useDaliState = (initialState: Partial<DaliState>): [Dali, number] => {
    const [ version, forceUpdate ] = React.useReducer((x: number): number => x + 1, 0);
    const daliState = React.useMemo<Dali>(() => {
        const dali = {
            title: initialState?.title || "",
            paths: initialState?.paths || [],
            width: initialState?.width || 100,
            height: initialState?.height || 100,
            background: initialState?.background || "#ffffff",

            activePath: null,

            // create a new path element
            createPath: (name?: string) => {
                dali.paths.push({
                    id: `path-${Date.now()}`,
                    name: name || `Path ${dali.paths.length + 1}`,
                    commands: [],
                });
                dali.activePath = dali.paths[dali.paths.length - 1].id;
                forceUpdate();
            },

            // manipulate the active path
            setActivePath: (pathId: string | null): void => {
                dali.activePath = pathId;
                forceUpdate();
            },
            getActivePath: (): DaliPath | null => {
                return dali.paths.find(path => path.id === dali.activePath) || null;
            },
        };
        return dali;
    }, [ forceUpdate ]);
    return [ daliState, version ];
};

// hook to access to dali manager
export const useDali = (): Dali | null => {
    return React.useContext(DaliContext)?.dali || null;
};

// section component
const Section = (props: {title: string, onCreate?: (event: React.SyntheticEvent) => void}): React.JSX.Element => (
    <div className="flex items-center justify-between py-2">
        <div className="text-sm font-bold select-none text-gray-800">
            <span>{props.title}</span>
        </div>
        {typeof props.onCreate === "function" && (
            <div className="flex items-center cursor-pointer text-gray-950 hover:text-gray-800" onClick={props.onCreate}>
                <PlusIcon />
            </div>
        )}
    </div>
);



// the edition left panel is used to list the paths of the svg file
// and to set the active path to edit
export const DaliPathsPanel = (): React.JSX.Element => {
    const dali = useDali();

    return (
        <React.Fragment>
            <Section
                title="Paths"
                onCreate={(event: React.SyntheticEvent): void => {
                    event.stopPropagation();
                    dali.createPath();
                }}
            />
            <div className="overflow-y-auto w-full max-h-xl flex flex-col gap-1">
                {dali.paths.map(path => {
                    const pathClass = classNames({
                        "flex items-center gap-2 px-2 h-7 rounded-lg cursor-pointer": true,
                        "text-gray-950 hover:bg-gray-100": dali.activePath !== path.id,
                        "text-white bg-gray-950": dali.activePath === path.id,
                    });
                    return (
                        <div key={path.id} className={pathClass} onClick={() => dali.setActivePath(path.id)}>
                            <div className="flex items-center text-base">
                                <PathIcon />
                            </div>
                            <div className="text-xs font-medium select-none">{path.name}</div>
                        </div>
                    );
                })}
            </div>
        </React.Fragment>
    );
};

// the right edition panel is used to display the options to customize the active path
// including the commands, fill, and stroke parameteres
const DaliEditionPanel = (): React.JSX.Element => {
    const dali = useDali();

    return (
        <React.Fragment>

        </React.Fragment>
    );
};

// SVG preview component
export const DaliPreview = (): React.JSX.Element => {
    const parent = React.useRef<HTMLDivElement>(null);
    const dali = useDali();

    return (
        <div ref={parent} className="relative w-full h-full overflow-hidden bg-gray-200 text-gray-900">
            Hello world!
        </div>
    );
};

// dali main provider component
// it provides the dali state and the version to force updates
export const DaliProvider = (props: { children: React.ReactNode, data?: Partial<DaliState> }): React.JSX.Element => {
    const [ dali, version ] = useDaliState(props.data || {});

    return (
        <DaliContext value={{dali, version}}>
            {props.children}
        </DaliContext>
    );
};
