const $pika = {
    // @description general utilities
    utils: {
        clone: value => {
            return JSON.parse(JSON.stringify(value));
        },
        delay: (timeout, handler) => {
            return window.setTimeout(handler, timeout);
        },
    },

    // @description SVG utilities
    svg: {
        namespace: "http://www.w3.org/2000/svg",
        createElement: (parent, name, attributes = {}) => {
            const element = document.createElementNS($pika.svg.namespace, name);
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
            if (parent) {
                parent.appendChild(element);
            }
            return element;
        },
    },

    // @description create an event handler
    createEventHandler: () => {
        const $events = new Map();
        return {
            addEventListener: (name, listener) => {
                $events.set(name, listener);
            },
            removeEventListener: (name) => {
                $events.delete(name);
            },
            dispatchEvent: (name, args) => {
                if ($events.has(name)) {
                    $events.get(name)(args);
                }
            },
        };
    },
};

export default $pika;
