const castStringTo = require('../utils/cast-string-to');
const {REGEX, ATTR} = require('../constants');

function serializeProps(node) {
    const props = {};

    if (node.attributes.length) {
        Array.from(node.attributes).forEach(attr => {
            let isComponentListener = attr.name.match(REGEX.IS_COMPONENT_LISTENER);
            if (isComponentListener) {
                if (!props.hasOwnProperty(ATTR.LISTENER))
                    props[ATTR.LISTENER] = {};
                props[ATTR.LISTENER][isComponentListener[1]] = attr.nodeValue;
                delete props[attr.name];
            } else {
                props[attr.name] = attr.nodeValue === '' ? true : castStringTo(attr.nodeValue);
            }
        });
    }

    return props;
}

function transform(node) {

    let root = {};

    function walking(node, parent) {
        do {
            let obj;
            if (node.nodeType === 3) {
                obj = node.nodeValue;
            } else {
                obj = {};
                obj.type = node.nodeName.toLowerCase();
                obj.children = [];
                obj.props = serializeProps(node);
            }

            if (!Object.keys(root).length)
                root = obj;

            if (parent && parent.children) {
                parent.children.push(obj);
            }

            if (node.hasChildNodes()) {
                walking(node.firstChild, obj);
            }
        } while (node = node.nextSibling)

    }

    walking(node, root);

    return root;
}

module.exports = {
    transform,
    serializeProps
};