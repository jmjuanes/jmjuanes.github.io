---
layout: "post"
title: "React Hooks for Local and Session Storage"
description: "A guide for creating React Hooks to access to the Local and Session Storage of the browser."
date: "September 24, 2023"
---

### What is Local and Session storage?

**Local** storage and **Session** storage are two web storage options available in JavaScript that allow you to store data on the client-side (in the user's browser) for a specific web domain. They are part of the Web Storage API and provide a way to store key-value pairs persistently (local storage) or for the duration of a page session (session storage).

On the one side, data stored using local storage persists even after the browser is closed, and is available across multiple browser sessions. It is suitable for storing user preferences, cached data, or application state. 

On the other side, data stored with session storage is automatically cleared when the session ends (e.g., when the user closes the browser tab or window). It is suitable for temporary data that is needed only while the user is interacting with the current page, such as shopping cart items, form data, or temporary user authentication tokens.

### API for local and session storage

The API for local ans session storage is exactly the same. Local storage API can be accessed from `window.localStorage`, and session storage API can be accessed from `window.sessionStorage`. Both have the following methods:

Both session storage and local storage offer similar methods for managing stored data. Here are the key methods available for both:

- `setItem(key, value)`: use this method to store a key-value pair in either session storage or local storage. The `key` is a string that acts as the identifier, and `value` can be any data type, but it will be automatically converted to a string.

- `getItem(key)`: use this method to retrieve the value associated with a specific key. It returns the stored value as a string.

- `removeItem(key)`: use this method to remove a specific key-value pair from either session storage or local storage.

```javascript
// Storing data in local storage
localStorage.setItem("username", "John");

// Retrieving data from local storage
const username = localStorage.getItem("username"); // Returns "John"

// Removing data from local storage
localStorage.removeItem("username");
```

### Creating a React Hook for interacting with local or session storage

Now, let's create a custom React hook to simplify working with local storage or session storage in React components, by encapsulating the logic for reading and writing values.

This hook will accept:
- The storage to use. It can be `window.localStorage` or `window.sessionStorage`.
- A string `key`, that is the identifier of the storage.
- A `defaultValue` to use if there are no data stored in the provided `key`.

This hook will return a pair of `[currentValue, setValue]`, similar to `React.useState`. When `setValue` is called, it will update the value in storage and trigger a re-render of the component using the updated value.

There is the full code:

```javascript
import {useState, useEffect} from "react";

export const useStorage = (store, key, defaultValue) => {
    // Initialize the state with the current value from storage or the default value
    const [currentValue, setCurrentValue] = useState(() => {
        // Attempt to retrieve the value from storage
        const storedValue = store.getItem(key);
        // If the value exists in storage, parse and return it
        if (storedValue !== null) {
            return JSON.parse(storedValue);
        }
        // Otherwise, return the default value
        return defaultValue;
    });
    // Update the storage value whenever currentValue changes
    useEffect(() => {
        // Serialize the new value and store it
        store.setItem(key, JSON.stringify(currentValue));
    }, [currentValue]);
    // Return the pair [currentValue, setCurrentValue]
    return [currentValue, setCurrentValue];
};
```

This hook follows these steps:

1. It initializes the state (`currentValue`) with the value from storage if it exists, or uses the default value provided as the third argument of the hook.
2. It sets up an effect that runs whenever `currentValue` changes. This effect serializes and stores the new value in the chosen storage (either local or session).
3. It returns the pair `[currentValue, setCurrentValue]`.

We can improve the previous code by creating two wrappers for using directly local or session storage, without having to provide this value as an argument to the hook:

```javascript
export const useLocalStorage = (key, defaultValue) => {
    return useStorage(window.localStorage, key, defaultValue);
};

export const useSessionStorage = (key, defaultValue) => {
    return useStorage(window.sessionStorage, key, defaultValue);
};
```

Now you can use `useLocalStorage` or `useSessionStorage` hooks in your React components:

```jsx
import React from "react";
import {useLocalStorage} from "./useStorage.js";

export const MyCounter = () => {
    // Use the useLocalStorage hook to manage a value in local storage
    const [count, setCount] = useLocalStorage("count", 0);

    return (
        <div className="flex gap-2">
            <button onClick={() => setCount(prev => prev - 1)}>
                <span>-</span>
            </button>
            <div>{count}</div>
            <button onClick={() => setCount(prev => prev + 1)}>
                <span>+</span>
            </button>
        </div>
    );
};
```
