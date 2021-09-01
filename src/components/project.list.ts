import Template from "./template";
import ProjectItem from "./project.item";
import AutoBind from "../decorators/AutoBind";
import { DropTarget } from "../models/dragDrop";
import projectState from "../state/projectState";
import { Project, ProjectStatus } from "../models/project";

export default class ProjectList
  extends Template<HTMLDivElement, HTMLElement>
  implements DropTarget
{
  assignedProjects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dropHandler(e: DragEvent): void {
    const movedProjectId = e.dataTransfer!.getData("text/plain");
    projectState.update(
      movedProjectId,
      this.type == ProjectStatus.Active
        ? ProjectStatus.Active
        : ProjectStatus.Finished
    );
  }
  @AutoBind
  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer.types[0] == "text/plain") {
      e.preventDefault();
      const listElement = this.element.querySelector("ul")!;
      listElement.classList.add("droppable");
    }
  }
  @AutoBind
  dragLeaveHandler(_e: DragEvent): void {
    const listElement = this.element.querySelector("ul")!;
    listElement.classList.remove("droppable");
  }

  renderProjects(status: ProjectStatus) {
    const listElement = document.getElementById(
      `${this.type}-project-list`
    )! as HTMLUListElement;
    listElement.innerHTML = "";

    const relevantProjects = this.assignedProjects.filter(
      (p) => p.status == status
    );
    for (let project of relevantProjects) {
      const listItem = new ProjectItem({ ...project });

      listItem.renderContent();
    }
  }

  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type
      .toString()
      .toUpperCase()} PROJECTS`;
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects(this.type);
    });
  }
}
