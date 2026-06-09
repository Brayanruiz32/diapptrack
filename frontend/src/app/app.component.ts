import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit {
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.auth.loadCurrentUser().subscribe();
    this.notify.initFirebase();
  }
}
