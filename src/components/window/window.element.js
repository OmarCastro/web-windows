import html from '!!raw-loader!./window.element.html'; 
import css from '!!raw-loader!./window.element.css'; 

const template = document.createElement("template");
template.innerHTML = html;

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(css)

const zIndexCounter = {
    value: 0,
    nextValue(){
        this.value += 1;
        return this.value;
    }
};

const moveEventData = Symbol("window title move event data")

export class WWindow extends HTMLElement {
    constructor(...args){
        super(...args);
        // Create a shadow root
        var shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(document.importNode(template.content, true));
        this.shadowRoot.adoptedStyleSheets = [stylesheet] 
        const windowElement = this.shadowRoot.firstElementChild;
        this.windowElement = windowElement;

        this[moveEventData] = {
            initialX: 0,
            initialY: 0,
            initialElX: 0,
            initialElY: 0,
            initialElW: 0,
            initialElH: 0,
            initDrag(ev, element){
                this.initialX = ev.screenX;
                this.initialY = ev.screenY;
                this.initialElX = +element.getAttribute("x");
                this.initialElY = +element.getAttribute("y");
                this.initialElW = +element.getAttribute("w");
                this.initialElH = +element.getAttribute("h");
            },

            getDragDiff(ev){
                const diffX = ev.screenX - this.initialX
                const diffY = ev.screenY - this.initialY
                return {
                    x: diffX,
                    y: diffY,
                    elX: this.initialElX + diffX,
                    elY: this.initialElY + diffY,
                    elW: this.initialElW + diffX,
                    elH: this.initialElH + diffY

                };
            }
        }


        windowElement.addEventListener("pointerdown", () => {
            windowElement.style.setProperty("--zindex", zIndexCounter.nextValue());
            const windowElementFocusEvent = new Event("windows-focus")
            this.dispatchEvent(windowElementFocusEvent);
        })


        const windowTopBar = windowElement.querySelector(".window__top-bar");
        windowTopBar.addEventListener("pointerdown", this.dragHandlerByAttributes("x","y"))
        windowTopBar.addEventListener("dblclick", (ev) => this.toggleMaximize())

        const borderTopLeft = windowElement.querySelector(".border--top-left");
        borderTopLeft.addEventListener("pointerdown", this.dragHandlerByAttributes("-w", "-h", "x", "y"))

        const borderTop = windowElement.querySelector(".border--top");
        borderTop.addEventListener("pointerdown", this.dragHandlerByAttributes("-h", "y"))

        const borderTopRight = windowElement.querySelector(".border--top-right");
        borderTopRight.addEventListener("pointerdown", this.dragHandlerByAttributes("w", "-h", "y"))

        const borderRight = windowElement.querySelector(".border--right");
        borderRight.addEventListener("pointerdown", this.dragHandlerByAttributes("w"))

        const borderBottomRight = windowElement.querySelector(".border--bottom-right");
        borderBottomRight.addEventListener("pointerdown", this.dragHandlerByAttributes("w","h"))

        const borderBottom = windowElement.querySelector(".border--bottom");
        borderBottom.addEventListener("pointerdown", this.dragHandlerByAttributes("h"))

        const borderBottomLeft = windowElement.querySelector(".border--bottom-left");
        borderBottomLeft.addEventListener("pointerdown", this.dragHandlerByAttributes("-w","h", "x"))

        const borderLeft = windowElement.querySelector(".border--left");
        borderLeft.addEventListener("pointerdown", this.dragHandlerByAttributes("x","-w"))

        const minimizeButton = windowElement.querySelector(".button--minimize");
        minimizeButton.addEventListener("click", () => this.toggleMinimize());        

        const maximizeButton = windowElement.querySelector(".button--maximize");
        maximizeButton.addEventListener("click", () => this.toggleMaximize());     
        
        const closeButton = windowElement.querySelector(".button--close");
        closeButton.addEventListener("click", () => this.parentElement.removeChild(this));

    }

    dragHandlerByAttributes(...attrs){
        return (ev) => {
            ev.preventDefault();
            this[moveEventData].initDrag(ev, this);
            const handleEvent = this.handlePointerAttributes(...attrs)
            window.addEventListener("pointermove", handleEvent);
            const removevents = () => {
                window.removeEventListener("pointermove", handleEvent)
                window.removeEventListener("pointerup", removevents)
            }
            window.addEventListener("pointerup", removevents)
        }
    }

    handlePointerAttributes(...attrs){

        const setPositiveValueAttribute = (name, value) => {
            this.setAttribute(name, Math.max(value, 0));
            return value >= 0
        }

        const fns = attrs.reduce((acc, attr) => {
            switch(attr){
                case "x": return (diff) => acc(diff) && setPositiveValueAttribute("x", diff.elX);
                case "y": return (diff) => acc(diff) && setPositiveValueAttribute("y", diff.elY);
                case "w": return (diff) => acc(diff) && setPositiveValueAttribute("w", diff.elW);
                case "-w": return (diff) => acc(diff) && setPositiveValueAttribute("w", diff.elW - 2*diff.x);
                case "h": return (diff) => acc(diff) && setPositiveValueAttribute("h", diff.elH);
                case "-h": return (diff) => acc(diff) && setPositiveValueAttribute("h", diff.elH - 2*diff.y);
            }
        } ,() => true);

        return (ev) => fns( this[moveEventData].getDragDiff(ev));
    }

    maximize(){
        this.windowElement.setAttribute("maximized", "");
    }

    restoreMaximize(){
        this.windowElement.removeAttribute("maximized");
    }

    isMaximized(){
        this.windowElement.hasAttribute("maximized");
    }

    toggleMaximize(){
        this.windowElement.toggleAttribute("maximized")
    }

    minimize(){
        this.windowElement.setAttribute("minimized", "");
    }

    restoreMinimize(){
        this.windowElement.removeAttribute("minimized");
    }

    isMinimized(){
        this.windowElement.hasAttribute("minimized");
    }

    toggleMinimize(){
        this.windowElement.toggleAttribute("minimized")
    }


    handleMove(ev){
        const diff = this[moveEventData].getDragDiff(ev);
        this.setAttribute("x", diff.elX);
        this.setAttribute("y", diff.elY);
    }

    handleResizeWidth(ev){
        const diff = this[moveEventData].getDragDiff(ev);
        this.setAttribute("w", diff.elW);
    }

    handleResizeHeight(ev){
        const diff = this[moveEventData].getDragDiff(ev);
        this.setAttribute("h", diff.elH);
    }


    static get observedAttributes() { return ['x', 'y', 'w', 'h']; }

    attributeChangedCallback(name, oldValue, newValue) {
        const {style} = this.windowElement;
        switch(name){
            case "x": style.setProperty("--window-position-x",`${newValue}px`);
            break;
            case "y": style.setProperty("--window-position-y",`${newValue}px`);
            break;
            case "w": style.setProperty("--window-size-w",`${newValue}px`);
            break;
            case "h": style.setProperty("--window-size-h",`${newValue}px`);
            break;
        }
      }


}

customElements.define("wwin-window", WWindow);