import { RouterModule, Routes } from '@angular/router';
import { TodoComponent } from '../todo/todo.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: 'todo', component: TodoComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
