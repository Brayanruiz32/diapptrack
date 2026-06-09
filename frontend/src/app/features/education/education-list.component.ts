import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EducationService } from '../../core/services/education.service';
import { EducationContent, TOPIC_LABELS, Topic } from '../../core/models/education.model';

@Component({
  selector: 'app-education-list',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatChipsModule, MatProgressSpinnerModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/home"><mat-icon>arrow_back</mat-icon></button>
      <span>Educación</span>
    </mat-toolbar>

    <div class="page-container">
      <!-- Filtro por tema -->
      <mat-chip-listbox class="mb-16" style="display:flex;flex-wrap:wrap;gap:8px">
        <mat-chip-option (click)="filterTopic(undefined)" [selected]="!selectedTopic">Todos</mat-chip-option>
        <mat-chip-option *ngFor="let t of topics" (click)="filterTopic(t.value)" [selected]="selectedTopic===t.value">
          {{ t.label }}
        </mat-chip-option>
      </mat-chip-listbox>

      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <div *ngIf="!loading && articles.length === 0" class="empty-state">
        <mat-icon>menu_book</mat-icon>
        <p>Sin contenido disponible</p>
      </div>

      <div class="card-list">
        <a *ngFor="let a of articles" [routerLink]="['/education', a.id]" style="text-decoration:none">
          <mat-card style="cursor:pointer" [style.opacity]="a.read ? 0.75 : 1">
            <mat-card-content style="padding:12px 16px">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <mat-icon style="color:#0277bd;margin-top:2px;flex-shrink:0">
                  {{ a.type === 'ARTICLE' ? 'article' : 'lightbulb' }}
                </mat-icon>
                <div style="flex:1">
                  <div style="font-weight:500;font-size:15px;line-height:1.3">{{ a.title }}</div>
                  <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;align-items:center">
                    <span style="background:#e3f2fd;color:#0277bd;border-radius:6px;padding:2px 8px;font-size:11px">
                      {{ topicLabel(a.topic) }}
                    </span>
                    <span *ngIf="a.read" class="badge-normal" style="font-size:11px">✓ Leído</span>
                    <span *ngIf="!a.read" class="badge-high" style="font-size:11px">Nuevo</span>
                  </div>
                </div>
                <mat-icon style="color:rgba(0,0,0,.3)">chevron_right</mat-icon>
              </div>
            </mat-card-content>
          </mat-card>
        </a>
      </div>

      <div *ngIf="!lastPage && !loading" class="text-center mt-16">
        <button mat-stroked-button (click)="loadMore()" [disabled]="loadingMore">
          {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
        </button>
      </div>
    </div>
  `
})
export class EducationListComponent implements OnInit {
  private svc = inject(EducationService);

  articles    : EducationContent[] = [];
  loading      = true;
  loadingMore  = false;
  lastPage     = false;
  page         = 0;
  selectedTopic: Topic | undefined;

  topics = Object.entries(TOPIC_LABELS).map(([value, label]) => ({ value: value as Topic, label }));

  ngOnInit() { this.load(); }

  filterTopic(topic: Topic | undefined) {
    this.selectedTopic = topic;
    this.articles = [];
    this.page     = 0;
    this.lastPage = false;
    this.loading  = true;
    this.load();
  }

  load() {
    this.svc.getAll(this.page, 20, this.selectedTopic).subscribe({
      next: res => {
        this.articles   = [...this.articles, ...res.content];
        this.lastPage   = res.last;
        this.loading    = this.loadingMore = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMore() { this.loadingMore = true; this.page++; this.load(); }
  topicLabel(t: string) { return TOPIC_LABELS[t as Topic] ?? t; }
}
