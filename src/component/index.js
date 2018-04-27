const extend = require('../utils/extend');
const {register} = require('../collection');
const html = require('../utils/html');
const {REGEX, TAG} = require('../constants');
const collection = require('../collection');
const observer = require('./observer');
const events = require('./events');
const {transform, serializeProps} = require('../vdom/parser');
const update = require('../vdom').updateElement;
const castStringTo = require('../utils/cast-string-to');
const store = require('./store');
const ids = require('./ids');
const {extract} = require('./d-props');

function component(tag, cfg = {}) {

    if (typeof tag !== 'string') {
        throw new TypeError('Tag must be a string');
    }

    if (!REGEX.IS_CUSTOM_TAG.test(tag)) {
        throw new TypeError('Tag must contain a dash (-): my-component');
    }

    const cmp = {};

    cmp.tag = tag;

    cmp.cfg = extend.copy(cfg, {
        updateChildrenProps: true,
        props: {},
        template() {
            return '<div></div>'
        }
    });

    register(cmp);
}

function getInstances(cfg = {}) {

    cfg = extend.copy(cfg, {
        isStatic: false
    });

    console.log('TEMPLATE', cfg.template);

    cfg.template = typeof cfg.template === 'string'
        ? html.create(cfg.template)
        : cfg.template;

    let components = {};
    let index = 0;
    let newElement;

    let child = cfg.template;

    const cmp = cfg.autoCmp || collection.get(child.nodeName) || cfg.view._components[child.nodeName.toLowerCase()];

    if (cmp) {
        let alias = index;
        const props = serializeProps(child);
        const dProps = extract(props);
        const inner = child.innerHTML.trim();
        //child.innerHTML = '';

        newElement = createInstance(cmp, {
            root: cfg.root,
            view: cfg.view,
            props,
            dProps,
            parentCmp: cfg.parentCmp,
            isStatic: cfg.isStatic
        });

        if (newElement === undefined) return;

        // Remove old
        child.parentNode.removeChild(child);
        newElement.render();
        //newElement._rootElement.dataset.root = 'true';
        events.callRender(newElement);
        components[dProps.alias ? dProps.alias : alias] = newElement;

        if (inner) {
            const innerEl = html.create(inner);
            if (cfg.isStatic && newElement._rootElement.firstChild) {
                newElement._rootElement.firstChild.appendChild(innerEl);
            } else {
                newElement._rootElement.appendChild(innerEl);
            }
        }
    }

    const nested = Array.from(newElement ? newElement._rootElement.children : child.children);

    nested.forEach((item, i) => {
        console.log(i, item.outerHTML);

        //if (REGEX.IS_CUSTOM_TAG.test(item.nodeName) /*&& item.nodeName.toLowerCase() !== TAG.ROOT*/) {

            const template = item.outerHTML;
            if (!template) return;
            const rootElement = document.createElement(item.nodeName);
            item.parentNode.replaceChild(rootElement, item);

            //console.log('hhhhhhhhhhhhhh',item.outerHTML)

            const cmps = getInstances({
                root: rootElement,
                template: template,
                view: cfg.view,
                parentCmp: newElement,
                isStatic: cfg.isStatic
            });

            Object.keys(cmps).forEach(i => {
                if (cmps[i] === undefined) return;
                let n = i;
                if (newElement.children[n] !== undefined && typeof castStringTo(n) === 'number') {
                    n++
                }
                newElement.children[n] = cmps[i]
            })
        //}

    });

    return components;
}

