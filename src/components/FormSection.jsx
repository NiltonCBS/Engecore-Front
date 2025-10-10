import React from 'react';

export default function FormSection({ title, children }) {
    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h2>
            {children}
        </div>
    );
}