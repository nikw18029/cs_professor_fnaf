type Listener<T> = (data: T) => void;

export class Observable<T> {
    private listeners: Listener<T>[] = [];  // callbacks
    subscribe(l: Listener<T>) { this.listeners.push(l); }
    unsubscribe(l: Listener<T>) { this.listeners = this.listeners.filter(listener => listener != l)}
    notify(data: T) { this.listeners.forEach(l => l(data)); }
}