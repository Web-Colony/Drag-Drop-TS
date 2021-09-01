/// <reference path="models/project.ts" />
/// <reference path="components/project.list.ts" />
/// <reference path="components/project.input.ts" />

namespace App {
  new ProjectFormInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);
}
