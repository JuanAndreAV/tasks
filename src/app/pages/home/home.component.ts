import { Component,Injector, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Task } from 'src/app/models/task.model';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  tasks = signal<Task[]>([]);

  filter = signal<"all"|"pending"|"completed">('all' );
  tasksByFilter = computed(()=> {
    const filter = this.filter();
    const tasks = this.tasks();
    if(filter === 'pending'){
      return tasks.filter(task => !task.completed)
    }
    if(filter === 'completed'){
      return tasks.filter(task => task.completed)
    }
    return tasks;
  })

  newTaskCtrl = new FormControl('',{
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(4)
    ]
  });

  injector = inject(Injector)

 

  ngOnInit(){
    const storage = localStorage.getItem('tasks');
    if (storage){
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks)
    }
    this.trackTasks();
  }

  trackTasks(){
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }, {injector: this.injector});
  }

  //agregar tarea
  changeHandler(){
    //const input = event.target as HTMLInputElement;
    //const newTasks = input.value;
    if (this.newTaskCtrl.valid){
      const value = this.newTaskCtrl.value.trim();
      if (value !== ''){
        this.addTask(value);
        this.newTaskCtrl.setValue('')
      }
    }
  }

  addTask(title:string){
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
      hour: this.reloj()
    };
    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  //eliminar tarea
  deleteTask(index: number){
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
  }

  updateTask(index: number) {
    /*this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            completed: !task.completed
          }
        }
        return task;
      })
    })
    */
    this.tasks.mutate(state =>{
      const currentTask = state[index];
      state[index] = {
        ...currentTask,
        completed: !currentTask.completed
      }
    })
  }

  
  updateTaskEditingMode(index: number){
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            editing: true
          }
        }
        return {
          ...task,
          editing: false
        };
      })
    })
  }

  updateTaskText(index: number, event: Event){
    const input = event.target as HTMLInputElement;
    this.tasks.update(prevState => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }
       return task;
      })
    });
  }
  changeFilter(filter: "all"|"pending"|"completed"){
    this.filter.set(filter)
  }


  reloj(){
    const now = new Date()
    const hora = now.getHours()
    const  minutos = now.getMinutes()
    const segundos = now.getSeconds()
    var newhour;
    var newminutes;
    var newseconds;

    if (hora < 10){
      newhour = "0"+hora
    }
    else{
      newhour=hora
    }

    if (minutos < 10){
      newminutes = "0"+minutos
    }
    else{
      newminutes = minutos
    }
    if (segundos < 10 ){
      newseconds = "0"+segundos
    } 
    else{
      newseconds = segundos
    }

    const mostrarHora = `${newhour}: ${newminutes}: ${newseconds}`
    
    setInterval(this.reloj
      , 1000)
    return mostrarHora
  }
 
  
  
}
