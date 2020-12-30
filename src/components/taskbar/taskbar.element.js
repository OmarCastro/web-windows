import html from '!!raw-loader!./taskbar.element.html'; 
import css from '!!raw-loader!./taskbar.element.css'; 

const template = document.createElement("template");
template.innerHTML = html;

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(css)

export class TaskBar extends HTMLElement {
    constructor(...args){
        super(...args);
        // Create a shadow root
        var shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(document.importNode(template.content, true));
        shadow.adoptedStyleSheets = [stylesheet]
        shadow.addEventListener("click", (ev) => {
            const {target} = ev;
            if(target.matches("button[data-action]")){
                const action = target.getAttribute("data-action")
                const event = new Event(action, {bubbles: true});
                this.dispatchEvent(event);
            }
        })
    }
}

customElements.define("wwin-taskbar", TaskBar);