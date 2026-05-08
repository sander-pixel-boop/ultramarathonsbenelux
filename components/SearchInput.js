import React, { useState, useEffect } from 'react';

export default function SearchInput({ value, onChange, placeholder, t }) {
    const [inputValue, setInputValue] = useState(value);

    // Sync external value changes (e.g. from clear button)
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue !== value) {
                onChange(inputValue);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [inputValue, onChange, value]);

    return (
        <div className="input-group">
            <i className="fas fa-search"></i>
            <input
                type="text"
                id="search"
                placeholder={placeholder}
                aria-label={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ paddingRight: inputValue ? '40px' : '15px' }}
            />
            {inputValue && (
                <button
                    type="button"
                    aria-label={t.clearSearch}
                    title={t.clearSearch}
                    onClick={() => {
                        setInputValue('');
                        onChange('');
                    }}
                    className="clear-search-btn"
                >
                    <i className="fas fa-times"></i>
                </button>
            )}
        </div>
    );
}
