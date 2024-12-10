import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Task, TodoService } from '../service/todo.service';
@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [TodoService],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})

export class TodoComponent {
  tasks: Task[] = [];
  completed: Task[] = [];
  nowdate: Date | undefined;
  filteredTasks: Task[] = [];
  completedTasks: Task[] = [];
  editedTask: Task | null = null;

  r: boolean = false;
  hide: boolean = true;
  select: boolean = false;
  darkmode: boolean = false;
  openOrder: boolean = false;
  taskSelected: boolean = false;

  remove = "";
  repitition: string = '';
  criterio: string = 'semordem';

  newTask: Task = {
    id: '',
    title: '',
    description: '',
    date: null,
    time: null,
    status: false,
    repeat: ''
  }

  constructor(private readonly todoService: TodoService, private readonly cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.nowdate = new Date();
    this.loadTasks();
    document.documentElement.setAttribute('data-theme', 'light');

  }
  shouldShowRemoveButton(): boolean {
    this.remove = "Remover data de conclusão";
    return !!(this.newTask.date || this.newTask.time);
  }
  order(lista: Task[], criterio: 'title' | 'date'): void {
    lista.sort((a, b) => {
      let valorA: string | number = 0;
      let valorB: string | number = 0;

      if (criterio === 'date') {
        const dataA = a.date ? new Date(a.date).getTime() : null;
        const dataB = b.date ? new Date(b.date).getTime() : null;

        if (dataA === null && dataB === null) return 0;
        if (dataA === null) return 1;
        if (dataB === null) return -1;

        return dataA - dataB;
      } else if (criterio === 'title') {
        valorA = a.title ? a.title.toLowerCase() : '';
        valorB = b.title ? b.title.toLowerCase() : '';

        if (valorA > valorB) return 1;
        if (valorA < valorB) return -1;
        return 0;
      }

      return 0;
    });
  }
  clearFields() {
    const clearfields = document.getElementById('id-clear-fields') as HTMLImageElement;
    if (clearfields) {
      clearfields.src = this.darkmode ? "assets/x-dark.png" : "assets/x.png";
    }
    return (this.taskSelected === true || this.select === true) && (this.newTask.title || this.newTask.description || this.newTask.date || this.newTask.time)
  }
  atributeOrderTasks(criterion: 'title' | 'date' | 'semordem') {
    this.criterio = criterion;
    this.todoService.setOrderCriterion(criterion);
    if (criterion === 'title') {
      this.order(this.filteredTasks, 'title');
      this.order(this.completed, 'title');
    } else if (criterion === 'date') {
      this.order(this.filteredTasks, 'date');
      this.order(this.completed, 'date');
    } else if (criterion === 'semordem') {
      this.loadTasks();
    }
  }

  clearTime() {
    this.newTask.date = null;
    this.newTask.time = null;
    this.newTask.repeat = '';
  }

  toggleMenu() {
    this.openOrder = !this.openOrder;
  }

  hidetask() {
    this.hide = !this.hide;
    this.loadTasks();

    const hidetask = document.getElementById('hidetask') as HTMLImageElement;
    if (this.darkmode) {
      hidetask.src = this.hide ? "assets/seta-direita-dark.png" : "assets/seta-para-baixo-dark.png";

    } else if (!this.darkmode) {
      hidetask.src = this.hide ? "assets/seta-direita.png" : "assets/seta-para-baixo.png";
    }

  }

