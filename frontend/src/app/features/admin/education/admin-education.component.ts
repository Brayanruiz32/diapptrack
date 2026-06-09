import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EducationService } from '../../../core/services/education.service';
import { EducationContent, TOPIC_LABELS, Topic } from '../../../core/models/education.model';

@Component({
  selector: 'app-admin-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
            MatCardModule, MatFormFieldModule, MatInputModule,
            MatSelectModule, MatButtonModule, MatIconModule,
            MatDividerModule, MatSnackBarModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="margin:0">Contenido Educativo</h2>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start" class="edu-grid">
      <!-- Lista -->
      <div>
        <div *ngFor="let a of articles" style="margin-bottom:10px">
          <mat-card>
            <mat-card-content style="padding:12px 16px">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <img *ngIf="a.imageUrl" [src]="svc.imageUrl(a.imageUrl)" alt=""
                     style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">
                <div style="flex:1">
                  <div style="font-weight:500;font-size:14px">{{ a.title }}</div>
                  <div class="text-muted" style="font-size:12px">
                    {{ topicLabel(a.topic) }} · {{ a.type === 'ARTICLE' ? 'Artículo' : 'Consejo' }}
                    <span *ngIf="a.readingTimeMinutes"> · ⏱ {{ a.readingTimeMinutes }} min</span>
                  </div>
                </div>
                <button mat-icon-button (click)="edit(a)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="delete(a)"><mat-icon>delete</mat-icon></button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
        <div *ngIf="articles.length === 0" class="empty-state">
          <mat-icon>menu_book</mat-icon>
          <p>Sin contenido creado</p>
        </div>
      </div>

      <!-- Formulario -->
      <mat-card>
        <mat-card-header>
          <mat-card-title style="font-size:16px">{{ editingId ? 'Editar' : 'Nuevo' }} contenido</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()" class="form-container">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input matInput formControlName="title">
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contenido</mat-label>
              <textarea matInput formControlName="body" rows="6"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo</mat-label>
              <mat-select formControlName="type">
                <mat-option value="ARTICLE">Artículo</mat-option>
                <mat-option value="TIP">Consejo</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tema</mat-label>
              <mat-select formControlName="topic">
                <mat-option *ngFor="let t of topics" [value]="t.value">{{ t.label }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tiempo estimado de lectura</mat-label>
              <input matInput type="number" formControlName="readingTimeMinutes" min="1" max="240">
              <span matTextSuffix>min</span>
            </mat-form-field>

            <!-- Imagen -->
            <div class="img-upload">
              <div class="img-preview" *ngIf="previewUrl || currentImageUrl">
                <img [src]="previewUrl || currentImageUrl" alt="Vista previa">
              </div>
              <button mat-stroked-button type="button" (click)="fileInput.click()">
                <mat-icon>image</mat-icon> {{ (previewUrl || currentImageUrl) ? 'Cambiar imagen' : 'Subir imagen' }}
              </button>
              <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)">
              <span *ngIf="selectedFile" class="text-muted" style="font-size:12px">{{ selectedFile.name }}</span>
            </div>

            <div style="display:flex;gap:8px;margin-top:8px">
              <button mat-raised-button color="primary" type="submit" style="flex:1" [disabled]="form.invalid || saving">
                {{ saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Publicar') }}
              </button>
              <button *ngIf="editingId" mat-stroked-button type="button" (click)="cancelEdit()">Cancelar</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    @media(max-width:700px) { .edu-grid { grid-template-columns: 1fr !important; } }
    .img-upload { display:flex; flex-direction:column; gap:8px; align-items:flex-start; }
    .img-preview img { width:100%; max-height:180px; object-fit:cover; border-radius:8px; }
  `]
})
export class AdminEducationComponent implements OnInit {
  svc           = inject(EducationService);
  private fb    = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  articles  : EducationContent[] = [];
  editingId  = 0;
  saving     = false;
  topics     = Object.entries(TOPIC_LABELS).map(([value, label]) => ({ value: value as Topic, label }));

  selectedFile   : File | null = null;
  previewUrl     : string | null = null;   // preview local del archivo elegido
  currentImageUrl: string | null = null;   // imagen ya guardada (al editar)

  form = this.fb.group({
    title: ['', Validators.required],
    body:  ['', Validators.required],
    type:  ['ARTICLE', Validators.required],
    topic: ['NUTRITION', Validators.required],
    readingTimeMinutes: [null as number | null]
  });

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.svc.getAll(0, 100).subscribe(r => this.articles = r.content);
  }

  edit(a: EducationContent) {
    this.editingId = a.id;
    this.form.patchValue({
      title: a.title, body: a.body, type: a.type, topic: a.topic,
      readingTimeMinutes: a.readingTimeMinutes ?? null
    });
    this.selectedFile    = null;
    this.previewUrl      = null;
    this.currentImageUrl = this.svc.imageUrl(a.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId = 0;
    this.form.reset({ type: 'ARTICLE', topic: 'NUTRITION' });
    this.selectedFile = null;
    this.previewUrl = null;
    this.currentImageUrl = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.previewUrl   = URL.createObjectURL(file);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    const data: any = this.form.value;
    const obs = this.editingId
      ? this.svc.update(this.editingId, data)
      : this.svc.create(data);

    obs.subscribe({
      next: saved => {
        // Si se eligió una imagen, subirla asociada al contenido recién guardado
        if (this.selectedFile) {
          this.svc.uploadImage(saved.id, this.selectedFile).subscribe({
            next: () => this.finishSave(),
            error: () => { this.snack.open('Contenido guardado, pero falló la imagen', '', { duration: 3000 }); this.finishSave(); }
          });
        } else {
          this.finishSave();
        }
      },
      error: () => { this.snack.open('Error', '', { duration: 2500 }); this.saving = false; }
    });
  }

  private finishSave() {
    this.snack.open('Guardado', '', { duration: 2000 });
    this.loadAll();
    this.cancelEdit();
    this.saving = false;
  }

  delete(a: EducationContent) {
    if (!confirm(`¿Eliminar "${a.title}"?`)) return;
    this.svc.delete(a.id).subscribe({
      next: () => { this.articles = this.articles.filter(x => x.id !== a.id); this.snack.open('Eliminado', '', { duration: 2000 }); },
      error: () => this.snack.open('Error', '', { duration: 2500 })
    });
  }

  topicLabel(t: string) { return TOPIC_LABELS[t as Topic] ?? t; }
}
