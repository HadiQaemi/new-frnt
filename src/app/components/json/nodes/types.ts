type Author = {
    label: string | any;
    identifier: string | any;
};

type Statement = {
    content: any;
    authors?: Author[] | any;
    concepts?: any[] | any;
};

type TypeInfo = {
    name: string | any;
};

type LabelProps = {
    tooltip?: boolean | any;
    onConceptSelect?: (concept: any) => void | any;
    isOpen?: any, 
    hasChildren?: any,
    onAuthorSelect?: any;
    renderTooltip?: React.ReactElement | any;
    parent?: string | any;
    typeInfo: TypeInfo | any;
    color?: string | any;
    button?: string | any;
    toggleNode?: () => void | any;
    statement?: Statement | any;
    label?: string | any;
    level?: boolean | any;
};

interface HasCharacteristic {
    number_of_columns?: number;
    number_of_rows?: number;
}

interface HasPart {
    [key: string]: {
        label?: string;
        see_also?: string;
    };
}

interface HasExpression {
    '@type': string;
    [key: string]: string;
}

interface HasInputData {
    label?: string;
    source_table?: any;
    has_expression?: HasExpression;
    has_part?: HasPart;
    source_url?: string;
    comment?: string;
    has_characteristic?: HasCharacteristic;
}
