import React from "react";

// @description router context: stores the current url path
const RouterContext = React.createContext("");

// @description router hook
// @returns {object} router object
// @returns {string} router.currentPath current path
// @returns {function} router.redirect function to redirect to a new path
export const useRouter = () => {
    const currentPath = React.useContext(RouterContext);
    return {
        currentPath: currentPath || "#",
        redirect: newPath => {
            window.location.hash = newPath;
        },
    };
};

// @description router component
// @param {object} props
// @param {regexp} props.test regex to test the current path
// @param {function} props.render function to render the component
export const Route = props => {
    const {currentPath} = useRouter();
    if (props.test.test(currentPath)) {
        return props.render();
    }
    return null;
};

// @description switch component: renders the first child that matches the current path
// @param {object} props
// @param {array} props.children array of Route components
export const Switch = props => {
    const {currentPath} = useRouter();
    let matchFound = false;
    let element = null;
    React.Children.forEach(props.children, child => {
        if (!matchFound && React.isValidElement(child)) {
            // save this element --> If no route matches, we will render the last child automatically
            element = child;
            if (child.props.test) {
                matchFound = child.props.test === "*" || child.props.test.test(currentPath);
            }
        }
    });
    return element?.props?.render?.() || null;
};

// @description router provider: stores the current path and listens for hash changes
// @param {object} props
// @param {string} props.children children components
export const RouterProvider = ({children}) => {
    const [currentPath, setCurrentPath] = React.useState(() => {
        return window.location.hash || "#";
    });
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash || "");
        };
        window.addEventListener("hashchange", handleHashChange);
        // when app is unmounted, remove hashchange listener
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);
    return (
        <RouterContext value={currentPath}>
            {children}
        </RouterContext>
    );
};
