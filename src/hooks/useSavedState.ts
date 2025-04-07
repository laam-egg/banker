import { useEffect, useState } from "react";

export function useSavedState<T>(
    initialValue: T,
    localStorageKey: string,
    savedValueValidator?: (savedValue: T) => boolean,
) {
    const [value, _setValue] = useState<T>(initialValue);
    const setValue = (newValue: T) => {
        _setValue(newValue);
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newValue));
        } catch (e) {
            console.error(`Could not write to localStorage, key ${localStorageKey}: ${e}`);
        }
    };

    useEffect(() => {
        try {
            const savedValueRaw = localStorage.getItem(localStorageKey);
            if (null !== savedValueRaw) {
                const savedValue = JSON.parse(savedValueRaw);
                if (
                    savedValueValidator === undefined
                    || (savedValueValidator !== undefined && savedValueValidator(savedValue))
                ) {
                    setValue(savedValue);
                }
            }
        } catch (e) {
            console.error(`Could not read from localStorage, key ${localStorageKey}: ${e}`);
        }
    }, []);

    return [value, setValue] as const;
}
