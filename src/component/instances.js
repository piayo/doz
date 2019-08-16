const html = require('../utils/html');
const {scopedInner} = require('./style');
const {COMPONENT_ROOT_INSTANCE, COMPONENT_INSTANCE, ATTR, DIR_IS, REGEX} = require('../constants');
const collection = require('../collection');
const hooks = require('./hooks');
const {serializeProps} = require('../vdom/parser');
const {extract} = require('./d-props');
const hmr = require('./hmr');
const {Component} = require('./Component');
const propsInit = require('./props-init');
const delay = require('../utils/delay');

function getComponentName(child) {
    let cmpName;
    if (typeof child.getAttribute === 'function' && child.hasAttribute(ATTR.IS)) {
        cmpName = child.getAttribute(ATTR.IS).toLowerCase();
        child.removeAttribute(ATTR.IS);
        child.dataset.is = cmpName;
        child[DIR_IS] = true;
    } else
        cmpName = child.nodeName.toLowerCase();

    return cmpName;
}

function transformChildStyle(child, parent) {
    if (child.nodeName !== 'STYLE')
        return;

    //const dataSetId = parent.cmp._rootElement.parentNode.dataset.is;
    const dataSetUId = parent.cmp.uId;
    //const dataSetUId = parent.cmp._rootElement.parentNode.dataset.uid;
    parent.cmp._rootElement.parentNode.dataset.uid = parent.cmp.uId;
    //console.log(dataSetUId)

    let tagByData = `[data-uid="${dataSetUId}"]`;

    //scopedInner(child.textContent, parent.cmp.tag, tagByData);
    scopedInner(child.textContent, dataSetUId, tagByData);

    const emptyStyle = document.createElement('script');
    emptyStyle.type = 'text/style';
    emptyStyle.textContent = ' ';
    //emptyStyle.dataset.id = parent.cmp.tag + '--style';
    emptyStyle.dataset.id = dataSetUId + '--style';
    emptyStyle.dataset.owner = dataSetUId;//parent.cmp.tag;

    emptyStyle.dataset.ownerByData = tagByData;

    child.parentNode.replaceChild(emptyStyle, child);
    child = emptyStyle.nextSibling;

    return child;
}

function get(cfg = {}) {

    if (!cfg.root) return;

    cfg.template = typeof cfg.template === 'string'
        ? html.create(cfg.template)
        : cfg.template;

    cfg.root.appendChild(cfg.template);

    let componentInstance = null;
    let cmpName;
    let isChildStyle;
    const trash = [];

    //console.log(cfg.template);

    function walk($child, parent = {}) {
        while ($child) {

            //console.log('---', $child.nodeName);

            const uId = cfg.app.generateUId();

            isChildStyle = transformChildStyle($child, parent);

            if (isChildStyle) {
                $child = isChildStyle;
                continue;
            }

            cmpName = getComponentName($child);

            let localComponents = {};

            if (parent.cmp && parent.cmp._components) {
                localComponents = parent.cmp._components;
            }

            const cmp = cfg.autoCmp ||
                localComponents[cmpName] ||
                cfg.app._components[cmpName] ||
                collection.getComponent(cmpName);

            //console.log('-----', !!cmp);

            let parentElement;

            if (cmp) {

                if (parent.cmp) {
                    const rawChild = $child.outerHTML;
                    parent.cmp.rawChildren.push(rawChild);
                }

                // For node created by mount method
                if (parent.cmp && parent.cmp.mounted) {
                    $child = $child.nextSibling;
                    continue;
                }

                if (parent.cmp && parent.cmp.autoCreateChildren === false) {
                    trash.push($child);
                    $child = $child.nextSibling;
                    continue;
                }

                const props = serializeProps($child);
                const dProps = extract(props);

                let newElement;

                /*
                if(parent.cmp) {
                    console.log('parent.cmp', parent.cmp.tag);
                }
                if(cfg.parent)
                    console.log('cfg.parent', cfg.parent.tag);

                 */


                if (typeof cmp.cfg === 'function') {
                    // This implements single function component
                    if (!REGEX.IS_CLASS.test(Function.prototype.toString.call(cmp.cfg))) {
                        const func = cmp.cfg;
                        cmp.cfg = class extends Component {
                        };
                        cmp.cfg.prototype.template = func;
                    }

                    newElement = new cmp.cfg({
                        tag: cmpName,
                        root: $child,
                        app: cfg.app,
                        props,
                        dProps,
                        parentCmp: parent.cmp || cfg.parent
                    });
                } else {
                    newElement = new Component({
                        tag: cmpName,
                        cmp,
                        root: $child,
                        app: cfg.app,
                        props,
                        dProps,
                        parentCmp: parent.cmp || cfg.parent
                    });
                }

                //console.log($child.nodeName, $child.childNodes.length);

                if (!newElement) {
                    $child = $child.nextSibling;
                    continue;
                }

                if (typeof newElement.module === 'object') {
                    hmr(newElement, newElement.module);
                }

                propsInit(newElement);

                Object.defineProperty(newElement, 'uId', {value: uId});
                //Object.defineProperty(newElement, 'originalChildNodesLength', {value: $child.childNodes.length});

                newElement.app.emit('componentPropsInit', newElement);

                if (hooks.callBeforeMount(newElement) !== false) {

                    newElement._isRendered = true;
                    newElement.render(true);

                    if (!componentInstance) {
                        componentInstance = newElement;
                    }

                    newElement._rootElement[COMPONENT_ROOT_INSTANCE] = newElement;
                    newElement.getHTMLElement()[COMPONENT_INSTANCE] = newElement;

                    //$child.insertBefore(newElement._rootElement, $child.firstChild);

                    // This is an hack for call render a second time so the
                    // event onAppDraw and onDrawByParent are fired after
                    // that the component is mounted
                    delay(() => {
                        newElement.render(false, [], true)
                    });


                    hooks.callMount(newElement);
                    hooks.callMountAsync(newElement);

                }

                parentElement = newElement;

                if (parent.cmp) {
                    let n = Object.keys(parent.cmp.children).length;
                    parent.cmp.children[newElement.alias ? newElement.alias : n++] = newElement;
                    if (parent.cmp.childrenByTag[newElement.tag] === undefined) {
                        parent.cmp.childrenByTag[newElement.tag] = [newElement];
                    } else {
                        parent.cmp.childrenByTag[newElement.tag].push(newElement);
                    }

                }

                cfg.autoCmp = null;
            }

            if ($child.hasChildNodes()) {
                if (parentElement) {
                    walk($child.firstChild, {cmp: parentElement})
                } else {
                    walk($child.firstChild, {cmp: parent.cmp})
                }
            }

            $child = $child.nextSibling;
        }
    }

    walk(cfg.template);

    trash.forEach($child => $child.remove());

    return componentInstance;
}

module.exports = {
    get
};