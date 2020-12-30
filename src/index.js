import {Workspace} from "./components/workspace"
import "./main.css"

const workspace = new Workspace();

workspace.classList.add("wwin-workspace--fullscreen");
workspace.innerHTML = `
<wwin-window x="30" y="50" w="300" h="150"><div>test</div></wwin-window>
<wwin-window x="230" y="150" w="300" h="150"><div>nanana</div></wwin-window>
`
document.body.appendChild(workspace);