function createInstance(cmp, cfg) {
    const props = extend.copy(cfg.props, typeof cmp.cfg.props === 'function'
        ? cmp.cfg.props()
        : cmp.cfg.props
    );

    const instance = Object.defineProperties({}, {
        _isCreated: {
            value: false,
            writable: true
        },
        _prevTpl: {
            value: null,
            writable: true
        },
        _prev: {
            value: null,
            writable: true
        },
        _prevProps: {
            value: null,
            writable: true
        },
        _rootElement: {
            value: null,
            writable: true
        },
        _boundElements: {
            value: {},
            writable: true
        },
        _callback: {
            value: cfg.dProps['callback'],
            writable: true
        },
        _cache: {
            value: new Map()
        },
        _isStatic: {
            value: cfg.isStatic
        },
        _publicProps: {
            value: Object.assign({}, cfg.props)
        },
        view: {
            value: cfg.view,
            enumerable: true
        },
        parent: {
            value: cfg.parentCmp,
            enumerable: true
        },
        ref: {
            value: {},
            writable: true,
            enumerable: true
        },
        children: {
            value: {},
            writable: true,
            enumerable: true
        },
        tag: {
            value: cmp.tag,
            enumerable: true
        },
        emit: {
            value: function (name, ...args) {
                if (this._callback && this._callback[name] !== undefined
                    && this.parent[this._callback[name]] !== undefined
                    && typeof this.parent[this._callback[name]] === 'function') {
                    this.parent[this._callback[name]].apply(this.parent, args);
                }
            },
            enumerable: true
        },
        each: {
            value: function (obj, func) {
                if (Array.isArray(obj))
                    return obj.map(func).map(stringEl => {

                        stringEl = stringEl.trim();

                        const isCustomTagString = stringEl.match(REGEX.IS_CUSTOM_TAG_STRING);

                        if (isCustomTagString) {
                            const key = stringEl;
                            const value = this._cache.get(key);
                            if (value !== undefined) {
                                stringEl = value;
                            } else {
                                let cmp;
                                // Is wrapper component
                                if (isCustomTagString.index === 0) {
                                    const el = html.create(stringEl);
                                    stringEl = el.outerHTML;
                                    cmp = getInstances({
                                        root: document.createElement(TAG.ROOT),
                                        template: stringEl,
                                        view: this.view,
                                        parentCmp: this,
                                        isStatic: true
                                    });

                                    // Is into standard HTML
                                } else {
                                    const autoCmp = {
                                        tag: TAG.EACH,
                                        cfg: {
                                            props: {},
                                            template() {
                                                return stringEl;
                                            }
                                        }
                                    };
                                    cmp = getInstances({
                                        root: document.createElement(TAG.ROOT),
                                        template: `<${TAG.EACH}></${TAG.EACH}>`,
                                        view: this.view,
                                        parentCmp: this,
                                        isStatic: true,
                                        autoCmp
                                    });
                                }

                                stringEl = cmp[0]._rootElement.innerHTML;
                                cmp[0].destroy();
                                this._cache.set(key, stringEl);
                            }
                        }

                        return stringEl
                    }).join('').trim();
            },
            enumerable: true
        },
        getStore: {
            value: function (storeName) {
                return this.view.getStore(storeName);
            },
            enumerable: true
        },
        getComponentById: {
            value: function (id) {
                return this.view.getComponentById(id);
            },
            enumerable: true
        },
        action: {
            value: cfg.view.action,
            enumerable: true
        },
        render: {
            value: function () {
                const tag = this.tag ? this.tag + TAG.SUFFIX_ROOT : TAG.ROOT;
                const template = this.template().trim();
                const tpl = html.create(`<${tag}>${template}</${tag}>`);
                let next = transform(tpl);

                const rootElement = update(cfg.root, next, this._prev, 0, this);

                if (!this._rootElement && rootElement) {
                    this._rootElement = rootElement;
                }

                this._prev = next;
            },
            enumerable: true
        },
        mount: {
            value: function (template, cfg = {}) {
                let root = this._rootElement;
                if (typeof cfg.selector === 'string')
                    root = root.querySelector(cfg.selector);
                return this.view.mount(template, root, this);
            },
            enumerable: true
        },
        destroy: {
            value: function () {
                if (!this._rootElement || events.callBeforeDestroy(this) === false) return;
                this._rootElement.parentNode.removeChild(this._rootElement);
                events.callDestroy(this);
            },
            enumerable: true
        }
    });


    // Assign cfg to instance
    extendInstance(instance, cmp.cfg, cfg.dProps);

    const beforeCreate = events.callBeforeCreate(instance);
    if (beforeCreate === false)
        return undefined;

    // Create observer to props
    observer.create(instance, props);
    // Create shared store
    store.create(instance);
    // Create ID
    ids.create(instance);
    // Call create
    events.callCreate(instance);
    // Now instance is created
    instance._isCreated = true;

    return instance;
}

function extendInstance(instance, cfg, dProps) {
    Object.assign(instance, cfg);

    // Overwrite store name with that passed though props
    if (dProps.store)
        instance.store = dProps.store;
    // Overwrite id with that passed though props
    if (dProps.id)
        instance.id = dProps.id;
}

module.exports = {
    component,
    getInstances
};