import React from "react";

// @description database context
export const DatabaseContext = React.createContext(null);

// @description utility method to promisify an IDBRequest
const promisifyRequest = request => {
    return new Promise((resolve, reject) => {
        request.addEventListener("error", () => reject(request.error));
        request.addEventListener("abort", () => reject(request.error));
        request.addEventListener("success", () => resolve(request.result));
        request.addEventListener("complete", () => resolve(request.result));
    });
};

// @description utility method to generate a random id
export const uid = (len = 8) => {
    return String(Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, "").slice(0, len);
};

// @description tiny and super-simple idb wrapper
export const createDatabase = (dbName, storeName) => {
    const request = indexedDB.open(dbName);
    request.addEventListener("upgradeneeded", () => {
        request.result.createObjectStore(storeName);
    });
    return promisifyRequest(request).then(db => {
        const getStore = mode => {
            return db.transaction(storeName, mode).objectStore(storeName);
        };
        // return api to access to database
        return {
            get: key => {
                return promisifyRequest(getStore("readonly").get(key));
            },
            set: (key, value) => {
                return promisifyRequest(getStore("readwrite").put(value, key));
            },
            update: (key, setValue) => {
                const store = getStore("readwrite");
                return promisifyRequest(store.get(key)).then(prevValue => {
                    const newValue = setValue(prevValue);
                    return promisifyRequest(store.put(newValue, key));
                });
            },
            delete: key => {
                return promisifyRequest(getStore("readwrite").delete(key));
            },
            has: key => {
                const store = getStore("readonly");
                return promisifyRequest(store.count(key)).then(count => {
                    return count === 1;
                });
            },
            forEach: callback => {
                const cursorRequest = getStore("readonly").openCursor();
                return new Promise((resolve, reject) => {
                    cursorRequest.addEventListener("error", () => reject(cursorRequest.error));
                    cursorRequest.addEventListener("success", () => {
                        const cursor = cursorRequest.result;
                        if (cursor) {
                            callback(cursor.key, cursor.value);
                            cursor.continue();
                        } else {
                            resolve(null);
                        }
                    });
                });
            },
        };
    });
};

// @description hook to use the database
export const useDatabase = () => {
    return React.useContext(DatabaseContext);
};

// @description database provider
// @param {object} props
// @param {string} props.dbName - database name
// @param {string} props.storeName - store name
// @param {function} props.renderLoading - method to display a loading screen
// @param {React.ReactNode} props.children - children
export const DatabaseProvider = ({dbName, storeName, renderLoading, children}) => {
    const [database, setDatabase] = React.useState(null);

    // on mount initialize the database
    React.useEffect(() => {
        createDatabase(dbName, storeName).then(db => setDatabase(db));
    }, [dbName, storeName]);

    if (!database) {
        return renderLoading();
    }

    return (
        <DatabaseContext value={database}>
            {children}
        </DatabaseContext>
    );
};
