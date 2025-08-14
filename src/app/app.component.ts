import {Component} from '@angular/core';
import 'brace';
import 'brace/mode/text';
import 'brace/theme/github';
import 'brace/theme/monokai.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'arraythis';
  value: string = "";
  array: any[] = [];
  arraySql: string = "";
  arrayRaw: string = "";
  checked: any;
  skipNumber: boolean = false;

  toArray(){
    this.array = [];
    this.value.split('\n').forEach(item => {
      if( this.checked && item === "") { return }
      if (isNaN(parseInt(item)) || this.skipNumber) {
        this.array.push(item);
      } else {
        this.array.push(parseInt(item))
      }
    });
    this.toArraySql()
    this.toArrayRaw()
  }

  toArrayRaw(){
    this.arrayRaw = '';
    const total = this.value.split('\n').length
    this.value.split('\n').forEach((item, i) => {
      if(this.checked && item === "") { return }
      if(i+1 < total) {
        this.arrayRaw += item + ", ";
      }else{
        this.arrayRaw += item + "";
      }
    });
  }

  toArraySql(){
    this.arraySql = '';
    this.arraySql += `(`;
    const total = this.value.split('\n').length
    this.value.split('\n').forEach((item, i) => {
      if(this.checked && item === "") { return }
      if(i+1 < total) {
        if (isNaN(parseInt(item)) || this.skipNumber) {
          this.arraySql += `"${item}", `;
        } else {
          this.arraySql += `${item}, `;
        }
      }else {
        if (isNaN(parseInt(item)) || this.skipNumber) {
          this.arraySql += `"${item}" )`;
        } else {
          this.arraySql += `${item} )`;
        }
      }
    });
  }

  protected readonly JSON = JSON;


  IgnoreSpace($event: any) {
    this.checked = $event.checked;
    this.toArray()
  }

  IgnoreNumber($event: any) {
    this.skipNumber = $event.checked;
    console.log(this.skipNumber)
    this.toArray()
  }
}
