import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications$: Observable<NotificationMessage[]>;
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {
    // Test notification for debugging
    console.log('NotificationComponent initialized');

    // Subscribe to notifications for debugging
    this.subscription.add(
        this.notifications$.subscribe(notifications => {
          console.log('Notifications received:', notifications);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeNotification(id: string): void {
    console.log('Closing notification:', id);
    this.notificationService.removeNotification(id);
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  }

  trackByNotificationId(index: number, notification: NotificationMessage): string {
    return notification.id;
  }
}