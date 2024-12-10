import { Time } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
export interface Task {
  id: string;
  title: string;
  description: string;
  date?: string | Date | null;
  time: Time | null;
  status: boolean;
  repeat: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private api = 'http://192.168.0.16:3000/taks';
  private tasks: Task[] = [];
  private orderCriterion: string = 'semordem';

  constructor(private http: HttpClient) {}

  setOrderCriterion(criterion: string) {
    this.orderCriterion = criterion;
    localStorage.setItem('orderCriterion', criterion);
  }

  getOrderCriterion(): string {
    return localStorage.getItem('orderCriterion') || this.orderCriterion;
  }
  getTaskCount(): Observable<number> {
    return this.http.get<any[]>(this.api).pipe(
      map((tasks => tasks.length) // Retorna a quantidade de tarefas
    ));
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.api);
  }

  addTask(task: Task): Observable<Task> {
    task.id = uuidv4();
    this.tasks.push(task);
    return this.http.post<Task>(this.api, task);
  }

  updateTask(task: Task): Observable<Task> {
    const index = this.tasks.findIndex(i => i.id === task.id);
    if (index !== -1) {
      this.tasks[index] = task;
    }
    return this.http.put<Task>(`${this.api}/${task.id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    this.tasks = this.tasks.filter(task => task.id !== id);
    return this.http.delete<void>(`${this.api}/${id}`)
  }
}

