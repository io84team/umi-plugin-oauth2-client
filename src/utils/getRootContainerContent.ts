export default () => {
    return `\
import React from 'react';
import Provider from './Provider';

export function rootContainer(container: React.ReactNode, props) {
    return React.createElement(Provider, props, container);
};
`;
};
