import {Component} from '@angular/core';
import 'brace';
import 'brace/mode/text';
import 'brace/theme/github';
import 'brace/theme/monokai.js';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private snackBar: MatSnackBar) {
  }
  title = 'arraythis';
  value: string = "";
  array: any[] = [];
  arraySql: string = "";
  arrayRaw: string = "";
  checked: boolean = false;
  skipNumber: boolean = false;
  trimSpaces: boolean = false;
  sqlQuotes: 'single' | 'double' = 'double';

  toArray() {
    if (!this.value) {
      this.array = [];
      this.arrayRaw = "";
      this.arraySql = "";
      return;
    }

    const lines = this.value.split('\n');
    const processedLines: any[] = [];

    for (let item of lines) {
      if (this.trimSpaces) {
        item = item.trim();
      }
      if (this.checked && item === "") {
        continue;
      }
      
      let parsedItem: string | number = item;
      // Convert to number if it's not empty, doesn't contain just spaces, and is a valid number
      if (!this.skipNumber && item.trim() !== "" && !isNaN(Number(item))) {
         parsedItem = Number(item);
      }
      processedLines.push(parsedItem);
    }

    this.array = processedLines;
    
    // Raw
    this.arrayRaw = processedLines.join(', ');
    
    // SQL
    const quote = this.sqlQuotes === 'single' ? "'" : '"';
    const sqlItems = processedLines.map(item => {
      if (typeof item === 'number') {
        return item.toString();
      } else {
        return `${quote}${item}${quote}`;
      }
    });
    this.arraySql = sqlItems.length > 0 ? `(${sqlItems.join(', ')})` : '';
  }

  selectedTab: 'raw' | 'ts' | 'sql' = 'raw';

  protected readonly JSON = JSON;

  getCurrentOutput(): string {
    if (this.selectedTab === 'raw') return this.arrayRaw;
    if (this.selectedTab === 'ts') return this.array.length > 0 ? JSON.stringify(this.array) : '';
    return this.arraySql;
  }

  IgnoreSpace($event: any) {
    this.checked = $event.checked;
    this.toArray();
  }

  IgnoreNumber($event: any) {
    this.skipNumber = $event.checked;
    this.toArray();
  }

  ToggleTrim($event: any) {
    this.trimSpaces = $event.checked;
    this.toArray();
  }

  ToggleSqlQuotes($event: any) {
    this.sqlQuotes = $event.checked ? 'single' : 'double';
    this.toArray();
  }

  clearEditor() {
    this.value = '';
    this.toArray();
  }

  protected copyToClipboard() {
    this.snackBar.open("Copied to clipboard", "Close", {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }
}
