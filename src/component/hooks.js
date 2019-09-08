const delay = require('../utils/delay');
const directive = require('../directive');

function callBeforeCreate(context) {
    directive.callSystemComponentBeforeCreate(context);
    directive.callComponentBeforeCreate(context);
    if (typeof context.onBeforeCreate === 'function') {
        return context.onBeforeCreate.call(context);
    }
}

function callCreate(context) {
    directive.callSystemComponentCreate(context);
    directive.callComponentCreate(context);
    if (typeof context.onCreate === 'function') {
        context.onCreate.call(context);
    }
    context.app.emit('componentCreate', context);
}

function callConfigCreate(context) {
    directive.callSystemComponentConfigCreate(context);
    if (typeof context.onConfigCreate === 'function') {
        context.onConfigCreate.call(context);
    }
    if (context.parent && typeof context.parent[context.__onConfigCreate] === 'function') {
        context.parent[context.__onConfigCreate].call(context.parent, context);
    }
    context.app.emit('componentConfigCreate', context);
}

function callBeforeMount(context) {
    directive.callSystemComponentBeforeMount(context);
    directive.callComponentBeforeMount(context);
    if (typeof context.onBeforeMount === 'function') {
        return context.onBeforeMount.call(context);
    }
}

function callMount(context) {
    directive.callSystemComponentMount(context);
    directive.callComponentMount(context);
    if (typeof context.onMount === 'function') {
        context.onMount.call(context);
    }
    context.app.emit('componentMount', context);
}

function callMountAsync(context) {
    delay(()=> {
        directive.callSystemComponentMountAsync(context);
        directive.callComponentMountAsync(context);
    });
    if (typeof context.onMountAsync === 'function') {
        delay(() => context.onMountAsync.call(context));
    }
    context.app.emit('componentMountAsync', context);
}

function callBeforeUpdate(context, changes) {
    directive.callSystemComponentBeforeUpdate(context, changes);
    directive.callComponentBeforeUpdate(context, changes);
    if (typeof context.onBeforeUpdate === 'function') {
        return context.onBeforeUpdate.call(context, changes);
    }
}

function callUpdate(context, changes) {
    directive.callSystemComponentUpdate(context, changes);
    directive.callComponentUpdate(context, changes);
    if (typeof context.onUpdate === 'function') {
        context.onUpdate.call(context, changes);
    }
    context.app.emit('componentUpdate', context, changes);
}

function callDrawByParent(context, newNode, oldNode) {
    if (!context) return ;

    directive.callSystemComponentDrawByParent(context, newNode, oldNode);

    if (typeof context.onDrawByParent === 'function') {
        return context.onDrawByParent.call(context, newNode, oldNode);
    }
    if (context.parent && typeof context.parent[context.__onDrawByParent] === 'function') {
        return context.parent[context.__onDrawByParent].call(context.parent, context, newNode, oldNode);
    }
    //context.app.emit('componentDrawByParent', context, changes);
}

function callAfterRender(context, changes) {
    directive.callSystemComponentAfterRender(context, changes);
    directive.callComponentAfterRender(context, changes);
    if (typeof context.onAfterRender === 'function') {
        return context.onAfterRender.call(context, changes);
    }
}

function callBeforeUnmount(context) {
    directive.callSystemComponentBeforeUnmount(context);
    directive.callComponentBeforeUnmount(context);
    if (typeof context.onBeforeUnmount === 'function') {
        return context.onBeforeUnmount.call(context);
    }
}

function callUnmount(context) {
    directive.callSystemComponentUnmount(context);
    directive.callComponentUnmount(context);
    if (typeof context.onUnmount === 'function') {
        context.onUnmount.call(context);
    }
    context.app.emit('componentUnmount', context);
}

function callBeforeDestroy(context) {
    directive.callSystemComponentBeforeDestroy(context);
    directive.callComponentBeforeDestroy(context);
    if (typeof context.onBeforeDestroy === 'function') {
        return context.onBeforeDestroy.call(context);
    }
}

function callDestroy(context) {
    directive.callSystemComponentDestroy(context);
    directive.callComponentDestroy(context);
    context.app.emit('componentDestroy', context);

    //delete context.app._componentsByUId[context.uId];
    const style = document.getElementById(context.uId + '--style');
    if (style) {
        style.parentNode.removeChild(style);
    }

    if (context._unmountedPlaceholder && context._unmountedPlaceholder.parentNode)
        context._unmountedPlaceholder.parentNode.removeChild(context._unmountedPlaceholder);

    /*if (context.id && context.app._ids[context.id])
        delete context.app._ids[context.id];*/
    /*if (typeof context.onDestroy === 'function' && context.parent && typeof context.parent[context.__onDestroy] === 'function') {
        context.onDestroy.call(context);
        context.parent[context.__onDestroy].call(context.parent, context);
        context = null;
    } else*/ if (typeof context.onDestroy === 'function') {
        context.onDestroy.call(context);
        context = null;
    } /*else if (context.parent && typeof context.parent[context.__onDestroy] === 'function') {
        context.parent[context.__onDestroy].call(context.parent, context);
        context = null;
    }*/

}

function callLoadProps(context) {
    directive.callSystemComponentLoadProps(context);
    directive.callComponentLoadProps(context);
    if (typeof context.onLoadProps === 'function') {
        context.onLoadProps.call(context);
    }
    context.app.emit('componentLoadProps', context);
}

module.exports = {
    callBeforeCreate,
    callCreate,
    callConfigCreate,
    callBeforeMount,
    callMount,
    callMountAsync,
    callBeforeUpdate,
    callUpdate,
    callDrawByParent,
    callAfterRender,
    callBeforeUnmount,
    callUnmount,
    callBeforeDestroy,
    callDestroy,
    callLoadProps
};