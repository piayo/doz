const html = require('../utils/html');
const transformChildStyle = require('./helpers/transform-child-style');
const {COMPONENT_ROOT_INSTANCE, COMPONENT_INSTANCE, REGEX} = require('../constants');
const collection = require('../collection');
const hooks = require('./hooks');
const {serializeProps} = require('../vdom/parser');
const hmr = require('./helpers/hmr');
const Component = require('./Component');
const propsInit = require('./helpers/props-init');
const delay = require('../utils/delay');
const directive = require('../directive');
const getComponentName = require('./helpers/get-component-name');

function createInstance(cfg = {}) {

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

            directive.callAppWalkDOM(parent, $child);

            isChildStyle = transformChildStyle($child, parent);

            if (isChildStyle) {
                $child = isChildStyle;
                continue;
            }

            cmpName = getComponentName($child);

            directive.callAppComponentAssignName(parent, $child, (name) => {
                cmpName = name;
            });

            let localComponents = {};

            if (parent.cmp && parent.cmp._components) {
                localComponents = parent.cmp._components;
            }

            const cmp = cfg.autoCmp ||
                localComponents[cmpName] ||
                cfg.app._components[cmpName] ||
                collection.getComponent(cmpName);

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

                const componentDirectives = {};

                let newElement;

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
                        componentDirectives,
                        parentCmp: parent.cmp || cfg.parent
                    });
                } else {
                    newElement = new Component({
                        tag: cmpName,
                        cmp,
                        root: $child,
                        app: cfg.app,
                        props,
                        componentDirectives,
                        parentCmp: parent.cmp || cfg.parent
                    });
                }

                if (!newElement) {
                    $child = $child.nextSibling;
                    continue;
                }

                if (typeof newElement.module === 'object') {
                    hmr(newElement, newElement.module);
                }

                propsInit(newElement);

                newElement.app.emit('componentPropsInit', newElement);

                if (hooks.callBeforeMount(newElement) !== false) {

                    newElement._isRendered = true;
                    newElement.render(true);

                    if (!componentInstance) {
                        componentInstance = newElement;
                    }

                    newElement._rootElement[COMPONENT_ROOT_INSTANCE] = newElement;
                    newElement.getHTMLElement()[COMPONENT_INSTANCE] = newElement;

                    // Replace first child if defaultSlot exists with a slot comment
                    if (newElement._defaultSlot && newElement.getHTMLElement().firstChild) {
                        let slotPlaceholder = document.createComment('slot');
                        newElement.getHTMLElement().replaceChild(slotPlaceholder, newElement.getHTMLElement().firstChild);
                    }

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
                    let n = Object.keys(parent.cmp.children).length++;
                    directive.callAppComponentAssignIndex(newElement, n, (index) => {
                        parent.cmp.children[index] = newElement;
                    });

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

module.exports = createInstance;