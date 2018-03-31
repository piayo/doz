module.exports = {
    ROOT: '__DOZ__',
    SIGN: '__DOZ_SIGN__',
    EVENTS: [
        'show',
        'hide',
        'beforeContentChange',
        'contentChange',
        'state',
        'beforeState'
    ],
    PARSER: {
        REGEX: {
            ATTR: /{{([\w.]+)}}/,
            TEXT: /(?!<.){{([\w.]+)}}(?!.>)/g
        },
        TAG: {
            TEXT: 'doz-text-node'
        }
    },
    ATTR: {
        WIDGET: 'doz-medom-widget'
    }
};