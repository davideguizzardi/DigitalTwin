const DRAG_START = "DRAG_START"
const DRAG_END = "DRAG_END"
const DRAG_END_OUT = "DRAG_END_OUT"
const AVAILABLE_DROP = "AVAILABLE_DROP"


function subscribe(eventName, listener){
    document.addEventListener(eventName, listener)
}

function unsubscribe(eventName, listener){
    document.removeEventListener(eventName, listener)
}

function emit(eventType, detail){
    const event = new CustomEvent(eventType, {detail: detail})
    document.dispatchEvent(event)
}

export { DRAG_START, DRAG_END_OUT,DRAG_END, AVAILABLE_DROP,
    subscribe, unsubscribe, emit };