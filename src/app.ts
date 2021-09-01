/// <reference path="utils/validation.ts" />
/// <reference path="models/project.ts" />
/// <reference path="models/dragDrop.ts" />
/// <reference path="state/projectState.ts" />
/// <reference path="decorators/AutoBind.ts" />
/// <reference path="components/template.ts" />
/// <reference path="components/project.item.ts" />
/// <reference path="components/project.list.ts" />
/// <reference path="components/project.input.ts" />

namespace App {
  new ProjectFormInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);
}
