import React from "react";
import classNames from "classnames";
import { uid } from "uid";
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
    id: string;
    type: DaliCommands;
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
    activePath: DaliPath | null;

    // internal methods to manipulate the dali editor
    createPath: (name?: string) => void;
    createCommand: () => void;
    setActivePath: (pathId: string | null) => void;
    getActivePath: () => DaliPath | null;
};

// commands configuration
const Commands = {
    [DaliCommands.MOVE]: { name: "Move", values: ["x", "y"] },
    [DaliCommands.LINE]: { name: "Line", values: ["x", "y"] },
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
                    id: "p:" + uid(6),
                    name: name || `Path ${dali.paths.length + 1}`,
                    commands: [],
                });
                dali.activePath = dali.paths[dali.paths.length - 1];
                forceUpdate();
            },

            // create a new command in the current active path
            createCommand: () => {
                if (dali.activePath) {
                    dali.activePath.commands.push({
                        id: "c:" + uid(6),
                        type: DaliCommands.MOVE,
                        values: Commands[DaliCommands.MOVE].values.map(x => 0),
                    });
                    forceUpdate();
                }
            },
            deleteCommand: (commandId: string) => {
                if (dali.activePath) {
                    dali.activePath.commands = dali.activePath.commands.filter(command => {
                        return command.id !== commandId;
                    });
                    forceUpdate();
                }
            },

            // manipulate the active path
            setActivePath: (pathId: string | null): void => {
                dali.activePath = dali.paths.find(path => path.id === pathId) || null;
                forceUpdate();
            },
            getActivePath: (): DaliPath | null => {
                return dali.activePath || null;
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

// general field component that renders the field name, a helper message and the content
const Field = (props: { name: string, children: React.Node }): React.JSX.Element => (
    <div className="flex items-start gap-2">
        <div className="w-24 shrink-0">
            <div className="h-8 flex items-center">
                <div className="text-gray-600 text-sm font-medium">{props.name}</div>
            </div>
        </div>
        <div className="grow-1">
            {props.children}
        </div>
    </div>
);

// Form elements
const Form = {
    TextInput: (props: any): React.JSX.Element => (
        <Field name={props.name}>
            <input
                type="text"
                defaultValue={props.value}
                className="w-full h-8 rounded-md bg-gray-100 text-gray-950 font-medium text-sm px-2"
                onChange={props.onChange}
            />
        </Field>
    ),
};

// command input
const CommandInput = (props: any): React.JSX.Element => {
    const t = props.type;
    const config = Commands[props.type];
    return (
        <div className="flex items-start flex-nowrap gap-2">
            <div className="shrink-0">
                <select
                    className="h-8 rounded-md bg-gray-100 text-gray-950 font-medium text-sm px-2"
                    onChange={event => props.onTypeChange(event.currentTarget.value)}
                >
                    {Object.keys(Commands).map(key => (
                        <option key={key} value={key}>{key.toUpperCase()}</option>
                    ))}
                </select>
            </div>
            <div className="w-full flex items-start gap-1">
                {config.values.map((key, index) => (
                    <div key={t + ":" + index} className="h-8 flex gap-1 items-center rounded-md bg-gray-100 px-2">
                        <div className="text-gray-600 text-sm">{key}</div>
                        <input
                            key={t + ":" + index + ":input"}
                            type="number"
                            defaultValue={props.values[index] || 0}
                            className="bg-transparent text-gray-950 text-sm w-8"
                            onChange={event => props.onValueChange(index, event.currentTarget.value)}
                        />
                    </div>
                ))}
            </div>
            <div className="h-8 flex items-center shrink-0">
                <div
                    className="flex text-gray-600 hover:text-gray-950 cursor-pointer text-lg"
                    onClick={props.onDelete}
                >
                    {renderIcon("x")}
                </div>
            </div>
        </div>
    );
};

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
                        "text-gray-950 hover:bg-gray-100": dali.activePath?.id !== path.id,
                        "text-white bg-gray-950": dali.activePath?.id === path.id,
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
export const DaliEditionPanel = (): React.JSX.Element => {
    const dali = useDali();
    const activePath = dali.getActivePath();

    // handle creating a new command
    const handleCommandCreate = React.useCallback(() => {
        dali.createCommand();
    }, [ dali, dali.activePath?.id ]);

    if (!activePath) {
        return null;
    }

    return (
        <React.Fragment>
            <Section title="Path" />
            <div className="pl-2">
                <Form.TextInput
                    key={activePath.id}
                    name="Name"
                    value={activePath.name || "Untitled"}
                />
            </div>
            <Section title="Commands" onCreate={handleCommandCreate} />
            <div className="flex flex-col gap-1 pl-2">
                {activePath.commands.map(command => (
                    <CommandInput
                        key={command.id}
                        type={command.type}
                        values={command.values}
                        onDelete={() => dali.deleteCommand(command.id)}
                    />
                ))}
            </div>
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
