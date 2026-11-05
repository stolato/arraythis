import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import 'brace';
import 'brace/mode/text';
import 'brace/theme/github';
import 'brace/theme/monokai.js';

type Tab = 'raw' | 'ts' | 'sql';
type Theme = 'light' | 'dark';

/** Wails injects `window.runtime` into the page; absent in the web build. */
interface WailsRuntime {
  WindowToggleMaximise(): void;
}
declare global {
  interface Window {
    runtime?: WailsRuntime;
  }
}

const THEME_STORAGE_KEY = 'arraythis-theme';
const THEME_BAR_COLORS: Record<Theme, string> = {dark: '#111113', light: '#fafafa'};

// Inputs up to this size are processed on every keystroke; larger ones are debounced
const INSTANT_INPUT_LIMIT = 20_000;
const INPUT_DEBOUNCE_MS = 150;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'arraythis';
  value = '';
  array: (string | number)[] = [];
  arrayRaw = '';
  arrayTs = '';
  arraySql = '';
  currentOutput = '';

  checked = false;
  skipNumber = false;
  trimSpaces = false;
  sqlQuotes: 'single' | 'double' = 'double';
  selectedTab: Tab = 'raw';

  copied = false;
  theme: Theme = 'dark';

  /**
   * Desktop app on macOS: the title bar is hidden (TitleBarHiddenInset) and the
   * native traffic lights sit on top of our header, which becomes the drag area.
   */
  @HostBinding('class.desktop-mac')
  readonly isDesktopMac = !!window.runtime && /Mac/.test(navigator.userAgent);

  /** Touch devices get a native textarea: better keyboard, paste and selection than Ace. */
  readonly useNativeEditor = matchMedia('(pointer: coarse)').matches;

  private inputTimer?: ReturnType<typeof setTimeout>;
  private copiedTimer?: ReturnType<typeof setTimeout>;
  private readonly systemDark = matchMedia('(prefers-color-scheme: dark)');
  private readonly onSystemThemeChange = () => {
    if (!this.storedTheme()) {
      this.theme = this.systemTheme();
      this.cdr.markForCheck();
    }
  };

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.theme = this.storedTheme() ?? this.systemTheme();
    this.systemDark.addEventListener('change', this.onSystemThemeChange);
  }

  ngOnDestroy() {
    clearTimeout(this.inputTimer);
    clearTimeout(this.copiedTimer);
    this.systemDark.removeEventListener('change', this.onSystemThemeChange);
  }

  get itemCountLabel(): string {
    return this.array.length === 1 ? '1 item' : `${this.array.length} itens`;
  }

  onInput(value: string) {
    this.value = value;
    clearTimeout(this.inputTimer);
    if (value.length <= INSTANT_INPUT_LIMIT) {
      this.toArray();
      return;
    }
    this.inputTimer = setTimeout(() => {
      this.toArray();
      this.cdr.markForCheck();
    }, INPUT_DEBOUNCE_MS);
  }

  toArray() {
    if (!this.value) {
      this.array = [];
      this.arrayRaw = '';
      this.arrayTs = '';
      this.arraySql = '';
      this.updateCurrentOutput();
      return;
    }

    const processedLines: (string | number)[] = [];

    for (let item of this.value.split('\n')) {
      if (this.trimSpaces) {
        item = item.trim();
      }
      if (this.checked && item === '') {
        continue;
      }
      // Convert to number if it's not blank and is a valid number
      if (!this.skipNumber && item.trim() !== '' && !isNaN(Number(item))) {
        processedLines.push(Number(item));
      } else {
        processedLines.push(item);
      }
    }

    this.array = processedLines;
    this.arrayRaw = processedLines.join(', ');
    this.arrayTs = processedLines.length > 0 ? JSON.stringify(processedLines) : '';

    const quote = this.sqlQuotes === 'single' ? "'" : '"';
    const sqlItems = processedLines.map(item =>
      typeof item === 'number' ? item.toString() : `${quote}${item}${quote}`
    );
    this.arraySql = sqlItems.length > 0 ? `(${sqlItems.join(', ')})` : '';

    this.updateCurrentOutput();
  }

  selectTab(tab: Tab) {
    this.selectedTab = tab;
    this.updateCurrentOutput();
  }

  private updateCurrentOutput() {
    this.currentOutput =
      this.selectedTab === 'raw' ? this.arrayRaw :
      this.selectedTab === 'ts' ? this.arrayTs :
      this.arraySql;
  }

  IgnoreSpace($event: { checked: boolean }) {
    this.checked = $event.checked;
    this.toArray();
  }

  IgnoreNumber($event: { checked: boolean }) {
    this.skipNumber = $event.checked;
    this.toArray();
  }

  ToggleTrim($event: { checked: boolean }) {
    this.trimSpaces = $event.checked;
    this.toArray();
  }

  ToggleSqlQuotes($event: { checked: boolean }) {
    this.sqlQuotes = $event.checked ? 'single' : 'double';
    this.toArray();
  }

  clearEditor() {
    clearTimeout(this.inputTimer);
    this.value = '';
    this.toArray();
  }

  onCopied(success: boolean) {
    if (!success) return;
    this.copied = true;
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  /** Double-clicking the title area zooms the window, like a native macOS title bar. */
  onHeaderDoubleClick(event: MouseEvent) {
    if (!this.isDesktopMac) return;
    if ((event.target as HTMLElement).closest('button, .item-badge')) return;
    window.runtime?.WindowToggleMaximise();
  }

  // ---- Theme ----

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    } catch {
      // Storage unavailable (private mode): theme still applies for this session
    }
    document.documentElement.dataset['theme'] = this.theme;
    document.querySelectorAll('meta[name="theme-color"]')
      .forEach(meta => meta.setAttribute('content', THEME_BAR_COLORS[this.theme]));
  }

  private systemTheme(): Theme {
    return this.systemDark.matches ? 'dark' : 'light';
  }

  private storedTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }
}
