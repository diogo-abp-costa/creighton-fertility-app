import {DayRecord} from "../models/day-record.model";
import {BehaviorSubject, tap} from "rxjs";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "./notification.service";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly apiUrl = 'http://corona-australis.duckdns.org:8081/fertility-app';
  private recordsSubject = new BehaviorSubject<DayRecord[]>([]);

  records$ = this.recordsSubject.asObservable();

  constructor(private http: HttpClient,
              private notificationService: NotificationService) {
    this.loadRecords();
  }

  private loadRecords(): void {
    this.http.get<DayRecord[]>(this.apiUrl).subscribe(
        (records) => this.recordsSubject.next(records),
        (error) => {
          console.error(error);
        }
    );
  }

  getRecords(): BehaviorSubject<DayRecord[]> {
    return this.recordsSubject;
  }

  saveRecords(records: DayRecord[]): void {
    this.http.post<void>(this.apiUrl, records).subscribe({
      next: () => {
        // Atualize o estado interno se desejar
        this.recordsSubject.next(records);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  deleteRecord(recordId: string) {
    const deleteRecordUrl = `${this.apiUrl}/${recordId}`;
    return this.http.delete(deleteRecordUrl).pipe(
        tap(() => this.loadRecords())
    );
  }
}