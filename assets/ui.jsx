import React from "react";
import classNames from "classnames";
import {renderIcon, CloseIcon} from "@josemi-icons/react";

// @description button component
// @params {string} props.icon - icon name
// @params {string} props.text - button text
// @params {function} props.onClick - click handler
export const Button = props => {
    const buttonClassName = classNames({
        "flex items-center justify-center gap-1 cursor-pointer px-3 py-2 rounded-lg": true,
        "bg-neutral-950 hover:bg-neutral-900 text-white": props.variant === "primary" || props.primary,
        "bg-neutral-100 hover:bg-neutral-200 text-neutral-900": props.variant === "secondary",
        "opacity-60 pointer-events-none": props.disabled,
    }, props.className);
    return (
        <div className={buttonClassName} onClick={props.onClick}>
            {props.icon && (
                <span className="flex items-center text-lg">
                    {renderIcon(props.icon)}
                </span>
            )}
            {props.text && (
                <span className="text-sm leading-none font-medium">{props.text}</span>
            )}
        </div>
    );
};

// @description simple component that centers content in the screen
export const Center = ({className, ...props}) => (
    <div className={classNames("flex items-center justify-center w-full h-full", className)} {...props} />
);

// @description dialog component wrapper
export const Dialog = {
    Context: React.createContext(null),
    Content: ({className, ...props}) => (
        <div className={classNames("relative bg-white border border-neutral-200 shadow-sm rounded-xl", className)} {...props} />
    ),
    Title: ({className, ...props}) => (
        <div className={classNames("font-bold text-xl text-neutral-950", className)} {...props} />
    ),
    Description: ({className, ...props}) => (
        <div className={classNames("text-sm text-neutral-800", className)} {...props} />
    ),
    Close: ({className, ...props}) => (
        <div className={classNames("flex cursor-pointer text-2xl absolute top-0 right-0 mt-6 mr-5 text-neutral-700 hover:text-neutral-900", className)} {...props}>
            <CloseIcon />
        </div>
    ),
    Header: ({className, ...props}) => (
        <div className={classNames("flex flex-col select-none px-6 pt-6", className)} {...props} />
    ),
    Body: ({className, ...props}) => (
        <div className={classNames("px-6 py-6", className)} {...props} />
    ),
    Footer: ({className, ...props}) => (
        <div className={classNames("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pb-6", className)} {...props} />
    ),
    // Provider for the dialog component
    Provider: ({children}) => {
        const [activeDialog, setActiveDialog] = React.useState(null);

        // callback to show a dialog
        // @param {string} name dialog name (must be registered in allDialogs)
        // @param {object} props dialog additional properties
        const showDialog = React.useCallback(options => {
            if (!!options?.component) {
                setActiveDialog({
                    ...options,
                    key: options.key || "dialog." + Date.now(),
                });
            }
        }, [setActiveDialog]);

        // callback to hide the dialog
        const hideDialog = React.useCallback(() => {
            setActiveDialog(null);
        }, [setActiveDialog]);

        // register an effect to listen for the escape key
        React.useEffect(() => {
            const handleKeyDown = event => {
                if (event.key === "Escape" && !!activeDialog?.component) {
                    hideDialog();
                }
            };
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [activeDialog, hideDialog]);

        // active dialog component
        const DialogComponent = activeDialog?.component || null;

        // Render dialog context provider
        return (
            <Dialog.Context value={{showDialog, hideDialog}}>
                {children}
                {DialogComponent && (
                    <React.Fragment>
                        <Overlay className="z-50" />
                        <DialogComponent
                            key={activeDialog.key || "dialog"}
                            {...activeDialog.props}
                        />
                    </React.Fragment>
                )}
            </Dialog.Context>
        );
    },
};

// @description overlay component
export const Overlay = ({className, ...props}) => (
    <div className={classNames("fixed top-0 left-0 bottom-0 right-0 bg-neutral-900 opacity-70", className)} {...props} />
);


// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = () => {
    return React.useContext(Dialog.Context);
};
