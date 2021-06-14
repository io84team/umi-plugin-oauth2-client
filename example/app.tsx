export function render(oldRender: Function) {
    oldRender();
}

export const initialStateConfig = {
    loading: 'Loading...',
};

export async function getInitialState(): Promise<{
    currentUser?: any;
}> {
    return {
        currentUser: undefined,
    };
}
