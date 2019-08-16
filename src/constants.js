module.exports = {
    COMPONENT_DYNAMIC_INSTANCE: '__DOZ_COMPONENT_DYNAMIC_INSTANCE__',
    COMPONENT_INSTANCE: '__DOZ_COMPONENT_INSTANCE__',
    COMPONENT_ROOT_INSTANCE: '__DOZ_COMPONENT_ROOT_INSTANCE__',
    DIR_IS: '__DOZ_D_IS__',
    NS: {
        SVG: 'http://www.w3.org/2000/svg'
    },
    TAG: {
        ROOT: 'dz-root',
        EACH: 'dz-each-root',
        APP: 'dz-app',
        EMPTY: 'dz-empty',
        MOUNT: 'dz-mount',
        SUFFIX_ROOT: '-root',
        TEXT_NODE_PLACE: 'dz-text-node'
    },
    REGEX: {
        IS_CUSTOM_TAG: /^\w+-[\w-]+$/,
        IS_CUSTOM_TAG_STRING: /<\w+-[\w-]+/,
        IS_BIND: /^d-bind$/,
        IS_REF: /^d-ref$/,
        IS_IS: /^d-is$/,
        IS_ON: /^d:on$/,
        IS_ALIAS: /^d:alias$/,
        IS_STORE: /^d:store$/,
        IS_COMPONENT_LISTENER: /^d:on-(\w+)$/,
        IS_LISTENER: /^on/,
        IS_ID_SELECTOR: /^#[\w-_:.]+$/,
        IS_PARENT_METHOD: /^parent.(.*)/,
        IS_STRING_QUOTED: /^"\w+"/,
        IS_SVG: /^svg$/,
        IS_CLASS: /^(class\s|function\s+_class|function.*\s+_classCallCheck\(this, .*\))|(throw new TypeError\("Cannot call a class)|(function.*\.__proto__\|\|Object\.getPrototypeOf\(.*?\))/i,
        GET_LISTENER: /^this.(.*)\((.*)\)/,
        TRIM_QUOTES: /^["'](.*)["']$/,
        THIS_TARGET: /\B\$this(?!\w)/g,
        HTML_MARKUP: /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.0-9_a-z]*)\s*([^>]*?)(\/?)>/ig,
        HTML_ATTRIBUTE: /(^|\s)([\w-:]+)(\s*=\s*("([^"]+)"|'([^']+)'|(\S+)))?/ig,
        MATCH_NLS: /\n\s+/gm,
        REPLACE_QUOT: /"/g
    },
    ATTR: {
        // Attributes for HTMLElement
        BIND: 'd-bind',
        REF: 'd-ref',
        IS: 'd-is',
        // Attributes for both
        KEY: 'd-key',
        // Attributes for Components
        ALIAS: 'd:alias',
        STORE: 'd:store',
        LISTENER: 'd:on',
        ID: 'd:id',
        ON_BEFORE_CREATE: 'd:onbeforecreate',
        ON_CREATE: 'd:oncreate',
        ON_CONFIG_CREATE: 'd:onconfigcreate',
        ON_BEFORE_MOUNT: 'd:onbeforemount',
        ON_MOUNT: 'd:onmount',
        ON_MOUNT_ASYNC: 'd:onmountasync',
        ON_BEFORE_UPDATE: 'd:onbeforeupdate',
        ON_UPDATE: 'd:onupdate',
        ON_DRAW_BY_PARENT: 'd:ondrawbyparent',
        ON_AFTER_RENDER: 'd:onafterrender',
        ON_BEFORE_UNMOUNT: 'd:onbeforeunmount',
        ON_UNMOUNT: 'd:onunmount',
        ON_BEFORE_DESTROY: 'd:onbeforedestroy',
        ON_DESTROY: 'd:ondestroy',
        ON_LOAD_PROPS: 'd:onloadprops',
        FORCE_UPDATE: 'forceupdate'
    },
    DPROPS: {
        STORE: 'store',
        ALIAS: 'alias',
        CALLBACK: 'callback',
        ID: 'id',
        ON_BEFORE_CREATE: '__onBeforeCreate',
        ON_CREATE: '__onCreate',
        ON_CONFIG_CREATE: '__onConfigCreate',
        ON_BEFORE_MOUNT: '__onBeforeMount',
        ON_MOUNT: '__onMount',
        ON_MOUNT_ASYNC: '__onMountAsync',
        ON_BEFORE_UPDATE: '__onBeforeUpdate',
        ON_UPDATE: '__onUpdate',
        ON_DRAW_BY_PARENT: '__onDrawByParent',
        ON_AFTER_RENDER: '__onAfterRender',
        ON_BEFORE_UNMOUNT: '__onBeforeUnmount',
        ON_UNMOUNT: '__onUnmount',
        ON_BEFORE_DESTROY: '__onBeforeDestroy',
        ON_DESTROY: '__onDestroy',
        ON_LOAD_PROPS: '__onLoadProps',
    }
};