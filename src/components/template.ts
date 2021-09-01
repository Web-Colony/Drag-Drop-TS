namespace App {
  export abstract class Template<T extends HTMLElement, U extends HTMLElement> {
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
}
