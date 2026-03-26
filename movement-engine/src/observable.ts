type Listener<T> = (data: T) => void;

class Observable<T> {
    private listeners: Listener<T>[] = [];
    subscribe(l: Listener<T>) { this.listeners.push(l); }
    notify(data: T) { this.listeners.forEach(l => l(data)); }
}