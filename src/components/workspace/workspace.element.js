import css from '!!raw-loader!./workspace.element.css'; 
import html from '!!raw-loader!./workspace.element.html'; 

import "../taskbar"
import {WWindow} from "../window"

const template = document.createElement("template");
template.innerHTML = html;

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(css)

const observerProp = Symbol("Observer")


// Select the node that will be observed for mutations
const targetNode = document.getElementById('some-id');

// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {

    const mutationToTriggerUpdate = mutationsList.find(
        ({type, target}) => type === 'childList' && target instanceof Workspace
    )
    mutationToTriggerUpdate && mutationToTriggerUpdate.target.updateTaskbar();
};



export class Workspace extends HTMLElement {


    constructor(...args){
        super(...args);
        // Create a shadow root
        var shadow = this.attachShadow({mode: 'open'});
        const node = document.importNode(template.content, true)
        // Create some CSS to apply to the shadow dom
        var style = document.createElement('style');
        style.textContent = css 
        // CSS truncated for brevity
        // attach the created elements to the shadow dom
        shadow.appendChild(style);
        for(const child of node.children){
            shadow.appendChild(child);
        }
        this.taskbar = shadow.querySelector(".workspace__taskbar")
        shadow.addEventListener("taskbar__add-window", () => {
            const newWindow = new WWindow();
            newWindow.innerHTML = "banana";
            this.appendChild(newWindow);
        })
    }

    

    updateTaskbar(){
        const {taskbar} = this;
        taskbar.innerHTML = "";
        for(const child of this.children){
            if(child instanceof WWindow){
                const button = document.createElement("button")
                
                button.innerHTML = "aaa";
                button.addEventListener("click", () => {
                    child.toggleMinimize();
                })
                taskbar.appendChild(button);
            }
        }
    }
    

    connectedCallback(){
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(this, config);

        this[observerProp] = observer;
        this.updateTaskbar();
    }

    disconnectedCallback(){
        this[observerProp] &&  this[observerProp].disconnect();
        this[observerProp] = null;
    }
}

customElements.define("wwin-workspace", Workspace);