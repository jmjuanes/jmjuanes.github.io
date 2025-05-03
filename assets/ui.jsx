import React from "react";
import classNames from "classnames";
import {renderIcon, CloseIcon, ExclamationTriangleIcon} from "@josemi-icons/react";

// @description button component
// @params {string} props.icon - icon name
// @params {string} props.text - button text
// @params {function} props.onClick - click handler
export const Button = props => {
    const buttonClassName = classNames({
        "flex items-center justify-center gap-1 cursor-pointer px-6 py-3 rounded-lg select-none": true,
        "bg-quartz-800 hover:bg-quartz-900 text-white": props.variant === "primary" || props.primary,
        "bg-neutral-200 hover:bg-neutral-300": props.variant === "secondary" || props.secondary,
        "opacity-60 pointer-events-none": props.disabled,
    }, props.className);
    return (
        <div className={buttonClassName} onClick={props.onClick}>
            {props.icon && (
                <span className="flex items-center text-xl">
                    {renderIcon(props.icon)}
                </span>
            )}
            {props.text && (
                <span className="font-medium">{props.text}</span>
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
        <div className={classNames("relative bg-white shadow-sm rounded-lg", className)} {...props} />
    ),
    Title: ({className, ...props}) => (
        <div className={classNames("font-bold text-2xl text-quartz-800", className)} {...props} />
    ),
    Close: ({className, ...props}) => (
        <div className={classNames("ml-auto flex cursor-pointer text-2xl text-current bg-neutral-200 rounded-lg p-2", className)} {...props}>
            <CloseIcon />
        </div>
    ),
    Header: ({className, ...props}) => (
        <div className={classNames("flex flex-row items-center select-none px-8 pt-8", className)} {...props} />
    ),
    Body: ({className, ...props}) => (
        <div className={classNames("p-8", className)} {...props} />
    ),
    Footer: ({className, ...props}) => (
        <div className={classNames("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-8 pb-8", className)} {...props} />
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
    <div className={classNames("fixed top-0 left-0 bottom-0 right-0 bg-quartz-900 opacity-80", className)} {...props} />
);

// @description tabs component
export const Tabs = {
    Container: ({className, ...props}) => (
        <div className={classNames("flex flex-row align-center justify-stretch w-full bg-neutral-200 rounded-lg p-2", className)} {...props} />
    ),
    Item: ({className, active, children, text, ...props}) => {
        const itemClassName = classNames({
            "flex items-center justify-center cursor-pointer px-4 py-2 rounded-md w-full": true,
            "bg-white text-quartz-800": active,
            "hover:text-quartz-800 cursor-pointer": !active,
        }, className);
        return (
            <div className={itemClassName} {...props}>{text || children}</div>
        );
    },
};

// @description empty state component
// @param {object} props
// @param {string} props.icon icon name
// @param {string} props.title title text
// @param {string} props.description description text
// @param {string} props.actionText action button text
// @param {string} props.actionIcon action button icon
// @param {function} props.onActionClick action button click handler
export const EmptyState = ({icon, title, description, actionText, actionIcon, onActionClick}) => {
    return (
        <div className="flex flex-col items-center justify-center w-full p-10 text-center bg-white rounded-lg">
            {icon && (
                <div className="flex items-center justify-center text-7xl mb-2 text-quartz-800">
                    {renderIcon(icon)}
                </div>
            )}
            {title && (
                <div className="text-2xl font-bold text-quartz-800 mb-0">{title}</div>
            )}
            {description && (
                <div className="mb-4">{description}</div>
            )}
            {actionText && onActionClick && (
                <Button variant="primary" icon={actionIcon} text={actionText} onClick={onActionClick} />
            )}
        </div>
    );
};

// @description loading screen
export const LoadingScreen = props => (
    <Center className="fixed top-0 left-0 z-50">
        <div className="flex text-9xl animation-pulse text-neutral-200">
            {renderIcon(props.icon)}
        </div>
    </Center>
);

// @description error screen
export const ErrorScreen = props => (
    <Center className="fixed top-0 left-0 z-50">
        <div className="w-full max-w-md flex flex-col items-center gap-2 border border-neutral-200 bg-white rounded-lg p-8 shadow-md">
            <div className="flex items-center text-4xl text-neutral-600">
                <ExclamationTriangleIcon />
            </div>
            {props.title && (
                <div className="text-center text-base text-neutral-900 font-medium leading-none">{props.title}</div>
            )}
            {props.message && (
                <div className="text-center text-sm text-neutral-800">{props.message}</div>
            )}
        </div>
    </Center>
);

// @description hook to access to dialog
// @returns {object} dialog object
// @returns {function} dialog.showDialog function to show a dialog
// @returns {function} dialog.hideDialog function to hide the dialog
export const useDialog = () => {
    return React.useContext(Dialog.Context);
};