  loadTasks() {
    this.todoService.getTasks().subscribe(task => {
      this.tasks = task;
      this.filteredTasks = this.tasks.filter(task => !task.status);
      this.completedTasks = this.tasks.filter(task => task.status);

      if (this.hide === false) {
        this.completed = this.completedTasks;
      } else {
        this.completed = [];
      }

      const savedCriterion = this.todoService.getOrderCriterion();
      if (savedCriterion !== 'semordem') {
        this.atributeOrderTasks(savedCriterion as 'title' | 'date');
      }
    });


  }
  toggleMenuRepeat(classification: number) {
    if (classification === 1) {
      this.newTask.repeat = 'diariamente';
    } else if (classification === 2) {
      this.newTask.repeat = 'semanalmente';
    } else if (classification === 3) {
      this.newTask.repeat = 'mensalmente';
    } else if (classification === 4) {
      this.newTask.repeat = 'anualmente';
    } else if (classification === 5) {
      this.newTask.repeat = '';
    }
    this.repitition === this.newTask.repeat;
    this.modeRepeatToggle();

  }
  modetoggle() {
    this.darkmode = !this.darkmode;

    document.documentElement.setAttribute('data-theme', this.darkmode ? "dark" : "light");
    const modeIcon = document.getElementById('mode-icon') as HTMLImageElement;
    if (modeIcon) {
      modeIcon.src = this.darkmode ? "assets/mode-light.png" : "assets/mode-dark.png";
    }

    const uppage = document.getElementById('id-up-page') as HTMLImageElement;
    if (uppage) {
      uppage.src = this.darkmode ? "assets/atualizar-dark.png" : "assets/atualizar.png";
    }

    const repitition = document.getElementById('id-repeat') as HTMLImageElement;
    if (repitition) {
      repitition.src = this.darkmode ? "assets/repeat-dark.png" : "assets/repeat.png";
    }

    const classifications = document.getElementById('id-classifications') as HTMLImageElement;
    if (classifications) {
      classifications.src = this.darkmode ? "assets/ordenar-dark.png" : "assets/ordenar.png";
    }
    const completedTask = document.getElementById('hidetask') as HTMLImageElement;
    if (completedTask) {
      completedTask.src = this.darkmode ? "assets/seta-direita-dark.png" : "assets/seta-direita.png";
    }
    this.cdr.detectChanges();
  }

  modeRepeatToggle() {
    this.r = !this.r;
    this.cdr.detectChanges();
  }

  reT(task: Task) {
    this.newTask = { ...task };

    if (this.newTask.repeat) {
      this.repeatTask();
      this.newTask.id = '';
      this.addTask();
    }
  }
  repeatTask() {
    const dateTask = new Date(this.newTask.date + 'T00:00:00');

    const newDateTask = new Date(dateTask);

    if (this.newTask.repeat === 'diariamente') {
      newDateTask.setDate(newDateTask.getDate() + 1);

    } else if (this.newTask.repeat === 'semanalmente') {
      newDateTask.setDate(newDateTask.getDate() + 7);

    } else if (this.newTask.repeat === 'mensalmente') {
      newDateTask.setMonth(newDateTask.getMonth() + 1);

    } else if (this.newTask.repeat === 'anualmente') {
      newDateTask.setFullYear(newDateTask.getFullYear() + 1);
    } else {
    }
    const formattedDate = newDateTask.toISOString().split('T')[0];

    this.newTask.date = formattedDate;
  }
  toggleStatus(task: Task) {
    task.status = !task.status;
    this.todoService.updateTask(task).subscribe(() => {
      if (task.status) {
        this.filteredTasks = this.filteredTasks.filter(t => t.id !== task.id);
        this.completedTasks.push(task);
      } else {
        this.completedTasks = this.completedTasks.filter(t => t.id !== task.id);
        this.filteredTasks.push(task);
        this.hide === false;
      }
    });
    this.loadTasks();
    this.clear();
  }
  editTask(task: Task) {
    this.editedTask = { ...task };
    this.newTask = { ...task };
  }
  save() {
    if (this.newTask.date === null || (this.newTask.date === null && this.newTask.time)) {
      this.newTask.repeat = '';
    }
    if (this.taskSelected) {
      this.updateTask();
    } else {
      this.addTask();
    }
    this.clear();
    this.remove = "";
  }

  selected(task: Task) {
    this.editTask(task);
    this.taskSelected = true;
    const s = this.taskSelected;
    this.remove = "Remover data de conclusão";
    return s;
  }

  clear() {
    this.newTask = {
      id: '',
      title: '',
      description: '',
      date: null,
      time: null,
      status: false,
      repeat: ''
    }
    this.taskSelected = false;
    this.r = false

  }
  addTask() {

    if (this.newTask.title && this.newTask.title.trim() !== '') {
      this.todoService.addTask(this.newTask).subscribe(task => {
        this.tasks.push(task);
        this.loadTasks();
      });

    } else {
      alert("Insira o título da tarefa.")
    }
  }
  updateTask() {
    this.editedTask = this.newTask;
    if (this.newTask) {
      this.todoService.updateTask(this.editedTask).subscribe(task => {
        const index = this.tasks.findIndex(i => i.id === task.id);
        if (index !== -1) this.tasks[index] = task;
        this.editedTask = null;
        this.loadTasks();
        this.clear();

      });
    }
  }
  deleteTask(id: string) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      this.todoService.deleteTask(id).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.loadTasks();
        this.clear();
      });
    }

  }
}
