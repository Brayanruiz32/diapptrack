import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EducationService } from '../../core/services/education.service';
import { EducationContent, TOPIC_LABELS, Topic } from '../../core/models/education.model';

@Component({
  selector: 'app-education-detail',
  standalone: true,
  imports: [CommonModule, RouterLink,
            MatToolbarModule, MatCardModule, MatIconModule,
            MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <button mat-icon-button routerLink="/education"><mat-icon>arrow_back</mat-icon></button>
      <span>Contenido educativo</span>
    </mat-toolbar>

    <div class="page-container">
      <div *ngIf="loading" class="text-center mt-24">
        <mat-spinner diameter="48" style="margin:0 auto"></mat-spinner>
      </div>

      <mat-card *ngIf="!loading && article">
        <img *ngIf="article.imageUrl" [src]="svc.imageUrl(article.imageUrl)" alt=""
             style="width:100%;max-height:240px;object-fit:cover;border-radius:8px 8px 0 0">
        <mat-card-content style="padding:20px">
          <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
            <span style="background:#e3f2fd;color:#0277bd;border-radius:6px;padding:2px 10px;font-size:12px">
              {{ topicLabel(article.topic) }}
            </span>
            <span style="background:#f3e5f5;color:#7b1fa2;border-radius:6px;padding:2px 10px;font-size:12px">
              {{ article.type === 'ARTICLE' ? 'Artículo' : 'Consejo' }}
            </span>
            <span *ngIf="article.readingTimeMinutes" style="background:#e8f5e9;color:#2e7d32;border-radius:6px;padding:2px 10px;font-size:12px">
              ⏱ {{ article.readingTimeMinutes }} min de lectura
            </span>
            <span *ngIf="article.read" class="badge-normal">✓ Leído</span>
          </div>

          <h2 style="margin:0 0 16px;font-size:20px;line-height:1.3">{{ article.title }}</h2>

          <p style="line-height:1.7;color:rgba(0,0,0,.8);white-space:pre-wrap">{{ article.body }}</p>

          <div style="margin-top:16px;font-size:12px;color:rgba(0,0,0,.38)">
            Publicado: {{ article.publishedAt | date:'dd/MM/yyyy' }}
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class EducationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  svc           = inject(EducationService);

  article : EducationContent | null = null;
  loading  = true;

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next:  a => { this.article = a; this.loading = false; },
      error: () => this.loading = false
    });
  }

  topicLabel(t: string) { return TOPIC_LABELS[t as Topic] ?? t; }
}
