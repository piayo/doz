const proxy = require('../utils/proxy');
const events = require('./events');
const delay = require('../utils/delay');

function updateChildren(instance, changes) {

    if (!instance.updateChildrenProps) return;

    const children = Object.keys(instance.children);

    children.forEach(i => {
        changes.forEach(item => {
            if (instance.children[i]._publicProps.hasOwnProperty(item.currentPath)
                && instance.children[i].props.hasOwnProperty(item.currentPath))
                instance.children[i].props[item.currentPath] = item.newValue;
        });
    });
}

function updateBound(instance, changes) {
    changes.forEach(item => {
        if (instance._boundElements.hasOwnProperty(item.property)) {
            instance._boundElements[item.property].forEach(element => {
                if (element.type === 'checkbox') {
                    element.checked = item.newValue;
                } else if (element.type === 'radio') {
                    element.checked = element.value === item.newValue;
                } else {
                    element.value = item.newValue;
                }
            })
        }
    });
}

function create(instance, props) {
    instance.props = proxy.create(props, true, changes => {
        instance.render();
        updateBound(instance, changes);
        if (instance._isCreated) {
            delay(() => {
                //updateChildren(instance, changes);
                events.callUpdate(instance);
            });
        }
    });

    proxy.beforeChange(instance.props, () => {
        const res = events.callBeforeUpdate(instance);
        if (res === false)
            return false;
    });
}

module.exports = {
    create
};