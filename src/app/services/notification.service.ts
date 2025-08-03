import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationMessage[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  showSuccess(message: string, duration: number = 3000): void {
    console.log('Showing success notification:', message);
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration: number = 5000): void {
    console.log('Showing error notification:', message);
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'error',
      duration
    });
  }

  showInfo(message: string, duration: number = 4000): void {
    console.log('Showing info notification:', message);
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'info',
      duration
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    console.log('Showing warning notification:', message);
    this.addNotification({
      id: this.generateId(),
      message,
      type: 'warning',
      duration
    });
  }

  private addNotification(notification: NotificationMessage): void {
    console.log('Adding notification:', notification);
    const currentNotifications = this.notificationsSubject.value;
    const newNotifications = [...currentNotifications, notification];
    console.log('New notifications array:', newNotifications);
    this.notificationsSubject.next(newNotifications);

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        console.log('Auto-removing notification:', notification.id);
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notificationsSubject.next(updatedNotifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}