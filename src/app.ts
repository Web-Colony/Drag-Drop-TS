import { ProjectStatus } from "./models/project.js";
import ProjectList from "./components/project.list.js";
import ProjectFormInput from "./components/project.input.js";

new ProjectFormInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
