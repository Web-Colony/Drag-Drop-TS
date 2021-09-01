interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable) => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
};

interface Draggable {
  dragStartHandler(e: DragEvent): void;
  dragEndHandler(e: DragEvent): void;
}

interface DropTarget {
  dropHandler(e: DragEvent): void;
  dragOverHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

abstract class Template<T extends HTMLElement, U extends HTMLElement> {
  element: U;
  hostElement: T;
  templateElement: HTMLTemplateElement;

  constructor(
    templateId: string,
    hostId: string,
    insertAtStart: boolean,
    elementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (elementId) this.element.id = elementId;

    this.attach(insertAtStart);
  }

  abstract renderContent(): void;
  abstract configure(): void;

  protected attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

const AutoBind = (
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
};

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  static getInstance(): ProjectState {
    if (this.instance) {
      return this.instance;
    } else {
      this.instance = new ProjectState();
      return this.instance;
    }
  }

  add(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.notifyListeners();
  }

  notifyListeners() {
    for (let listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
  update(id: string, newStatus: ProjectStatus) {
    const selectedProject = this.projects.find((p) => p.id === id);
    if (selectedProject && selectedProject.status !== newStatus) {
      selectedProject.status = newStatus;
      this.notifyListeners();
    }
  }
}

const projectState = ProjectState.getInstance();

enum ProjectStatus {
  Active = "active",
  Finished = "finished",
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

class ProjectFormInput extends Template<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.configure();

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.peopleInputElement.value = "";
    this.descriptionInputElement.value = "";
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.add(title, desc, people);
      this.clearInputs();
    }
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}
}

class ProjectList
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

class ProjectItem
  extends Template<HTMLDivElement, HTMLLIElement>
  implements Draggable
{
  private projectInfo: Project;

  get persons() {
    const { people } = this.projectInfo;
    return people > 1 ? `${people} Persons` : "1 Person";
  }

  constructor(projectInfo: Project) {
    super(
      "single-project",
      `${projectInfo.status}-project-list`,
      false,
      projectInfo.id
    );
    this.projectInfo = projectInfo;

    this.configure();
  }

  @AutoBind
  dragStartHandler(e: DragEvent): void {
    e.dataTransfer!.setData("text/plain", this.projectInfo.id);
    e.dataTransfer!.effectAllowed = "move";
  }
  @AutoBind
  dragEndHandler(_e: DragEvent): void {
    console.log("drag end");
  }

  renderContent() {
    const { title, description } = this.projectInfo;
    this.element.querySelector("h2")!.textContent = title;
    this.element.querySelector("p")!.textContent = description;
    this.element.querySelector("h3")!.textContent = `${this.persons} Assigned`;
  }
  configure() {
    this.element.draggable = true;
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
}

const prjInput = new ProjectFormInput();
const active = new ProjectList(ProjectStatus.Active);
const finished = new ProjectList(ProjectStatus.Finished);
