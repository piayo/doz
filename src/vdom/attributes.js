const {REGEX, ATTR, PROPS_ATTRIBUTES} = require('../constants');
//const castStringTo = require('../utils/cast-string-to');
const objectPath = require('../utils/object-path');
const isListener = require('../utils/is-listener');
//const mapper = require('./mapper');
const {isDirective} = require('../directives/helpers');
const makeSureAttach = require('../component/make-sure-attach');
const booleanAttributes = require('../utils/boolean-attributes');

function isEventAttribute(name) {
    return isListener(name);
}

function setAttribute($target, name, value, cmp, cmpParent, isSVG) {
    //console.log('setAttribute', $target, name, value)
    if (name === 'data-attributeoriginaletagname') return;

    makeSureAttach($target);

    if (!$target._dozAttach[PROPS_ATTRIBUTES]) {
        $target._dozAttach[PROPS_ATTRIBUTES] = {};
    }
    $target._dozAttach[PROPS_ATTRIBUTES][name] = value;

    if (name === 'key') {
        if ($target._dozAttach.key === undefined) {
            $target._dozAttach.key = value;
        }
        return;
    }

    let _isDirective = isDirective(name);

    if (_isDirective) $target._dozAttach.hasDirective = true;

    if ((isCustomAttribute(name) || typeof value === 'function' || typeof value === 'object') && !_isDirective) {
        // why? I need to remove any orphan keys in the mapper. Orphan keys are created by handler attributes
        // like onclick, onmousedown etc. ...
        // handlers are associated to the element only once.
        // at the moment the only way to remove the keys is to take them.
        //if (isEventAttribute(name) && typeof value === 'string') {
            //mapper.getAll(value);
        //}
        /*} else if (typeof value === 'boolean') {
            setBooleanAttribute($target, name, value);*/
    } else {
        if (value === undefined) value = '';

        if (name === 'class' && !isSVG) {
            $target.className = value;
            //Imposto solo se la proprietà esiste...
        } else if ($target[name] !== undefined && !isSVG) {
            //console.log(name, value, typeof value)
            // Support for boolean attributes like required, disabled etc..
            if (value === '') {
                if (booleanAttributes.indexOf(name) > -1)
                    value = true;
            }
            $target[name] = value;
        } else if (name.startsWith('data-')
            || name.startsWith('aria-')
            || name === 'role'
            || name === 'for'
            || isSVG) {
            $target.setAttribute(name, value);
        }
    }
}

function updateAttribute($target, name, newVal, oldVal, cmp, cmpParent, isSVG) {
    //if (newVal !== oldVal) {
        setAttribute($target, name, newVal, cmp, cmpParent, isSVG);
        cmp.$$afterAttributeUpdate($target, name, newVal);
    //}
}

function updateAttributes($target, newProps, oldProps = {}, cmp, cmpParent, isSVG) {
    const props = Object.assign({}, newProps, oldProps);
    let updated = [];

    let propsKeys = Object.keys(props);
    let name;

    for (let i = 0; i < propsKeys.length; i++) {
        name = propsKeys[i];
        if (!$target || $target.nodeType !== 1) continue;
        if (newProps[name] !== oldProps[name]) {
            updateAttribute($target, name, newProps[name], oldProps[name], cmp, cmpParent, isSVG);
            let obj = {};
            obj[name] = newProps[name];
            updated.push(obj);
        }
    }

    /*Object.keys(props).forEach(name => {
        if(!$target || $target.nodeType !== 1) return;
        updateAttribute($target, name, newProps[name], oldProps[name], cmp, cmpParent);
        if (newProps[name] !== oldProps[name]) {
            let obj = {};
            obj[name] = newProps[name];
            updated.push(obj);
        }
    });*/
    return updated;
}

function isCustomAttribute(name) {
    return isEventAttribute(name) || name === ATTR.FORCE_UPDATE;
}

function extractEventName(name) {
    return name.slice(2).toLowerCase();
}

function trimQuotes(str) {
    return str.replace(REGEX.TRIM_QUOTES, '$1');
}

