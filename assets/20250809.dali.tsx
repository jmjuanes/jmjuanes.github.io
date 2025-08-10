import React from "react";
import classNames from "classnames";
import { renderIcon, PathIcon, PlusIcon} from "@josemi-icons/react";

type DaliPathCommand = {
    type: string;
    values: number[];
};

type DaliPath = {
    id: string;
    name?: string;
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

// section component
const Section = (props: {title: string, onCreate?: () => void}): React.JSX.Element => (
    <div className="flex items-center justify-between py-2">
        <div className="text-base font-bold">{props.title}</div>
        {props.onCreate && (
            <div className="flex items-center text-lg">
                <PlusIcon />
            </div>
        )}
    </div>
);

// the edition left panel is used to list the paths of the svg file
// and to set the active path to edit
const DaliEditionLeftPanel = (props: any): React.JSX.Element => (
    <div className="absolute z-30 top-0 left-0 mt-12 h-full w-64 p-4 bg-white">
        <Section title="Paths" />
        <div className="overflow-y-auto w-full max-h-xl flex flex-col gap-2">
            {props.paths.map(path => {
                const pathClass = classNames({
                    "flex items-center gap-2 p-2 rounded-lg": true,
                    "text-gray-950 hover:bg-gray-100": props.activePath !== path.id,
                    "text-white bg-gray-950": props.activePath === path.id,
                });
                return (
                    <div key={path.id} className={pathClass}>
                        <div className="flex items-center text-lg">
                            <PathIcon />
                        </div>
                        <div className="text-base font-medium">{path.name}</div>
                    </div>
                );
            })}
        </div>
    </div>
);

// the right edition panel is used to display the options to customize the active path
// including the commands, fill, and stroke parameteres
const DaliEditionRightPanel = (props: any): React.JSX.Element => {
    return (
        <div className="absolute z-30 top-0 right-0 mt-12 h-full w-96 p-4 bg-white">
            Right panel
        </div>
    );
};

export const DaliApp = (): React.JSX.Element => {
    const parent = React.useRef<HTMLDivElement>(null);
    const [ state, setState ] = React.useState<DaliState>(() => {
        return { paths: [], width: 100, height: 100 };
    });
    const [ activePath, setActivePath ] = React.useState<DaliPath>(null);

    return (
        <div ref={parent} className="relative w-full h-full overflow-hidden bg-gray-200 text-gray-900">
            <div className="absolute z-40 top-0 left-0 w-full bg-white flex items-center justify-between h-12 p-4 border-b-1 border-gray-200">
                Top panel
            </div>
            <DaliEditionLeftPanel
                paths={state.paths || []}
                activePath={activePath?.id}
                onChangeActivePath={(pathId: string): void => {
                    setActivePath(state.paths.find((path: DaliPath) => path.id === pathId));
                }}
            />
            <DaliEditionRightPanel />
        </div>
    );
};
