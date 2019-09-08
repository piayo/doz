module.exports = {
    COMPONENT_DYNAMIC_INSTANCE: '__DOZ_COMPONENT_DYNAMIC_INSTANCE__',
    COMPONENT_INSTANCE: '__DOZ_COMPONENT_INSTANCE__',
    COMPONENT_ROOT_INSTANCE: '__DOZ_COMPONENT_ROOT_INSTANCE__',
    DIR_IS: '__DOZ_D_IS__',
    DEFAULT_SLOT_KEY: '__DEFAULT__',
    NS: {
        SVG: 'http://www.w3.org/2000/svg'
    },
    TAG: {
        ROOT: 'dz-root',
        EACH: 'dz-each-root', //not in use
        APP: 'dz-app',
        EMPTY: 'dz-empty',
        MOUNT: 'dz-mount',
        SLOT: 'dz-slot',
        SLOT_UPPERCASE: 'DZ-SLOT',
        SUFFIX_ROOT: '-root',
        TEXT_NODE_PLACE: 'dz-text-node'
    },
    REGEX: {
        IS_DIRECTIVE: /^d[-:][\w-]+$/,
        IS_CUSTOM_TAG: /^\w+-[\w-]+$/,
        IS_CUSTOM_TAG_STRING: /<\w+-[\w-]+/,
        IS_BIND: /^d-bind$/,
        IS_REF: /^d-ref$/,
        IS_IS: /^d-is$/,
        /*
        IS_ON: /^d:on$/,
        IS_ALIAS: /^d:alias$/,
        IS_STORE: /^d:store$/,
        IS_COMPONENT_LISTENER: /^d:on-(\w+)$/,
         */
        IS_LISTENER: /^on/,
        IS_ID_SELECTOR: /^#[\w-_:.]+$/,
        IS_PARENT_METHOD: /^parent.(.*)/,
        IS_STRING_QUOTED: /^"\w+"/,
        IS_SVG: /^svg$/,
        IS_CLASS: /^(class\s|function\s+_class|function.*\s+_classCallCheck\(this, .*\))|(throw new TypeError\("Cannot call a class)|(function.*\.__proto__\|\|Object\.getPrototypeOf\(.*?\))/i,
        GET_LISTENER: /^this.(.*)\((.*)\)/,
        GET_LISTENER_SCOPE: /^scope.(.*)\((.*)\)/,
        IS_LISTENER_SCOPE: /(^|\()scope[.)]/g,
        TRIM_QUOTES: /^["'](.*)["']$/,
        THIS_TARGET: /\B\$this(?!\w)/g,
        HTML_MARKUP: /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.0-9_a-z]*)\s*([^>]*?)(\/?)>/ig,
        HTML_ATTRIBUTE: /(^|\s)([\w-:]+)(\s*=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig,
        MATCH_NLS: /\n\s+/gm,
        REPLACE_QUOT: /"/g,
        REPLACE_D_DIRECTIVE: /^d[-:]/
    },
    ATTR: {
        // Attributes for HTMLElement
        BIND: 'd-bind',
        REF: 'd-ref',
        IS: 'd-is',
        // Attributes for both
        KEY: 'd-key',
        // Attributes for Components
        /*
        ALIAS: 'd:alias',
        STORE: 'd:store',
        LISTENER: 'd:on',
        ID: 'd:id',
        */
        FORCE_UPDATE: 'forceupdate'
    }
};