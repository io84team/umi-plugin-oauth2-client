import React from 'react';

export function render(oldRender: Function) {
    oldRender();
}

export const initialStateConfig = {
    loading: 'Loading...',
    error: (props: { error: string }) => {
        return <p>Error: {props.error}</p>;
    },
};

export async function getInitialState(): Promise<{
    currentUser?: any;
}> {
    return {
        currentUser: undefined,
    };
}