function addEventListener($target, name, value, cmp, cmpParent) {

    if (!isEventAttribute(name)) return;

    //console.log('event attribute', name, value)

    let alreadyFunction = false;

    // Determines if the function is passed by mapper
    if (typeof value === 'function') {
        alreadyFunction = true;
    }

    // Legacy logic where use a string instead of function
    if (typeof value === 'string') {
        // If use scope. from onDrawByParent event
        let match = value.match(REGEX.GET_LISTENER_SCOPE);

        if (match) {

            let args = null;
            let handler = match[1];
            let stringArgs = match[2];
            if (stringArgs) {
                args = stringArgs.split(',').map(item => {
                    item = trimQuotes(item.trim());
                    //return item === 'scope' ? cmpParent : castStringTo(trimQuotes(item))
                    /*let itemMap = mapper.get(item);
                    if (itemMap !== undefined)
                        item = itemMap;*/

                    return item === 'scope'
                        ? cmpParent
                        : item
                })
            }

            const method = objectPath(handler, cmpParent);
            if (method !== undefined) {
                value = args
                    ? method.bind(cmpParent, ...args)
                    : method.bind(cmpParent);
            }

        } else {
            /*return;
            console.log('bbb')*/
            match = value.match(REGEX.GET_LISTENER);

            if (match) {
                //console.log('aaaaa')
                let args = null;
                let handler = match[1];
                let stringArgs = match[2];
                if (stringArgs) {
                    args = stringArgs.split(',').map(item => {
                        item = trimQuotes(item.trim());
                        /*let itemMap = mapper.get(item);
                        if (itemMap !== undefined)
                            item = itemMap;*/
                        //return item === 'this' ? cmp : castStringTo(trimQuotes(item))
                        return item === 'this'
                            ? cmp
                            : item
                    })
                }

                let isParentMethod = handler.match(REGEX.IS_PARENT_METHOD);

                if (isParentMethod) {
                    handler = isParentMethod[1];
                    cmp = cmp.parent;
                }

                const method = objectPath(handler, cmp);

                if (method !== undefined) {
                    value = args
                        ? method.bind(cmp, ...args)
                        : method.bind(cmp);
                }
            }
        }
    }

    if (typeof value === 'function') {
        if (alreadyFunction) {
            $target.addEventListener(
                extractEventName(name),
                value.bind(cmp)
            );
        } else {
            $target.addEventListener(
                extractEventName(name),
                value
            );
        }
    } else {
        value = value.replace(REGEX.THIS_TARGET, '$target');
        // I don't understand but with regex test sometimes it don't works fine so use match... boh!
        //if (REGEX.IS_LISTENER_SCOPE.test(value) || value === 'scope') {
        if (value.match(REGEX.IS_LISTENER_SCOPE) || value === 'scope') {
            const _func = function () {
                // Brutal replace of scope with this
                value = value.replace(/scope/g, 'this');
                eval(value);
            };
            $target.addEventListener(
                extractEventName(name),
                _func.bind(cmpParent)
            );
        } else {
            const _func = function () {
                eval(value)
            };
            $target.addEventListener(
                extractEventName(name),
                _func.bind(cmp)
            );
        }
    }
}

function attach($target, nodeProps, cmp, cmpParent, isSVG) {

    let name;
//console.log(nodeProps)
    const propsKeys = Object.keys(nodeProps);

    for (let i = 0, len = propsKeys.length; i < len; i++) {
        name = propsKeys[i];
        addEventListener($target, name, nodeProps[name], cmp, cmpParent);
        setAttribute($target, name, nodeProps[name], cmp, cmpParent, isSVG);
        //cmp.$$afterAttributeCreate($target, name, nodeProps[name], nodeProps);
    }

    /*const datasetArray = Object.keys($target.dataset);
    for (let i = 0; i < datasetArray.length; i++) {
        if (isListener(datasetArray[i]))
            addEventListener($target, datasetArray[i], $target.dataset[datasetArray[i]], cmp, cmpParent);
    }*/
}

module.exports = {
    attach,
    updateAttributes
};