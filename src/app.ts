import { ProjectStatus } from "./models/project";
import ProjectList from "./components/project.list";
import ProjectFormInput from "./components/project.input";

new ProjectFormInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);
