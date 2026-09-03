declare module 'react-quill' {
    import React from 'react';
    export interface ReactQuillProps {
        value?: string;
        defaultValue?: string;
        readOnly?: boolean;
        theme?: string;
        modules?: any;
        formats?: string[];
        bounds?: string | HTMLElement;
        placeholder?: string;
        preserveWhitespace?: boolean;
        onChange?: (content: string, delta: any, source: any, editor: any) => void;
        onChangeSelection?: (selection: any, source: any, editor: any) => void;
        onFocus?: (selection: any, source: any, editor: any) => void;
        onBlur?: (previousSelection: any, source: any, editor: any) => void;
        onKeyDown?: React.KeyboardEventHandler<any>;
        onKeyPress?: React.KeyboardEventHandler<any>;
        onKeyUp?: React.KeyboardEventHandler<any>;
        id?: string;
        className?: string;
        tabIndex?: number;
        style?: React.CSSProperties;
    }
    const ReactQuill: React.ComponentType<ReactQuillProps>;
    export default ReactQuill;
}
